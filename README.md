# PON_Tool
# Typing AISS Club — Weather Dashboard

A small, dependency-free weather dashboard that fetches weather data from Open-Meteo (no API key required). Features:
- Search by city name (geocoding via Open-Meteo)
- Use browser geolocation to get local weather
- Shows current weather (temperature, wind, simple emoji icon) and a short daily forecast
- Accessible, responsive, and easy to host as a static site

How it works
- Geocoding: https://geocoding-api.open-meteo.com (no key)
- Weather: https://api.open-meteo.com/v1/forecast (current_weather + daily forecast + hourly optional)

Files
- index.html — main page
- styles.css — styling
- app.js — client-side logic

Run locally
1. Clone or copy the files into a folder.
2. Serve them with a simple static server (recommended) so fetch and geolocation work properly:
   - Python 3:
     ```
     python -m http.server 8000
     ```
     Then open http://localhost:8000
   - Or use any static server (live-server, serve, etc.)

Deploy to the public web
- GitHub Pages:
  - Create a repo, push the files, enable Pages from the repository Settings → Pages → Source = main / root.
  - Optionally set a custom domain.
- Netlify:
  - Drag & drop the site folder or connect the repo (automatic deploys).
- Vercel:
  - Import the repository and deploy (zero config for static).
- S3 + CloudFront:
  - Upload files to an S3 bucket and set up CloudFront for HTTPS.

Notes & improvements
- This implementation uses Open-Meteo which is free and requires no API key. If you prefer OpenWeatherMap or other providers, replace the geocoding and weather endpoints and handle API keys.
- You can extend the UI with icons from a weather icon set, hourly charts (Chart.js), or additional details (humidity, precipitation probability).
- Consider caching responses (IndexedDB/localStorage) for offline or rate-limited use.

Privacy
- Geolocation is only used when the user clicks "Use my location" and is handled entirely on the client. No data is sent to any server besides the public APIs used to fetch weather and geocoding.

License
- MIT — adapt and reuse as you like.
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Typing AISS Club — Weather Dashboard</title>
  <meta name="description" content="Typing AISS Club Weather Dashboard — current weather and short forecast using Open-Meteo (no API key)." />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="site-header">
    <div class="container">
      <h1>Typing AISS Club</h1>
      <p class="tagline">Weather Dashboard</p>
    </div>
  </header>

  <main class="container" id="main" role="main">
    <section class="controls" aria-label="Search and location">
      <div class="row">
        <label for="city-input" class="visually-hidden">City</label>
        <input id="city-input" type="search" placeholder="Search city (e.g. London, Hanoi)" aria-label="Search city" />
        <button id="search-btn" type="button">Search</button>
        <button id="locate-btn" type="button">Use my location</button>
      </div>
      <p id="status" class="status" aria-live="polite"></p>
    </section>

    <section id="weather" class="weather" aria-label="Weather information" hidden>
      <article class="current card" id="current-weather" aria-live="polite"></article>
      <aside class="forecast card" id="forecast" aria-label="Forecast"></aside>
    </section>

    <section id="notes" class="notes" aria-label="Notes / details"></section>
  </main>

  <footer class="site-footer">
    <div class="container">
      <small>Powered by <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo</a>. No API key required.</small>
    </div>
  </footer>

  <script src="app.js" defer></script>
</body>
</html>
:root{
  --bg:#f7fafc;
  --card:#ffffff;
  --muted:#61748b;
  --accent:#2563eb;
  --radius:12px;
  --gap:16px;
  --max-width:980px;
  --shadow: 0 6px 20px rgba(16,24,40,0.06);
  color-scheme: light;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  background:linear-gradient(180deg,var(--bg),#eef2f7);
  color:#0f172a;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}

.container{
  max-width:var(--max-width);
  margin:0 auto;
  padding:20px;
}

.site-header{
  padding:18px 0 0;
}
.site-header h1{
  margin:0;
  font-size:1.25rem;
}
.tagline{margin:.25rem 0 0;color:var(--muted);font-size:.95rem}

.controls .row{
  display:flex;
  gap:10px;
  margin:18px 0;
}
input[type="search"]{
  flex:1;
  padding:10px 12px;
  border-radius:10px;
  border:1px solid #e6edf6;
  background:#fff;
  box-shadow:var(--shadow);
}
button{
  padding:10px 14px;
  border:0;
  border-radius:10px;
  background:var(--accent);
  color:white;
  cursor:pointer;
  font-weight:600;
}
button[aria-pressed="true"]{outline:3px solid rgba(37,99,235,0.18)}

.status{color:var(--muted);margin:8px 0 0}

.weather{
  display:grid;
  gap:var(--gap);
  grid-template-columns:1fr;
  margin-top:18px;
}
.card{
  background:var(--card);
  padding:18px;
  border-radius:var(--radius);
  box-shadow:var(--shadow);
}

.current{
  display:flex;
  align-items:center;
  gap:18px;
  flex-wrap:wrap;
}
.current .temp{
  font-size:3rem;
  font-weight:700;
  line-height:1;
}
.meta{color:var(--muted)}
.place{font-weight:700}

.forecast{
  display:flex;
  gap:10px;
  overflow:auto;
  padding-bottom:8px;
}
.forecast .day{
  min-width:110px;
  background:linear-gradient(180deg,#fcfcff,#f6f8ff);
  padding:10px;
  border-radius:10px;
  text-align:center;
}
.forecast .day .date{font-weight:700;margin-bottom:6px}
.forecast .day .temps{color:var(--muted);font-size:.95rem}

.notes{margin-top:12px;color:var(--muted);font-size:.95rem}

.visually-hidden{
  position:absolute !important;
  height:1px;width:1px;
  overflow:hidden;clip:rect(1px,1px,1px,1px);
  white-space:nowrap;border:0;padding:0;margin:-1px;
}

/* Responsive */
@media(min-width:880px){
  .weather{
    grid-template-columns:2fr 1fr;
  }
  .forecast{
    flex-direction:column;
    overflow:visible;
  }
  .forecast .day{min-width:auto}
}// app.js - Weather Dashboard using Open-Meteo (no API key)
// Features:
// - Search cities via Open-Meteo geocoding
// - Use browser geolocation
// - Fetch current weather + daily forecast (max/min) and hourly temps
// - Simple, dependency-free, accessible

const DOM = {
  cityInput: document.getElementById('city-input'),
  searchBtn: document.getElementById('search-btn'),
  locateBtn: document.getElementById('locate-btn'),
  status: document.getElementById('status'),
  weatherSection: document.getElementById('weather'),
  currentCard: document.getElementById('current-weather'),
  forecastCard: document.getElementById('forecast'),
  notes: document.getElementById('notes'),
};

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const MAX_FORECAST_DAYS = 6;

function setStatus(msg, isError = false) {
  DOM.status.textContent = msg || '';
  DOM.status.style.color = isError ? 'crimson' : '';
}

function showWeather() { DOM.weatherSection.hidden = false; }
function hideWeather() { DOM.weatherSection.hidden = true; }

function weatherCodeToEmoji(code) {
  // simplified mapping from WMO weather codes to emoji
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '⛅';
  if (code >= 45 && code <= 48) return '🌫️';
  if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return '🌨️';
  if (code >= 95 && code <= 99) return '🌩️';
  return '🌤️';
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

async function geocodeCity(query) {
  const url = `${GEO_API}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error('No matching location found');
  // prefer the first result
  return data.results[0];
}

async function fetchWeather(lat, lon, timezone = 'auto') {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current_weather: 'true',
    timezone,
    daily: 'temperature_2m_max,temperature_2m_min,weathercode',
    // include hourly temps (optional, could be used to show hourly chart)
    hourly: 'temperature_2m,relativehumidity_2m',
  });
  const url = `${WEATHER_API}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather request failed');
  return res.json();
}

function renderCurrent(placeLabel, coords, current) {
  const emoji = weatherCodeToEmoji(current.weathercode);
  const html = `
    <div aria-hidden="true" class="weather-emoji" style="font-size:3.2rem">${emoji}</div>
    <div>
      <div class="place">${placeLabel}</div>
      <div class="meta">Lat ${coords.latitude.toFixed(3)}, Lon ${coords.longitude.toFixed(3)}</div>
      <div style="height:8px"></div>
      <div class="temp">${Math.round(current.temperature)}°C</div>
      <div class="meta">Wind ${Math.round(current.windspeed)} km/h • ${current.weathercode} code</div>
    </div>
  `;
  DOM.currentCard.innerHTML = html;
}

function renderForecast(daily) {
  // daily: {time: [], temperature_2m_max: [], temperature_2m_min: [], weathercode: []}
  const days = Math.min(daily.time.length, MAX_FORECAST_DAYS);
  DOM.forecastCard.innerHTML = ''; // clear
  for (let i = 0; i < days; i++) {
    const date = formatDate(daily.time[i]);
    const max = Math.round(daily.temperature_2m_max[i]);
    const min = Math.round(daily.temperature_2m_min[i]);
    const code = daily.weathercode[i];
    const emoji = weatherCodeToEmoji(code);
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    dayDiv.innerHTML = `
      <div class="date">${date}</div>
      <div class="icon" style="font-size:1.6rem">${emoji}</div>
      <div class="temps">${max}° / ${min}°</div>
    `;
    DOM.forecastCard.appendChild(dayDiv);
  }
}

function saveLastLocation(label) {
  try { localStorage.setItem('typing_aiss_last_loc', label); } catch (e) {/* ignore */}
}

function loadLastLocation() {
  try { return localStorage.getItem('typing_aiss_last_loc'); } catch (e){ return null; }
}

async function showByCoords(lat, lon, placeLabel = `Lat ${lat.toFixed(3)}, Lon ${lon.toFixed(3)}`) {
  setStatus('Fetching weather…');
  try {
    const weather = await fetchWeather(lat, lon);
    renderCurrent(placeLabel, { latitude: lat, longitude: lon }, weather.current_weather);
    renderForecast(weather.daily);
    showWeather();
    setStatus('');
    saveLastLocation(placeLabel);
  } catch (err) {
    setStatus(err.message || 'Failed to fetch weather', true);
    hideWeather();
  }
}

async function handleSearch() {
  const q = DOM.cityInput.value.trim();
  if (!q) return setStatus('Please enter a city name', true);
  setStatus('Searching for location…');
  try {
    const loc = await geocodeCity(q);
    const place = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}${loc.country ? ', ' + loc.country : ''}`;
    await showByCoords(loc.latitude, loc.longitude, place);
  } catch (err) {
    setStatus(err.message || 'Location not found', true);
    hideWeather();
  }
}

async function handleLocate() {
  if (!navigator.geolocation) {
    setStatus('Geolocation not supported in this browser', true);
    return;
  }
  setStatus('Getting your location…');
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    await showByCoords(latitude, longitude, 'Your location');
  }, (err) => {
    setStatus('Permission denied or unable to get location', true);
  }, { timeout: 10000 });
}

function initEventListeners() {
  DOM.searchBtn.addEventListener('click', handleSearch);
  DOM.locateBtn.addEventListener('click', handleLocate);
  DOM.cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

async function init() {
  initEventListeners();
  // try last location
  const last = loadLastLocation();
  if (last) {
    setStatus('Restoring last location: ' + last);
    // we don't have coords, but show last label and prompt user to search or locate
    DOM.notes.textContent = `Last viewed: ${last}. Use Search or 'Use my location' to refresh.`;
    setTimeout(() => setStatus(''), 2000);
  } else {
    setStatus('Enter a city or press "Use my location" to get started.');
  }
}

// start
init();