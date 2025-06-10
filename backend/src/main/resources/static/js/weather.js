//=============================================
// IMPORTS
//=============================================

import { createElement } from './createElement.js';

//=============================================
// WEATHER MAPPING & HELPERS
//=============================================

// maps conditions to CSS classes
const weatherCssMap = {
  0:  'clear',
  1:  'mostlycloudy',
  2:  'partlycloudy',
  3:  'cloudy',
  45: 'fog',
  48: 'fog',
  51: 'chancerain',
  53: 'rain',
  55: 'rain',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  80: 'chancerain',
  81: 'rain',
  82: 'rain',
  95: 'tstorms',
  96: 'tstorms',
  99: 'tstorms'
};

/**
 * Returns the CSS class for a given weather code.
 * @param {number} code - Weather condition code
 * @returns {string} CSS class name
 */

export function getCssClassForCode(code) {
  return weatherCssMap[code] || 'unknown';
}

//=============================================
// DATA FORMAT
//=============================================

/**
 * Formats an ISO timestamp into "DD.MM.YYYY HH:MM".
 * @param {string} isoString - ISO date-time string
 * @returns {string} Formatted date and time
 */

export function formatDateTime(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Formats an ISO timestamp into "DD.MM.YYYY".
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date
 */

export function formatDate(isoString) {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

//=============================================
// NAVIGATION
//=============================================

/**
 * Determines the initial index for hourly data based on current time.
 * @param {Array} hourlyData - Array of hourly forecast objects
 * @returns {number} Index of the first forecast at or after now
 */

export function calculateInitialHourlyIndex(hourlyData) {
  if (!Array.isArray(hourlyData) || hourlyData.length === 0) {
    return 0;
  }
  const now = new Date();
  const idx = hourlyData.findIndex(entry => new Date(entry.time) >= now);
  return idx >= 0 ? idx : hourlyData.length - 1;
}

//=============================================
// WEATHER ICON UI
//=============================================

/**
 * Creates a decorative weather icon element.
 * @param {number} code - Weather condition code
 * @returns {HTMLElement} Icon wrapper element
 */

function createWeatherIcon(code) {
  const wrapper = createElement('div', {
    className: 'd-flex justify-content-center mb-3',
    role: 'img',
    'aria-hidden': 'true'
  });
  const iconContainer = createElement('div', { className: 'weatherIcon mt-4' });
  const iconInner = createElement('div', { className: getCssClassForCode(code) });
  iconInner.append(createElement('div', { className: 'inner' }));
  iconContainer.append(iconInner);
  wrapper.append(iconContainer);
  return wrapper;
}

/**
 * Creates navigation controls for forecast entries.
 * @param {number} currentIndex - Current entry index
 * @param {number} maxIndex - Maximum entry index
 * @param {Function} onPrev - Callback for previous button
 * @param {Function} onNext - Callback for next button
 * @param {string} label - Label for aria attributes
 * @returns {HTMLElement} Navigation container
 */

function createForecastNavigation(currentIndex, maxIndex, onPrev, onNext, label) {
  const prevButton = createElement('button', {
    className: 'btn btn-sm btn-primary me-2 mt-2 mb-2',
    textContent: '←',
    'aria-label': `Previous ${label}`
  });
  prevButton.disabled = currentIndex === 0;
  prevButton.addEventListener('click', onPrev);

  const nextButton = createElement('button', {
    className: 'btn btn-sm btn-primary ms-2 mt-2 mb-2',
    textContent: '→',
    'aria-label': `Next ${label}`
  });
  nextButton.disabled = currentIndex === maxIndex;
  nextButton.addEventListener('click', onNext);

  return createElement('div', {
    className: 'd-flex justify-content-center',
    role: 'navigation',
    'aria-label': `${label} forecast navigation`
  }, prevButton, nextButton);
}

//=============================================
// RENDERERS: CURRENT; HOURLY; DAILY
//=============================================

/**
 * Renders the current weather into the provided container.
 * @param {Object|null} current - Current weather data or null
 * @param {HTMLElement} container - DOM container to render into
 */

export function renderCurrent(current, container) {
  container.replaceChildren();
  if (!current) {
    container.append(createElement('p', { role: 'alert' }, 'No current data available.'));
    return;
  }
  const iconEl = createWeatherIcon(current.weather_code);
  const infoBlock = createElement('div', { className: 'text-center' },
    createElement('p', { textContent: `Time: ${formatDateTime(current.time)}` }),
    createElement('p', { textContent: `Temperature: ${current.temperature.toFixed(1)} °C` }),
    createElement('p', { textContent: `Feels like: ${current.apparentTemperature.toFixed(1)} °C` }),
    createElement('p', { textContent: `Humidity: ${current.humidity}%` }),
    createElement('p', { textContent: `Precipitation: ${current.precipitation} mm` })
  );
  container.append(iconEl, infoBlock);
}

/**
 * Renders a single hourly forecast entry.
 * @param {Array} hourlyData - Array of hourly forecast objects
 * @param {number} index - Index of entry to render
 * @param {HTMLElement} container - DOM container to render into
 */

export function renderHourly(hourlyData, index, container) {
  container.replaceChildren();
  if (!Array.isArray(hourlyData) || hourlyData.length === 0) {
    container.append(createElement('p', { role: 'alert' }, 'No hourly data available.'));
    return;
  }
  const entry = hourlyData[index];
  const iconEl = createWeatherIcon(entry.weather_code);
  const infoBlock = createElement('div', { className: 'text-center mb-3' },
    createElement('p', { textContent: `Time: ${formatDateTime(entry.time)}` }),
    createElement('p', { textContent: `Temperature: ${entry.temperature.toFixed(1)} °C` }),
    createElement('p', { textContent: `Feels like: ${entry.tempApparent.toFixed(1)} °C` }),
    createElement('p', { textContent: `Humidity: ${entry.humidity}%` }),
    createElement('p', { textContent: `Wind speed: ${entry.windSpeed.toFixed(1)} m/s` }),
    createElement('p', { textContent: `Rain probability: ${entry.precipitation_probability}%` })
  );
  const nav = createForecastNavigation(
    index,
    hourlyData.length - 1,
    () => renderHourly(hourlyData, index - 1, container),
    () => renderHourly(hourlyData, index + 1, container),
    'hourly'
  );
  container.append(iconEl, infoBlock, nav);
}

/**
 * Renders a single daily forecast entry.
 * @param {Array} dailyData - Array of daily forecast objects
 * @param {number} index - Index of entry to render
 * @param {HTMLElement} container - DOM container to render into
 */

export function renderDaily(dailyData, index, container) {
  container.replaceChildren();
  if (!Array.isArray(dailyData) || dailyData.length === 0) {
    container.append(createElement('p', { role: 'alert' }, 'No daily data available.'));
    return;
  }
  const entry = dailyData[index];
  const iconEl = createWeatherIcon(entry.weather_code);
  const infoBlock = createElement('div', { className: 'text-center mb-3' },
    createElement('p', { textContent: `Date: ${formatDate(entry.time)}` }),
    createElement('p', { textContent: `Min temp: ${entry.tempMin.toFixed(1)} °C` }),
    createElement('p', { textContent: `Max temp: ${entry.tempMax.toFixed(1)} °C` }),
    createElement('p', { textContent: `Rain: ${entry.rain_sum} mm` }),
    createElement('p', { textContent: `Snow: ${entry.snowfall_sum} cm` }),
    createElement('p', { textContent: `Rain probability: ${entry.precipitation_probability}%` })
  );
  const nav = createForecastNavigation(
    index,
    dailyData.length - 1,
    () => renderDaily(dailyData, index - 1, container),
    () => renderDaily(dailyData, index + 1, container),
    'daily'
  );
  container.append(iconEl, infoBlock, nav);
}
