/*
 * Lädt den "My Trips" View für logged-in Nutzer
 */

export function loadTrips(page = 1) {
    const app = document.getElementById('app');
    if (!app) {
        console.warn('No #app element found. Trips view not loaded.');
        return;
    }

    // Reset vom vorherigen View, es wird der View resetet aber nicht die navbar
    app.replaceChildren();
    // neue Klasse für den Trips-View
    app.className = 'trip-view';


    // Platzhalter für dynamische Trips mit dummy Trips
    const userTrips = [
        { id: 1, name: 'Bratislava Zerfetzung', from: '01-06-2025', to: '05-06-2025' },
        { id: 2, name: 'Wien Zerfetzung', from: '10-07-2025', to: '15-07-2025' },
        { id: 3, name: 'Wolfsthal Zerfetzung', from: '01-08-2025', to: '03-08-2025' },
        { id: 4, name: 'Test1', from: '01-09-2025', to: '07-09-2025' },
        { id: 5, name: 'Test2', from: '10-10-2025', to: '20-10-2025' },
        { id: 6, name: 'Test3', from: '05-11-2025', to: '12-11-2025' },
        { id: 7, name: 'Test4', from: '01-12-2025', to: '08-12-2025' },
        { id: 8, name: 'Test5', from: '15-01-2025', to: '22-01-2025' },
    ];

    const tripsPerPage = 5;
    const totalPages = Math.ceil(userTrips.length / tripsPerPage);
    const startIndex = (page - 1) * tripsPerPage;
    const pageTrips = userTrips.slice(startIndex, startIndex + tripsPerPage);

    // Container für alles
    const container = document.createElement('div');
    container.className = 'container-fluid py-5 d-flex flex-column align-items-center'

    // Überschrift
    const heading = document.createElement('h2');
    heading.textContent = 'My Trips';
    heading.className = 'display-5 fw-bold text-center mb-spacing';
    container.appendChild(heading);

    // Trip-Buttons
    const list = document.createElement('div');
    list.className = 'trip-list d-flex flex-column align-items-center w-100 gap-3';
    container.appendChild(list);

    pageTrips.forEach(trip => {
        // Button als Karte
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'trip-card btn btn-outline-dark w-100 py-5';

        // Titel
        const title = document.createElement('h4');
        title.className = 'mb-1';
        title.textContent = trip.name;
        card.appendChild(title);

        // Datum
        const date = document.createElement('small');
        date.textContent = `${trip.from} - ${trip.to}`;
        card.appendChild(date);

        // Klick-Handler
        card.addEventListener('click', () => {
            alert(`Trip "${trip.name}" clicked - später Detailseite`);
        });

        list.appendChild(card);
    });

    // Pagination, also die Aufteilung auf die Pages
    if (totalPages > 1) {
        const pagination = document.createElement('div');
        pagination.className = 'd-flex justify-content-center gap-2 mt-3 flex-wrap';
        container.appendChild(pagination);

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn ${i === page ? 'btn-dark' : 'btn-outline-dark'} px-3`;
            pageBtn.textContent = i;

            pageBtn.addEventListener('click', () => {
                loadTrips(i);
            });
            pagination.appendChild(pageBtn);
        }
    }
    app.appendChild(container);
}