/* Client-side routing */
import { loadHome } from './home.js';
import { loadTrips } from './trips.js'
import { loadTripDetail } from './tripDetail.js';
import { loadBuddies } from './buddies.js';
import { loadProfile } from './profile.js';

export function route() {
    const rawHash = location.hash.replace('#', '').trim().toLowerCase();
    const [path, queryString] = rawHash.split('?');
    const view = path || 'home';
    const queryParams = new URLSearchParams(queryString);

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
            const page = parseInt(queryParams.get('page') || '1', 10);
            loadTrips(page);
            break;
        case 'buddies':
            loadBuddies();
            break;
        case 'profile':
            loadProfile();
            break;
        default:
            loadHome();
    }
}

export function initRouter() {
    const routes = {
        'home': loadHome,
        'trips': loadTrips,
        'buddies': loadBuddies,
        'profile': loadProfile,
        'about': () => {
            document.getElementById('app').innerHTML = '<h1>About</h1><p>This is the about page.</p>';
        }
    };

    function handleRoute() {
        route();
    }

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}