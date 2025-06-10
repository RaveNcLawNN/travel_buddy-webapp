//=============================================
// IMPORTS
//=============================================

import { initNavigationBar } from './navigation-bar.js';
import { route } from './router.js';
import { initFooterBar } from './footer.js';
import { loadHome } from './home.js';

// Handler for URL changes
window.addEventListener('hashchange', route);

// Init URL load
document.addEventListener('DOMContentLoaded', () => {
    initNavigationBar();
    initFooterBar();
    route();
});

// Helper for Modal closing
function closeAllModals() {
  const openModals = document.querySelectorAll('.modal.show');
  openModals.forEach(modal => {
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }
    modal.remove();
  });
}

// Attach modal closing to navigation events
window.addEventListener('popstate', closeAllModals);