// =============================================
// IMPORTS
// =============================================
import { createElement } from './createElement.js';
import {
  searchLocation,
  searchPointsOfInterest,
  getWeather
} from './api.js';
import {
  createMap,
  setMapMarker,
  clearMapMarkers,
  addPoiFilterPanel
} from './map.js';
import {
  calculateInitialHourlyIndex,
  renderCurrent,
  renderHourly,
  renderDaily
} from './weather.js';

// =============================================
// HERO SECTION
// =============================================
/**
 * Creates the hero section with heading, subtitle, and search form.
 */
function createHeroSection(onSearch) {
  const heading = createElement('h1', {
    className: 'text-h1',
    textContent: 'Travel Buddy',
    id: 'hero-heading'
  });

  const subtitle = createElement('p', {
    className: 'text-highlight',
    textContent: 'Find your next adventure:'
  });

  const label = createElement('label', {
    htmlFor: 'citySearchInput',
    className: 'sr-only'
  }, 'Search for a city');

  const cityInput = createElement('input', {
    id: 'citySearchInput',
    type: 'text',
    className: 'form-control',
    placeholder: 'Enter city name...',
    'aria-label': 'City name'
  });

  const searchButton = createElement('button', {
    className: 'btn btn-primary',
    type: 'submit',
    textContent: 'Search',
    'aria-label': 'Search city'
  });

  const inputGroup = createElement('div', { className: 'input-group' }, label, cityInput, searchButton);
  const form = createElement('form', { role: 'search' }, inputGroup);
  form.addEventListener('submit', onSearch);

  const wrapper = createElement('div', { className: 'formWrapper' }, form);
  const content = createElement('div', { className: 'heroContent' }, heading, subtitle, wrapper);
  return createElement('section', { id: 'hero-section', 'aria-labelledby': 'hero-heading' }, content);
}

// =============================================
// MAP + SIDEBAR WITH TABS
// =============================================
/**
 * Builds the map container and sidebar with tab panels.
 */
function createMapContainer() {
  const section = createElement('section', { id: 'map-container', 'aria-label': 'Map and weather details' });
  const mapDiv = createElement('div', { id: 'map', 'aria-label': 'Interactive map' });
  const sidebar = createElement('div', { id: 'map-sidebar' });

  const tabs = [
    { label: 'Current', id: 'current-tab', target: 'current', active: true },
    { label: 'Hourly', id: 'hourly-tab', target: 'hourly', active: false },
    { label: 'Daily', id: 'daily-tab', target: 'daily', active: false }
  ];

  const navTabs = createElement('ul', { className: 'nav nav-tabs justify-content-center', role: 'tablist' });
  const tabPanes = [];

  tabs.forEach(({ label, id, target, active }) => {
    const li = createElement('li', { className: 'nav-item', role: 'presentation' });
    const btn = createElement('button', {
      className: `nav-link${active ? ' active' : ''}`,
      id,
      type: 'button',
      role: 'tab',
      'aria-controls': target,
      'aria-selected': active.toString(),
      textContent: label
    });
    li.append(btn);
    navTabs.append(li);

    const pane = createElement('div', {
      className: `tab-pane fade${active ? ' show active' : ''}`,
      id: target,
      role: 'tabpanel',
      'aria-labelledby': id
    });
    pane.append(createElement('p', { className: 'text-center text-muted p-3', textContent: 'Please search for a city to display weather data.' }));
    tabPanes.push(pane);

    btn.addEventListener('click', () => {
      tabs.forEach(t => {
        document.getElementById(t.id).classList.remove('active');
        document.getElementById(t.target).classList.remove('show', 'active');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      pane.classList.add('show', 'active');
    });
  });

  sidebar.append(navTabs, createElement('div', { className: 'tab-content' }, ...tabPanes));
  section.append(mapDiv, sidebar);
  return section;
}

// =============================================
// MAIN ENTRY POINT
// =============================================
/**
 * Loads the home view, initializes map and event handlers.
 */
export async function loadHome() {
  const app = document.getElementById('app');
  if (!app) {
    console.warn('No #app element found. Home view not loaded.');
    return;
  }
  app.replaceChildren();
  app.className = '';

  const hero = createHeroSection(onSearch);
  const mapContainer = createMapContainer();
  app.append(hero, mapContainer);

  const map = createMap('map', [20, 0], 2);
  setTimeout(() => map.invalidateSize(), 0);
  window.addEventListener('resize', () => map.invalidateSize());

  let cityMarker = null;
  let poiMarkers = [];
  let currentCoords = null;
  let currentTypes = [];
  let currentRadius = 1000;
  let hourlyIndex = 0;
  let dailyIndex = 0;

  addPoiFilterPanel(map, (types, radius) => {
    currentTypes = types;
    currentRadius = radius;
    if (currentCoords) {
      loadPois(currentCoords.lat, currentCoords.lon, currentTypes, currentRadius);
    }
  });

  /**
   * Event handler for city search form submission.
   */
  async function onSearch(e) {
    e.preventDefault();
    const query = document.getElementById('citySearchInput').value.trim();
    if (!query) {
      return alert('Please enter a city name.');
    }
    try {
      const locations = await searchLocation(query);
      if (!locations.length) {
        return alert(`No results for "${query}".`);
      }
      const loc = locations[0];
      currentCoords = { lat: loc.latitude, lon: loc.longitude };
      map.setView([loc.latitude, loc.longitude], 13);
      cityMarker = setMapMarker(map, loc.latitude, loc.longitude, loc.displayName, cityMarker, 'default');

      await loadPois(loc.latitude, loc.longitude, currentTypes, currentRadius);

      const weatherData = await getWeather(loc.latitude, loc.longitude);
      renderWeather(weatherData);

      document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  }

  /**
   * Loads points of interest via API and places markers.
   */
  async function loadPois(lat, lon, types, radius) {
    poiMarkers = clearMapMarkers(map, poiMarkers);
    if (!types.length) return;
    try {
      const pois = await searchPointsOfInterest({ latitude: lat, longitude: lon, radius, types });
      if (!pois.length) return;
      pois.forEach(poi => {
        const typeKey = (poi.type || 'default').toLowerCase();
        if (!types.includes(typeKey)) return;
        const popup = `<strong>${poi.name}</strong><br>Type: ${poi.type}` 
                    + (poi.website ? `<br><a href="${poi.website}" target="_blank">Website</a>` : '')
                    + (poi.phone   ? `<br>Phone: ${poi.phone}` : '');
        const marker = setMapMarker(map, poi.latitude, poi.longitude, popup, null, typeKey);
        poiMarkers.push(marker);
      });
    } catch (e) {
      console.error('Failed to load POIs:', e);
    }
  }

  /**
   * Renders weather data into current, hourly, and daily tabs.
   */
  function renderWeather(data) {
    dailyIndex = 0;
    hourlyIndex = calculateInitialHourlyIndex(data.hourlyWeatherData);
    renderCurrent(data.currentWeather, document.getElementById('current'));
    renderHourly(data.hourlyWeatherData, hourlyIndex, document.getElementById('hourly'));
    renderDaily(data.dailyWeatherData, dailyIndex, document.getElementById('daily'));
  }
}
