/**
 * Initialisiert die Navigationsleiste, indem sie dynamisch in das Element 'navbar' eingefügt wird.
 * Wird nur einmalig beim ersten Laden der Seite aufgerufen
 */

export function initNavigationBar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
        console.warn('No #navbar element found. Navigation bar not initialized.');
        return;
    }

    // Reset vom aktuellen Inhalt - noch nicht sicher ob wir das bei der Navigation Bar brauchen, weil die ist ja bei jeder View da.
    app.innerHTML = '';
    
    // <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-lg navbar-dark bg-dark';

    // <div class="container-fluid">
    const container = document.createElement('div');
    container.className = 'container-fluid';

    // Link: TravelApp (führt zur Landing Page)
    const travelapp = document.createElement('a');
    travelapp.className = 'navbar-brand';
    travelapp.href = '#home';
    travelapp.textContent = 'TravelApp';

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

    // Login-Button (öffnet später Login/Registrierung)
    const loginBtn = document.createElement('button');
    loginBtn.className = 'btn btn-outline-light';
    loginBtn.id = 'loginBtn';
    loginBtn.type = 'button';
    loginBtn.textContent = 'Login / Create Account';

    // Click-Event: Platzhalter für Login/Registrierung
    loginBtn.addEventListener('click', () => {
        alert('Login or create account functionality goes here.');
    });

    // Aufbau der Elemente
    collapse.appendChild(ul);               // Links
    collapse.appendChild(loginBtn);         // Login-Button
    container.appendChild(travelapp);       // Überschrift
    container.appendChild(toggler);         // Toggler
    container.appendChild(collapse);        // Collapse-Bereich
    nav.appendChild(container);             // Navbar-Container
    navbar.appendChild(nav);                // Alles in das navbar div (im HTML)
}