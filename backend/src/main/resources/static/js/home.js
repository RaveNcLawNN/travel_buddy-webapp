//=============================================
// IMPORTS
//=============================================

import { createElement } from './createElement.js';
import { searchPointsOfInterest } from './api.js';
import { getWeather } from './api.js';  // Wetter-API importieren
import { createMap, setMapMarker, clearMapMarkers, fitMapToMarkers, addPoiFilterPanel } from './map.js';

//=============================================
// HERO SECTION
//=============================================

function createHeroSection(onSearch) {
  const heading = createElement('h1', { className: 'text-h1', textContent: 'Welcome to Travel Buddy' });
  const lead = createElement('p', { className: 'text-highlight', textContent: 'Plan trips, track adventures, and find your perfect destination.' });
  const searchInput = createElement('input', { type: 'text', className: 'form-control', placeholder: 'Search for cities...', id: 'citySearchInput' });
  const searchButton = createElement('button', { className: 'btn btn-primary', type: 'submit' }, 'Search');
  const inputGroup = createElement('div', { className: 'input-group' }, searchInput, searchButton);
  const form = createElement('form', {}, inputGroup);
  form.addEventListener('submit', onSearch);

  const formWrapper = createElement('div', { className: 'formWrapper' }, form);
  const heroContent = createElement('div', { className: 'heroContent' }, heading, lead, formWrapper);
  return createElement('section', { id: 'hero-section' }, heroContent);
}

//=============================================
// MAP SECTION
//=============================================

function createMapContainer() {
  const wrapper = createElement('section', { id: 'map-container' });
  const mapDiv = createElement('div', { id: 'map' });
  const sidePanel = createElement('div', { id: 'map-sidebar' });

  sidePanel.appendChild(createElement('h5', {}, 'Current Weather'));
  sidePanel.appendChild(createElement('p', {}, 'This is the current weather at PLACEHOLDER'));

  const weatherContainer = createElement('div', { id: 'weather-container' });
  sidePanel.appendChild(weatherContainer);

  wrapper.append(mapDiv, sidePanel);
  return wrapper;
}

//=============================================
// MAIN ENTRY POINT
//=============================================

export async function loadHome() {
  const app = document.getElementById('app');
  if (!app) {
    console.warn('No #app element found. Home view not loaded.');
    return;
  }
  app.replaceChildren();
  app.className = '';

  const heroSection = createHeroSection(onSearch);
  const mapContainer = createMapContainer();
  app.append(heroSection, mapContainer);

  //=============================================
  // MAP INITIALIZATION
  //=============================================

  const map = createMap('map', [20, 0], 2);

  setTimeout(() => {
    map.invalidateSize();
  }, 0);

  window.addEventListener('resize', () => {
    map.invalidateSize();
  });

  let cityMarker = null;
  let poiMarkers = [];
  let currentCoords = null;
  let currentTypes = [];
  let currentRadius = 1000;

  // Dynamic POI filters
  addPoiFilterPanel(map, (selectedTypes, radius) => {
    currentTypes = selectedTypes;
    currentRadius = radius;
    if (currentCoords) {
      loadPois(currentCoords.lat, currentCoords.lon, currentTypes, currentRadius);
    }
  });

  //=============================================
  // EVENT HANDLERS
  //=============================================

  async function onSearch(e) {
    e.preventDefault();
    const query = document.getElementById('citySearchInput').value.trim();
    if (!query) {
      return alert('Please enter a city name.');
    }
    try {
      const res = await fetch(`/api/locations/search?query=${encodeURIComponent(query)}`);
      const locations = await res.json();

      if (!locations.length) return alert(`No locations found matching "${query}".`);

      const loc = locations[0];
      currentCoords = { lat: loc.latitude, lon: loc.longitude };
      map.setView([loc.latitude, loc.longitude], 13);

      cityMarker = setMapMarker(map, loc.latitude, loc.longitude, loc.displayName, cityMarker, 'default');

      await loadPois(loc.latitude, loc.longitude, currentTypes);

      // Wetterdaten abrufen und anzeigen
      const weatherData = await getWeather(loc.latitude, loc.longitude);
      renderWeather(weatherData);

      document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      console.error(err);
      alert('Fehler: ' + err.message);
    }
  }

  // Loads and shows POIs on the map based on filters
  async function loadPois(lat, lon, types, radius) {
    poiMarkers = clearMapMarkers(map, poiMarkers);

    if (!types || types.length === 0) {
      return;
    }

    try {
      const pois = await searchPointsOfInterest({ latitude: lat, longitude: lon, radius, types });

      if (!pois || pois.length === 0) {
        return;
      }

      pois.forEach(poi => {
        const rawType = poi.type || 'default';
        const type = rawType.toLowerCase();
        if (!types.includes(type)) return;
        const popup = `<strong>${poi.name}</strong><br>Type: ${rawType}` +
                      `${poi.website ? `<br><a href='${poi.website}' target='_blank'>Website</a>` : ''}` +
                      `${poi.phone ? `<br>Phone: ${poi.phone}` : ''}`;
        const marker = setMapMarker(map, poi.latitude, poi.longitude, popup, null, type);
        poiMarkers.push(marker);
      });
    } catch (e) {
      console.log('Failed to load POIs:', e);
    }
  }

  function renderWeather(data) {
    const container = document.getElementById('weather-container');
    container.innerHTML = '';
    if (!data) {
      container.appendChild(createElement('p', {}, 'Keine Wetterdaten verfügbar.'));
      return;
    }
    const timeP = createElement('p', { textContent: `Zeit: ${data.time}` });
    const tempP = createElement('p', { textContent: `Temperatur: ${data.temperature.toFixed(1)} °C` });
    const feelP = createElement('p', { textContent: `Gefühlte Temperatur: ${data.apparentTemperature.toFixed(1)} °C` });
    const humP = createElement('p', { textContent: `Luftfeuchte: ${data.humidity}%` });
    const precP = createElement('p', { textContent: `Niederschlag: ${data.precipitation} mm` });
    container.append(timeP, tempP, feelP, humP, precP);
  }
}
