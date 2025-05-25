export function loadHome() {
    const app = document.getElementById('app');
    if (!app) {
        console.warn('No #app element found. Home view not loaded.');
        return;
    }

    app.replaceChildren();
    app.className = '';

    const heroSection = document.createElement('section');
    heroSection.className = 'hero-section';

    const heroContent = document.createElement('div');
    heroContent.className = 'container';

    const heading = document.createElement('h1');
    heading.className = 'display-4 text-shadow text-bold text-more-space';
    heading.textContent = 'Welcome to Travel Buddy';

    const lead = document.createElement('p');
    lead.className = 'lead text-shadow text-bold text-more-space';
    lead.textContent = 'Plan trips, track adventures, and find your perfect destination.';

    const formWrapper = document.createElement('div');
    formWrapper.className = 'search-form-overlay';

    const form = document.createElement('form');

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'form-control';
    searchInput.placeholder = 'Search for cities...';
    searchInput.setAttribute('aria-label', 'City search');
    searchInput.id = 'citySearchInput';

    const searchButton = document.createElement('button');
    searchButton.className = 'btn btn-primary';
    searchButton.type = 'submit';
    searchButton.textContent = 'Search';

    inputGroup.appendChild(searchInput);
    inputGroup.appendChild(searchButton);
    form.appendChild(inputGroup);
    formWrapper.appendChild(form);

    heroContent.appendChild(heading);
    heroContent.appendChild(lead);
    heroContent.appendChild(formWrapper);
    heroSection.appendChild(heroContent);

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'container mt-5 search-results search-result-home';
    resultsContainer.id = 'searchResults';

    const sampleCities = [
        "New York", "Berlin", "Paris", "Tokyo", "London", "Sydney",
        "Barcelona", "Amsterdam", "Rome", "Cape Town", "Toronto", "Dubai", "Vienna"
    ];

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        resultsContainer.replaceChildren();

        if (!query) {
            const msg = document.createElement('p');
            msg.textContent = 'Please enter a city name.';
            resultsContainer.appendChild(msg);
            return;
        }

        // Call backend for geocoding
        try {
            const response = await fetch(`/api/locations/search?query=${encodeURIComponent(query)}`);
            const locations = await response.json();
            if (locations.length > 0) {
                const loc = locations[0];
                // Center map and add marker
                map.setView([loc.latitude, loc.longitude], 13);
                if (marker) map.removeLayer(marker);
                marker = L.marker([loc.latitude, loc.longitude]).addTo(map)
                    .bindPopup(loc.displayName).openPopup();
            } else {
                const noResult = document.createElement('p');
                noResult.textContent = `No locations found matching "${query}".`;
                resultsContainer.appendChild(noResult);
            }
        } catch (err) {
            resultsContainer.textContent = 'Error fetching location.';
        }
    });

    app.appendChild(heroSection);
    app.appendChild(resultsContainer);

    // Add Leaflet map container
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    mapContainer.style.height = '400px';
    mapContainer.style.margin = '2rem 0';
    app.appendChild(mapContainer);

    // Initialize the Leaflet map
    let map = L.map('map').setView([20, 0], 2); // World view
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    let marker; // To store the current marker
}
