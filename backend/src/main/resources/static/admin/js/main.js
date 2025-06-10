// Placeholder for admin panel JavaScript logic
// Use this file to dynamically create HTML and interact with backend endpoints

// Toggle views
document.addEventListener('DOMContentLoaded', function() {
    const userSection = document.getElementById('user-management-section');
    const tripSection = document.getElementById('trip-management-section');
    document.getElementById('user-management-link').onclick = function() {
        userSection.style.display = 'block';
        tripSection.style.display = 'none';
        fetchUsers();
    };
    document.getElementById('trip-management-link').onclick = function() {
        userSection.style.display = 'none';
        tripSection.style.display = 'block';
        fetchTrips();
    };
    // Show user management by default
    document.getElementById('user-management-link').click();

    // Logout button logic
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = function() {
            localStorage.removeItem('token');
            window.location.href = '/index.html';
        };
    }

    // Fetch and display users
    function fetchUsers() {
        fetch('/api/users')
            .then(res => res.json())
            .then(users => {
                userSection.innerHTML = '<h3>Users</h3>' + users.map(user => `
                    <div class="user-item">
                        <span>${user.username} (${user.email}) - ${user.role}</span>
                        <button class="delete" onclick="deleteUser('${user.username}')">Delete</button>
                    </div>
                `).join('');
            });
    }

    // Delete user
    window.deleteUser = function(username) {
        fetch(`/api/users/${username}`, { method: 'DELETE' })
            .then(res => {
                if (res.status === 204) fetchUsers();
                else alert('Failed to delete user');
            });
    }

    // Fetch and display trips
    function fetchTrips() {
        fetch('/api/trips')
            .then(res => res.json())
            .then(trips => {
                tripSection.innerHTML = '<h3>Trips</h3>' + trips.map(trip => `
                    <div class="trip-item">
                        <span>${trip.title} - ${trip.destination}</span>
                        <button class="delete" onclick="deleteTrip(${trip.id})">Delete</button>
                    </div>
                `).join('');
            });
    }

    // Delete trip
    window.deleteTrip = function(tripId) {
        fetch(`/api/trips/${tripId}`, { method: 'DELETE' })
            .then(res => {
                if (res.status === 204) fetchTrips();
                else alert('Failed to delete trip');
            });
    }
}); 