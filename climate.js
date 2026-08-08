"use strict";

/* ================= Climate dashboard =================
   Level 1: 12-month bar chart (rain% / snow%) built from real archived
            daily data over the last CLIMATE_YEARS complete years.
   Level 2: tap a month -> bar chart per day-of-month (same stat, grouped
            by day across all sampled years).
   Level 3: tap a day -> bar chart per hour-of-day, averaged from real
            hourly archive data for that exact month/day over the last
            HOURLY_SAMPLE_YEARS years.
   The "next year outlook" tab reuses the same historical stats but labels
   the columns with the real upcoming month/year, since no genuine forecast
   exists that far ahead — this is stated clearly in the note under the chart.
*/

const CLIMATE_YEARS = 10;
const HOURLY_SAMPLE_YEARS = 5;
const RAIN_MM_THRESHOLD = 1;
const SNOW_CM_THRESHOLD = 0.1;

let climateCache = {};
let climateTabMode = "history"; // "history" | "outlook"
let climateLevel = "year"; // "year" | "month" | "day"
let climateActiveMonth = null; // 0-11 (calendar month)
let climateActiveYearLabel = null; // e.g. "2027" when in outlook mode
let climateActiveDay = null;

const climateArea = el("climateArea");
const climateBtn = el("climateBtn");
const climateBack = el("climateBack");
const climateCloseBtn = el("climateClose");
const climateTabs = el("climateTabs");
const climateStatus = el("climateStatus");

function climateKey(place) {
  return `${place.lat.toFixed(2)},${place.lon.toFixed(2)}`;
}

function setClimateStatus(msg) {
  climateStatus.textContent = msg || "";
  climateStatus.classList.toggle("hidden", !msg);
}

function showClimateView(level) {
  climateLevel = level;
  el("climateYearView").classList.toggle("hidden", level !== "year");
  el("climateMonthView").classList.toggle("hidden", level !== "month");
  el("climateDayView").classList.toggle("hidden", level !== "day");
  climateBack.classList.toggle("hidden", level === "year");
}

/* ================= Data fetch + processing ================= */
async function ensureClimateHistory(place) {
  const key = climateKey(place);
  if (climateCache[key]) return climateCache[key];

  const endYear = new Date().getFullYear() - 1; // last fully-complete year
  const startYear = endYear - (CLIMATE_YEARS - 1);
  const start = `${startYear}-01-01`;
  const end = `${endYear}-12-31`;

  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${place.lat}&longitude=${place.lon}` +
    `&daily=precipitation_sum,snowfall_sum&timezone=auto&start_date=${start}&end_date=${end}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("climate-fetch-failed");
  const data = await res.json();
  if (!data.daily || !data.daily.time || !data.daily.time.length) throw new Error("climate-empty");

  const processed = processClimateData(data, startYear, endYear);
  climateCache[key] = processed;
  return processed;
}

function processClimateData(data, startYear, endYear) {
  const monthly = Array.from({ length: 12 }, () => ({ rainDays: 0, snowDays: 0, totalDays: 0 }));
  const byMonthDay = Array.from({ length: 12 }, () => ({}));

  const times = data.daily.time;
  const precs = data.daily.precipitation_sum;
  const snows = data.daily.snowfall_sum;

  times.forEach((dateStr, i) => {
    const precip = precs[i];
    if (precip == null) return;
    const snow = snows ? snows[i] : null;
    const mIdx = Number(dateStr.slice(5, 7)) - 1;
    const day = Number(dateStr.slice(8, 10));
    const isRain = precip >= RAIN_MM_THRESHOLD;
    const isSnow = snow != null && snow > SNOW_CM_THRESHOLD;

    monthly[mIdx].totalDays++;
    if (isRain) monthly[mIdx].rainDays++;
    if (isSnow) monthly[mIdx].snowDays++;

    const dm = byMonthDay[mIdx];
    if (!dm[day]) dm[day] = { rainDays: 0, snowDays: 0, totalYears: 0 };
    dm[day].totalYears++;
    if (isRain) dm[day].rainDays++;
    if (isSnow) dm[day].snowDays++;
  });

  const monthlyStats = monthly.map((s) => ({
    rainProb: s.totalDays ? Math.round((s.rainDays / s.totalDays) * 100) : 0,
    snowProb: s.totalDays ? Math.round((s.snowDays / s.totalDays) * 100) : 0,
  }));

  return { monthlyStats, byMonthDay, startYear, endYear, years: endYear - startYear + 1 };
}

/* ================= Level 1: year view ================= */
async function loadClimateForCurrentPlace() {
  const t = I18N[currentLang].ui;
  el("monthChart").innerHTML = "";
  el("climateYearNote").textContent = "";
  setClimateStatus(t.climateLoading);
  try {
    const climate = await ensureClimateHistory(selectedPlace);
    renderMonthChart(climate);
    setClimateStatus("");
  } catch (e) {
    console.error(e);
    setClimateStatus(t.climateError);
  }
}

function renderMonthChart(climate) {
  const chart = el("monthChart");
  chart.innerHTML = "";
  const t = I18N[currentLang];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    let calMonth, yearLabel, displayLabel;
    if (climateTabMode === "history") {
      calMonth = i;
      yearLabel = null;
      displayLabel = t.months[i];
    } else {
      const target = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1);
      calMonth = target.getMonth();
      yearLabel = String(target.getFullYear());
      displayLabel = t.months[calMonth];
    }
    const stat = climate.monthlyStats[calMonth];

    const col = document.createElement("div");
    col.className = "month-col";
    col.innerHTML = `
      <div class="bar-pair">
        <div class="bar bar-rain" style="height:${Math.max(stat.rainProb, 2)}%"><span class="bar-val">${stat.rainProb}%</span></div>
        <div class="bar bar-snow" style="height:${Math.max(stat.snowProb, 2)}%"><span class="bar-val">${stat.snowProb}%</span></div>
      </div>
      <div class="month-label">${displayLabel}</div>
      ${yearLabel ? `<div class="month-sublabel">${yearLabel}</div>` : ""}
    `;
    col.addEventListener("click", () => openMonthView(calMonth, yearLabel));
    chart.appendChild(col);
  }

  updateYearNote(climate);
}

function updateYearNote(climate) {
  const t = I18N[currentLang].ui;
  let msg =
    climateTabMode === "history"
      ? t.climateNoteHistory
          .replace("{years}", climate.years)
          .replace("{start}", climate.startYear)
          .replace("{end}", climate.endYear)
      : t.climateNoteOutlook.replace("{years}", climate.years);

  const allSnowZero = climate.monthlyStats.every((s) => s.snowProb === 0);
  if (allSnowZero) msg += " " + t.climateNoSnow;
  el("climateYearNote").textContent = msg;
}

climateTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".climate-tab");
  if (!btn) return;
  climateTabMode = btn.dataset.tab;
  [...climateTabs.children].forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
  const climate = climateCache[climateKey(selectedPlace)];
  if (climate) renderMonthChart(climate);
});

/* ================= Level 2: month/day view ================= */
function openMonthView(monthIndex, yearLabel) {
  climateActiveMonth = monthIndex;
  climateActiveYearLabel = yearLabel;

  const climate = climateCache[climateKey(selectedPlace)];
  const t = I18N[currentLang];
  el("monthViewTitle").textContent = yearLabel ? `${t.months[monthIndex]} ${yearLabel}` : t.months[monthIndex];

  const dayMap = climate.byMonthDay[monthIndex];
  const dayKeys = Object.keys(dayMap).map(Number);
  const daysInMonth = dayKeys.length ? Math.max(...dayKeys) : 28;

  const chart = el("dayChart");
  chart.innerHTML = "";
  for (let d = 1; d <= daysInMonth; d++) {
    const rec = dayMap[d];
    const rainProb = rec && rec.totalYears ? Math.round((rec.rainDays / rec.totalYears) * 100) : 0;
    const snowProb = rec && rec.totalYears ? Math.round((rec.snowDays / rec.totalYears) * 100) : 0;

    const col = document.createElement("div");
    col.className = "day-col" + (rainProb >= 50 || snowProb >= 50 ? " high-chance" : "");
    col.innerHTML = `
      <div class="bar-pair small">
        <div class="bar bar-rain" style="height:${Math.max(rainProb, 2)}%"></div>
        <div class="bar bar-snow" style="height:${Math.max(snowProb, 2)}%"></div>
      </div>
      <div class="day-num">${d}</div>
    `;
    col.addEventListener("click", () => openDayView(monthIndex, d, yearLabel));
    chart.appendChild(col);
  }

  el("climateMonthNote").textContent = I18N[currentLang].ui.climateMonthNote.replace("{years}", climate.years);
  showClimateView("month");
}

/* ================= Level 3: hourly view ================= */
async function openDayView(monthIndex, day, yearLabel) {
  climateActiveDay = day;
  const t = I18N[currentLang];
  el("dayViewTitle").textContent = yearLabel
    ? `${day} ${t.months[monthIndex]} ${yearLabel}`
    : `${day} ${t.months[monthIndex]}`;

  showClimateView("day");
  el("hourChart").innerHTML = "";
  setClimateStatus(t.ui.climateLoading);

  try {
    const climate = climateCache[climateKey(selectedPlace)];
    const mm = String(monthIndex + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const years = [];
    for (let y = climate.endYear; y > climate.endYear - HOURLY_SAMPLE_YEARS; y--) years.push(y);

    const results = await Promise.all(
      years.map((y) => {
        const dateStr = `${y}-${mm}-${dd}`;
        const url =
          `https://archive-api.open-meteo.com/v1/archive?latitude=${selectedPlace.lat}&longitude=${selectedPlace.lon}` +
          `&hourly=precipitation,snowfall&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;
        return fetch(url)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);
      })
    );

    const valid = results.filter((r) => r && r.hourly && r.hourly.time && r.hourly.time.length);
    if (!valid.length) throw new Error("no-hourly-data");

    const hourStats = Array.from({ length: 24 }, () => ({ rain: 0, snow: 0, total: 0 }));
    valid.forEach((r) => {
      r.hourly.time.forEach((tm, i) => {
        const hour = Number(tm.slice(11, 13));
        const precip = r.hourly.precipitation[i];
        const snow = r.hourly.snowfall ? r.hourly.snowfall[i] : null;
        if (precip == null || !hourStats[hour]) return;
        hourStats[hour].total++;
        if (precip > 0.1) hourStats[hour].rain++;
        if (snow != null && snow > 0.05) hourStats[hour].snow++;
      });
    });

    renderHourChart(hourStats);
    el("climateDayNote").textContent = t.ui.climateDayNote.replace("{years}", valid.length);
    setClimateStatus("");
  } catch (e) {
    console.error(e);
    setClimateStatus(t.ui.climateNoHourly);
  }
}

function renderHourChart(hourStats) {
  const chart = el("hourChart");
  chart.innerHTML = "";
  hourStats.forEach((s, h) => {
    const rainProb = s.total ? Math.round((s.rain / s.total) * 100) : 0;
    const snowProb = s.total ? Math.round((s.snow / s.total) * 100) : 0;
    const col = document.createElement("div");
    col.className = "hour-col";
    col.innerHTML = `
      <div class="bar-pair small">
        <div class="bar bar-rain" style="height:${Math.max(rainProb, 2)}%"></div>
        <div class="bar bar-snow" style="height:${Math.max(snowProb, 2)}%"></div>
      </div>
      <div class="hour-num">${String(h).padStart(2, "0")}</div>
    `;
    chart.appendChild(col);
  });
}

/* ================= Open / close / navigation ================= */
climateBtn.addEventListener("click", async () => {
  const t = I18N[currentLang].ui;
  if (!selectedPlace) {
    setStatus(t.climateOpenPrompt);
    return;
  }
  climateArea.classList.remove("hidden");
  el("climatePlaceLine").textContent = [selectedPlace.name, selectedPlace.admin1].filter(Boolean).join("، ");
  climateTabMode = "history";
  [...climateTabs.children].forEach((c) => c.classList.toggle("active", c.dataset.tab === "history"));
  showClimateView("year");
  await loadClimateForCurrentPlace();
});

climateCloseBtn.addEventListener("click", () => {
  climateArea.classList.add("hidden");
});
climateArea.addEventListener("click", (e) => {
  if (e.target === climateArea) climateArea.classList.add("hidden");
});

climateBack.addEventListener("click", () => {
  if (climateLevel === "day") showClimateView("month");
  else if (climateLevel === "month") showClimateView("year");
});

/* ================= Re-render on language change ================= */
el("langSelect").addEventListener("change", () => {
  if (climateArea.classList.contains("hidden")) return;
  const climate = climateCache[climateKey(selectedPlace)];
  el("climatePlaceLine").textContent = [selectedPlace.name, selectedPlace.admin1].filter(Boolean).join("، ");
  if (!climate) return;
  if (climateLevel === "year") renderMonthChart(climate);
  else if (climateLevel === "month") openMonthView(climateActiveMonth, climateActiveYearLabel);
  else if (climateLevel === "day") openDayView(climateActiveMonth, climateActiveDay, climateActiveYearLabel);
});
