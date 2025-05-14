export function initFooterBar() {
    const footer = document.getElementById('footer');
    if (!footer) {
        console.warn('No #footer element found. Footer bar not initialized.');
        return;
    }

    const footerElement = document.createElement('footer');
    footerElement.className = 'navbar navbar-dark bg-dark justify-content-center';

    const container = document.createElement('div');
    container.className = 'container';

    const text = document.createElement('span');
    text.className = 'navbar-text text-light';
    text.textContent = '© 2025 Travel Buddy - All rights reserved';

    container.appendChild(text);
    footerElement.appendChild(container);
    footer.appendChild(footerElement);
}
