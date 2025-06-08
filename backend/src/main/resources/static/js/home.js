//=============================================
// IMPORTS
//=============================================

import { createElement } from './createElement.js';
import { searchPointsOfInterest } from './api.js';
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

  sidePanel.appendChild(createElement('h5', {}, 'Sidebar Panel'));
  sidePanel.appendChild(createElement('p', {}, 'You can add filters, highlights, or anything else.'));

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

      document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });


    } catch (err) {
      alert('Error fetching location.');
    }
  }

  // Loads and shows POIs on the map baed on filters
  async function loadPois(lat, lon, types, radius) {
    poiMarkers = clearMapMarkers(map, poiMarkers);

    if (!types || types.length === 0) {
      return;
    }

    try {
      const pois = await searchPointsOfInterest({
        latitude: lat,
        longitude: lon,
        radius,
        types
      });

      if (!pois || pois.length === 0) {
        return;
      }

      pois.forEach(poi => {
        const rawType = poi.type || 'default';
        const type = rawType.toLowerCase();

        if (!types.includes(type)) return;

        const popup = `<strong>${poi.name}</strong><br>Type: ${rawType}${poi.website ? `<br><a href='${poi.website}' target='_blank'>Website</a>` : ''
          }${poi.phone ? `<br>Phone: ${poi.phone}` : ''}`;

        const marker = setMapMarker(map, poi.latitude, poi.longitude, popup, null, type);
        poiMarkers.push(marker);
      });

      // fitMapToMarkers(map, [cityMarker, ...poiMarkers]);
    } catch (e) {
      console.log('Failed to load POIs:', e);
    }
  }
}