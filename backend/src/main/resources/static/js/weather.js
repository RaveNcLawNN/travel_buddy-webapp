// weather.js

import { createElement } from './createElement.js';

// Mapping Wettercode → CSS-Klasse
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

export function getCssClassForCode(code) {
  return weatherCssMap[code] || 'unknown';
}

export function formatDateTime(iso) {
  const d  = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min= String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

export function formatDate(iso) {
  const d  = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function calculateInitialHourlyIndex(hourly) {
  if (!hourly?.length) return 0;
  const now = new Date();
  const idx = hourly.findIndex(h => new Date(h.time) >= now);
  return idx >= 0 ? idx : hourly.length - 1;
}

export function renderCurrent(cur, container) {
  container.replaceChildren();
  if (!cur) {
    container.append(createElement('p', {}, 'Keine aktuellen Daten.'));
    return;
  }

  // Icon zentriert
  const iconWrapper = createElement('div', { className: 'd-flex justify-content-center mb-3' });
  const weatherIcon = createElement('div', { className: 'weatherIcon' });
  const iconDiv     = createElement('div', { className: getCssClassForCode(cur.weather_code) });
  iconDiv.append(createElement('div', { className: 'inner' }));
  weatherIcon.append(iconDiv);
  iconWrapper.append(weatherIcon);

  // Texte
  const textBlock = createElement('div', { className: 'text-center' },
    createElement('p', { textContent: `Zeit: ${formatDateTime(cur.time)}` }),
    createElement('p', { textContent: `Temperatur: ${cur.temperature.toFixed(1)} °C` }),
    createElement('p', { textContent: `Gefühlt: ${cur.apparentTemperature.toFixed(1)} °C` }),
    createElement('p', { textContent: `Luftfeuchte: ${cur.humidity}%` }),
    createElement('p', { textContent: `Niederschlag: ${cur.precipitation} mm` })
  );

  container.append(iconWrapper, textBlock);
}

export function renderHourly(hourly, index, container) {
  container.replaceChildren();
  if (!hourly?.length) {
    container.append(createElement('p', {}, 'Keine stündlichen Daten.'));
    return;
  }

  const h = hourly[index];

  // Icon zentriert
  const iconWrapper = createElement('div', { className: 'd-flex justify-content-center mb-3' });
  const weatherIcon = createElement('div', { className: 'weatherIcon' });
  const iconDiv     = createElement('div', { className: getCssClassForCode(h.weather_code) });
  iconDiv.append(createElement('div', { className: 'inner' }));
  weatherIcon.append(iconDiv);
  iconWrapper.append(weatherIcon);

  // Texte zentriert
  const textBlock = createElement('div', { className: 'text-center mb-3' },
    createElement('p', { textContent: `Zeit: ${formatDateTime(h.time)}` }),
    createElement('p', { textContent: `Temp: ${h.temperature.toFixed(1)} °C` }),
    createElement('p', { textContent: `Gefühlt: ${h.tempApparent.toFixed(1)} °C` }),
    createElement('p', { textContent: `Luftfeuchte: ${h.humidity}%` }),
    createElement('p', { textContent: `Wind: ${h.windSpeed.toFixed(1)} m/s` }),
    createElement('p', { textContent: `Regen-Wahrscheinlichkeit: ${h.precipitation_probability}%` })
  );

  // Navigation unterhalb zentriert
  const prev = createElement('button', { className: 'btn btn-sm btn-secondary me-2', textContent: '←' });
  const next = createElement('button', { className: 'btn btn-sm btn-secondary ms-2', textContent: '→' });
  prev.disabled = index === 0;
  next.disabled = index === hourly.length - 1;
  prev.addEventListener('click', () => renderHourly(hourly, index - 1, container));
  next.addEventListener('click', () => renderHourly(hourly, index + 1, container));
  const nav = createElement('div', { className: 'd-flex justify-content-center' }, prev, next);

  container.append(iconWrapper, textBlock, nav);
}

export function renderDaily(daily, index, container) {
  container.replaceChildren();
  if (!daily?.length) {
    container.append(createElement('p', {}, 'Keine täglichen Daten.'));
    return;
  }

  const d = daily[index];

  // Icon zentriert
  const iconWrapper = createElement('div', { className: 'd-flex justify-content-center mb-3' });
  const weatherIcon = createElement('div', { className: 'weatherIcon' });
  const iconDiv     = createElement('div', { className: getCssClassForCode(d.weather_code) });
  iconDiv.append(createElement('div', { className: 'inner' }));
  weatherIcon.append(iconDiv);
  iconWrapper.append(weatherIcon);

  // Texte zentriert
  const textBlock = createElement('div', { className: 'text-center mb-3' },
    createElement('p', { textContent: `Datum: ${formatDate(d.time)}` }),
    createElement('p', { textContent: `Min: ${d.tempMin.toFixed(1)} °C` }),
    createElement('p', { textContent: `Max: ${d.tempMax.toFixed(1)} °C` }),
    createElement('p', { textContent: `Regen: ${d.rain_sum} mm` }),
    createElement('p', { textContent: `Schnee: ${d.snowfall_sum} cm` }),
    createElement('p', { textContent: `Regen-Wahrscheinlichkeit: ${d.precipitation_probability}%` })
  );

  // Navigation unterhalb zentriert
  const prev = createElement('button', { className: 'btn btn-sm btn-secondary me-2', textContent: '←' });
  const next = createElement('button', { className: 'btn btn-sm btn-secondary ms-2', textContent: '→' });
  prev.disabled = index === 0;
  next.disabled = index === daily.length - 1;
  prev.addEventListener('click', () => renderDaily(daily, index - 1, container));
  next.addEventListener('click', () => renderDaily(daily, index + 1, container));
  const nav = createElement('div', { className: 'd-flex justify-content-center' }, prev, next);

  container.append(iconWrapper, textBlock, nav);
}
