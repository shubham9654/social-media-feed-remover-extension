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

// Options button handler
document.getElementById('optionsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
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
