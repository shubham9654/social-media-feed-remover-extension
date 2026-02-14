/**
 * Popup Script
 * Handles popup UI interactions with auto-save
 */

let isEnabled = true;

// Load current status
chrome.storage.local.get(['enabled'], (result) => {
  isEnabled = result.enabled !== false; // Default to true
  updateUI();
});

// Toggle switch handler with auto-save
const toggleInput = document.getElementById('toggleInput');
toggleInput.addEventListener('change', () => {
  isEnabled = toggleInput.checked;
  
  // Auto-save immediately
  chrome.storage.local.set({ enabled: isEnabled }, () => {
    updateUI();
    
    // Reload current tab to apply changes
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
      }
    });
  });
});

// Settings button handler
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Snooze handlers
function formatCountdown(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function updateSnoozeUI(snoozeUntil) {
  const snoozeStatus = document.getElementById('snoozeStatus');
  const snoozeStatusText = document.getElementById('snoozeStatusText');
  const snoozeButtons = document.querySelectorAll('.snooze-btn');
  const isSnoozed = snoozeUntil && snoozeUntil > Date.now();

  snoozeButtons.forEach(b => b.classList.remove('active'));

  if (isSnoozed) {
    snoozeStatus.classList.remove('hidden');
    snoozeStatusText.textContent = `Resumes in ${formatCountdown(snoozeUntil - Date.now())}`;
    const remaining = Math.ceil((snoozeUntil - Date.now()) / 60000);
    const presets = Array.from(snoozeButtons).map(b => parseInt(b.getAttribute('data-minutes')));
    const closest = presets.reduce((a, b) =>
      Math.abs(b - remaining) < Math.abs(a - remaining) ? b : a
    );
    snoozeButtons.forEach(btn => {
      if (parseInt(btn.getAttribute('data-minutes')) === closest) btn.classList.add('active');
    });
  } else {
    snoozeStatus.classList.add('hidden');
  }
}

document.querySelectorAll('.snooze-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const minutes = parseInt(btn.getAttribute('data-minutes'));
    const snoozeUntil = Date.now() + (minutes * 60 * 1000);
    chrome.storage.local.set({ snoozeUntil }, () => {
      updateSnoozeUI(snoozeUntil);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.tabs.reload(tabs[0].id);
      });
    });
  });
});

document.getElementById('cancelSnoozeBtn').addEventListener('click', () => {
  chrome.storage.local.set({ snoozeUntil: null }, () => {
    updateSnoozeUI(null);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.reload(tabs[0].id);
    });
  });
});

chrome.storage.local.get(['snoozeUntil'], (result) => {
  updateSnoozeUI(result.snoozeUntil);
});

function updateUI() {
  const toggleLabel = document.getElementById('toggleLabel');
  toggleInput.checked = isEnabled;
  
  if (isEnabled) {
    toggleLabel.textContent = 'Extension Enabled';
  } else {
    toggleLabel.textContent = 'Extension Disabled';
  }
}
