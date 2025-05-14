/*
 * Lädt den "My Trips" View für logged-in Nutzer
 */

export function loadTrips(page = 1) {
    const currentPage = page;

    const app = document.getElementById('app');
    if (!app) {
        console.warn('No #app element found. Trips view not loaded.');
        return;
    }

    // Reset vom vorherigen View, es wird der View resetet aber nicht die navbar
    app.innerHTML = '';

    // Platzhalter für dynamische Trips mit dummy Trips
    const userTrips = [
        { id: 1, name: 'Bratislava Zerfetzung' },
        { id: 2, name: 'Wien Zerfetzung' },
        { id: 3, name: 'Wolfsthal Zerfetzung' },
        { id: 4, name: 'Test1' },
        { id: 5, name: 'Test2' },
        { id: 6, name: 'Test3' },
        { id: 7, name: 'Test4' },
        { id: 8, name: 'Test5' },
    ];

    const tripsPerPage = 5;
    const totalPages = Math.ceil(userTrips.length / tripsPerPage);


    // Container für die Buttons
    const container = document.createElement('div');
    container.className = 'd-flex flex-column justify-content-between align-items-center px-3';
    container.style.minHeight = '100vh';
    container.style.paddingTop = '50px';        // fixer abstand oben
    container.style.paddingBottom = '60px';     // fixer abstand unten

    // Überschrift
    const heading = document.createElement('h2');
    heading.textContent = 'My Trips';
    heading.className = 'text-center mb-2';
    app.appendChild(heading);

    // Wrapper für die Buttons
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'd-flex flex-column align-items-center w-100 flex-grow-1 justify-content-between';

    // Logik damit max 5 pro Seite angezeigt werden
    const startIndex = (currentPage - 1) * tripsPerPage;
    const pageTrips = userTrips.slice(startIndex, startIndex + tripsPerPage);

    pageTrips.forEach(trip => {
        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-center justify-content-center flex-grow-1 w-100';
        wrapper.style.maxWidth = '800px';

        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-dark w-100 fs-5 py-3';
        btn.textContent = trip.name;

        btn.addEventListener('click', () => {
            alert(`Trip "${trip.name}" clicked - später Detailseite`);
        });

        wrapper.appendChild(btn);
        buttonWrapper.appendChild(wrapper);
    });

    container.appendChild(buttonWrapper);

    // Pagination, also die Aufteilung auf die Pages
    if (totalPages > 1) {
        const pagination = document.createElement('div');
        pagination.className = 'd-flex justify-content-center mt-4 gap-2 flex-wrap';

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn ${i === currentPage ? 'btn-dark' : 'btn-outline-dark'} px-3`;
            pageBtn.textContent = i;

            pageBtn.addEventListener('click', () => {
                loadTrips(i);
            });

            pagination.appendChild(pageBtn);
        }

        container.appendChild(pagination);
    }

    app.appendChild(container);
}