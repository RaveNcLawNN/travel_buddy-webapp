import { createElement } from "./createElement.js";
import { getAllTrips, addTrip } from './tripStore.js';

/*
 * Lädt den "My Trips" View für logged-in Nutzer
 */

// Platzhalter für dynamische Trips mit dummy Trips
const userTrips = getAllTrips();

function openTripModal(onCreate) {
    const modalId = 'tripModal';

    document.getElementById(modalId)?.remove();
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style = '';


    const modal = createElement('div', {
        className: 'modal fade',
        id: modalId,
        tabindex: '-1',
        role: 'dialog'
    },
        createElement('div', { className: 'modal-dialog', role: 'document' },
            createElement('div', { className: 'modal-content' },
                createElement('div', { className: 'modal-header' },
                    createElement('h5', { className: 'modal-title' }, 'Create New Trip'),
                    createElement('button', {
                        type: 'button',
                        className: 'btn-close',
                        'data-bs-dismiss': 'modal',
                        'aria-label': 'Close'
                    })
                ),
                createElement('div', { className: 'modal-body' },
                    createElement('form', { id: 'tripForm', className: 'd-flex flex-column gap-2' },
                        createElement('input', { className: 'form-control', id: 'tripName', placeholder: 'Trip Name', required: true }),
                        createElement('input', { className: 'form-control', id: 'tripLocation', placeholder: 'Location', required: true }),
                        createElement('input', { type: 'date', className: 'form-control', id: 'tripFrom', required: true }),
                        createElement('input', { type: 'date', className: 'form-control', id: 'tripTo', required: true }),
                        createElement('div', { className: 'modal-footer' },
                            createElement('button', {
                                type: 'button',
                                className: 'btn btn-secondary',
                                'data-bs-dismiss': 'modal'
                            }, 'Cancel'),
                            createElement('button', {
                                type: 'submit',
                                className: 'btn btn-primary',
                                form: 'tripForm'
                            }, 'Create')
                        )
                    )
                )
            )
        )
    );

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);

    modal.addEventListener('hidden.bs.modal', () => {
        console.log('hidden.bs.modal wurde ausgelöst')
        bsModal.dispose();
        modal.remove();
        loadTrips();
    },
    { once: true }
);

    modal.querySelector('#tripForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = modal.querySelector('#tripName').value.trim();
        const location = modal.querySelector('#tripLocation').value.trim();
        const from = modal.querySelector('#tripFrom').value;
        const to = modal.querySelector('#tripTo').value;

        if (!name || !location || !from || !to) {
            alert('Please fill in all fields.');
            return;
        }

        const newTrip = {
            id: Date.now(),
            name: `${name} (${location})`,
            from: from,
            to: to
        };
        
        onCreate?.(newTrip);
        document.activeElement?.blur();

        bsModal.hide();
    });

    bsModal.show();
}
                    

export function loadTrips(page = 1) {
    const app = document.getElementById('app');
    if (!app) return;

    // Reset vom vorherigen View, es wird der View resetet aber nicht die navbar
    app.replaceChildren();
    // neue Klasse für den Trips-View
    app.className = 'trip-view';
    
    const userTrips = getAllTrips();
    const tripsPerPage = 5;
    const totalPages = Math.ceil(userTrips.length / tripsPerPage);
    const startIndex = (page - 1) * tripsPerPage;
    const pageTrips = userTrips.slice(startIndex, startIndex + tripsPerPage);

    // Container für alles
    const container = createElement('div', {
        className: 'container-fluid py-5 d-flex flex-column align-items-center'
    });

    // Überschrift
    const heading = createElement('h2', {
        className: 'display-5 fw-bold text-center mb-spacing'
    }, 'My Trips');

    const newTripBtn = createElement('button', {
        className: 'btn btn-success mb-4'
    }, '+');

    newTripBtn.addEventListener('click', () => {
        openTripModal((newTrip) => {
            addTrip(newTrip);
        });
    });

    // Trip-Buttons
    const list = createElement('div', {
        className: 'trip-list d-flex flex-column align-items-center w-100 gap-3'
    });

    container.appendChild(heading);
    container.appendChild(newTripBtn);
    container.appendChild(list);

    pageTrips.forEach(trip => {
        const card = createElement('button', {
            type: 'button',
            className: 'trip-card btn btn-outline-dark w-100 py-5'
        },
            createElement('h4', { className: 'mb-1' }, trip.name),
            createElement('small', {}, `${trip.from} - ${trip.to}`)
        );

        card.addEventListener('click', () => {
            window.location.hash = `trip/${trip.id}`;
        });

        list.appendChild(card);
    });

    if (userTrips.length > tripsPerPage) {
        const pagination = createElement('div', {
            className: 'd-flex justify-content-center gap-2 mt-3 flex-wrap'
        });

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = createElement('button', {
                className: `btn ${i === page ? 'btn-dark' : 'btn-outline-dark'} px-3`
            }, i.toString());

            pageBtn.addEventListener('click', () => {
                loadTrips(i);
            });

            pagination.appendChild(pageBtn);
        }

        container.appendChild(pagination);
    }

    app.appendChild(container);
}