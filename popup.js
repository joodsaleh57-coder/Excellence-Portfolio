/**
 * Excellence Portfolio - Popup Script
 */

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const openPanelBtn = document.getElementById('open-panel-btn');
const syncBtn = document.getElementById('sync-btn');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  const token = await getAuthToken();
  
  if (token) {
    showDashboard();
    loadDashboardStats();
  } else {
    showLogin();
  }
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    loginError.style.display = 'none';
    const response = await sendMessage({
      action: 'LOGIN',
      email,
      password
    });
    
    if (response.success) {
      showDashboard();
      loadDashboardStats();
      loginForm.reset();
    } else {
      showError('فشل تسجيل الدخول. تحقق من بيانات الدخول.');
    }
  } catch (error) {
    showError('حدث خطأ: ' + error.message);
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  try {
    await sendMessage({ action: 'LOGOUT' });
    showLogin();
  } catch (error) {
    console.error('Logout error:', error);
  }
});

// Open side panel
openPanelBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'OPEN_SIDE_PANEL' });
});

// Sync offline queue
syncBtn.addEventListener('click', async () => {
  try {
    syncBtn.disabled = true;
    const syncStatus = document.getElementById('sync-status');
    syncStatus.style.display = 'block';
    syncStatus.textContent = 'جاري المزامنة...';
    
    const response = await sendMessage({ action: 'SYNC_QUEUE' });
    
    if (response.success) {
      syncStatus.textContent = `تمت مزامنة ${response.data.synced} عنصر`;
      if (response.data.failed > 0) {
        syncStatus.textContent += ` (${response.data.failed} فشل)`;
      }
    } else {
      syncStatus.textContent = 'فشلت المزامنة';
    }
    
    setTimeout(() => {
      syncStatus.style.display = 'none';
      syncBtn.disabled = false;
    }, 3000);
  } catch (error) {
    console.error('Sync error:', error);
  }
});

// Helper functions
function showLogin() {
  loginScreen.classList.add('active');
  dashboardScreen.classList.remove('active');
}

function showDashboard() {
  loginScreen.classList.remove('active');
  dashboardScreen.classList.add('active');
}

function showError(message) {
  loginError.textContent = message;
  loginError.style.display = 'block';
}

async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'GET_AUTH_TOKEN' }, (response) => {
      resolve(response.token || null);
    });
  });
}

async function loadDashboardStats() {
  try {
    const response = await sendMessage({
      action: 'GET_EVIDENCE_LIST',
      filters: {
        weekOnly: true
      }
    });
    
    if (response.success) {
      const evidence = response.data || [];
      
      // Count weekly evidence
      document.getElementById('weekly-evidence').textContent = evidence.length;
      
      // Count pending evidence
      const pending = evidence.filter(e => e.status === 'submitted').length;
      document.getElementById('pending-evidence').textContent = pending;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}
