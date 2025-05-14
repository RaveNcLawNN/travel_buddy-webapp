/* Client-side routing */
import { loadHome } from './home.js';
import { loadTrips } from './trips.js'

export function route() {
    const view = (location.hash.replace('#', '').trim().toLowerCase()) || 'home';
    console.log('Routing to view:', view);

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