// Register Page Script

// Check if already logged in
checkAuthPage();

// Get form element
const registerForm = document.getElementById('registerForm');

// Handle form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide any previous messages
    hideError('registerError');
    document.getElementById('registerSuccess').style.display = 'none';

    // Get form data
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate input
    if (!username || !password || !confirmPassword) {
        showError('registerError', 'Please fill in all required fields');
        return;
    }

    if (username.length < 3) {
        showError('registerError', 'Username must be at least 3 characters');
        return;
    }

    if (password.length < 6) {
        showError('registerError', 'Password must be at least 6 characters');
        return;
    }

    if (password !== confirmPassword) {
        showError('registerError', 'Passwords do not match');
        return;
    }

    // Disable submit button
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    try {
        // Prepare request data
        const requestData = {
            username,
            password,
            email: email || null
        };

        // Make API request
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (response.ok) {
            // Show success message
            showSuccess('registerSuccess', 'Account created successfully! Redirecting to login...');

            // Clear form
            registerForm.reset();

            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            // Show error message
            showError('registerError', data.message || 'Registration failed. Username may already exist.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('registerError', 'Failed to connect to server. Please try again.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Password match validation
document.getElementById('confirmPassword').addEventListener('input', (e) => {
    const password = document.getElementById('password').value;
    const confirmPassword = e.target.value;

    if (confirmPassword && password !== confirmPassword) {
        e.target.setCustomValidity('Passwords do not match');
    } else {
        e.target.setCustomValidity('');
    }
});
