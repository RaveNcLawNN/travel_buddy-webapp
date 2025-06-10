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
                // Separate 'admin' and sort the rest alphabetically
                const adminUser = users.find(u => u.username === 'admin');
                const otherUsers = users.filter(u => u.username !== 'admin').sort((a, b) => a.username.localeCompare(b.username));
                const sortedUsers = adminUser ? [adminUser, ...otherUsers] : otherUsers;
                userSection.innerHTML = '<h3>Users</h3>' + sortedUsers.map(user => {
                    if (user.username === 'admin') {
                        // Do not allow changing the admin's role or deleting admin
                        return `
                            <div class=\"user-item\">\n
                                <span class=\"user-info\">${user.username} (${user.email}) - ${user.role}</span>
                                <div class=\"user-actions\"></div>
                            </div>
                        `;
                    }
                    const toggleRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
                    const toggleLabel = user.role === 'ADMIN' ? 'Demote to USER' : 'Promote to ADMIN';
                    const toggleClass = user.role === 'ADMIN' ? 'role-toggle demote' : 'role-toggle promote';
                    return `
                        <div class=\"user-item\">\n
                            <span class=\"user-info\">${user.username} (${user.email}) - ${user.role}</span>
                            <div class=\"user-actions\">
                                <button class=\"${toggleClass}\" onclick=\"toggleUserRole('${user.username}','${toggleRole}')\">${toggleLabel}</button>
                                <button class=\"delete\" onclick=\"deleteUser('${user.username}')\">Delete</button>
                            </div>
                        </div>
                    `;
                }).join('');
            });
    }

    // Toggle user role
    window.toggleUserRole = function(username, newRole) {
        fetch(`/api/users/${username}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        })
        .then(res => {
            if (res.ok) fetchUsers();
            else alert('Failed to update user role');
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
                    <div class=\"trip-item\">\n
                        <span>${trip.title} - ${trip.destination}</span>
                        <button class=\"delete\" onclick=\"deleteTrip(${trip.id})\">Delete</button>
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