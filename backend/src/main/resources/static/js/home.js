//=============================================
// IMPORTS
//=============================================
import { createElement } from './createElement.js';
import { searchPointsOfInterest, getWeather } from './api.js';
import {
  createMap,
  setMapMarker,
  clearMapMarkers,
  fitMapToMarkers,
  addPoiFilterPanel
} from './map.js';
import {
  calculateInitialHourlyIndex,
  renderCurrent,
  renderHourly,
  renderDaily
} from './weather.js';

//=============================================
// HERO SECTION
//=============================================
function createHeroSection(onSearch) {
  const heading     = createElement('h1', { className: 'text-h1', textContent: 'Travel Buddy' });
  const lead        = createElement('p',  { className: 'text-highlight', textContent: 'Find your next adventure' });
  const searchInput = createElement('input', {
    type: 'text',
    className: 'form-control',
    placeholder: 'Search for cities...',
    id: 'citySearchInput'
  });
  const searchButton = createElement('button', {
    className: 'btn btn-primary',
    type: 'submit',
    textContent: 'Search'
  });
  const inputGroup = createElement('div', { className: 'input-group' }, searchInput, searchButton);
  const form       = createElement('form', {}, inputGroup);
  form.addEventListener('submit', onSearch);

  const formWrapper = createElement('div', { className: 'formWrapper' }, form);
  const heroContent = createElement('div', { className: 'heroContent' }, heading, lead, formWrapper);
  return createElement('section', { id: 'hero-section' }, heroContent);
}

//=============================================
// MAP + SIDEBAR WITH TABS
//=============================================
function createMapContainer() {
  const wrapper   = createElement('section', { id: 'map-container' });
  const mapDiv    = createElement('div',     { id: 'map' });
  const sidePanel = createElement('div',     { id: 'map-sidebar' });

  // Nav-Tabs zentriert
  const navTabs  = createElement('ul', {
    className: 'nav nav-tabs justify-content-center',
    role: 'tablist'
  });
  const tabPanes = [];

  const tabs = [
    { label: 'Aktuell',   id: 'current-tab', target: 'current',  active: true  },
    { label: 'Stündlich', id: 'hourly-tab',  target: 'hourly',  active: false },
    { label: 'Täglich',   id: 'daily-tab',   target: 'daily',   active: false }
  ];

  tabs.forEach(tab => {
    const li  = createElement('li', { className: 'nav-item', role: 'presentation' });
    const btn = createElement('button', {
      className: `nav-link${tab.active ? ' active' : ''}`,
      id: tab.id,
      type: 'button',
      role: 'tab',
      textContent: tab.label
    });
    li.append(btn);
    navTabs.append(li);

    // Pane erstellen und Platzhalter-Text setzen
    const pane = createElement('div', {
      className: `tab-pane fade${tab.active ? ' show active' : ''}`,
      id: tab.target,
      role: 'tabpanel',
      'aria-labelledby': tab.id
    });
    pane.append(
      createElement('p', { className: 'text-center text-muted p-3' },
        'Bitte suche zunächst eine Stadt, um Wetterdaten anzuzeigen.'
      )
    );
    tabPanes.push(pane);

    btn.addEventListener('click', () => {
      tabs.forEach(t => document.getElementById(t.id).classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('show', 'active'));
      btn.classList.add('active');
      pane.classList.add('show', 'active');
    });
  });

  const tabContent = createElement('div', { className: 'tab-content' }, ...tabPanes);
  sidePanel.append(navTabs, tabContent);
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

  const heroSection  = createHeroSection(onSearch);
  const mapContainer = createMapContainer();
  app.append(heroSection, mapContainer);

  const map = createMap('map', [20, 0], 2);
  setTimeout(() => map.invalidateSize(), 0);
  window.addEventListener('resize', () => map.invalidateSize());

  let cityMarker    = null;
  let poiMarkers    = [];
  let currentCoords = null;
  let currentTypes  = [];
  let currentRadius = 1000;

  let hourlyIndex = 0;
  let dailyIndex  = 0;

  addPoiFilterPanel(map, (types, radius) => {
    currentTypes  = types;
    currentRadius = radius;
    if (currentCoords) {
      loadPois(currentCoords.lat, currentCoords.lon, currentTypes, currentRadius);
    }
  });

  //=============================================
  // EVENT HANDLER: SEARCH
  //=============================================
  async function onSearch(e) {
    e.preventDefault();
    const query = document.getElementById('citySearchInput').value.trim();
    if (!query) {
      return alert('Bitte Stadtnamen eingeben.');
    }
    try {
      const res       = await fetch(`/api/locations/search?query=${encodeURIComponent(query)}`);
      const locations = await res.json();
      if (!locations.length) {
        return alert(`Keine Treffer für "${query}".`);
      }

      const loc       = locations[0];
      currentCoords   = { lat: loc.latitude, lon: loc.longitude };
      map.setView([loc.latitude, loc.longitude], 13);
      cityMarker      = setMapMarker(map, loc.latitude, loc.longitude, loc.displayName, cityMarker, 'default');

      await loadPois(loc.latitude, loc.longitude, currentTypes, currentRadius);

      const weatherData = await getWeather(loc.latitude, loc.longitude);
      renderWeather(weatherData);

      document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      console.error(err);
      alert('Fehler: ' + err.message);
    }
  }

  //=============================================
  // POI LADEN
  //=============================================
  async function loadPois(lat, lon, types, radius) {
    poiMarkers = clearMapMarkers(map, poiMarkers);
    if (!types || !types.length) return;

    try {
      const pois = await searchPointsOfInterest({ latitude: lat, longitude: lon, radius, types });
      if (!pois || !pois.length) return;

      pois.forEach(poi => {
        const type  = (poi.type || 'default').toLowerCase();
        if (!types.includes(type)) return;
        const popup = `<strong>${poi.name}</strong><br>Type: ${poi.type}`
                    + (poi.website ? `<br><a href="${poi.website}" target="_blank">Website</a>` : '')
                    + (poi.phone   ? `<br>Phone: ${poi.phone}` : '');
        const marker = setMapMarker(map, poi.latitude, poi.longitude, popup, null, type);
        poiMarkers.push(marker);
      });
    } catch (e) {
      console.error('Failed to load POIs:', e);
    }
  }

  //=============================================
  // WEATHER RENDERING
  //=============================================
  function renderWeather(data) {
    dailyIndex  = 0;
    hourlyIndex = calculateInitialHourlyIndex(data.hourlyWeatherData);

    const currentContainer = document.getElementById('current');
    const hourlyContainer  = document.getElementById('hourly');
    const dailyContainer   = document.getElementById('daily');

    renderCurrent(data.currentWeather,   currentContainer);
    renderHourly(data.hourlyWeatherData, hourlyIndex,  hourlyContainer);
    renderDaily(data.dailyWeatherData,   dailyIndex,   dailyContainer);
  }
}
