// Authentication Helper Functions

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem(STORAGE_KEYS.USER) !== null;
}

// Get current user
function getCurrentUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
}

// Save user to storage
function saveUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    if (user.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, user.token);
    }
}

// Logout user
function logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    window.location.href = 'index.html';
}

// Protect page (redirect to login if not authenticated)
function protectPage() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

// Check if on auth page and redirect if already logged in
function checkAuthPage() {
    if (isAuthenticated()) {
        window.location.href = 'dashboard.html';
    }
}

// Display user name in navbar
function displayUserName() {
    const user = getCurrentUser();
    const userNameElement = document.getElementById('userName');
    if (user && userNameElement) {
        userNameElement.textContent = user.username;
    }
}

// Setup logout button
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

// Hide error message
function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// Show success message
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}
