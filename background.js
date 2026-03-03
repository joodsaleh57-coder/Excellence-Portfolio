/**
 * Excellence Portfolio - Background Service Worker
 * Handles authentication, API calls, and background tasks
 */

const API_BASE_URL = 'http://localhost:3000/api'; // Change to your backend URL
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNC: 'last_sync'
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Excellence Portfolio Extension installed');
  // Open side panel on install
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request.action);

  switch (request.action) {
    case 'LOGIN':
      handleLogin(request.email, request.password)
        .then(response => sendResponse({ success: true, data: response }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_AUTH_TOKEN':
      getAuthToken()
        .then(token => sendResponse({ success: true, token }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_USER_DATA':
      getUserData()
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'UPLOAD_EVIDENCE':
      uploadEvidence(request.evidence)
        .then(response => sendResponse({ success: true, data: response }))
        .catch(error => {
          // Queue for offline sync
          queueForSync(request.evidence);
          sendResponse({ success: false, queued: true, error: error.message });
        });
      return true;

    case 'GET_DOMAINS':
      getDomains()
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_INDICATORS':
      getIndicators(request.domainId, request.standardId)
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_EVIDENCE_LIST':
      getEvidenceList(request.filters)
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'EXPORT_PDF':
      exportPDF(request.scope)
        .then(response => sendResponse({ success: true, data: response }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'EXPORT_IMPROVEMENT_PLAN':
      exportImprovementPlan(request.scope)
        .then(response => sendResponse({ success: true, data: response }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'SYNC_QUEUE':
      syncOfflineQueue()
        .then(response => sendResponse({ success: true, data: response }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'LOGOUT':
      logout()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Authentication functions
async function handleLogin(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    const { token, user } = data;

    // Store token and user data
    await chrome.storage.local.set({
      [STORAGE_KEYS.AUTH_TOKEN]: token,
      [STORAGE_KEYS.USER_DATA]: user
    });

    return { token, user };
  } catch (error) {
    throw error;
  }
}

async function getAuthToken() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.AUTH_TOKEN);
  return result[STORAGE_KEYS.AUTH_TOKEN] || null;
}

async function getUserData() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.USER_DATA);
  return result[STORAGE_KEYS.USER_DATA] || null;
}

async function logout() {
  await chrome.storage.local.remove([
    STORAGE_KEYS.AUTH_TOKEN,
    STORAGE_KEYS.USER_DATA
  ]);
}

// API functions
async function apiCall(endpoint, options = {}) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, clear storage
      await logout();
      throw new Error('Unauthorized');
    }
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

async function uploadEvidence(evidence) {
  const formData = new FormData();
  formData.append('indicatorId', evidence.indicatorId);
  formData.append('type', evidence.type);
  formData.append('description', evidence.description || '');
  formData.append('metadata', JSON.stringify(evidence.metadata));

  if (evidence.file) {
    formData.append('file', evidence.file);
  }

  const token = await getAuthToken();
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/evidence`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}

async function getDomains() {
  return apiCall('/domains?include=standards,indicators');
}

async function getIndicators(domainId, standardId) {
  const params = new URLSearchParams();
  if (domainId) params.append('domainId', domainId);
  if (standardId) params.append('standardId', standardId);

  return apiCall(`/indicators?${params.toString()}`);
}

async function getEvidenceList(filters = {}) {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });

  return apiCall(`/evidence?${params.toString()}`);
}

async function exportPDF(scope) {
  return apiCall('/export/pdf', {
    method: 'POST',
    body: JSON.stringify({ scope })
  });
}

async function exportImprovementPlan(scope) {
  return apiCall('/export/improvement-plan-docx', {
    method: 'POST',
    body: JSON.stringify({ scope })
  });
}

// Offline queue management
async function queueForSync(evidence) {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SYNC_QUEUE);
  const queue = result[STORAGE_KEYS.SYNC_QUEUE] || [];

  queue.push({
    id: Date.now(),
    action: 'UPLOAD_EVIDENCE',
    data: evidence,
    timestamp: new Date().toISOString(),
    status: 'pending'
  });

  await chrome.storage.local.set({
    [STORAGE_KEYS.SYNC_QUEUE]: queue
  });
}

async function syncOfflineQueue() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SYNC_QUEUE);
  const queue = result[STORAGE_KEYS.SYNC_QUEUE] || [];

  if (queue.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;
  const updatedQueue = [];

  for (const item of queue) {
    if (item.status === 'pending') {
      try {
        await uploadEvidence(item.data);
        synced++;
      } catch (error) {
        failed++;
        updatedQueue.push(item);
      }
    }
  }

  await chrome.storage.local.set({
    [STORAGE_KEYS.SYNC_QUEUE]: updatedQueue,
    [STORAGE_KEYS.LAST_SYNC]: new Date().toISOString()
  });

  return { synced, failed };
}

// Periodic sync check
chrome.alarms.create('syncQueue', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncQueue') {
    syncOfflineQueue().catch(error => console.error('Sync failed:', error));
  }
});
