// Admin Page Script

// Protect page
protectPage();

// Display user name
displayUserName();

// Setup logout
setupLogout();

// Global variables
let allUsers = [];
let allImages = [];
let currentEditUserId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadUsers();
    setupTabs();
    setupModals();
});

// ===========================
// Stats Functions
// ===========================
async function loadStats() {
    try {
        // Load users count
        const usersResponse = await fetch(`${API_CONFIG.BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (usersResponse.ok) {
            const users = await usersResponse.json();
            document.getElementById('totalUsers').textContent = users.length;
            allUsers = users;
        } else {
            document.getElementById('totalUsers').textContent = '0';
        }

        // Load images count
        const imagesResponse = await fetch(`${API_CONFIG.BASE_URL}/images`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (imagesResponse.ok) {
            const images = await imagesResponse.json();
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
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading users...</td></tr>';

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load users');
        }

        const users = await response.json();
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
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
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
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    const tbody = document.getElementById('imagesTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading images...</td></tr>';

    try {
        let url = `${API_CONFIG.BASE_URL}/images`;
        if (userId) {
            url += `?userId=${userId}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load images');
        }

        const images = await response.json();
        allImages = images;

        if (images.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No images found</td></tr>';
            return;
        }

        tbody.innerHTML = images.map(image => `
            <tr>
                <td>${image.id}</td>
                <td>${image.userId}</td>
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
        tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: red;">Error loading images: ${error.message}</td></tr>`;
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
            const resp = await fetch(`${API_CONFIG.BASE_URL}/images/${imageId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!resp.ok) {
                throw new Error('Failed to load image details from API');
            }

            const data = await resp.json();
            console.log('🔍 API Response for image', imageId, ':', data);

            // If API returns an array, take first element
            image = Array.isArray(data) ? data[0] : data;

            // Update local cache if possible
            if (image) {
                const idx = allImages.findIndex(i => i.id === image.id);
                if (idx >= 0) allImages[idx] = image;
                else allImages.push(image);
            }
        }

        if (!image) {
            alert('Image data not available.');
            return;
        }

        console.log('📊 Image data being displayed:', image);

        document.getElementById('modalImageId').textContent = image.id ?? 'N/A';
        document.getElementById('modalUserId').textContent = image.userId ?? 'N/A';
        document.getElementById('modalKcal').textContent = (image.kcal ?? 'N/A');
        // some APIs may use different field names for gam/ai suggestion; try common fallbacks
        document.getElementById('modalGam').textContent = (image.gam ?? image.fat ?? 'N/A');
        document.getElementById('modalAiSuggestion').textContent = (image.aiSuggestion ?? image.ai_suggestion ?? image.aiResult ?? 'No suggestion available');
        document.getElementById('modalCreatedAt').textContent = image.createdAt ? new Date(image.createdAt).toLocaleString() : 'N/A';

        // Image preview
        if (image.imagePath) {
            const imgSrc = `${API_CONFIG.BASE_URL.replace('/api', '')}${image.imagePath}`;
            console.log('🖼️ Image source URL:', imgSrc);

            const preview = document.getElementById('modalImagePreview');
            preview.src = imgSrc;
            preview.onerror = function () {
                console.error('❌ Failed to load image from:', imgSrc);
                this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23ddd" width="400" height="400"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="20">Image not found</text></svg>';
            };
        } else {
            console.warn('⚠️ No imagePath found in image data');
            // No image path — use placeholder
            document.getElementById('modalImagePreview').src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23eee" width="400" height="400"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="18">No image available</text></svg>';
            document.getElementById('modalImagePreview').onerror = null;
        }

        document.getElementById('imageModal').style.display = 'block';
    } catch (err) {
        console.error('Error viewing image:', err);
        alert('Unable to load image details. Check console for more information.');
    }
};

// Delete Image
window.deleteImage = async function (imageId) {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
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

// Close Image Modal Button
document.getElementById('closeImageModalBtn').addEventListener('click', () => {
    document.getElementById('imageModal').style.display = 'none';
});

// ===========================
// Modal Management
// ===========================
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal .close');

    // Close button click
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Click outside modal
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

// Refresh stats every 30 seconds
setInterval(loadStats, 30000);
