/* =================================================================
   Weather App Script
   ================================================================= */

// === 1. CONFIGURATION ===

// 🔹 Replace with your real key (keep private in local environment)
const apiKey = "0f507d4c5d4d427e94a95710250811";
const baseUrl = "https://api.weatherapi.com/v1/current.json";

// === 2. DOM ELEMENTS ===
// (Grouped all element selections from your snippets)

const cityInput = document.getElementById("cityInput");
const getWeatherBtn = document.getElementById("getWeatherBtn");
const weatherResult = document.getElementById("weatherResult");
const checkWeatherBtn = document.getElementById("checkWeatherNowBtn");
const weatherSection = document.getElementById("weather-section");
const canvas = document.getElementById('fixedBgCanvas');
const ctx = canvas.getContext('2d');

// Note: These elements are used in your tip functions but not defined.
// Make sure they exist in your HTML.
const metricsPanel = document.getElementById('metricsPanel');
const advicePanel = document.getElementById('advicePanel');
let latestData = null; // Assuming 'latestData' is defined globally for tip functions

// === 3. HELPER FUNCTIONS ===

/**
 * Sanitizes a string to prevent HTML injection.
 * @param {string} s - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeHtml(s) {
  return String(s || '').replace(
    /[&<>"']/g,
    m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m])
  );
}

// === 4. CANVAS BACKGROUND ANIMATION ===

/**
 * Resizes the canvas to fill the screen, accounting for pixel density.
 */
function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

// Particle setup for animation
const particles = Array.from({
  length: Math.max(80, Math.floor(window.innerWidth / 12))
}, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  r: Math.random() * 3 + 1,
  s: 0.5 + Math.random() * 1.5
}));

/**
 * Main animation loop for the particle effect.
 */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    p.y += p.s;
    p.x += Math.sin(p.y / 40) * 0.4;

    if (p.y > window.innerHeight + 10) {
      p.y = -10;
      p.x = Math.random() * window.innerWidth;
    }
  }
  requestAnimationFrame(loop);
}

// Initial setup
window.addEventListener('resize', resize);
resize();
loop();

// === 5. PAGE INTERACTIONS ===

/**
 * Smoothly scrolls to the weather section and focuses the input.
 * (This is the cleaned, combined version of your two listeners)
 */
checkWeatherBtn.addEventListener("click", () => {
  weatherSection.scrollIntoView({
    behavior: "smooth"
  });
  weatherSection.classList.add("active"); // Highlights the section

  setTimeout(() => {
    cityInput.focus();
  }, 800); // Delay to match scroll time

  setTimeout(() => {
    weatherSection.classList.remove("active");
  }, 2000); // Remove highlight
});

// === 6. SIMPLE WEATHER FETCHER ===

/**
 * Fetches and displays current weather for a city.
 * Note: This is a simple implementation. It does not use the advanced
 * tip-generating functions below.
 */
getWeatherBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (!city) {
    // Note: Using CSS classes is cleaner than inline styles.
    weatherResult.innerHTML = `<p style="color:#ff8080;">Please enter a city name.</p>`;
    return;
  }

  weatherResult.innerHTML = `<p style="color:white;">Fetching weather...</p>`;

  fetch(`${baseUrl}?key=${apiKey}&q=${city}&aqi=no`)
    .then((res) => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then((data) => {
      const {
        location,
        current
      } = data;

      weatherResult.innerHTML = `
        <div style="color:white; text-align:center;">
          <h3>${escapeHtml(location.name)}, ${escapeHtml(location.country)}</h3>
          <img src="https:${current.condition.icon}" alt="Weather Icon" width="64" height="64" />
          <p style="font-size:1.2rem;">${escapeHtml(current.condition.text)}</p>
          <p><strong>Temperature:</strong> ${current.temp_c}°C</p>
          <p><strong>Humidity:</strong> ${current.humidity}%</p>
          <p><strong>Wind Speed:</strong> ${current.wind_kph} km/h</p>
        </div>
      `;
    })
    .catch(() => {
      weatherResult.innerHTML = `<p style="color:#ff8080;">Couldn't fetch weather. Try again.</p>`;
    });
});

// === 7. ADVANCED WEATHER TIP LOGIC ===
// (These functions are preserved as requested, but are not
// called by the simple fetcher above).

/**
 * Generates an array of simple text tips based on weather data.
 * @param {object} data - The weather API data object.
 * @returns {string[]} - An array of advice strings.
 */
function getWeatherTips(data) {
  if (!data || !data.current) return [];

  const cur = data.current;
  const tips = [];
  const text = (cur.condition && cur.condition.text ? cur.condition.text.toLowerCase() : '');
  const tempC = typeof cur.temp_c === 'number' ? cur.temp_c : null;
  const uv = typeof cur.uv === 'number' ? cur.uv : null;
  const windK = typeof cur.wind_kph === 'number' ? cur.wind_kph : null;
  const aqiObj = cur.air_quality || {};
  const usEpa = aqiObj['us-epa-index'] ? Number(aqiObj['us-epa-index']) : null;
  const pm25 = aqiObj.pm2_5 ? Number(aqiObj.pm2_5) : null;

  // Rain / drizzle / shower
  if (text.includes('rain') || text.includes('drizzle') || text.includes('shower') || text.includes('thunder')) {
    tips.push('Carry an umbrella or a waterproof jacket — showers expected.');
  }
  // Snow / freezing conditions
  if (text.includes('snow') || (tempC !== null && tempC <= 5)) {
    tips.push('It’s cold — layer up, and wear insulated shoes if you’ll be outside.');
  }
  // Hot conditions
  if (tempC !== null && tempC >= 30) {
    tips.push('Hot day ahead — stay hydrated and wear light, breathable clothing.');
  }
  // Very hot
  if (tempC !== null && tempC >= 38) {
    tips.push('Heat alert — avoid heavy exertion during midday and seek shade.');
  }
  // Windy
  if (windK !== null && windK >= 50) {
    tips.push('High winds — secure loose items and avoid exposed areas.');
  }
  // UV advice
  if (uv !== null) {
    if (uv >= 11) tips.push('Extreme UV — stay indoors during midday; use SPF 50+ and cover up.');
    else if (uv >= 8) tips.push('Very high UV — wear SPF 30+, hat, and sunglasses.');
    else if (uv >= 6) tips.push('High UV — apply sunscreen and wear protective clothing.');
  }
  // AQI advice
  if (usEpa !== null) {
    if (usEpa >= 5) tips.push('Very unhealthy air — avoid outdoor activities and consider an air purifier.');
    else if (usEpa === 4) tips.push('Unhealthy air — limit prolonged outdoor exertion.');
    else if (usEpa === 3) tips.push('Unhealthy for sensitive groups — sensitive people should be cautious.');
  } else if (pm25 !== null && pm25 > 75) {
    tips.push('High PM2.5 levels — consider limiting outdoor time.');
  }
  // If no specific tips, give a friendly generic one
  if (tips.length === 0) {
    tips.push('Conditions are looking normal — enjoy your day and check hourly updates for changes.');
  }
  return tips;
}

/**
 * Generates an array of rich tip objects (with icons and classes)
 * based on weather data.
 * @param {object} data - The weather API data object.
 * @returns {object[]} - An array of tip objects.
 */
function getWeatherTipsWithIcons(data) {
  if (!data || !data.current) return [];

  const cur = data.current;
  const text = (cur.condition && cur.condition.text ? cur.condition.text.toLowerCase() : '');
  const tempC = typeof cur.temp_c === 'number' ? cur.temp_c : null;
  const uv = typeof cur.uv === 'number' ? cur.uv : null;
  const windK = typeof cur.wind_kph === 'number' ? cur.wind_kph : null;
  const aqiObj = cur.air_quality || {};
  const usEpa = aqiObj['us-epa-index'] ? Number(aqiObj['us-epa-index']) : null;
  const pm25 = aqiObj.pm2_5 ? Number(aqiObj.pm2_5) : null;
  const tips = [];

  /* SVG icons (small, inline) */
  const ICONS = {
    umbrella: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden><path d="M12 2a10 10 0 00-9.95 8.78" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.95 10.78A10 10 0 0012 2c-4.41 0-8.16 2.85-9.49 6.78 1.5-.9 3.4-1.28 5.39-1.28 2.15 0 4.17.5 5.6 1.38 1.43-.88 3.46-1.38 5.45-1.38.96 0 1.88.08 2.99.28z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 14v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    sun: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    mask: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg"><path d="M20 8c0 4-4 8-8 8s-8-4-8-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M4 8v4a4 4 0 004 4h8a4 4 0 004-4V8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    snow: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6M12 16v6M4.5 7.5l5 5M14.5 16.5l5 5M19.5 7.5l-5 5M9.5 16.5l-5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    wind: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg"><path d="M3 10h13a3 3 0 100-6M3 14h11a2 2 0 110 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    uv: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
  };

  // Rainy
  if (text.includes('rain') || text.includes('drizzle') || text.includes('shower') || text.includes('thunder')) {
    tips.push({
      iconSvg: ICONS.umbrella,
      colorClass: 'tip-umbrella',
      title: 'Carry an umbrella',
      text: 'Showers expected — bring an umbrella or a waterproof jacket.',
      tag: 'umbrella'
    });
  }
  // Snow / cold
  if (text.includes('snow') || (tempC !== null && tempC <= 5)) {
    tips.push({
      iconSvg: ICONS.snow,
      colorClass: 'tip-snow',
      title: 'Dress warmly',
      text: 'It’s cold — layer up and wear warm footwear.',
      tag: 'snow'
    });
  }
  // Hot
  if (tempC !== null && tempC >= 30) {
    tips.push({
      iconSvg: ICONS.sun,
      colorClass: 'tip-sun',
      title: 'Stay hydrated',
      text: 'Hot day — drink water frequently and wear breathable clothing.',
      tag: 'sun'
    });
  }
  if (tempC !== null && tempC >= 38) {
    tips.push({
      iconSvg: ICONS.sun,
      colorClass: 'tip-uv',
      title: 'Heat alert',
      text: 'Very hot — avoid heavy exertion around midday.',
      tag: 'heat'
    });
  }
  // Windy
  if (windK !== null && windK >= 50) {
    tips.push({
      iconSvg: ICONS.wind,
      colorClass: 'tip-wind',
      title: 'High winds',
      text: 'Strong winds — secure loose items and avoid open areas.',
      tag: 'wind'
    });
  }
  // UV
  if (uv !== null) {
    if (uv >= 11) tips.push({
      iconSvg: ICONS.uv,
      colorClass: 'tip-uv',
      title: 'Extreme UV',
      text: 'Extreme UV — stay indoors during midday and use SPF50+',
      tag: 'uv'
    });
    else if (uv >= 8) tips.push({
      iconSvg: ICONS.uv,
      colorClass: 'tip-uv',
      title: 'Very high UV',
      text: 'Very high UV — wear SPF30+, hat and sunglasses.',
      tag: 'uv'
    });
    else if (uv >= 6) tips.push({
      iconSvg: ICONS.uv,
      colorClass: 'tip-uv',
      title: 'High UV',
      text: 'High UV — apply sunscreen and protective clothing.',
      tag: 'uv'
    });
  }
  // AQI / pm2.5
  if (usEpa !== null) {
    if (usEpa >= 5) tips.push({
      iconSvg: ICONS.mask,
      colorClass: 'tip-mask',
      title: 'Very unhealthy air',
      text: 'Avoid outdoor activities; consider using an air purifier.',
      tag: 'aqi'
    });
    else if (usEpa === 4) tips.push({
      iconSvg: ICONS.mask,
      colorClass: 'tip-mask',
      title: 'Unhealthy air',
      text: 'Limit prolonged or heavy outdoor exertion.',
      tag: 'aqi'
    });
    else if (usEpa === 3) tips.push({
      iconSvg: ICONS.mask,
      colorClass: 'tip-mask',
      title: 'Sensitive groups caution',
      text: 'Sensitive people should reduce heavy outdoor exertion.',
      tag: 'aqi'
    });
  } else if (pm25 !== null && pm25 > 75) {
    tips.push({
      iconSvg: ICONS.mask,
      colorClass: 'tip-mask',
      title: 'High PM2.5',
      text: 'PM2.5 levels elevated — consider limiting outdoor time.',
      tag: 'aqi'
    });
  }
  // default fallback
  if (tips.length === 0) {
    tips.push({
      iconSvg: ICONS.sun,
      colorClass: 'tip-sun',
      title: 'All clear',
      text: 'Conditions look normal — check hourly updates if you plan to be outdoors.',
      tag: 'ok'
    });
  }
  return tips;
}

/**
 * Renders the rich tips (from getWeatherTipsWithIcons) into the DOM.
 * @param {object} data - The weather API data object.
 */
function renderWeatherTips(data) {
  // Use the data passed in, or fall back to the global 'latestData'
  const tips = getWeatherTipsWithIcons(data || latestData);
  if (!tips || tips.length === 0) return;

  // Find or create the container for the tips
  let tipsContainer = document.getElementById('weatherTipsPanel');
  if (!tipsContainer) {
    tipsContainer = document.createElement('div');
    tipsContainer.id = 'weatherTipsPanel';
    tipsContainer.className = 'tips-panel';

    // Try to insert it after the metricsPanel or advicePanel
    if (metricsPanel && metricsPanel.parentNode) {
      const referenceNode = advicePanel ? advicePanel.nextSibling : metricsPanel.nextSibling;
      metricsPanel.parentNode.insertBefore(tipsContainer, referenceNode);
    } else {
      // Fallback: append to the first forecast area or body
      const parent = document.querySelector('.forecast-area') || document.body;
      parent.appendChild(tipsContainer);
    }
  }

  // Build and inject the HTML for the tips
  tipsContainer.innerHTML = tips.map(t => {
    return `
      <div class="tip-row" role="listitem">
        <div class="tip-icon ${escapeHtml(t.colorClass)}" aria-hidden="true">${t.iconSvg}</div>
        <div class="tip-text">
          <div class="tip-title">${escapeHtml(t.title)}${t.tag ? `<span class="tip-pill">${escapeHtml(t.tag.toUpperCase())}</span>` : ''}</div>
          <div class="tip-desc">${escapeHtml(t.text)}</div>
        </div>
      </div>
    `;
  }).join('');
}


// === 8. CODE SNIPPETS TO BE INTEGRATED ===
// (These were loose in your file. They show how to *use* the functions above).

/*
// This snippet shows how you would use the SIMPLE `getWeatherTips` function.
// You would place this inside a fetch's .then() block:
const tips = getWeatherTips(data);
let tipsEl = document.getElementById('weatherTipsPanel');
if (!tipsEl) {
  tipsEl = document.createElement('div');
  tipsEl.id = 'weatherTipsPanel';
  tipsEl.className = 'tips-panel';
  // Ensure metricsPanel and advicePanel exist and are scoped
  metricsPanel.parentNode.insertBefore(tipsEl, advicePanel.nextSibling);
}
tipsEl.innerHTML = `<h4>Quick tips</h4><ul class="tips-list">${tips.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;
*/

/*
// This snippet shows how you would call the ADVANCED `renderWeatherTips` function.
// You would place this at the end of your API fetch's .then() block:
renderWeatherTips(latestData);
*/