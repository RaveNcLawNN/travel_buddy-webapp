import { createElement } from './createElement.js';

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

  const heroSection = createHeroSection(onSearch);
  const mapContainer = createMapContainer();
  app.append(heroSection, mapContainer);

  const map = L.map('map').setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  let marker;

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
        marker = L.marker([loc.latitude, loc.longitude]).addTo(map)
          .bindPopup(loc.displayName)
          .openPopup();
      } else {
        alert(`No locations found matching "${query}".`);
      }
    } catch {
      alert('Error fetching location.');
    }
  }
}

