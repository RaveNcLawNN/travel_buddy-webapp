/* Client-side routing */
import { loadHome } from './home.js';
import { loadTrips } from './trips.js'
import { loadTripDetail } from './tripDetail.js';

export function route() {
    const view = (location.hash.replace('#', '').trim().toLowerCase()) || 'home';
    console.log('Routing to view:', view);


    if (view.startsWith('trip/')) {
        const id = view.split('/')[1];
        loadTripDetail(parseInt(id));
        return;
    }

    switch (view) {
        case 'home':
            loadHome();
            break;
        case 'trips':
            loadTrips();
            break;
        default:
            loadHome();
    }
}