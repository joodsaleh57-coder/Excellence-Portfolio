/**
 * Excellence Portfolio - Side Panel Script
 * Main UI logic for the extension
 */

// State management
const state = {
  currentTab: 'dashboard',
  domains: [],
  standards: [],
  indicators: [],
  evidence: [],
  tasks: [],
  selectedDomain: null,
  selectedStandard: null,
  selectedIndicator: null,
  selectedEvidenceType: 'screenshot',
  screenshot: null
};

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const captureForm = document.getElementById('capture-form');
const typeButtons = document.querySelectorAll('.type-btn');
const linkTaskCheckbox = document.getElementById('link-task');
const taskSelectGroup = document.getElementById('task-select-group');
const domainSelect = document.getElementById('domain-select');
const standardSelect = document.getElementById('standard-select');
const indicatorSelect = document.getElementById('indicator-select');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const exportDocxBtn = document.getElementById('export-docx-btn');
const captureBtn = document.getElementById('capture-btn');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setupTabNavigation();
  setupEventListeners();
  await loadInitialData();
  updateDashboard();
});

// Tab Navigation
function setupTabNavigation() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  // Update active button
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update active pane
  tabPanes.forEach(pane => {
    pane.classList.toggle('active', pane.id === tabName);
  });

  state.currentTab = tabName;

  // Load data for specific tabs
  if (tabName === 'indicators') {
    loadIndicators();
  } else if (tabName === 'tasks') {
    loadTasks();
  } else if (tabName === 'evidence') {
    loadEvidence();
  }
}

// Event Listeners
function setupEventListeners() {
  // Evidence type selection
  typeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectEvidenceType(btn.dataset.type);
    });
  });

  // Form submission
  captureForm.addEventListener('submit', handleCaptureSubmit);

  // Task linking
  linkTaskCheckbox.addEventListener('change', () => {
    taskSelectGroup.style.display = linkTaskCheckbox.checked ? 'block' : 'none';
  });

  // Domain selection
  domainSelect.addEventListener('change', async () => {
    state.selectedDomain = domainSelect.value;
    await loadStandards(state.selectedDomain);
  });

  // Standard selection
  standardSelect.addEventListener('change', async () => {
    state.selectedStandard = standardSelect.value;
    await loadIndicators(state.selectedDomain, state.selectedStandard);
  });

  // Indicator selection
  indicatorSelect.addEventListener('change', () => {
    state.selectedIndicator = indicatorSelect.value;
  });

  // Screenshot capture
  captureBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await captureScreenshot();
  });

  // Export buttons
  exportPdfBtn.addEventListener('click', async () => {
    await exportPDF();
  });

  exportDocxBtn.addEventListener('click', async () => {
    await exportImprovementPlan();
  });
}

// Evidence Type Selection
function selectEvidenceType(type) {
  state.selectedEvidenceType = type;

  // Update button states
  typeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  // Show/hide relevant fields
  document.querySelectorAll('.type-field-group').forEach(group => {
    group.classList.remove('active');
  });

  const fieldGroup = document.getElementById(`${type}-fields`);
  if (fieldGroup) {
    fieldGroup.classList.add('active');
  }
}

// Screenshot Capture
async function captureScreenshot() {
  try {
    captureBtn.disabled = true;
    captureBtn.textContent = 'جاري التقاط الشاشة...';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png'
    });

    state.screenshot = screenshot;
    
    // Display preview
    const preview = document.getElementById('screenshot-preview');
    preview.innerHTML = `<img src="${screenshot}" alt="preview" style="max-width: 100%; max-height: 200px;">`;

    captureBtn.textContent = 'التقط الشاشة';
    captureBtn.disabled = false;
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    captureBtn.textContent = 'فشل التقاط الشاشة';
    captureBtn.disabled = false;
  }
}

// Form Submission
async function handleCaptureSubmit(e) {
  e.preventDefault();

  try {
    const evidence = {
      type: state.selectedEvidenceType,
      description: document.getElementById('description').value,
      indicatorId: indicatorSelect.value,
      category: document.getElementById('evidence-category').value,
      metadata: {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        platform: 'Extension'
      }
    };

    // Add type-specific data
    if (state.selectedEvidenceType === 'screenshot' && state.screenshot) {
      evidence.file = dataURLtoBlob(state.screenshot);
      evidence.fileName = `screenshot-${Date.now()}.png`;
    } else if (state.selectedEvidenceType === 'file') {
      const fileInput = document.getElementById('file-input');
      if (fileInput.files.length > 0) {
        evidence.file = fileInput.files[0];
      }
    } else if (state.selectedEvidenceType === 'link') {
      evidence.link = document.getElementById('link-input').value;
    } else if (state.selectedEvidenceType === 'note') {
      evidence.note = document.getElementById('note-input').value;
    }

    // Add task association if selected
    if (linkTaskCheckbox.checked) {
      evidence.taskId = document.getElementById('task-select').value;
    }

    // Send to background script
    const response = await sendMessage({
      action: 'UPLOAD_EVIDENCE',
      evidence
    });

    if (response.success) {
      showMessage('تم حفظ الشاهد بنجاح', 'success');
      captureForm.reset();
      state.screenshot = null;
      document.getElementById('screenshot-preview').innerHTML = '';
    } else {
      if (response.queued) {
        showMessage('تم حفظ الشاهد محلياً وسيتم مزامنته عند توفر الإنترنت', 'info');
      } else {
        showMessage('فشل حفظ الشاهد', 'error');
      }
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    showMessage('حدث خطأ: ' + error.message, 'error');
  }
}

// Data Loading Functions
async function loadInitialData() {
  try {
    const response = await sendMessage({ action: 'GET_DOMAINS' });
    
    if (response.success) {
      state.domains = response.data;
      populateDomainSelects();
    }
  } catch (error) {
    console.error('Failed to load domains:', error);
  }
}

async function loadStandards(domainId) {
  try {
    const response = await sendMessage({
      action: 'GET_INDICATORS',
      domainId
    });

    if (response.success) {
      // Extract standards from indicators
      const standards = [...new Set(response.data.map(i => i.standard))];
      state.standards = standards;
      populateStandardSelect();
    }
  } catch (error) {
    console.error('Failed to load standards:', error);
  }
}

async function loadIndicators(domainId, standardId) {
  try {
    const response = await sendMessage({
      action: 'GET_INDICATORS',
      domainId,
      standardId
    });

    if (response.success) {
      state.indicators = response.data;
      populateIndicatorSelect();
    }
  } catch (error) {
    console.error('Failed to load indicators:', error);
  }
}

async function loadEvidence() {
  try {
    const response = await sendMessage({
      action: 'GET_EVIDENCE_LIST',
      filters: {}
    });

    if (response.success) {
      state.evidence = response.data;
      renderEvidenceList();
    }
  } catch (error) {
    console.error('Failed to load evidence:', error);
  }
}

async function loadTasks() {
  try {
    const response = await sendMessage({ action: 'GET_TASKS' });

    if (response.success) {
      state.tasks = response.data;
      renderTasksList();
    }
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
}

// Populate Selects
function populateDomainSelects() {
  domainSelect.innerHTML = '<option value="">اختر المجال...</option>';
  
  state.domains.forEach(domain => {
    const option = document.createElement('option');
    option.value = domain.id;
    option.textContent = domain.name;
    domainSelect.appendChild(option);
  });
}

function populateStandardSelect() {
  standardSelect.innerHTML = '<option value="">اختر المعيار...</option>';
  
  state.standards.forEach(standard => {
    const option = document.createElement('option');
    option.value = standard.id;
    option.textContent = standard.name;
    standardSelect.appendChild(option);
  });
}

function populateIndicatorSelect() {
  indicatorSelect.innerHTML = '<option value="">اختر المؤشر...</option>';
  
  state.indicators.forEach(indicator => {
    const option = document.createElement('option');
    option.value = indicator.id;
    option.textContent = indicator.name;
    indicatorSelect.appendChild(option);
  });
}

// Render Lists
function renderEvidenceList() {
  const container = document.getElementById('evidence-list');
  
  if (state.evidence.length === 0) {
    container.innerHTML = '<p class="empty-state">لا توجد شواهد</p>';
    return;
  }

  container.innerHTML = state.evidence.map(item => `
    <div class="evidence-item">
      <div class="evidence-header">
        <h4>${item.description || 'شاهد بدون وصف'}</h4>
        <span class="status-badge status-${item.status}">${getStatusLabel(item.status)}</span>
      </div>
      <div class="evidence-meta">
        <span>${item.type}</span>
        <span>${new Date(item.createdAt).toLocaleDateString('ar-SA')}</span>
      </div>
    </div>
  `).join('');
}

function renderTasksList() {
  const container = document.getElementById('tasks-list');
  
  if (state.tasks.length === 0) {
    container.innerHTML = '<p class="empty-state">لا توجد مهام</p>';
    return;
  }

  container.innerHTML = state.tasks.map(task => `
    <div class="task-item">
      <div class="task-header">
        <h4>${task.title}</h4>
        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
      </div>
      <div class="task-meta">
        <span>الموعد: ${new Date(task.dueDate).toLocaleDateString('ar-SA')}</span>
        <span>الحالة: ${task.status}</span>
      </div>
    </div>
  `).join('');
}

// Dashboard Update
async function updateDashboard() {
  try {
    const response = await sendMessage({
      action: 'GET_EVIDENCE_LIST',
      filters: { weekOnly: true }
    });

    if (response.success) {
      const evidence = response.data || [];
      document.getElementById('stat-weekly').textContent = evidence.length;
      
      const pending = evidence.filter(e => e.status === 'submitted').length;
      document.getElementById('stat-pending').textContent = pending;
    }
  } catch (error) {
    console.error('Failed to update dashboard:', error);
  }
}

// Export Functions
async function exportPDF() {
  try {
    exportPdfBtn.disabled = true;
    exportPdfBtn.textContent = 'جاري التصدير...';

    const scope = document.querySelector('input[name="pdf-scope"]:checked').value;

    const response = await sendMessage({
      action: 'EXPORT_PDF',
      scope
    });

    if (response.success) {
      showMessage('تم تصدير PDF بنجاح', 'success');
      // Trigger download
      downloadFile(response.data.url, `report-${Date.now()}.pdf`);
    } else {
      showMessage('فشل التصدير', 'error');
    }
  } catch (error) {
    console.error('Export error:', error);
    showMessage('حدث خطأ: ' + error.message, 'error');
  } finally {
    exportPdfBtn.disabled = false;
    exportPdfBtn.textContent = 'تصدير PDF';
  }
}

async function exportImprovementPlan() {
  try {
    exportDocxBtn.disabled = true;
    exportDocxBtn.textContent = 'جاري التصدير...';

    const scope = document.getElementById('improvement-plan-scope').value;

    const response = await sendMessage({
      action: 'EXPORT_IMPROVEMENT_PLAN',
      scope
    });

    if (response.success) {
      showMessage('تم تصدير خطة التحسين بنجاح', 'success');
      downloadFile(response.data.url, `improvement-plan-${Date.now()}.docx`);
    } else {
      showMessage('فشل التصدير', 'error');
    }
  } catch (error) {
    console.error('Export error:', error);
    showMessage('حدث خطأ: ' + error.message, 'error');
  } finally {
    exportDocxBtn.disabled = false;
    exportDocxBtn.textContent = 'تصدير DOCX';
  }
}

// Helper Functions
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

function showMessage(text, type = 'info') {
  const messageEl = document.getElementById('capture-message');
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
  messageEl.style.display = 'block';

  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 3000);
}

function getStatusLabel(status) {
  const labels = {
    draft: 'مسودة',
    submitted: 'مرسل',
    reviewed: 'مراجع',
    approved: 'موافق عليه'
  };
  return labels[status] || status;
}

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
