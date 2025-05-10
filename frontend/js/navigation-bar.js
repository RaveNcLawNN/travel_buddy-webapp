export function initNavigationBar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
        console.warn('No #navbar element found. Navigation bar not initialized.');
        return;
    }

    navbar.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="#home">TravelApp</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link" href="#home">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#trips">My Trips</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#buddies">My Buddies</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#about">About</a>
                        </li>
                    </ul>
                    <button class="btn btn-outline-light" type="button" id="loginBtn">Login / Create Account</button>
                </div>
            </div>
        </nav>
    `;

    const loginButton = document.getElementById('loginBtn');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            alert('Login or create account functionality goes here.');
        });
    } else {
        console.warn('Login button not found.');
    }
}
