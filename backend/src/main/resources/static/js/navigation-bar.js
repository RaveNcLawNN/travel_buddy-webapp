//=============================================
// IMPORTS
//=============================================

import { isLoggedIn, logout, getCurrentUser } from './auth.js';
import { showLoginModal } from './loginModal.js';

//=============================================
// MAIN: INIT NAV BAR
//=============================================

export function initNavigationBar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
        console.warn('No #navbar element found. Navigation bar not initialized.');
        return;
    }

    // Clear the current content to prevent duplicates
    navbar.replaceChildren();

    //=============================================
    // STRUCTURE
    //=============================================

    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-lg navbar-dark';

    const container = document.createElement('div');
    container.className = 'container-fluid';

    const travelbuddy = document.createElement('a');
    travelbuddy.className = 'navbar-brand ms-5';
    travelbuddy.href = '#home';
    
    const logo = document.createElement('img');
    logo.src = '/images/logo-white.png'
    logo.alt = 'TravelBuddy Logo';
    logo.style.height = '60px';
    logo.style.width  = 'auto';
    logo.style.objectFit = 'contain';

    travelbuddy.appendChild(logo);

    //=============================================
    // RESPONSIVE: TOGGLER
    //=============================================

    const toggler = document.createElement('button');
    toggler.className = 'navbar-toggler';
    toggler.type = 'button';
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

    //=============================================
    // LEFT SIDE NAV
    //=============================================

    const leftUl = document.createElement('ul');
    leftUl.className = 'navbar-nav mb-2 mb-lg-0';

    let profileLink = null;

    // Navigationspunkte
    const navItems = [
        { href: '#home', label: 'Home' },
        { href: '#trips', label: 'My Trips' },
        { href: '#buddies', label: 'My Buddies' },
        { href: '#profile', label: 'My Profile', protected: true }
    ];

    // Erstellung von den einzelnen Navigationspunkten
    navItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item ms-2';

        const a = document.createElement('a');
        a.className = 'nav-link';
        a.href = item.href;
        a.textContent = item.label;

        if (item.protected) {
            a.style.display = 'none';
            profileLink = a;
        }

        li.appendChild(a);
        leftUl.appendChild(li);
    });

    //=============================================
    // RIGHT SIDE NAV
    //=============================================

    const rightUl = document.createElement('ul');
    rightUl.className = 'navbar-nav ms-auto mb-2 mb-lg-0';

    // Login/Logout Button
    const authLi = document.createElement('li');
    authLi.className = 'nav-item me-4';

    const authLink = document.createElement('a');
    authLink.className = 'nav-link';
    authLink.href = '#';
    authLink.id = 'authLink';

    authLi.appendChild(authLink);
    rightUl.appendChild(authLi);

    //=============================================
    // AUTH BTN (based on login state)
    //=============================================

    function updateAuthButton() {
        if (isLoggedIn()) {
            authLink.textContent = 'Logout';
            authLink.onclick = (e) => {
                e.preventDefault();
                logout();
                initNavigationBar();
            };
            
            if (profileLink) profileLink.style.display = '';
        } else {
            authLink.textContent = 'Login / Create Account';
            authLink.onclick = (e) => {
                e.preventDefault();
                showLoginModal();
            };

            if (profileLink) profileLink.style.display = 'none';
        }
    }

    // Initial update of auth button
    updateAuthButton();


    // Assemble nav
    collapse.appendChild(leftUl);
    collapse.appendChild(rightUl);
    container.appendChild(travelbuddy);
    container.appendChild(toggler);
    container.appendChild(collapse);
    nav.appendChild(container);
    navbar.appendChild(nav);
}