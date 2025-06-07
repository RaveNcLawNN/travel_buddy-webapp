/**
 * Initialisiert die Navigationsleiste, indem sie dynamisch in das Element 'navbar' eingefügt wird.
 * Wird nur einmalig beim ersten Laden der Seite aufgerufen
 */

import { isLoggedIn, logout, getCurrentUser } from './auth.js';
import { showLoginModal } from './loginModal.js';

export function initNavigationBar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
        console.warn('No #navbar element found. Navigation bar not initialized.');
        return;
    }

    // Clear the current content to prevent duplicate navbars
    navbar.innerHTML = '';
    
    // <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-lg navbar-dark bg-dark';

    // <div class="container-fluid">
    const container = document.createElement('div');
    container.className = 'container-fluid';

    // Link: TravelBuddy (führt zur Landing Page)
    const travelbuddy = document.createElement('a');
    travelbuddy.className = 'navbar-brand ms-5';
    travelbuddy.href = '#home';
    travelbuddy.textContent = 'TravelBuddy';

    // Toggler-Button für die mobile Ansicht (zeigen/verstecken von Menüpunkten)
    const toggler = document.createElement('button');
    toggler.className = 'navbar-toggler';
    toggler.setAttribute('type', 'button');
    toggler.setAttribute('data-bs-toggle', 'collapse');
    toggler.setAttribute('data-bs-target', '#navbarNav');
    toggler.setAttribute('aria-controls', 'navbarNav');
    toggler.setAttribute('aria-expanded', 'false');
    toggler.setAttribute('aria-label', 'Toggle navigation');

    // Toggler-Icon (Burger)
    const icon = document.createElement('span');
    icon.className = 'navbar-toggler-icon';
    toggler.appendChild(icon);

    // Container für die toggled Menüpunkte
    const collapse = document.createElement('div');
    collapse.className = 'collapse navbar-collapse';
    collapse.id = 'navbarNav';

    // Liste der Navigationslinks
    const ul = document.createElement('ul');
    ul.className = 'navbar-nav me-auto mb-2 mb-lg-0';

    // Navigationspunkte
    const navItems = [
        { href: '#home', label: 'Home' },
        { href: '#trips', label: 'My Trips' },
        { href: '#buddies', label: 'My Buddies' },
        { href: '#about', label: 'About' }
    ];

    // Erstellung von den einzelnen Navigationspunkten
    navItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item';

        const a = document.createElement('a');
        a.className = 'nav-link';
        a.href = item.href;
        a.textContent = item.label;

        li.appendChild(a);
        ul.appendChild(li);
    });

    // Login/Logout Button
    const authBtn = document.createElement('button');
    authBtn.className = 'btn btn-outline-light me-5';
    authBtn.id = 'authBtn';
    authBtn.type = 'button';

    // Create a container for the auth section
    const authContainer = document.createElement('div');
    authContainer.className = 'd-flex align-items-center';

    // Create a span for the username
    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'text-light me-3';
    usernameSpan.style.display = 'none'; // Hidden by default

    // Create a 'My Profile' button
    const profileBtn = document.createElement('button');
    profileBtn.className = 'btn btn-outline-light me-3';
    profileBtn.textContent = 'My Profile';
    profileBtn.style.display = 'none'; // Hidden by default
    profileBtn.onclick = () => {
        window.location.hash = '#profile';
    };

    // Update auth button based on login state
    function updateAuthButton() {
        if (isLoggedIn()) {
            const currentUser = getCurrentUser();
            usernameSpan.textContent = `Currently logged in as: ${currentUser.username}`;
            usernameSpan.style.display = 'inline'; // Show the username
            profileBtn.style.display = 'inline'; // Show the profile button
            authBtn.textContent = 'Logout';
            authBtn.className = 'btn btn-outline-light me-5';
            authBtn.onclick = () => {
                logout();
                updateAuthButton();
            };
        } else {
            usernameSpan.style.display = 'none'; // Hide the username
            profileBtn.style.display = 'none'; // Hide the profile button
            authBtn.textContent = 'Login / Create Account';
            authBtn.className = 'btn btn-outline-light me-5';
            authBtn.onclick = () => {
                showLoginModal();
            };
        }
    }

    // Initial update of auth button
    updateAuthButton();

    // Add username span, profile button, and auth button to container
    authContainer.appendChild(usernameSpan);
    authContainer.appendChild(profileBtn);
    authContainer.appendChild(authBtn);

    // Aufbau der Elemente
    collapse.appendChild(ul);               // Links
    collapse.appendChild(authContainer);    // Auth section (username + button)
    container.appendChild(travelbuddy);       // Überschrift
    container.appendChild(toggler);         // Toggler
    container.appendChild(collapse);        // Collapse-Bereich
    nav.appendChild(container);             // Navbar-Container
    navbar.appendChild(nav);                // Alles in das navbar div (im HTML)
}