"use strict";

/* ---------------- Weather code -> icon/mood (language-independent) ---------------- */
const WCODES = {
  0:  { icon: "☀️", moon: "🌕", cloud: 0 },
  1:  { icon: "🌤️", moon: "🌔", cloud: 0.2 },
  2:  { icon: "⛅", moon: "🌤️", cloud: 0.5 },
  3:  { icon: "☁️", moon: "☁️", cloud: 0.9 },
  45: { icon: "🌫️", moon: "🌫️", cloud: 0.6 },
  48: { icon: "🌫️", moon: "🌫️", cloud: 0.6 },
  51: { icon: "🌦️", moon: "🌦️", cloud: 0.7 },
  53: { icon: "🌦️", moon: "🌦️", cloud: 0.75 },
  55: { icon: "🌦️", moon: "🌦️", cloud: 0.8 },
  56: { icon: "🌧️", moon: "🌧️", cloud: 0.75 },
  57: { icon: "🌧️", moon: "🌧️", cloud: 0.8 },
  61: { icon: "🌧️", moon: "🌧️", cloud: 0.85 },
  63: { icon: "🌧️", moon: "🌧️", cloud: 0.9 },
  65: { icon: "🌧️", moon: "🌧️", cloud: 0.95 },
  66: { icon: "🌧️", moon: "🌧️", cloud: 0.9 },
  67: { icon: "🌧️", moon: "🌧️", cloud: 0.9 },
  71: { icon: "🌨️", moon: "🌨️", cloud: 0.85 },
  73: { icon: "🌨️", moon: "🌨️", cloud: 0.9 },
  75: { icon: "❄️", moon: "❄️", cloud: 0.95 },
  77: { icon: "🌨️", moon: "🌨️", cloud: 0.8 },
  80: { icon: "🌦️", moon: "🌦️", cloud: 0.7 },
  81: { icon: "🌧️", moon: "🌧️", cloud: 0.85 },
  82: { icon: "⛈️", moon: "⛈️", cloud: 0.95 },
  85: { icon: "🌨️", moon: "🌨️", cloud: 0.8 },
  86: { icon: "❄️", moon: "❄️", cloud: 0.9 },
  95: { icon: "⛈️", moon: "⛈️", cloud: 1 },
  96: { icon: "⛈️", moon: "⛈️", cloud: 1 },
  99: { icon: "⛈️", moon: "⛈️", cloud: 1 },
};
function wcode(code) { return WCODES[code] || { icon: "🌡️", moon: "🌙", cloud: 0.3 }; }
function wtext(code) {
  const t = I18N[currentLang].wcodes[code];
  return t || I18N.en.wcodes[code] || "--";
}

function isoDate(d) { return d.toISOString().slice(0, 10); }
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
  const t = I18N[currentLang];
  const label = `${t.weekdays[d.getDay()]} ${d.getDate()} ${t.months[d.getMonth()]}`;
  return iso === todayISO() ? `${t.todayLabel} · ${label}` : label;
}

/* ---------------- State ---------------- */
let currentLang = detectDefaultLang();
let selectedPlace = { name: "القاهرة", admin1: "محافظة القاهرة", country: "مصر", lat: 30.0444, lon: 31.2357 };
let selectedDate = todayISO();
let searchDebounce = null;
let weekCache = null;
let lastInfo = null;
let map = null;
let mapMarker = null;

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
const installModal = el("installModal");
const mapWrap = el("mapWrap");
const mapHintEl = mapWrap.querySelector(".map-hint");

dateInput.value = selectedDate;
citySearch.value = "القاهرة، محافظة القاهرة";

/* ================= i18n ================= */
function applyTranslations() {
  const t = I18N[currentLang];
  document.getElementById("htmlRoot").setAttribute("lang", currentLang);
  document.getElementById("htmlRoot").setAttribute("dir", t.dir);
  document.body.style.direction = t.dir;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (t.ui[key] != null) node.textContent = t.ui[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    if (t.ui[key] != null) node.placeholder = t.ui[key];
  });
  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    const key = node.getAttribute("data-i18n-title");
    if (t.ui[key] != null) {
      node.title = t.ui[key];
      node.setAttribute("aria-label", t.ui[key]);
    }
  });

  goBtn.textContent = t.ui.goBtn;
  if (mapHintEl) mapHintEl.textContent = t.ui.mapHint;

  if (lastInfo) renderDay(lastInfo);
  if (weekCache) renderWeekStrip(weekCache);
  refreshInstallButtonLabel();
}

el("langSelect").value = currentLang;
el("langSelect").addEventListener("change", (e) => {
  currentLang = e.target.value;
  try { localStorage.setItem("taqsna_lang", currentLang); } catch (err) {}
  applyTranslations();
});

/* ================= Geocoding search ================= */
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
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=${currentLang}&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    renderSuggestions(data.results || []);
  } catch (e) {
    suggestions.classList.add("hidden");
  }
}

function renderSuggestions(results) {
  suggestions.innerHTML = "";
  if (!results.length) {
    suggestions.classList.add("hidden");
    return;
  }
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

/* ================= Geolocation ================= */
el("locateBtn").addEventListener("click", () => {
  if (!navigator.geolocation) return;
  setStatus(I18N[currentLang].ui.statusLocating);
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      await setPlaceFromCoords(latitude, longitude);
      setStatus(I18N[currentLang].ui.statusInitial);
      fetchAndRender();
    },
    () => setStatus(I18N[currentLang].ui.statusLocateFail)
  );
});

async function reverseGeocode(lat, lon) {
  let name = I18N[currentLang].ui.currentLocation;
  let admin1 = "";
  let country = "";
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${currentLang}`
    );
    const j = await res.json();
    name = j.city || j.locality || name;
    admin1 = j.principalSubdivision || "";
    country = j.countryName || "";
  } catch (e) {}
  return { name, admin1, country };
}

async function setPlaceFromCoords(lat, lon) {
  const info = await reverseGeocode(lat, lon);
  selectedPlace = { ...info, lat, lon };
  citySearch.value = [info.name, info.admin1].filter(Boolean).join("، ");
  weekCache = null;
}

/* ================= Map picker ================= */
el("mapBtn").addEventListener("click", () => {
  const willShow = mapWrap.classList.contains("hidden");
  mapWrap.classList.toggle("hidden");
  if (willShow) initMapIfNeeded();
});

function initMapIfNeeded() {
  if (map) {
    setTimeout(() => map.invalidateSize(), 50);
    return;
  }
  map = L.map("mapContainer", { zoomControl: true }).setView([selectedPlace.lat, selectedPlace.lon], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
    maxZoom: 18,
  }).addTo(map);
  mapMarker = L.marker([selectedPlace.lat, selectedPlace.lon]).addTo(map);

  map.on("click", async (e) => {
    const { lat, lng } = e.latlng;
    mapMarker.setLatLng([lat, lng]);
    mapHintEl.textContent = "…";
    const info = await reverseGeocode(lat, lng);
    selectedPlace = { ...info, lat, lon: lng };
    citySearch.value = [info.name, info.admin1].filter(Boolean).join("، ");
    weekCache = null;
    mapHintEl.textContent = I18N[currentLang].ui.mapHint;
    setTimeout(() => mapWrap.classList.add("hidden"), 700);
  });

  setTimeout(() => map.invalidateSize(), 50);
}

/* ================= Date controls ================= */
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

/* ================= Fetch + mode selection ================= */
async function fetchAndRender() {
  if (!selectedPlace) {
    setStatus(I18N[currentLang].ui.statusNeedPlace);
    return;
  }
  const t = I18N[currentLang].ui;
  const offset = daysBetween(todayISO(), selectedDate);
  goBtn.disabled = true;
  goBtn.textContent = t.goBtnLoading;
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
        hourly: offset === 0 ? data.hourly : null,
      });
      loadWeekStrip();
    } else if (offset < 0) {
      const data = await fetchArchiveRange(selectedPlace, selectedDate, selectedDate);
      if (!data.daily || data.daily.weathercode[0] == null) throw new Error("no-archive-data");
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
        hourly: null,
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
        hourly: null,
      });
    }
    resultArea.classList.remove("hidden");
  } catch (e) {
    console.error(e);
    setStatus(t.statusError);
  } finally {
    goBtn.disabled = false;
    goBtn.textContent = t.goBtn;
  }
}

async function fetchForecastRange(place, start, end) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max` +
    `&hourly=relative_humidity_2m,temperature_2m,weathercode&current_weather=true&timezone=auto&start_date=${start}&end_date=${end}`;
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
    const target = `${selectedDate}T${String(now.getHours()).padStart(2, "0")}:00`;
    let idx = times.indexOf(target);
    if (idx === -1) idx = Math.floor(times.length / 2);
    return hums[idx];
  } catch (e) {
    return null;
  }
}

async function fetchHistoricalAverage(place, targetIso) {
  const [, mm, dd] = targetIso.split("-");
  const thisYear = new Date().getFullYear();
  const years = [1, 2, 3, 4, 5].map((back) => thisYear - back);
  const results = await Promise.all(
    years.map((y) => fetchArchiveRange(place, `${y}-${mm}-${dd}`, `${y}-${mm}-${dd}`).catch(() => null))
  );
  const valid = results.filter((r) => r && r.daily && r.daily.temperature_2m_max[0] != null);
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

  return { tmax, tmin, wind, code };
}

/* ================= Week strip ================= */
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
  } catch (e) {}
}

function renderWeekStrip(data) {
  const strip = el("weekStrip");
  strip.innerHTML = "";
  const t = I18N[currentLang];
  data.daily.time.forEach((d, i) => {
    const w = wcode(data.daily.weathercode[i]);
    const pill = document.createElement("div");
    pill.className = "day-pill" + (d === selectedDate ? " active" : "");
    pill.innerHTML = `
      <div class="d-name">${i === 0 ? t.todayLabel : t.weekdays[new Date(d + "T00:00:00").getDay()]}</div>
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

/* ================= Hour strip (today only) ================= */
function renderHourStrip(hourly) {
  const strip = el("hourStrip");
  if (!hourly) {
    strip.classList.add("hidden");
    strip.innerHTML = "";
    return;
  }
  const nowHourIso = new Date().toISOString().slice(0, 13);
  let startIdx = hourly.time.findIndex((tm) => tm.startsWith(nowHourIso));
  if (startIdx === -1) startIdx = 0;
  const slice = hourly.time.slice(startIdx, startIdx + 8);

  strip.innerHTML = "";
  slice.forEach((tm, i) => {
    const idx = startIdx + i;
    const hour = new Date(tm).getHours();
    const w = wcode(hourly.weathercode[idx]);
    const item = document.createElement("div");
    item.className = "hour-item";
    item.innerHTML = `
      <div class="h-time">${String(hour).padStart(2, "0")}:00</div>
      <div class="h-icon">${w.icon}</div>
      <div class="h-temp">${Math.round(hourly.temperature_2m[idx])}°</div>
    `;
    strip.appendChild(item);
  });
  strip.classList.remove("hidden");
}

/* ================= Render ================= */
function renderDay(info) {
  lastInfo = info;
  const w = wcode(info.code);

  el("placeName").textContent = [selectedPlace.name, selectedPlace.admin1].filter(Boolean).join("، ");
  el("placeDate").textContent = fmtDateLabel(info.date);
  el("weatherIcon").textContent = info.isDay ? w.icon : w.moon;
  el("tempValue").textContent = Math.round((info.tmax + info.tmin) / 2);
  el("descText").textContent = wtext(info.code);
  el("minMax").textContent = `${Math.round(info.tmax)}° / ${Math.round(info.tmin)}°`;

  el("humidityVal").textContent = info.humidity != null ? `${Math.round(info.humidity)}%` : "--";
  el("windVal").textContent = info.wind != null ? `${Math.round(info.wind)} km/h` : "--";
  el("rainVal").textContent = info.rainProb != null ? `${Math.round(info.rainProb)}%` : "--";

  const t = I18N[currentLang].ui;
  const note = el("noteText");
  if (info.mode === "avg") {
    note.textContent = t.noteAvg;
    note.classList.remove("hidden");
  } else if (info.mode === "archive") {
    note.textContent = t.noteArchive;
    note.classList.remove("hidden");
  } else {
    note.classList.add("hidden");
  }

  renderHourStrip(info.hourly);
  updateSky(w, info.isDay);
}

/* ================= Sky visuals ================= */
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
    const size = 60 + Math.random() * 70;
    c.style.width = `${size}px`;
    c.style.height = `${size * 0.4}px`;
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

/* ================= Install (PWA) =================
   Android/desktop Chrome & Edge: real native "Add to Home screen" prompt
   via the beforeinstallprompt event — one tap, no manual steps.
   iOS Safari: Apple gives websites NO API to trigger install — this is a
   platform restriction (true for every website, not just this one), so we
   show the manual Share -> Add to Home Screen steps instead.
*/
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

let deferredPrompt = null;
let promptArrived = false;

function refreshInstallButtonLabel() {
  installBtn.textContent = I18N[currentLang].ui.installBtn;
}

// Start hidden. iOS never fires beforeinstallprompt, so show the button for it
// right away (it will open manual steps — Apple gives no install API to websites).
// On Android/desktop we WAIT for the real beforeinstallprompt event before
// showing anything, so we never race ahead of the browser's own signal with a
// premature "open the menu" fallback when a real one-tap install was seconds away.
if (isStandalone) {
  installBtn.classList.add("hidden");
} else if (isIOS) {
  installBtn.classList.remove("hidden");
} else {
  installBtn.classList.add("hidden");
  // Safety net: if the browser never fires the event (unsupported browser,
  // already installed elsewhere, criteria genuinely unmet), reveal a button
  // after a few seconds so the user isn't left with nothing to tap.
  setTimeout(() => {
    if (!promptArrived && !isStandalone) installBtn.classList.remove("hidden");
  }, 3000);
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  promptArrived = true;
  installBtn.classList.remove("hidden");
});

installBtn.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    return;
  }
  openInstallModal(isIOS ? "ios" : "generic");
});

window.addEventListener("appinstalled", () => {
  installBtn.classList.add("hidden");
  closeInstallModal();
});

function openInstallModal(kind) {
  const t = I18N[currentLang].ui;
  el("installModalTitle").textContent = t.installModalTitle;
  el("installModalBody").textContent = kind === "ios" ? t.installModalIos : t.installModalGeneric;
  installModal.classList.remove("hidden");
}
function closeInstallModal() {
  installModal.classList.add("hidden");
}
el("installModalClose").addEventListener("click", closeInstallModal);
installModal.addEventListener("click", (e) => {
  if (e.target === installModal) closeInstallModal();
});

/* ================= Service worker ================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

/* ================= Boot ================= */
applyTranslations();
