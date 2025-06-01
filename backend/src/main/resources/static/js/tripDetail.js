import { getTripById } from "./tripStore.js";
import { createElement } from "./createElement.js";

export function loadTripDetail(id) {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    
    document.body.classList.remove('modal-open');
    document.body.style = '';
    document.activeElement?.blur();


    const trip = getTripById(id);
    const app = document.getElementById('app');
    app.replaceChildren();
    
    if (!trip) {
        app.appendChild(createElement('div', {}, 'Trip not found.'));
        return;
    }

    app.className = 'trip-detail-view';

    const container = createElement('div', { className: 'container py-5' },
        createElement('h2', { className: 'mb-4' }, trip.name),
        createElement('p', {}, `From: ${trip.from}`),
        createElement('p', {}, `To: ${trip.to}`),
        createElement('button', {
            className: 'btn btn-outline-secondary mt-3',
            onclick: () => window.location.hash = '#trips'
        }, '← Back to Trips')
    );
    app.appendChild(container);
}