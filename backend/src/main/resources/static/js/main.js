import { initNavigationBar } from './navigation-bar.js';
import { initFooterBar } from './footer.js';
import { loadHome } from './home.js';

window.addEventListener('hashchange', route);

function route() {
    const view = (location.hash.replace('#', '').trim().toLowerCase()) || 'home';

    switch (view) {
        case 'home':
            loadHome();
            break;
        // other views can be put here later
        default:
            loadHome();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initNavigationBar();
    initFooterBar();
    route();
});