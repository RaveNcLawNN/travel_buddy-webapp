import { createElement } from "./createElement.js";


export function initFooterBar() {
    const footer = document.getElementById('footer');
    if (!footer) {
        console.warn('No #footer element found. Footer bar not initialized.');
        return;
    }

    const footerElement = createElement('footer', { className: 'navbar navbar-dark bg-dark justify-content-center' },
        createElement('div', { className: 'container' }, 
            createElement('span', { className: 'navbar-text text-light' }, `© ${new Date().getFullYear()} Travel Buddy – All rights reserved`))
    );
    footer.appendChild(footerElement);
}
