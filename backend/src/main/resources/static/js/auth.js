/*´Login/session handling */

// Store the JWT token in localStorage
export function setToken(token) {
    localStorage.setItem('token', token);
}

// Get the JWT token from localStorage
export function getToken() {
    return localStorage.getItem('token');
}

// Remove the JWT token from localStorage
export function removeToken() {
    localStorage.removeItem('token');
}

// Get the current user from localStorage
export function getCurrentUser() {
    const token = getToken();
    if (!token) return null;

    try {
        // Decode the JWT token (it's in the format: header.payload.signature)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            username: payload.sub,
            id: payload.id,
            // Add any other user properties you need
        };
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

// Check if the user is logged in
export function isLoggedIn() {
    return getToken() !== null;
}

// Handle login
export async function login(username, password) {
    try {
        console.log('Attempting login with:', { username, password });
        
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        console.log('Login response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Login failed with status:', response.status, 'Error:', errorText);
            throw new Error(errorText || 'Login failed');
        }

        const token = await response.text();
        console.log('Received token:', token ? 'Token received' : 'No token');
        
        if (!token) {
            throw new Error('No token received');
        }

        setToken(token);

        // Decode the JWT and redirect based on role
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role === 'ADMIN') {
                window.location.href = '/admin/html/index.html';
            } else {
                window.location.href = '/index.html';
            }
        } catch (e) {
            console.error('Error decoding JWT for redirection:', e);
            window.location.href = '/index.html';
        }
        return true;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Handle registration
export async function register(username, email, password) {
    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        // After successful registration, log the user in
        return await login(username, password);
    } catch (error) {
        console.error('Registration error:', error);
        return false;
    }
}

// Handle logout
export function logout() {
    removeToken();
    window.location.hash = 'home';
}

// Add authorization header to fetch requests
export function fetchWithAuth(url, options = {}) {
    const token = getToken();
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    return fetch(url, options);
}
