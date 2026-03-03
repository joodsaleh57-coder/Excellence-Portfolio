/**
 * Excellence Portfolio - Content Script
 * Injects floating button and collects page metadata
 */

// Only inject on supported platforms
const supportedDomains = ['madrasati.edu.sa', 'noor.moe.gov.sa'];
const currentDomain = window.location.hostname;

if (!supportedDomains.some(domain => currentDomain.includes(domain))) {
  console.log('Excellence Portfolio: Not on supported platform');
} else {
  console.log('Excellence Portfolio: Injecting floating button');
  injectFloatingButton();
}

function injectFloatingButton() {
  // Create floating button container
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'excellence-portfolio-floating-btn';
  buttonContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    direction: rtl;
  `;

  // Create button element
  const button = document.createElement('button');
  button.id = 'excellence-portfolio-btn';
  button.textContent = '+ إضافة شاهد';
  button.style.cssText = `
    padding: 12px 20px;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `;

  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = '#1d4ed8';
    button.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)';
  });

  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = '#2563eb';
    button.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
  });

  button.addEventListener('click', () => {
    openQuickCapture();
  });

  buttonContainer.appendChild(button);
  document.body.appendChild(buttonContainer);
}

function openQuickCapture() {
  // Send message to background script to open side panel
  chrome.runtime.sendMessage({
    action: 'OPEN_SIDE_PANEL',
    metadata: {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      platform: getPlatformName()
    }
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error opening side panel:', chrome.runtime.lastError);
    }
  });
}

function getPlatformName() {
  const hostname = window.location.hostname;
  if (hostname.includes('madrasati')) return 'Madrasati';
  if (hostname.includes('noor')) return 'Noor';
  return 'Unknown';
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CAPTURE_SCREENSHOT') {
    captureScreenshot().then(screenshot => {
      sendResponse({ success: true, screenshot });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

async function captureScreenshot() {
  try {
    const canvas = await html2canvas(document.body);
    return canvas.toDataURL('image/png');
  } catch (error) {
    // Fallback: use chrome.tabs.captureVisibleTab
    return new Promise((resolve, reject) => {
      chrome.tabs.captureVisibleTab((screenshot) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(screenshot);
        }
      });
    });
  }
}

// Inject html2canvas library for better screenshot support
function injectHtml2Canvas() {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  document.head.appendChild(script);
}

injectHtml2Canvas();

// Monitor online/offline status
window.addEventListener('online', () => {
  chrome.runtime.sendMessage({ action: 'SYNC_QUEUE' });
});
