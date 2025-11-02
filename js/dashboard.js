// Dashboard Page Script

// Protect page
protectPage();

// Display user name
displayUserName();

// Setup logout
setupLogout();

// Load existing analyses
loadExistingAnalyses();

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

// Load existing analyses for the current user
async function loadExistingAnalyses() {
    const user = getCurrentUser();
    if (!user || !user.id) {
        console.error('User not found or not logged in');
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_IMAGE}?userId=${user.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const images = await response.json();
            displayExistingAnalyses(images);
        } else {
            console.error('Failed to load existing analyses');
        }
    } catch (error) {
        console.error('Error loading existing analyses:', error);
    }
}

// Display existing analyses
function displayExistingAnalyses(images) {
    if (!images || images.length === 0) {
        return;
    }

    // Create history section if it doesn't exist
    let historySection = document.getElementById('historySection');
    if (!historySection) {
        historySection = document.createElement('section');
        historySection.id = 'historySection';
        historySection.className = 'history-section';
        historySection.innerHTML = `
            <h2><i class="fas fa-history"></i> Previous Analyses</h2>
            <div id="historyGrid" class="history-grid"></div>
        `;

        // Insert after results section
        const resultsSection = document.querySelector('.results-section');
        resultsSection.parentNode.insertBefore(historySection, resultsSection.nextSibling);
    }

    const historyGrid = document.getElementById('historyGrid');
    historyGrid.innerHTML = '';

    images.forEach(image => {
        const historyCard = document.createElement('div');
        historyCard.className = 'history-card';
        historyCard.onclick = () => displayResults(image);

        const imageUrl = `http://localhost:5288${image.imagePath || image.path}`;
        const analyzedDate = new Date(image.createdAt).toLocaleDateString();

        historyCard.innerHTML = `
            <div class="history-image">
                <img src="${imageUrl}" alt="Food image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='">
            </div>
            <div class="history-info">
                <h4>${image.foodName || 'Unknown Food'}</h4>
                <p class="history-date">${analyzedDate}</p>
                <p class="history-calories">${image.kcal ? image.kcal.toFixed(0) + ' kcal' : ''}</p>
            </div>
        `;

        historyGrid.appendChild(historyCard);
    });
}

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

            // Reload existing analyses to include the new one
            loadExistingAnalyses();
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

    // Display food name if available
    const foodNameCard = document.getElementById('foodNameCard');
    const foodNameValue = document.getElementById('foodNameValue');

    if (data.foodName) {
        foodNameValue.textContent = data.foodName;
        foodNameCard.style.display = 'block';
    } else {
        foodNameCard.style.display = 'none';
    }

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
