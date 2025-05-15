import { initNavigationBar } from './navigation-bar.js';
import { route } from './router.js';
import { initFooterBar } from './footer.js';
import { loadHome } from './home.js';

// damit auf die URL-Änderungen reagiert wird
window.addEventListener('hashchange', route);

// Initialisierung beim loaden der Website
document.addEventListener('DOMContentLoaded', () => {
    initNavigationBar();
    initFooterBar();
    route();
});