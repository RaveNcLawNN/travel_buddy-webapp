//=============================================
// TOKEN HANDLING
//=============================================

// Store the JWT token in localStorage (browser).
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

//=============================================
// USER INFO/AUTHENTICATION STATUS
//=============================================

// Get the current user from localStorage
export function getCurrentUser() {
    const token = getToken();
    if (!token) return null;

    try {
        // Decode the JWT token for the current user.
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            username: payload.sub,
            id: payload.id,
        };
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

// Check if the user is logged in. If the token is not null, the user is logged in.
export function isLoggedIn() {
    return getToken() !== null;
}

//=============================================
// LOGIN/REGISTRATION/LOGOUT
//=============================================


// Handle login. This function is called when the user clicks the login button.
export async function login(username, password) {
    try {
        console.log('Attempting login with:', { username, password });
        
        // 1. We send a POST request to the backend (UserController) to login the user.
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // 1.1. We send the username and password to the backend.
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        console.log('Login response status:', response.status);
        
        // 2. If the response is not ok, we throw an error.
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Login failed with status:', response.status, 'Error:', errorText);
            throw new Error(errorText || 'Login failed');
        }

        // 2.1. We get the token from the response.
        const token = await response.text();
        console.log('Received token:', token ? 'Token received' : 'No token');
        
        // 2.2. If the token is not received, we throw an error.
        if (!token) {
            throw new Error('No token received');
        }

        // 3. We store the token in localStorage.
        setToken(token);

        // Decode the JWT and redirect based on role. This is done to determine which page to redirect the user to.
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

// Handle registration. This function is called when the user clicks the register button.
export async function register(username, email, password) {
    try {
        // 1. We send a POST request to the backend (UserController) to register the user.
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 1.1. We send the username, email, password, and role to the backend.
            body: JSON.stringify({ username, email, password, role: "USER" })
        });

        // 2. If the response is not ok, we throw an error.
        if (!response.ok) {
            throw new Error('Registration failed');
        }

        // 3. After successful registration, log the user in.
        return await login(username, password);
    } catch (error) {
        console.error('Registration error:', error);
        return false;
    }
}

// Handle logout. This function is called when the user clicks the logout button.
// 1. We remove the token from localStorage.
// 2. We redirect the user to the home page.
export function logout() {
    removeToken();
    window.location.hash = 'home';
}

//=============================================
// FETCH HELPER WITH AUTH
//=============================================

// This function is used to make authenticated API requests.It is used in the api.js file.
// It gets the token from localStorage and adds it to the headers of the request.
// This is done to make sure that the user is authenticated and has a valid token.
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
