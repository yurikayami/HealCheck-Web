// Dashboard Page Script

// Protect page
protectPage();

// Display user name
displayUserName();

// Setup logout
setupLogout();

// Get DOM elements
const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImage = document.getElementById('removeImage');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultsSection = document.getElementById('resultsSection');

let selectedFile = null;

// Handle file input change
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

// Handle drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFileSelect(file);
    } else {
        showError('uploadError', 'Please drop a valid image file');
    }
});

// Handle file selection
function handleFileSelect(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showError('uploadError', 'Invalid file type. Please select a JPG, PNG, GIF, or WEBP image.');
        return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showError('uploadError', 'File size exceeds 10MB limit');
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        uploadArea.style.display = 'none';
        imagePreview.style.display = 'block';
        hideError('uploadError');
    };
    reader.readAsDataURL(file);
}

// Remove image
removeImage.addEventListener('click', () => {
    selectedFile = null;
    imageInput.value = '';
    uploadArea.style.display = 'block';
    imagePreview.style.display = 'none';
    resultsSection.style.display = 'none';
});

// Handle form submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedFile) {
        showError('uploadError', 'Please select an image first');
        return;
    }

    // Hide previous results and errors
    resultsSection.style.display = 'none';
    hideError('uploadError');

    // Show loading
    uploadForm.style.display = 'none';
    loadingSpinner.style.display = 'block';

    try {
        // Get current user
        const user = getCurrentUser();

        // Prepare form data
        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('image', selectedFile);

        // Make API request
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_IMAGE}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // Display results
            displayResults(data);
        } else {
            showError('uploadError', data.message || 'Failed to analyze image');
            uploadForm.style.display = 'block';
        }
    } catch (error) {
        console.error('Upload error:', error);
        showError('uploadError', 'Failed to connect to server. Please try again.');
        uploadForm.style.display = 'block';
    } finally {
        loadingSpinner.style.display = 'none';
    }
});

// Display analysis results
function displayResults(data) {
    // Show results section
    resultsSection.style.display = 'block';
    uploadForm.style.display = 'block';

    // Update nutrient values
    if (data.nutrientAnalysis && data.nutrientAnalysis.length > 0) {
        data.nutrientAnalysis.forEach(nutrient => {
            const elementId = nutrient.nutrientName.toLowerCase() + 'Value';
            let targetId;

            switch (nutrient.nutrientName.toLowerCase()) {
                case 'calories':
                    targetId = 'caloriesValue';
                    break;
                case 'protein':
                    targetId = 'proteinValue';
                    break;
                case 'fat':
                    targetId = 'fatValue';
                    break;
                case 'carbohydrate':
                    targetId = 'carbsValue';
                    break;
            }

            if (targetId) {
                const element = document.getElementById(targetId);
                if (element) {
                    element.textContent = nutrient.value.toFixed(1);
                }
            }
        });
    } else {
        // Use fallback values if available
        if (data.kcal) {
            document.getElementById('caloriesValue').textContent = data.kcal.toFixed(1);
        }
    }

    // Update suggestion
    if (data.aiSuggestion) {
        document.getElementById('suggestionText').textContent = data.aiSuggestion;
    } else {
        document.getElementById('suggestionText').textContent = 'No suggestion available at this time.';
    }

    // Update details
    document.getElementById('imageId').textContent = data.id;
    document.getElementById('analyzedDate').textContent = new Date(data.createdAt).toLocaleString();

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}
