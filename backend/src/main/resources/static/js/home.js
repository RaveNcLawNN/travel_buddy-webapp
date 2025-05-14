export function loadHome() {
    const app = document.getElementById('app');
    if (!app) {
        console.warn('No #app element found. Home view not loaded.');
        return;
    }

    app.innerHTML = `
        <div class="text-center">
            <h1 class="mt-5">Welcome to Travel Buddy</h1>
            <p class="lead">Plan trips, track adventures, and share memories with your travel buddies!</p>
            <img src="/images/travelBuddy_home_placeholder.jpg" 
                 class="img-fluid rounded mt-4" 
                 alt="Travel">
        </div>
    `;
}
