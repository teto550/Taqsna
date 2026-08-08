"use strict";

/* ======================================================================
   i18n
====================================================================== */
const WCODE_META = {
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

const I18N = {
  ar: {
    dir: "rtl",
    geoLang: "ar",
    weekdays: ["الأحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"],
    months: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
    wcodes: {
      0:"سماء صافية",1:"صافية غالباً",2:"غيوم متفرقة",3:"غائم",45:"ضباب",48:"ضباب متجمد",
      51:"رذاذ خفيف",53:"رذاذ",55:"رذاذ كثيف",56:"رذاذ متجمد",57:"رذاذ متجمد كثيف",
      61:"مطر خفيف",63:"مطر",65:"مطر غزير",66:"مطر متجمد",67:"مطر متجمد غزير",
      71:"ثلج خفيف",73:"ثلج",75:"ثلج غزير",77:"حبيبات ثلج",
      80:"زخات مطر خفيفة",81:"زخات مطر",82:"زخات مطر غزيرة",85:"زخات ثلج خفيفة",86:"زخات ثلج غزيرة",
      95:"عاصفة رعدية",96:"عاصفة رعدية وبرَد",99:"عاصفة رعدية شديدة",
    },
    strings: {
      tagline: "اسأل عن أي مكان... في أي يوم",
      fieldPlace: "المكان",
      searchPlaceholder: "اكتب اسم بلد أو محافظة أو مدينة... مثلاً: الفيوم",
      locateTitle: "استخدم موقعي الحالي",
      mapTitle: "اختار من الخريطة",
      mapHint: "دوس على أي نقطة على الخريطة عشان تختارها",
      fieldDay: "اليوم",
      chipToday: "النهاردة",
      goBtn: "اعرض الطقس",
      goBtnLoading: "بنجيب الطقس...",
      statHumidity: "رطوبة",
      statWind: "رياح",
      statRain: "فرصة مطر",
      statusInitial: 'دور على مكان واضغط "اعرض الطقس"',
      statusLocating: "بنحدد موقعك...",
      statusNoLocation: "مقدرناش نوصل لموقعك، اكتب اسم المكان بدل كده",
      statusChoosePlaceFirst: "لازم تختار مكان الأول من قائمة الاقتراحات 🙏",
      statusFetchError: "معرفناش نجيب بيانات الطقس دلوقتي. جرب تاني كمان شوية 🙏",
      noteAvg: "اليوم ده بعيد عن حدود التوقع الدقيق (16 يوم)، فالأرقام دي متوسط الطقس في نفس اليوم من السنين اللي فاتت، مش توقع مؤكد.",
      noteArchive: "دي بيانات أرشيف فعلية لليوم ده اللي فات.",
      windUnit: "كم/س",
      currentLocationName: "موقعك الحالي",
      nowLabel: "دلوقتي",
      installBtn: "📲 ثبّت التطبيق على الشاشة الرئيسية",
      installModalTitle: "إزاي تثبت التطبيق",
      installModalIos: 'دوس على زرار المشاركة ⬆️ تحت في المتصفح، بعدين اختار "إضافة للشاشة الرئيسية".',
      installModalDesktop: 'دوس على أيقونة التثبيت ⊕ اللي في شريط عنوان المتصفح، أو من قائمة المتصفح اختار "تثبيت التطبيق".',
      installModalGeneric: 'من قائمة المتصفح (⋮ أو ⋯) دور على "إضافة للشاشة الرئيسية" أو "تثبيت التطبيق".',
      closeBtn: "تمام",
    },
  },
  en: {
    dir: "ltr",
    geoLang: "en",
    weekdays: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    wcodes: {
      0:"Clear sky",1:"Mostly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Rime fog",
      51:"Light drizzle",53:"Drizzle",55:"Dense drizzle",56:"Freezing drizzle",57:"Dense freezing drizzle",
      61:"Light rain",63:"Rain",65:"Heavy rain",66:"Freezing rain",67:"Heavy freezing rain",
      71:"Light snow",73:"Snow",75:"Heavy snow",77:"Snow grains",
      80:"Light rain showers",81:"Rain showers",82:"Violent rain showers",85:"Light snow showers",86:"Heavy snow showers",
      95:"Thunderstorm",96:"Thunderstorm with hail",99:"Severe thunderstorm",
    },
    strings: {
      tagline: "Ask about any place... on any day",
      fieldPlace: "Place",
      searchPlaceholder: "Type a country, region or city... e.g. Cairo",
      locateTitle: "Use my current location",
      mapTitle: "Pick from the map",
      mapHint: "Tap anywhere on the map to pick that point",
      fieldDay: "Day",
      chipToday: "Today",
      goBtn: "Show weather",
      goBtnLoading: "Fetching weather...",
      statHumidity: "Humidity",
      statWind: "Wind",
      statRain: "Rain chance",
      statusInitial: 'Search for a place and press "Show weather"',
      statusLocating: "Finding your location...",
      statusNoLocation: "Couldn't get your location, type a place name instead",
      statusChoosePlaceFirst: "Pick a place from the suggestions first 🙏",
      statusFetchError: "Couldn't fetch weather data right now. Try again in a bit 🙏",
      noteAvg: "This day is beyond the accurate forecast range (16 days), so these numbers are a historical average for the same date over past years, not a confirmed forecast.",
      noteArchive: "This is real archived data for this past day.",
      windUnit: "km/h",
      currentLocationName: "Your location",
      nowLabel: "Now",
      installBtn: "📲 Install app to Home Screen",
      installModalTitle: "How to install the app",
      installModalIos: 'Tap the Share button ⬆️ in your browser, then choose "Add to Home Screen".',
      installModalDesktop: 'Click the install icon ⊕ in the address bar, or open the browser menu and choose "Install app".',
      installModalGeneric: 'Open the browser menu (⋮ or ⋯) and look for "Add to Home Screen" or "Install app".',
      closeBtn: "Got it",
    },
  },
  fr: {
    dir: "ltr",
    geoLang: "fr",
    weekdays: ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],
    months: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
    wcodes: {
      0:"Ciel dégagé",1:"Plutôt dégagé",2:"Partiellement nuageux",3:"Couvert",45:"Brouillard",48:"Brouillard givrant",
      51:"Bruine légère",53:"Bruine",55:"Bruine dense",56:"Bruine verglaçante",57:"Bruine verglaçante dense",
      61:"Pluie légère",63:"Pluie",65:"Forte pluie",66:"Pluie verglaçante",67:"Forte pluie verglaçante",
      71:"Neige légère",73:"Neige",75:"Forte neige",77:"Grains de neige",
      80:"Averses légères",81:"Averses de pluie",82:"Averses violentes",85:"Averses de neige légères",86:"Fortes averses de neige",
      95:"Orage",96:"Orage avec grêle",99:"Orage violent",
    },
    strings: {
      tagline: "Demandez n'importe quel lieu... n'importe quel jour",
      fieldPlace: "Lieu",
      searchPlaceholder: "Tapez un pays, une région ou une ville... ex. Le Caire",
      locateTitle: "Utiliser ma position actuelle",
      mapTitle: "Choisir sur la carte",
      mapHint: "Touchez un point sur la carte pour le choisir",
      fieldDay: "Jour",
      chipToday: "Aujourd'hui",
      goBtn: "Afficher la météo",
      goBtnLoading: "Récupération de la météo...",
      statHumidity: "Humidité",
      statWind: "Vent",
      statRain: "Chance de pluie",
      statusInitial: 'Cherchez un lieu puis appuyez sur "Afficher la météo"',
      statusLocating: "Recherche de votre position...",
      statusNoLocation: "Impossible d'obtenir votre position, tapez un lieu à la place",
      statusChoosePlaceFirst: "Choisissez d'abord un lieu dans les suggestions 🙏",
      statusFetchError: "Impossible de récupérer la météo pour le moment. Réessayez bientôt 🙏",
      noteAvg: "Ce jour dépasse la portée de prévision précise (16 jours), ces chiffres sont donc une moyenne historique pour la même date au cours des dernières années, pas une prévision confirmée.",
      noteArchive: "Voici les données d'archive réelles pour ce jour passé.",
      windUnit: "km/h",
      currentLocationName: "Votre position",
      nowLabel: "Maint.",
      installBtn: "📲 Installer l'app sur l'écran d'accueil",
      installModalTitle: "Comment installer l'app",
      installModalIos: "Appuyez sur le bouton Partager ⬆️ du navigateur, puis choisissez « Sur l'écran d'accueil ».",
      installModalDesktop: "Cliquez sur l'icône d'installation ⊕ dans la barre d'adresse, ou ouvrez le menu du navigateur et choisissez « Installer l'application ».",
      installModalGeneric: "Ouvrez le menu du navigateur (⋮ ou ⋯) et cherchez « Ajouter à l'écran d'accueil » ou « Installer l'application ».",
      closeBtn: "Compris",
    },
  },
};

let currentLang = localStorage.getItem("weatherAppLang") || "ar";
if (!I18N[currentLang]) currentLang = "ar";

function t(key) {
  return (I18N[currentLang].strings[key]) ?? (I18N.ar.strings[key]) ?? key;
}
function wcodeText(code) {
  return I18N[currentLang].wcodes[code] || I18N.ar.wcodes[code] || "--";
}
function wcodeMeta(code) {
  return WCODE_META[code] || { icon: "🌡️", moon: "🌙", cloud: 0.3 };
}

/* ======================================================================
   Date helpers
====================================================================== */
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
  const L = I18N[currentLang];
  return `${L.weekdays[d.getDay()]} ${d.getDate()} ${L.months[d.getMonth()]}`;
}

/* ======================================================================
   State
====================================================================== */
let selectedPlace = null;
let selectedDate = todayISO();
let selectedHour = null;
let searchDebounce = null;
let weekCache = null;
let hourCache = null;
let lastRenderInfo = null;
let leafletMap = null;
let mapMarker = null;

/* ======================================================================
   DOM
====================================================================== */
const el = (id) => document.getElementById(id);
const citySearch = el("citySearch");
const suggestions = el("suggestions");
const dateInput = el("dateInput");
const dateChips = el("dateChips");
const goBtn = el("goBtn");
const resultArea = el("resultArea");
const statusArea = el("statusArea");
const installBtn = el("installBtn");
const mapBtn = el("mapBtn");
const mapWrap = el("mapWrap");
const mapContainer = el("mapContainer");
const langSelect = el("langSelect");
const installModal = el("installModal");
const installModalBody = el("installModalBody");

dateInput.value = selectedDate;

/* ======================================================================
   i18n application
====================================================================== */
function applyLanguage(lang, { rerender = true } = {}) {
  if (!I18N[lang]) lang = "ar";
  currentLang = lang;
  localStorage.setItem("weatherAppLang", lang);

  const L = I18N[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = L.dir;
  langSelect.value = lang;

  document.querySelectorAll("[data-i18n]").forEach((elm) => {
    elm.textContent = t(elm.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((elm) => {
    elm.placeholder = t(elm.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((elm) => {
    elm.title = t(elm.dataset.i18nTitle);
    elm.setAttribute("aria-label", t(elm.dataset.i18nTitle));
  });

  if (statusArea.children.length && !lastRenderInfo) {
    setStatus(t("statusInitial"));
  }

  if (rerender && lastRenderInfo) {
    renderDay(lastRenderInfo, { skipSky: true });
    if (weekCache) renderWeekStrip(weekCache);
    if (hourCache && lastRenderInfo.mode === "forecast") renderHourStrip(hourCache);
  }
}

langSelect.addEventListener("change", () => applyLanguage(langSelect.value));

/* ======================================================================
   Geocoding search
====================================================================== */
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
    const lang = I18N[currentLang].geoLang;
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=${lang}&format=json`;
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
  hourCache = null;
  syncMapToPlace();
}

/* ======================================================================
   Geolocation
====================================================================== */
el("locateBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus(t("statusNoLocation"));
    return;
  }
  setStatus(t("statusLocating"));
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      await setPlaceFromCoords(latitude, longitude);
      setStatus(t("statusInitial"));
      fetchAndRender();
    },
    () => setStatus(t("statusNoLocation"))
  );
});

async function setPlaceFromCoords(latitude, longitude) {
  let name = t("currentLocationName");
  let admin1 = "";
  let country = "";
  try {
    const rev = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${I18N[currentLang].geoLang}`
    );
    const j = await rev.json();
    name = j.city || j.locality || name;
    admin1 = j.principalSubdivision || "";
    country = j.countryName || "";
  } catch (e) {}
  selectedPlace = { name, admin1, country, lat: latitude, lon: longitude };
  citySearch.value = [name, admin1].filter(Boolean).join("، ");
  weekCache = null;
  hourCache = null;
  syncMapToPlace();
}

/* ======================================================================
   Map picker (Leaflet + OpenStreetMap)
====================================================================== */
mapBtn.addEventListener("click", () => {
  const willShow = mapWrap.classList.contains("hidden");
  mapWrap.classList.toggle("hidden");
  if (willShow) {
    setTimeout(initMap, 30);
  }
});

function initMap() {
  const startLat = selectedPlace ? selectedPlace.lat : 30.0444;
  const startLon = selectedPlace ? selectedPlace.lon : 31.2357;

  if (!leafletMap) {
    leafletMap = L.map(mapContainer, { attributionControl: true }).setView([startLat, startLon], 9);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(leafletMap);

    leafletMap.on("click", async (e) => {
      await pickMapPoint(e.latlng.lat, e.latlng.lng);
    });

    if (selectedPlace) {
      mapMarker = L.marker([startLat, startLon]).addTo(leafletMap);
    }
  } else {
    leafletMap.invalidateSize();
    leafletMap.setView([startLat, startLon], leafletMap.getZoom() || 9);
  }
}

async function pickMapPoint(lat, lon) {
  if (!mapMarker) {
    mapMarker = L.marker([lat, lon]).addTo(leafletMap);
  } else {
    mapMarker.setLatLng([lat, lon]);
  }
  await setPlaceFromCoords(lat, lon);
  mapMarker.bindPopup(`<span class="map-pin-popup">${citySearch.value}</span>`).openPopup();
}

function syncMapToPlace() {
  if (!leafletMap || !selectedPlace) return;
  leafletMap.setView([selectedPlace.lat, selectedPlace.lon], leafletMap.getZoom() || 9);
  if (!mapMarker) {
    mapMarker = L.marker([selectedPlace.lat, selectedPlace.lon]).addTo(leafletMap);
  } else {
    mapMarker.setLatLng([selectedPlace.lat, selectedPlace.lon]);
  }
}

/* ======================================================================
   Date controls
====================================================================== */
dateChips.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  btn.classList.add("active");
  selectedDate = addDays(todayISO(), Number(btn.dataset.offset));
  selectedHour = null;
  dateInput.value = selectedDate;
});

dateInput.addEventListener("change", () => {
  selectedDate = dateInput.value || todayISO();
  selectedHour = null;
  [...dateChips.children].forEach((c) => c.classList.remove("active"));
  if (selectedDate === todayISO()) dateChips.children[0].classList.add("active");
});

goBtn.addEventListener("click", fetchAndRender);

/* ======================================================================
   Fetch + mode selection
====================================================================== */
async function fetchAndRender() {
  if (!selectedPlace) {
    setStatus(t("statusChoosePlaceFirst"));
    return;
  }
  const today = todayISO();
  const offset = daysBetween(today, selectedDate);
  goBtn.disabled = true;
  goBtn.textContent = t("goBtnLoading");
  setStatus("");
  hourCache = null;
  selectedHour = null;

  try {
    if (offset >= 0 && offset <= 15) {
      const data = await fetchForecastRange(selectedPlace, selectedDate, selectedDate);
      const info = {
        mode: "forecast",
        date: selectedDate,
        code: data.daily.weathercode[0],
        tmax: data.daily.temperature_2m_max[0],
        tmin: data.daily.temperature_2m_min[0],
        rainProb: data.daily.precipitation_probability_max[0],
        wind: data.daily.windspeed_10m_max[0],
        humidity: nearestHumidity(data),
        isDay: offset === 0 ? data.current_weather.is_day : 1,
      };
      lastRenderInfo = info;
      renderDay(info);
      loadWeekStrip();
      loadHourStrip();
    } else if (offset < 0) {
      const data = await fetchArchiveRange(selectedPlace, selectedDate, selectedDate);
      if (!data.daily || data.daily.weathercode[0] === null || data.daily.weathercode[0] === undefined) {
        throw new Error("no-archive-data");
      }
      const info = {
        mode: "archive",
        date: selectedDate,
        code: data.daily.weathercode[0],
        tmax: data.daily.temperature_2m_max[0],
        tmin: data.daily.temperature_2m_min[0],
        rainProb: null,
        wind: data.daily.windspeed_10m_max[0],
        humidity: null,
        isDay: 1,
      };
      lastRenderInfo = info;
      renderDay(info);
      el("hourStrip").classList.add("hidden");
    } else {
      const avg = await fetchHistoricalAverage(selectedPlace, selectedDate);
      const info = {
        mode: "avg",
        date: selectedDate,
        code: avg.code,
        tmax: avg.tmax,
        tmin: avg.tmin,
        rainProb: null,
        wind: avg.wind,
        humidity: null,
        isDay: 1,
      };
      lastRenderInfo = info;
      renderDay(info);
      el("hourStrip").classList.add("hidden");
    }
    resultArea.classList.remove("hidden");
  } catch (e) {
    console.error(e);
    setStatus(t("statusFetchError"));
  } finally {
    goBtn.disabled = false;
    goBtn.textContent = t("goBtn");
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

/* ======================================================================
   Hourly strip
====================================================================== */
async function loadHourStrip() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${selectedPlace.lat}&longitude=${selectedPlace.lon}` +
      `&hourly=temperature_2m,weathercode,relative_humidity_2m,windspeed_10m,precipitation_probability` +
      `&timezone=auto&start_date=${selectedDate}&end_date=${selectedDate}`;
    const res = await fetch(url);
    hourCache = await res.json();
    renderHourStrip(hourCache);
  } catch (e) {
    el("hourStrip").classList.add("hidden");
  }
}

function renderHourStrip(data) {
  const strip = el("hourStrip");
  if (!data || !data.hourly) {
    strip.classList.add("hidden");
    return;
  }
  strip.innerHTML = "";
  strip.classList.remove("hidden");

  const times = data.hourly.time;
  const nowHour = selectedDate === todayISO() ? new Date().getHours() : null;

  times.forEach((tm, i) => {
    const hour = Number(tm.slice(11, 13));
    const w = wcodeMeta(data.hourly.weathercode[i]);
    const isDay = hour >= 6 && hour < 18;
    const pill = document.createElement("div");
    pill.className = "hour-pill" + (selectedHour === hour ? " active" : "");
    const hourLabel = nowHour === hour ? t("nowLabel") : `${hour}:00`;
    pill.innerHTML = `
      <div class="h-name">${hourLabel}</div>
      <div class="h-icon">${isDay ? w.icon : w.moon}</div>
      <div class="h-temp">${Math.round(data.hourly.temperature_2m[i])}°</div>
    `;
    pill.addEventListener("click", () => {
      selectedHour = hour;
      applyHourSelection(i, data);
      [...strip.children].forEach((c) => c.classList.remove("active"));
      pill.classList.add("active");
    });
    strip.appendChild(pill);
  });
}

function applyHourSelection(index, data) {
  if (!lastRenderInfo) return;
  const hourNum = Number(data.hourly.time[index].slice(11, 13));
  const isDay = hourNum >= 6 && hourNum < 18;
  const w = wcodeMeta(data.hourly.weathercode[index]);
  el("weatherIcon").textContent = isDay ? w.icon : w.moon;
  el("tempValue").textContent = Math.round(data.hourly.temperature_2m[index]);
  el("descText").textContent = wcodeText(data.hourly.weathercode[index]);
  el("humidityVal").textContent = `${Math.round(data.hourly.relative_humidity_2m[index])}%`;
  el("windVal").textContent = `${Math.round(data.hourly.windspeed_10m[index])} ${t("windUnit")}`;
  el("rainVal").textContent = `${Math.round(data.hourly.precipitation_probability[index])}%`;
  updateSky(w, isDay ? 1 : 0);
}

/* ======================================================================
   Week strip
====================================================================== */
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
    /* silent */
  }
}

function renderWeekStrip(data) {
  const strip = el("weekStrip");
  strip.innerHTML = "";
  const days = data.daily.time;
  const L = I18N[currentLang];
  days.forEach((d, i) => {
    const w = wcodeMeta(data.daily.weathercode[i]);
    const pill = document.createElement("div");
    pill.className = "day-pill" + (d === selectedDate ? " active" : "");
    pill.innerHTML = `
      <div class="d-name">${i === 0 ? t("chipToday") : L.weekdays[new Date(d + "T00:00:00").getDay()]}</div>
      <div class="d-icon">${w.icon}</div>
      <div class="d-temp">${Math.round(data.daily.temperature_2m_max[i])}°/${Math.round(data.daily.temperature_2m_min[i])}°</div>
    `;
    pill.addEventListener("click", () => {
      selectedDate = d;
      selectedHour = null;
      dateInput.value = d;
      [...dateChips.children].forEach((c) => c.classList.remove("active"));
      if (d === todayISO()) dateChips.children[0].classList.add("active");
      fetchAndRender();
    });
    strip.appendChild(pill);
  });
}

/* ======================================================================
   Render
====================================================================== */
function renderDay(info, opts = {}) {
  const w = wcodeMeta(info.code);

  el("placeName").textContent = selectedPlace ? [selectedPlace.name, selectedPlace.admin1].filter(Boolean).join("، ") : "--";
  el("placeDate").textContent = fmtDateLabel(info.date);
  el("weatherIcon").textContent = info.isDay ? w.icon : w.moon;
  el("tempValue").textContent = Math.round((info.tmax + info.tmin) / 2);
  el("descText").textContent = wcodeText(info.code);
  el("minMax").textContent = currentLang === "ar"
    ? `أعلى ${Math.round(info.tmax)}° / أقل ${Math.round(info.tmin)}°`
    : currentLang === "fr"
      ? `Max ${Math.round(info.tmax)}° / Min ${Math.round(info.tmin)}°`
      : `High ${Math.round(info.tmax)}° / Low ${Math.round(info.tmin)}°`;

  el("humidityVal").textContent = info.humidity != null ? `${Math.round(info.humidity)}%` : "--";
  el("windVal").textContent = info.wind != null ? `${Math.round(info.wind)} ${t("windUnit")}` : "--";
  el("rainVal").textContent = info.rainProb != null ? `${Math.round(info.rainProb)}%` : "--";

  const note = el("noteText");
  if (info.mode === "avg") {
    note.textContent = t("noteAvg");
    note.classList.remove("hidden");
  } else if (info.mode === "archive") {
    note.textContent = t("noteArchive");
    note.classList.remove("hidden");
  } else {
    note.classList.add("hidden");
  }

  if (!opts.skipSky) updateSky(w, info.isDay);
}

/* ======================================================================
   Sky visuals
====================================================================== */
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

/* ======================================================================
   PWA install
====================================================================== */
let deferredPrompt = null;
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

function initInstallButton() {
  if (isStandalone()) {
    installBtn.classList.add("hidden");
    return;
  }
  installBtn.classList.remove("hidden");
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  initInstallButton();
});

installBtn.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (choice.outcome === "accepted") installBtn.classList.add("hidden");
    return;
  }
  showInstallModal();
});

function showInstallModal() {
  let bodyKey = "installModalGeneric";
  if (isIOS()) bodyKey = "installModalIos";
  else if (!/Mobi|Android/i.test(navigator.userAgent)) bodyKey = "installModalDesktop";
  installModalBody.textContent = t(bodyKey);
  installModalBody.dataset.i18n = bodyKey;
  installModal.classList.remove("hidden");
}
el("installModalClose").addEventListener("click", () => installModal.classList.add("hidden"));
installModal.addEventListener("click", (e) => {
  if (e.target === installModal) installModal.classList.add("hidden");
});

window.addEventListener("appinstalled", () => installBtn.classList.add("hidden"));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

/* ======================================================================
   Init
====================================================================== */
(function init() {
  applyLanguage(currentLang, { rerender: false });
  initInstallButton();

  selectedPlace = { name: "القاهرة", admin1: "محافظة القاهرة", country: "مصر", lat: 30.0444, lon: 31.2357 };
  citySearch.value = "القاهرة، محافظة القاهرة";
})();
