export function loadHome() {
    const app = document.getElementById('app');
    if (!app) {
        console.warn('No #app element found. Home view not loaded.');
        return;
    }

    app.replaceChildren();

    app.className = 'bg-home d-flex flex-column align-items-center justify-content-center text-center';

    const heading = document.createElement('h1');
    heading.className = 'mt-5 text-shadow';
    heading.textContent = 'Welcome to Travel Buddy';

    const lead = document.createElement('p');
    lead.className = 'lead text-shadow';
    lead.textContent = 'Plan trips, track adventures, and find your perfect destination.';

    const form = document.createElement('form');
    form.className = 'w-50';

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group mb-3';

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

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'mt-4 search-results';
    resultsContainer.id = 'searchResults';

    const sampleCities = [
        "New York", "Berlin", "Paris", "Tokyo", "London", "Sydney",
        "Barcelona", "Amsterdam", "Rome", "Cape Town", "Toronto", "Dubai", "Vienna"
    ];

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim().toLowerCase();
        resultsContainer.replaceChildren();

        if (!query) {
            const msg = document.createElement('p');
            msg.textContent = 'Please enter a city name.';
            resultsContainer.appendChild(msg);
            return;
        }

        const matches = sampleCities.filter(city => city.toLowerCase().includes(query));

        if (matches.length > 0) {
            const list = document.createElement('ul');
            list.className = 'list-group';

            matches.forEach(city => {
                const item = document.createElement('li');
                item.className = 'list-group-item list-group-item-action';
                item.textContent = city;
                item.style.cursor = 'pointer';

                item.addEventListener('click', () => {
                    alert(`You selected: ${city}`);
                });

                list.appendChild(item);
            });

            resultsContainer.appendChild(list);
        } else {
            const noResult = document.createElement('p');
            noResult.textContent = `No cities found matching "${query}".`;
            resultsContainer.appendChild(noResult);
        }
    });

    app.appendChild(heading);
    app.appendChild(lead);
    app.appendChild(form);
    app.appendChild(resultsContainer);
}
