# HealCheck Web - Frontend Application

A modern, responsive web application for AI-powered nutritional analysis of food images.

## 🎯 Features

### User Authentication
- ✅ User Registration
- ✅ User Login
- ✅ Session Management
- ✅ Logout Functionality

### Dashboard
- ✅ Image Upload (Drag & Drop or Browse)
- ✅ Real-time Image Preview
- ✅ AI-Powered Nutritional Analysis
- ✅ Beautiful Results Display
- ✅ Health Suggestions from AI

### Admin Panel
- ✅ System Statistics Overview
- ✅ API Status Monitoring
- ✅ Recent Activities Log
- ✅ System Settings Management
- ✅ User Analytics

## 📁 Project Structure

```
HealCheck Web/
├── index.html              # Login page
├── register.html           # Registration page
├── dashboard.html          # Main dashboard with image upload
├── admin.html             # Admin panel
├── css/
│   └── styles.css         # All styles
├── js/
│   ├── config.js          # API configuration
│   ├── auth.js            # Authentication helpers
│   ├── login.js           # Login functionality
│   ├── register.js        # Registration functionality
│   ├── dashboard.js       # Dashboard functionality
│   └── admin.js           # Admin panel functionality
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- HealCheck API running (default: http://localhost:5288)

### Installation

1. **No installation required!** This is a static web application.

2. **Update API URL** (if needed):
   - Open `js/config.js`
   - Update `BASE_URL` if your API is running on a different port

3. **Run the application**:
   
   **Option 1: Using Live Server (Recommended)**
   - Install Live Server extension in VS Code
   - Right-click on `index.html`
   - Select "Open with Live Server"
   
   **Option 2: Using Python**
   ```bash
   # Python 3
   python -m http.server 8080
   
   # Then open: http://localhost:8080
   ```
   
   **Option 3: Using Node.js**
   ```bash
   npx http-server -p 8080
   
   # Then open: http://localhost:8080
   ```
   
   **Option 4: Direct File Access**
   - Simply double-click `index.html`
   - Note: Some features may not work due to CORS

## 📖 Usage Guide

### 1. Register an Account
1. Click "Sign Up" on the login page
2. Fill in your details:
   - Username (required, min 3 characters)
   - Email (optional)
   - Password (required, min 6 characters)
3. Click "Sign Up"
4. You'll be redirected to login

### 2. Login
1. Enter your username and password
2. Click "Sign In"
3. You'll be redirected to the dashboard

### 3. Analyze Food Images
1. On the dashboard, drag & drop a food image or click "Browse Files"
2. Supported formats: JPG, PNG, GIF, WEBP (max 10MB)
3. Preview your image
4. Click "Analyze Image"
5. Wait for AI analysis (may take 10-30 seconds)
6. View results:
   - Calories
   - Protein
   - Fat
   - Carbohydrates
   - AI Health Suggestions

### 4. Access Admin Panel
1. Click "Admin" in the navigation
2. View system statistics
3. Monitor API status
4. Check recent activities
5. Manage system settings

### 5. Logout
1. Click "Logout" in the navigation
2. Confirm logout
3. You'll be redirected to login page

## 🎨 Features Highlight

### Responsive Design
- ✅ Mobile-friendly
- ✅ Tablet-optimized
- ✅ Desktop-enhanced

### User Experience
- ✅ Smooth animations
- ✅ Real-time validation
- ✅ Loading indicators
- ✅ Error handling
- ✅ Success messages

### Security
- ✅ Client-side validation
- ✅ Secure password handling
- ✅ Session management
- ✅ Protected pages

## 🔧 Configuration

### API Configuration (`js/config.js`)

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:5288/api',
    ENDPOINTS: {
        REGISTER: '/users/register',
        LOGIN: '/users/login',
        UPLOAD_IMAGE: '/images/upload',
        GET_IMAGE: '/images'
    }
};
```

**To change API URL:**
1. Open `js/config.js`
2. Update `BASE_URL` to your API server
3. Save and refresh the browser

## 🎨 Customization

### Colors (`css/styles.css`)

```css
:root {
    --primary-color: #4CAF50;      /* Main green */
    --secondary-color: #2196F3;    /* Blue accent */
    --danger-color: #f44336;       /* Red for errors */
    --warning-color: #ff9800;      /* Orange for warnings */
    --success-color: #4CAF50;      /* Green for success */
}
```

### Logo
- The logo uses Font Awesome heartbeat icon
- To change: Update the `<i>` tag in HTML files

## 🐛 Troubleshooting

### Issue: "Failed to connect to server"
**Solution:**
- Make sure HealCheck API is running
- Check API URL in `js/config.js`
- Verify CORS is enabled in API

### Issue: "Invalid username or password"
**Solution:**
- Make sure you registered first
- Check username spelling (case-sensitive)
- Re-register if needed

### Issue: Image upload fails
**Solution:**
- Check file size (max 10MB)
- Verify file type (JPG, PNG, GIF, WEBP)
- Ensure Gemini API key is configured in backend
- Check API logs for errors

### Issue: Styles not loading
**Solution:**
- Clear browser cache (Ctrl+Shift+Del)
- Check console for errors (F12)
- Verify CSS file path is correct

## 🌐 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ✅ Opera

## 📱 Mobile Support

Fully responsive design works on:
- ✅ iPhone / iOS
- ✅ Android phones
- ✅ Tablets
- ✅ iPad

## 🔒 Privacy & Storage

### Local Storage
The app stores:
- User session data
- Username (no passwords)
- Token (if provided by API)
- Admin settings preferences

### Data Handling
- No sensitive data stored in browser
- All passwords sent encrypted over HTTPS
- Session cleared on logout

## 🚀 Production Deployment

### Steps:
1. Update API URL in `js/config.js` to production URL
2. Enable HTTPS
3. Configure CORS on API for your domain
4. Upload files to web server
5. Test all functionality

### Recommended Hosting:
- Netlify (free)
- Vercel (free)
- GitHub Pages (free)
- AWS S3 + CloudFront
- Azure Static Web Apps

## 📞 Support

For issues or questions:
- Check API documentation
- Review browser console for errors
- Verify API is running and accessible

## 🎉 Thank You!

Enjoy using HealCheck for your nutritional analysis needs!

---

**Version:** 1.0.0  
**Last Updated:** October 31, 2025
