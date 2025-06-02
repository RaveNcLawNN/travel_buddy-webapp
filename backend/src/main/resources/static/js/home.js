import { createElement } from './createElement.js';
import { searchPointsOfInterest } from './api.js';

function createHeroSection(onSearch) {
  const heading = createElement('h1', { className: 'display-4 text-shadow text-bold text-more-space', textContent: 'Welcome to Travel Buddy' });
  const lead = createElement('p', { className: 'lead text-shadow text-bold text-more-space', textContent: 'Plan trips, track adventures, and find your perfect destination.' });
  const searchInput = createElement('input', { type: 'text', className: 'form-control', placeholder: 'Search for cities...', id: 'citySearchInput' });
  const searchButton = createElement('button', { className: 'btn btn-primary', type: 'submit' }, 'Search');
  const inputGroup = createElement('div', { className: 'input-group' }, searchInput, searchButton);
  const form = createElement('form', {}, inputGroup);
  form.addEventListener('submit', onSearch);

  const formWrapper = createElement('div', { className: 'formWrapper' }, form);
  const heroContent = createElement('div', { className: 'heroContent' }, heading, lead, formWrapper);
  return createElement('section', { id: 'hero-section' }, heroContent);
}

function createMapContainer() {
  const mapContainer = createElement('section', { id: 'map' });
  return mapContainer;
}

export async function loadHome() {
  const app = document.getElementById('app');
  if (!app) {
    console.warn('No #app element found. Home view not loaded.');
    return;
  }
  app.replaceChildren();
  app.className = '';
  document.body.className = 'home-view';

  const heroSection = createHeroSection(onSearch);
  const mapContainer = createMapContainer();
  app.append(heroSection, mapContainer);

  const map = L.map('map').setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  let marker;
  let poiMarkers = [];

  console.log('Home.js loaded, L.AwesomeMarkers:', window.L && window.L.AwesomeMarkers);

  async function onSearch(e) {
    e.preventDefault();
    const query = document.getElementById('citySearchInput').value.trim();
    if (!query) {
      return alert('Please enter a city name.');
    }
    try {
      const res = await fetch(`/api/locations/search?query=${encodeURIComponent(query)}`);
      const locations = await res.json();
      if (locations.length) {
        const loc = locations[0];
        map.setView([loc.latitude, loc.longitude], 13);
        if (marker) map.removeLayer(marker);
        // Main destination: default Leaflet marker
        marker = L.marker([loc.latitude, loc.longitude]).addTo(map)
          .bindPopup(loc.displayName)
          .openPopup();

        // Remove old POI markers
        poiMarkers.forEach(m => map.removeLayer(m));
        poiMarkers = [];
        // Fetch and display POIs
        try {
          const pois = await searchPointsOfInterest({
            latitude: loc.latitude,
            longitude: loc.longitude,
            radius: 1000, // 1km
            types: ['hotel', 'museum', 'theatre', 'attraction', 'train_station', 'bus_station', 'airport', 'hospital']
          });
          pois.forEach(poi => {
            // All POIs: default Leaflet marker
            const poiMarker = L.marker([poi.latitude, poi.longitude]).addTo(map)
              .bindPopup(`<strong>${poi.name}</strong><br>Type: ${poi.type}${poi.website ? `<br><a href='${poi.website}' target='_blank'>Website</a>` : ''}${poi.phone ? `<br>Phone: ${poi.phone}` : ''}`);
            poiMarkers.push(poiMarker);
          });
        } catch (e) {
          // Optionally show a warning, but don't block city search
        }

        const mapElement = document.getElementById('map');
        if (mapElement) {
          mapElement.scrollIntoView({ behavior: 'smooth', block: 'center'});
        }
      } else {
        alert(`No locations found matching "${query}".`);
      }
    } catch {
      alert('Error fetching location.');
    }
  }
}

