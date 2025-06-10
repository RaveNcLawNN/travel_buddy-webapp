//=============================================
// IMPORTS
//=============================================

import { createElement } from "./createElement.js";

//=============================================
// FOOTER INIT
//=============================================

export function initFooterBar() {
    const footer = document.getElementById('footer');
    if (!footer) {
        console.warn('No #footer element found. Footer bar not initialized.');
        return;
    }

    const footerElement = createElement('footer', { className: 'navbar navbar-dark bg-dark' },
        createElement('div', { className: 'container' }, 
            createElement('span', { className: 'navbar-text text-light' }, `© ${new Date().getFullYear()} Travel Buddy – All rights reserved`))
    );
    footer.appendChild(footerElement);
}
