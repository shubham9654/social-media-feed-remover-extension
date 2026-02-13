/**
 * Background Service Worker
 * Handles extension lifecycle and storage
 */

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Social Media Feed Remover installed');
    
    // Set default settings
    chrome.storage.local.set({
      enabled: true,
      lastQuoteIndex: 0
    });
  } else if (details.reason === 'update') {
    console.log('Social Media Feed Remover updated');
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getQuote') {
    // Content scripts can request quotes if needed
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

// Listen for tab updates to re-inject if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Content scripts handle their own initialization
    // This is just for logging/debugging if needed
  }
});
