# Excellence Portfolio - Installation & Deployment Guide

## Table of Contents

1. [Development Setup](#development-setup)
2. [Loading in Chrome](#loading-in-chrome)
3. [Configuring Backend](#configuring-backend)
4. [Production Deployment](#production-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Development Setup

### Prerequisites

- **Chrome Browser**: Version 88 or later
- **Node.js**: Version 14 or later (for mock API server)
- **npm**: Version 6 or later

### Step 1: Clone or Download the Project

```bash
# If using Git
git clone https://github.com/your-org/excellence-portfolio-extension.git
cd excellence-portfolio-extension

# Or download and extract the ZIP file
unzip excellence-portfolio-extension.zip
cd excellence-portfolio-extension
```

### Step 2: Install Dependencies (for mock API server)

```bash
npm install
```

This installs:
- `express`: Web framework
- `cors`: Cross-Origin Resource Sharing
- `multer`: File upload handling
- `jsonwebtoken`: JWT authentication

### Step 3: Start the Mock API Server (Optional)

For development and testing without a real backend:

```bash
npm start
```

The server will start on `http://localhost:3000` with test data pre-loaded.

**Test Credentials**:
```
Email: teacher@school.edu.sa
Password: password123
```

---

## Loading in Chrome

### Method 1: Load Unpacked Extension (Development)

1. **Open Chrome Extensions Page**:
   - Type `chrome://extensions/` in the address bar
   - Press Enter

2. **Enable Developer Mode**:
   - Look for the toggle in the top-right corner
   - Click to enable "Developer mode"

3. **Load Unpacked Extension**:
   - Click the "Load unpacked" button
   - Navigate to your project folder
   - Select the `excellence-portfolio-extension` folder
   - Click "Select Folder"

4. **Verify Installation**:
   - The extension should appear in the list
   - You should see it in the Chrome toolbar
   - Click the extension icon to open the popup

### Method 2: Package as CRX (Distribution)

To create a distributable package:

1. Go to `chrome://extensions/`
2. Find the Excellence Portfolio extension
3. Click the menu icon (⋮) next to it
4. Select "Pack extension"
5. Choose the extension folder
6. Click "Pack extension"
7. Chrome will generate a `.crx` file

---

## Configuring Backend

### Step 1: Update API Base URL

Edit `background.js` and change the API base URL:

```javascript
// Line 7 in background.js
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

### Step 2: Configure CORS

Ensure your backend allows requests from Chrome extensions:

```javascript
// Example Express CORS configuration
app.use(cors({
  origin: [
    'chrome-extension://[EXTENSION_ID]',
    'http://localhost:3000' // for development
  ],
  credentials: true
}));
```

To find your extension ID:
1. Go to `chrome://extensions/`
2. Look for "ID" under the extension name
3. Use this ID in your CORS configuration

### Step 3: Implement Required API Endpoints

Your backend must implement all endpoints listed in `API_DOCUMENTATION.md`:

- Authentication: `/auth/login`, `/me`
- Domains: `/domains`, `/indicators`
- Evidence: `/evidence` (POST, GET, PATCH)
- Tasks: `/tasks` (POST, GET)
- Exports: `/export/pdf`, `/export/improvement-plan-docx`, `/export/{jobId}`

### Step 4: Test Connection

1. Update the API URL in `background.js`
2. Reload the extension in Chrome
3. Try logging in with test credentials
4. Check browser console (F12) for any errors

---

## Production Deployment

### Step 1: Security Checklist

- [ ] Change JWT secret in backend
- [ ] Enable HTTPS for all API endpoints
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable CORS only for your domain
- [ ] Use environment variables for sensitive data
- [ ] Implement proper error handling
- [ ] Add logging and monitoring
- [ ] Set up database backups
- [ ] Implement data encryption

### Step 2: Update Configuration

Create a `.env` file for production:

```env
API_BASE_URL=https://your-production-domain.com/api
JWT_SECRET=your-very-secure-secret-key-here
NODE_ENV=production
LOG_LEVEL=info
```

### Step 3: Prepare for Chrome Web Store

To publish on Chrome Web Store:

1. **Create Developer Account**:
   - Go to https://chrome.google.com/webstore/devconsole
   - Sign in with your Google account
   - Pay the one-time registration fee ($5)

2. **Prepare Assets**:
   - Create a 128x128 icon (PNG)
   - Create a 1280x800 screenshot
   - Create a 440x280 promotional image
   - Write description and privacy policy

3. **Create Store Listing**:
   - Go to Developer Dashboard
   - Click "New Item"
   - Upload the `.crx` file or folder
   - Fill in all required fields
   - Add screenshots and promotional images

4. **Privacy Policy**:
   - Create a privacy policy explaining data collection
   - Include it in your submission

5. **Submit for Review**:
   - Review all information
   - Click "Submit for review"
   - Wait for Google's review (usually 1-3 days)

### Step 4: Version Management

Update `manifest.json` for each release:

```json
{
  "version": "1.0.1"
}
```

Follow semantic versioning:
- **Major**: Breaking changes (1.0.0 → 2.0.0)
- **Minor**: New features (1.0.0 → 1.1.0)
- **Patch**: Bug fixes (1.0.0 → 1.0.1)

---

## Troubleshooting

### Issue: Extension doesn't appear in toolbar

**Solution**:
1. Go to `chrome://extensions/`
2. Verify the extension is enabled (toggle should be ON)
3. Try reloading the extension:
   - Click the refresh icon under the extension
4. Restart Chrome

### Issue: "Cannot load extension" error

**Solution**:
1. Check that `manifest.json` is valid JSON
2. Verify all referenced files exist
3. Check file permissions
4. Try loading from a different folder
5. Check browser console for specific errors

### Issue: Login fails

**Solution**:
1. Verify API server is running: `http://localhost:3000/health`
2. Check API URL in `background.js`
3. Verify test credentials are correct
4. Check browser console (F12) for error messages
5. Verify CORS is enabled on backend

### Issue: Floating button doesn't appear

**Solution**:
1. Verify you're on madrasati.edu.sa or noor.moe.gov.sa
2. Reload the page
3. Check content script is loaded:
   - Open DevTools (F12)
   - Go to Sources tab
   - Look for content-script.js
4. Check for JavaScript errors in console

### Issue: Evidence upload fails

**Solution**:
1. Check file size (max 50MB)
2. Verify file format is supported
3. Check internet connection
4. Try uploading a smaller file
5. Check backend logs for errors

### Issue: Export takes too long

**Solution**:
1. Try exporting a smaller scope (single indicator)
2. Check backend performance
3. Verify database queries are optimized
4. Check network speed
5. Increase timeout values if needed

### Issue: Extension runs slowly

**Solution**:
1. Check browser memory usage (Shift+Esc)
2. Disable other extensions temporarily
3. Clear browser cache
4. Check for memory leaks in DevTools
5. Reduce number of loaded indicators

### Issue: CORS errors

**Solution**:
1. Verify backend CORS headers are set correctly
2. Check extension ID in CORS configuration
3. Verify API URL matches exactly
4. Check for typos in domain name
5. Restart backend server

### Issue: Token expires too quickly

**Solution**:
1. Increase JWT expiration time in backend
2. Implement token refresh mechanism
3. Check system time on server and client
4. Verify JWT secret is consistent

---

## Development Tips

### Enable Debug Mode

Add this to `background.js` for verbose logging:

```javascript
const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log('[Excellence Portfolio]', ...args);
  }
}
```

### Monitor Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions in extension
4. View all API requests and responses

### Check Storage

View local storage data:

1. Open DevTools (F12)
2. Go to Application tab
3. Expand "Extensions" in left sidebar
4. Click your extension ID
5. View "Local Storage" and "Session Storage"

### Test Offline Mode

1. Open DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline"
4. Perform actions (they should queue)
5. Set back to "Online"
6. Click "Sync" to upload queued items

---

## Performance Optimization

### Reduce Bundle Size

- Minimize CSS and JavaScript
- Remove unused dependencies
- Use tree-shaking for imports

### Optimize Images

- Use WebP format where possible
- Compress PNG/JPG files
- Use appropriate sizes

### Implement Caching

- Cache domain/indicator data locally
- Implement service worker caching
- Use IndexedDB for large datasets

### Lazy Load Features

- Load tab content only when needed
- Defer non-critical operations
- Use pagination for large lists

---

## Monitoring & Analytics

### Log Important Events

```javascript
function logEvent(eventName, data) {
  chrome.runtime.sendMessage({
    action: 'LOG_EVENT',
    event: eventName,
    data: data,
    timestamp: new Date().toISOString()
  });
}
```

### Track Errors

```javascript
window.addEventListener('error', (event) => {
  logEvent('ERROR', {
    message: event.message,
    source: event.filename,
    line: event.lineno
  });
});
```

### Monitor API Performance

```javascript
async function apiCall(endpoint, options = {}) {
  const startTime = performance.now();
  const response = await fetch(endpoint, options);
  const duration = performance.now() - startTime;
  
  logEvent('API_CALL', {
    endpoint,
    duration,
    status: response.status
  });
  
  return response;
}
```

---

## Support & Documentation

- **README.md**: General overview and usage guide
- **API_DOCUMENTATION.md**: Complete API reference
- **TESTING.md**: Test cases and acceptance criteria
- **INSTALLATION.md**: This file

For issues or questions:
1. Check the troubleshooting section above
2. Review the relevant documentation
3. Check browser console for error messages
4. Contact support team

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial release |
| 1.0.1 | TBD | Bug fixes |
| 1.1.0 | TBD | New features |

---

## License

© 2024 Excellence Portfolio Team. All rights reserved.

