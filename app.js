"use strict";

/* ---------------- Weather code -> look & feel ---------------- */
const WCODES = {
  0:  { text: "سماء صافية",        icon: "☀️", moon: "🌕", cloud: 0 },
  1:  { text: "صافية غالباً",       icon: "🌤️", moon: "🌔", cloud: 0.2 },
  2:  { text: "غيوم متفرقة",        icon: "⛅", moon: "🌤️", cloud: 0.5 },
  3:  { text: "غائم",               icon: "☁️", moon: "☁️", cloud: 0.9 },
  45: { text: "ضباب",               icon: "🌫️", moon: "🌫️", cloud: 0.6 },
  48: { text: "ضباب متجمد",         icon: "🌫️", moon: "🌫️", cloud: 0.6 },
  51: { text: "رذاذ خفيف",          icon: "🌦️", moon: "🌦️", cloud: 0.7 },
  53: { text: "رذاذ",               icon: "🌦️", moon: "🌦️", cloud: 0.75 },
  55: { text: "رذاذ كثيف",          icon: "🌦️", moon: "🌦️", cloud: 0.8 },
  56: { text: "رذاذ متجمد",         icon: "🌧️", moon: "🌧️", cloud: 0.75 },
  57: { text: "رذاذ متجمد كثيف",    icon: "🌧️", moon: "🌧️", cloud: 0.8 },
  61: { text: "مطر خفيف",           icon: "🌧️", moon: "🌧️", cloud: 0.85 },
  63: { text: "مطر",                icon: "🌧️", moon: "🌧️", cloud: 0.9 },
  65: { text: "مطر غزير",           icon: "🌧️", moon: "🌧️", cloud: 0.95 },
  66: { text: "مطر متجمد",          icon: "🌧️", moon: "🌧️", cloud: 0.9 },
  67: { text: "مطر متجمد غزير",     icon: "🌧️", moon: "🌧️", cloud: 0.9 },
  71: { text: "ثلج خفيف",           icon: "🌨️", moon: "🌨️", cloud: 0.85 },
  73: { text: "ثلج",                icon: "🌨️", moon: "🌨️", cloud: 0.9 },
  75: { text: "ثلج غزير",           icon: "❄️", moon: "❄️", cloud: 0.95 },
  77: { text: "حبيبات ثلج",         icon: "🌨️", moon: "🌨️", cloud: 0.8 },
  80: { text: "زخات مطر خفيفة",     icon: "🌦️", moon: "🌦️", cloud: 0.7 },
  81: { text: "زخات مطر",           icon: "🌧️", moon: "🌧️", cloud: 0.85 },
  82: { text: "زخات مطر غزيرة",     icon: "⛈️", moon: "⛈️", cloud: 0.95 },
  85: { text: "زخات ثلج خفيفة",     icon: "🌨️", moon: "🌨️", cloud: 0.8 },
  86: { text: "زخات ثلج غزيرة",     icon: "❄️", moon: "❄️", cloud: 0.9 },
  95: { text: "عاصفة رعدية",        icon: "⛈️", moon: "⛈️", cloud: 1 },
  96: { text: "عاصفة رعدية وبرَد",  icon: "⛈️", moon: "⛈️", cloud: 1 },
  99: { text: "عاصفة رعدية شديدة",  icon: "⛈️", moon: "⛈️", cloud: 1 },
};
function wcode(code) { return WCODES[code] || { text: "غير معروف", icon: "🌡️", moon: "🌙", cloud: 0.3 }; }

const WEEKDAYS_AR = ["الأحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];
const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function todayISO() { return isoDate(new Date()); }
function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return isoDate(d);
}
function daysBetween(a, b) {
  return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
}
function fmtDateLabel(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${WEEKDAYS_AR[d.getDay()]} ${d.getDate()} ${MONTHS_AR[d.getMonth()]}`;
}

/* ---------------- State ---------------- */
let selectedPlace = null; // { name, admin1, country, lat, lon }
let selectedDate = todayISO();
let searchDebounce = null;
let weekCache = null; // cached 16-day forecast for pills

/* ---------------- DOM ---------------- */
const el = (id) => document.getElementById(id);
const citySearch = el("citySearch");
const suggestions = el("suggestions");
const dateInput = el("dateInput");
const dateChips = el("dateChips");
const goBtn = el("goBtn");
const resultArea = el("resultArea");
const statusArea = el("statusArea");
const installBtn = el("installBtn");

dateInput.value = selectedDate;

/* ---------------- Geocoding search ---------------- */
citySearch.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  const q = citySearch.value.trim();
  if (q.length < 2) {
    suggestions.classList.add("hidden");
    suggestions.innerHTML = "";
    return;
  }
  searchDebounce = setTimeout(() => runSearch(q), 350);
});

async function runSearch(q) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=ar&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    renderSuggestions(data.results || []);
  } catch (e) {
    suggestions.classList.add("hidden");
  }
}

function renderSuggestions(results) {
  if (!results.length) {
    suggestions.classList.add("hidden");
    suggestions.innerHTML = "";
    return;
  }
  suggestions.innerHTML = "";
  results.forEach((r) => {
    const li = document.createElement("li");
    const sub = [r.admin1, r.country].filter(Boolean).join(" - ");
    li.innerHTML = `<div>${r.name}</div><div class="sub">${sub}</div>`;
    li.tabIndex = 0;
    li.addEventListener("click", () => choosePlace(r));
    suggestions.appendChild(li);
  });
  suggestions.classList.remove("hidden");
}

function choosePlace(r) {
  selectedPlace = {
    name: r.name,
    admin1: r.admin1 || "",
    country: r.country || "",
    lat: r.latitude,
    lon: r.longitude,
  };
  citySearch.value = [r.name, r.admin1].filter(Boolean).join("، ");
  suggestions.classList.add("hidden");
  suggestions.innerHTML = "";
  weekCache = null;
}

/* ---------------- Geolocation ---------------- */
el("locateBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus("المتصفح ده مش بيدعم تحديد الموقع");
    return;
  }
  setStatus("بنحدد موقعك...");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      let name = "موقعك الحالي";
      let admin1 = "";
      let country = "";
      try {
        const rev = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`
        );
        const j = await rev.json();
        name = j.city || j.locality || name;
        admin1 = j.principalSubdivision || "";
        country = j.countryName || "";
      } catch (e) {}
      selectedPlace = { name, admin1, country, lat: latitude, lon: longitude };
      citySearch.value = [name, admin1].filter(Boolean).join("، ");
      weekCache = null;
      setStatus("دور على مكان واضغط \"اعرض الطقس\"");
      fetchAndRender();
    },
    () => setStatus("مقدرناش نوصل لموقعك، اكتب اسم المكان بدل كده")
  );
});

/* ---------------- Date controls ---------------- */
dateChips.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  [...dateChips.children].forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
  selectedDate = addDays(todayISO(), Number(btn.dataset.offset));
  dateInput.value = selectedDate;
});

dateInput.addEventListener("change", () => {
  selectedDate = dateInput.value || todayISO();
  [...dateChips.children].forEach((c) => c.classList.remove("active"));
});

goBtn.addEventListener("click", fetchAndRender);

/* ---------------- Fetch + mode selection ---------------- */
async function fetchAndRender() {
  if (!selectedPlace) {
    setStatus("لازم تختار مكان الأول من قائمة الاقتراحات 🙏");
    return;
  }
  const today = todayISO();
  const offset = daysBetween(today, selectedDate);
  goBtn.disabled = true;
  goBtn.textContent = "بنجيب الطقس...";
  setStatus("");

  try {
    if (offset >= 0 && offset <= 15) {
      const data = await fetchForecastRange(selectedPlace, selectedDate, selectedDate);
      renderDay({
        mode: "forecast",
        date: selectedDate,
        code: data.daily.weathercode[0],
        tmax: data.daily.temperature_2m_max[0],
        tmin: data.daily.temperature_2m_min[0],
        rainProb: data.daily.precipitation_probability_max[0],
        wind: data.daily.windspeed_10m_max[0],
        humidity: nearestHumidity(data),
        isDay: offset === 0 ? data.current_weather.is_day : 1,
      });
      loadWeekStrip();
    } else if (offset < 0) {
      const data = await fetchArchiveRange(selectedPlace, selectedDate, selectedDate);
      if (!data.daily || data.daily.weathercode[0] === null || data.daily.weathercode[0] === undefined) {
        throw new Error("no-archive-data");
      }
      renderDay({
        mode: "archive",
        date: selectedDate,
        code: data.daily.weathercode[0],
        tmax: data.daily.temperature_2m_max[0],
        tmin: data.daily.temperature_2m_min[0],
        rainProb: null,
        wind: data.daily.windspeed_10m_max[0],
        humidity: null,
        isDay: 1,
      });
    } else {
      const avg = await fetchHistoricalAverage(selectedPlace, selectedDate);
      renderDay({
        mode: "avg",
        date: selectedDate,
        code: avg.code,
        tmax: avg.tmax,
        tmin: avg.tmin,
        rainProb: null,
        wind: avg.wind,
        humidity: null,
        isDay: 1,
      });
    }
    resultArea.classList.remove("hidden");
  } catch (e) {
    console.error(e);
    setStatus("معرفناش نجيب بيانات الطقس دلوقتي. جرب تاني كمان شوية 🙏");
  } finally {
    goBtn.disabled = false;
    goBtn.textContent = "اعرض الطقس";
  }
}

async function fetchForecastRange(place, start, end) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max` +
    `&hourly=relative_humidity_2m&current_weather=true&timezone=auto&start_date=${start}&end_date=${end}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("forecast-failed");
  return res.json();
}

async function fetchArchiveRange(place, start, end) {
  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${place.lat}&longitude=${place.lon}` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max&timezone=auto` +
    `&start_date=${start}&end_date=${end}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("archive-failed");
  return res.json();
}

function nearestHumidity(forecastData) {
  try {
    const times = forecastData.hourly.time;
    const hums = forecastData.hourly.relative_humidity_2m;
    const now = new Date();
    let target = `${selectedDate}T${String(now.getHours()).padStart(2, "0")}:00`;
    let idx = times.indexOf(target);
    if (idx === -1) idx = Math.floor(times.length / 2);
    return hums[idx];
  } catch (e) {
    return null;
  }
}

// Historical average: same month/day across the last 5 years, via archive API
async function fetchHistoricalAverage(place, targetIso) {
  const [, mm, dd] = targetIso.split("-");
  const thisYear = new Date().getFullYear();
  const years = [1, 2, 3, 4, 5].map((back) => thisYear - back);
  const results = await Promise.all(
    years.map((y) => fetchArchiveRange(place, `${y}-${mm}-${dd}`, `${y}-${mm}-${dd}`).catch(() => null))
  );
  const valid = results.filter((r) => r && r.daily && r.daily.temperature_2m_max[0] !== null);
  if (!valid.length) throw new Error("no-history");

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const tmax = avg(valid.map((r) => r.daily.temperature_2m_max[0]));
  const tmin = avg(valid.map((r) => r.daily.temperature_2m_min[0]));
  const wind = avg(valid.map((r) => r.daily.windspeed_10m_max[0]));

  const codeCounts = {};
  valid.forEach((r) => {
    const c = r.daily.weathercode[0];
    codeCounts[c] = (codeCounts[c] || 0) + 1;
  });
  const code = Number(Object.entries(codeCounts).sort((a, b) => b[1] - a[1])[0][0]);

  return { tmax, tmin, wind, code, years: valid.length };
}

/* ---------------- Week strip (quick-pick pills) ---------------- */
async function loadWeekStrip() {
  try {
    if (!weekCache) {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${selectedPlace.lat}&longitude=${selectedPlace.lon}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=16`;
      const res = await fetch(url);
      weekCache = await res.json();
    }
    renderWeekStrip(weekCache);
  } catch (e) {
    /* silent — the strip is a nice-to-have */
  }
}

function renderWeekStrip(data) {
  const strip = el("weekStrip");
  strip.innerHTML = "";
  const days = data.daily.time;
  days.forEach((d, i) => {
    const w = wcode(data.daily.weathercode[i]);
    const pill = document.createElement("div");
    pill.className = "day-pill" + (d === selectedDate ? " active" : "");
    pill.innerHTML = `
      <div class="d-name">${i === 0 ? "النهاردة" : WEEKDAYS_AR[new Date(d + "T00:00:00").getDay()]}</div>
      <div class="d-icon">${w.icon}</div>
      <div class="d-temp">${Math.round(data.daily.temperature_2m_max[i])}°/${Math.round(data.daily.temperature_2m_min[i])}°</div>
    `;
    pill.addEventListener("click", () => {
      selectedDate = d;
      dateInput.value = d;
      [...dateChips.children].forEach((c) => c.classList.remove("active"));
      fetchAndRender();
    });
    strip.appendChild(pill);
  });
}

/* ---------------- Render ---------------- */
function renderDay(info) {
  const w = wcode(info.code);

  el("placeName").textContent = [selectedPlace.name, selectedPlace.admin1].filter(Boolean).join("، ");
  el("placeDate").textContent = fmtDateLabel(info.date);
  el("weatherIcon").textContent = info.isDay ? w.icon : w.moon;
  el("tempValue").textContent = Math.round((info.tmax + info.tmin) / 2);
  el("descText").textContent = w.text;
  el("minMax").textContent = `أعلى ${Math.round(info.tmax)}° / أقل ${Math.round(info.tmin)}°`;

  el("humidityVal").textContent = info.humidity != null ? `${Math.round(info.humidity)}%` : "--";
  el("windVal").textContent = info.wind != null ? `${Math.round(info.wind)} كم/س` : "--";
  el("rainVal").textContent = info.rainProb != null ? `${Math.round(info.rainProb)}%` : "--";

  const note = el("noteText");
  if (info.mode === "avg") {
    note.textContent = `اليوم ده بعيد عن حدود التوقع الدقيق (16 يوم)، فالأرقام دي متوسط الطقس في نفس اليوم من السنين اللي فاتت، مش توقع مؤكد.`;
    note.classList.remove("hidden");
  } else if (info.mode === "archive") {
    note.textContent = `دي بيانات أرشيف فعلية لليوم ده اللي فات.`;
    note.classList.remove("hidden");
  } else {
    note.classList.add("hidden");
  }

  updateSky(w, info.isDay);
}

/* ---------------- Sky visuals ---------------- */
function updateSky(w, isDay) {
  const sky = el("sky");
  const stars = el("stars");
  const sunMoon = el("sunMoon");
  const clouds = el("clouds");

  if (isDay) {
    sky.style.background = w.cloud > 0.6
      ? "linear-gradient(to bottom, #5b6b7a 0%, #8b95a0 45%, var(--sand) 100%)"
      : "linear-gradient(to bottom, #1c4f7a 0%, #4d86a8 45%, var(--dusk-bottom) 100%)";
    stars.style.opacity = "0";
    sunMoon.style.background = "radial-gradient(circle at 35% 35%, #ffe08a, #f4a825 70%)";
    sunMoon.style.boxShadow = "0 0 60px 18px rgba(244,168,37,0.45)";
  } else {
    sky.style.background = "linear-gradient(to bottom, #050e22 0%, #0b1e3d 55%, #1a2f52 100%)";
    stars.style.opacity = "1";
    sunMoon.style.background = "radial-gradient(circle at 35% 35%, #f7f9fc, #cfd6e6 70%)";
    sunMoon.style.boxShadow = "0 0 40px 10px rgba(247,249,251,0.25)";
  }

  clouds.innerHTML = "";
  const cloudCount = Math.round(w.cloud * 5);
  for (let i = 0; i < cloudCount; i++) {
    const c = document.createElement("div");
    c.className = "cloud-shape";
    const w2 = 60 + Math.random() * 70;
    c.style.width = `${w2}px`;
    c.style.height = `${w2 * 0.4}px`;
    c.style.top = `${10 + Math.random() * 35}%`;
    c.style.left = `${Math.random() * 80}%`;
    c.style.opacity = String(0.5 + Math.random() * 0.4);
    clouds.appendChild(c);
  }
}

function setStatus(msg) {
  statusArea.innerHTML = msg ? `<p>${msg}</p>` : "";
  statusArea.classList.toggle("hidden", !msg);
}

/* ---------------- PWA install ---------------- */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});
installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add("hidden");
});
window.addEventListener("appinstalled", () => installBtn.classList.add("hidden"));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

/* ---------------- Default: try Cairo, Egypt so the app isn't empty ---------------- */
(function seedDefault() {
  selectedPlace = { name: "القاهرة", admin1: "محافظة القاهرة", country: "مصر", lat: 30.0444, lon: 31.2357 };
  citySearch.value = "القاهرة، محافظة القاهرة";
})();
