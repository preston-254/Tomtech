// Admin Authentication System
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'tomtech2024', // Change this to a secure password
    role: 'admin'
};

// Session timeout (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000;
let sessionTimer = null;

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (window.location.pathname.includes('admin-dashboard.html')) {
        checkAuth();
        startSessionTimer();
    } else if (window.location.pathname.includes('admin-login.html')) {
        initializeLogin();
    }
});

// Check authentication status
function checkAuth() {
    const authData = localStorage.getItem('adminAuth');
    if (!authData) {
        redirectToLogin();
        return;
    }

    try {
        const auth = JSON.parse(authData);
        const now = Date.now();
        
        // Check if session expired
        if (now - auth.timestamp > SESSION_TIMEOUT) {
            logout();
            return;
        }

        // Check role
        if (auth.role !== 'admin') {
            logout();
            return;
        }

        // Update timestamp
        auth.timestamp = now;
        localStorage.setItem('adminAuth', JSON.stringify(auth));
    } catch (e) {
        logout();
    }
}

// Initialize login form
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (authenticate(username, password)) {
                // Create session
                const authData = {
                    username: username,
                    role: ADMIN_CREDENTIALS.role,
                    timestamp: Date.now()
                };
                localStorage.setItem('adminAuth', JSON.stringify(authData));
                
                // Redirect to dashboard
                window.location.href = 'admin-dashboard.html';
            } else {
                showError('Invalid username or password');
            }
        });
    }
}

// Authenticate user
function authenticate(username, password) {
    return username === ADMIN_CREDENTIALS.username && 
           password === ADMIN_CREDENTIALS.password;
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('adminAuth');
    clearSessionTimer();
    redirectToLogin();
}

// Redirect to login
function redirectToLogin() {
    window.location.href = 'admin-login.html';
}

// Start session timer
function startSessionTimer() {
    clearSessionTimer();
    
    // Reset timer on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const resetTimer = () => {
        clearSessionTimer();
        sessionTimer = setTimeout(() => {
            logout();
        }, SESSION_TIMEOUT);
    };

    events.forEach(event => {
        document.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();
}

// Clear session timer
function clearSessionTimer() {
    if (sessionTimer) {
        clearTimeout(sessionTimer);
        sessionTimer = null;
    }
}

// Export logout function for use in dashboard
if (typeof window !== 'undefined') {
    window.adminLogout = logout;
    window.checkAuth = checkAuth;
}

