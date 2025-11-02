// Admin Page Script

// Global variables
let allUsers = [];
let allImages = [];
let currentEditUserId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Protect page
        // protectPage(); // Commented out since API doesn't require authentication

        // Display user name
        displayUserName();

        // Setup logout
        setupLogout();

        console.log('✅ Page setup complete');
    } catch (error) {
        console.error('❌ Error during page setup:', error);
    }

    loadStats();
    loadUsers();
    setupTabs();
    setupModals();
});

// ===========================
// Stats Functions
// ===========================
async function loadStats() {
    console.log('🔄 Loading stats...', API_CONFIG);
    try {
        // Load users count
        const usersResponse = await fetch(`${API_CONFIG.BASE_URL}/users`);
        console.log('📊 Users Response:', usersResponse.status);

        if (usersResponse.ok) {
            const users = await usersResponse.json();
            console.log('👥 Users loaded:', users.length);
            document.getElementById('totalUsers').textContent = users.length;
            allUsers = users;
        } else {
            document.getElementById('totalUsers').textContent = '0';
        }

        // Load images count
        const imagesResponse = await fetch(`${API_CONFIG.BASE_URL}/images`);
        console.log('📸 Images Response:', imagesResponse.status);

        if (imagesResponse.ok) {
            const images = await imagesResponse.json();
            console.log('🖼️ Images loaded:', images.length);
            document.getElementById('totalImages').textContent = images.length;

            // Calculate today's analysis
            const today = new Date().toDateString();
            const todayCount = images.filter(img => {
                const imgDate = new Date(img.createdAt).toDateString();
                return imgDate === today;
            }).length;
            document.getElementById('todayAnalysis').textContent = todayCount;

            allImages = images;
        } else {
            document.getElementById('totalImages').textContent = '0';
            document.getElementById('todayAnalysis').textContent = '0';
        }

        // API Status
        document.getElementById('apiStatusDot').className = 'status-indicator online';
        document.getElementById('apiStatusText').textContent = 'Online';
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalImages').textContent = '0';
        document.getElementById('todayAnalysis').textContent = '0';
        document.getElementById('apiStatusDot').className = 'status-indicator offline';
        document.getElementById('apiStatusText').textContent = 'Offline';
    }
}

// ===========================
// Tab Management
// ===========================
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Add active class to clicked tab
            btn.classList.add('active');
            const tabName = btn.getAttribute('data-tab');

            if (tabName === 'users') {
                document.getElementById('usersTab').classList.add('active');
                loadUsers();
            } else if (tabName === 'images') {
                document.getElementById('imagesTab').classList.add('active');
                loadImages();
            }
        });
    });
}

// ===========================
// Users CRUD Functions
// ===========================
async function loadUsers() {
    console.log('📋 Loading users...');
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading users...</td></tr>';

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/users`);

        if (!response.ok) {
            throw new Error('Failed to load users');
        }

        const users = await response.json();
        console.log('✅ Users data:', users);
        allUsers = users;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${new Date(user.createdAt).toLocaleString()}</td>
                <td>
                    <button class="action-btn edit" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: red;">Error loading users: ${error.message}</td></tr>`;
    }
}

// Add User Button
document.getElementById('addUserBtn').addEventListener('click', () => {
    currentEditUserId = null;
    document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Add User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('passwordGroup').style.display = 'block';
    document.getElementById('password').required = true;
    document.getElementById('userModal').style.display = 'block';
});

// Edit User
window.editUser = function (userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    currentEditUserId = userId;
    document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Edit User';
    document.getElementById('userId').value = user.id;
    document.getElementById('username').value = user.username;
    document.getElementById('email').value = user.email || '';
    document.getElementById('passwordGroup').style.display = 'none';
    document.getElementById('password').required = false;
    document.getElementById('userModal').style.display = 'block';
};

// Delete User
window.deleteUser = async function (userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        alert('User deleted successfully!');
        await loadUsers();
        await loadStats();
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
    }
};

// User Form Submit
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const userData = {
        username,
        email: email || null
    };

    if (password) {
        userData.password = password;
    }

    try {
        let response;

        if (currentEditUserId) {
            // Update existing user
            response = await fetch(`${API_CONFIG.BASE_URL}/users/${currentEditUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        } else {
            // Create new user
            response = await fetch(`${API_CONFIG.BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save user');
        }

        alert(currentEditUserId ? 'User updated successfully!' : 'User created successfully!');
        document.getElementById('userModal').style.display = 'none';
        await loadUsers();
        await loadStats();
    } catch (error) {
        console.error('Error saving user:', error);
        alert(error.message || 'Failed to save user. Please try again.');
    }
});

// Cancel User Button
document.getElementById('cancelUserBtn').addEventListener('click', () => {
    document.getElementById('userModal').style.display = 'none';
});

// ===========================
// Images CRUD Functions
// ===========================
async function loadImages(userId = null) {
    console.log('🖼️ Loading images...', userId);
    const tbody = document.getElementById('imagesTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading images...</td></tr>';

    try {
        let url = `${API_CONFIG.BASE_URL}/images`;
        if (userId) {
            url += `?userId=${userId}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to load images');
        }

        const images = await response.json();
        console.log('✅ Images data:', images.length, 'images');
        allImages = images;

        if (images.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No images found</td></tr>';
            return;
        }

        tbody.innerHTML = images.map(image => `
            <tr>
                <td>${image.id}</td>
                <td>${image.userId}</td>
                <td>${image.foodName || 'N/A'}</td>
                <td>
                    <img src="${API_CONFIG.BASE_URL.replace('/api', '')}${image.imagePath}" 
                         alt="Image" 
                         class="image-thumbnail"
                         onclick="viewImage(${image.id})"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22>No Image</text></svg>'">
                </td>
                <td>${image.kcal || 0} kcal</td>
                <td>${new Date(image.createdAt).toLocaleString()}</td>
                <td>
                    <button class="action-btn view" onclick="viewImage(${image.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn delete" onclick="deleteImage(${image.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading images:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color: red;">Error loading images: ${error.message}</td></tr>`;
    }
}

// Search Images Button
document.getElementById('searchImageBtn').addEventListener('click', () => {
    const userId = document.getElementById('searchImage').value;
    if (userId) {
        loadImages(userId);
    } else {
        loadImages();
    }
});

// Search on Enter
document.getElementById('searchImage').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchImageBtn').click();
    }
});

// View Image (fetch details if missing)
window.viewImage = async function (imageId) {
    try {
        let image = allImages.find(img => img.id === imageId);

        // If image not found or missing important fields, fetch from API
        if (!image || !image.imagePath || !image.createdAt) {
            const resp = await fetch(`${API_CONFIG.BASE_URL}/images/${imageId}`);

            if (!resp.ok) {
                throw new Error('Failed to load image details from API');
            }

            const data = await resp.json();
            console.log('🔍 API Response for image', imageId, ':', data);

            // If API returns an array, take first element
            image = Array.isArray(data) ? data[0] : data;

            // Update local cache if possible
            if (image.id) {
                allImages = allImages.map(img => img.id === image.id ? image : img);
            }
        }

        // Set modal fields
        document.getElementById('modalImageId').textContent = image.id ?? 'N/A';
        document.getElementById('modalUserId').textContent = image.userId ?? 'N/A';
        document.getElementById('modalFoodName').textContent = image.foodName ?? 'N/A';
        document.getElementById('modalKcal').textContent = (image.kcal ?? 'N/A');
        document.getElementById('modalGam').textContent = (image.gam ?? 'N/A');
        document.getElementById('modalCreatedAt').textContent = new Date(image.createdAt).toLocaleString();

        // Set AI suggestion
        const aiSuggestionDiv = document.getElementById('modalAiSuggestion');
        if (aiSuggestionDiv) {
            aiSuggestionDiv.textContent = image.aiSuggestion ?? 'No suggestion available';
        }

        // Set image preview
        const imageUrl = API_CONFIG.BASE_URL.replace('/api', '') + image.imagePath;
        const modalImagePreview = document.getElementById('modalImagePreview');
        if (modalImagePreview) {
            modalImagePreview.src = imageUrl;
            modalImagePreview.onerror = function () {
                this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="%23ddd" width="300" height="300"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image Not Found</text></svg>';
            };
        }

        // Show modal
        const imageModal = document.getElementById('imageModal');
        if (imageModal) {
            imageModal.style.display = 'block';
            console.log('✅ Image modal displayed for image:', imageId);
        }
    } catch (error) {
        console.error('Error viewing image:', error);
        alert('Failed to view image. Please try again.');
    }
};

// Delete Image
window.deleteImage = async function (imageId) {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/images/${imageId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete image');
        }

        alert('Image deleted successfully!');
        await loadImages();
        await loadStats();
    } catch (error) {
        console.error('Error deleting image:', error);
        alert('Failed to delete image. Please try again.');
    }
};

// ===========================
// Modal and Other Utilities
// ===========================
function setupModals() {
    try {
        // User Modal
        const userModal = document.getElementById('userModal');
        if (userModal) {
            userModal.addEventListener('click', (e) => {
                if (e.target === userModal) {
                    userModal.style.display = 'none';
                }
            });

            const closeUserBtn = userModal.querySelector('.close');
            if (closeUserBtn) {
                closeUserBtn.addEventListener('click', () => {
                    userModal.style.display = 'none';
                });
            }

            const cancelUserBtn = document.getElementById('cancelUserBtn');
            if (cancelUserBtn) {
                cancelUserBtn.addEventListener('click', () => {
                    userModal.style.display = 'none';
                });
            }

            console.log('✅ User modal setup complete');
        } else {
            console.warn('⚠️ User modal not found');
        }

        // Image Modal
        const imageModal = document.getElementById('imageModal');
        if (imageModal) {
            imageModal.addEventListener('click', (e) => {
                if (e.target === imageModal) {
                    imageModal.style.display = 'none';
                }
            });

            const closeImageBtn = imageModal.querySelector('.close');
            if (closeImageBtn) {
                closeImageBtn.addEventListener('click', () => {
                    imageModal.style.display = 'none';
                });
            }

            const closeImageModalBtn = document.getElementById('closeImageModalBtn');
            if (closeImageModalBtn) {
                closeImageModalBtn.addEventListener('click', () => {
                    imageModal.style.display = 'none';
                });
            }

            console.log('✅ Image modal setup complete');
        } else {
            console.warn('⚠️ Image modal not found');
        }
    } catch (error) {
        console.error('❌ Error setting up modals:', error);
    }
}

// Logout function
function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    });
}

// Display user name
function displayUserName() {
    const userName = localStorage.getItem('userName') || 'Admin';
    document.getElementById('userNameDisplay').textContent = `Welcome, ${userName}`;
}

// Protect page
function protectPage() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You are not authorized to view this page. Please login.');
        window.location.href = 'login.html';
    }
}
