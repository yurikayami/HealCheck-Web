// Login Page Script

// Check if already logged in
checkAuthPage();

// Get form element
const loginForm = document.getElementById('loginForm');

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide any previous errors
    hideError('loginError');

    // Get form data
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Validate input
    if (!username || !password) {
        showError('loginError', 'Please fill in all fields');
        return;
    }

    // Disable submit button
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    try {
        // Make API request
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save user data
            saveUser(data);

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Show error message
            showError('loginError', data.message || 'Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('loginError', 'Failed to connect to server. Please try again.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Allow Enter key to submit
document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});
