/**
 * LinkedIn Feed Replacer
 * Replaces LinkedIn feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';

const SELECTORS = {
  feed: ['main[role="main"] .scaffold-finite-scroll__content', '.feed-container'],
  suggestions: ['[aria-label*="People you may know"]', '[data-testid="people-you-may-know"]']
};

async function initLinkedInFeedReplacer() {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const linkedinSettings = settings.platforms?.linkedin || {};
  
  // Hide feed if enabled
  if (linkedinSettings.hideFeed !== false) {
    await replaceFeed('main[role="main"] .scaffold-finite-scroll__content', {
      checkInterval: 500,
      maxAttempts: 20,
      preserveStructure: false
    });
  }
  
  // Hide suggestions if enabled
  if (linkedinSettings.hideSuggestions !== false) {
    hideElements(SELECTORS.suggestions, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Handle navigation changes (SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(initLinkedInFeedReplacer, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Listen for storage changes
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        setTimeout(initLinkedInFeedReplacer, 100);
      }
    });
  }
}

function getSettings() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['enabled', 'platforms'], (result) => {
        resolve({
          enabled: result.enabled !== false,
          platforms: result.platforms || {}
        });
      });
    } else {
      resolve({ enabled: true, platforms: {} });
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLinkedInFeedReplacer);
} else {
  initLinkedInFeedReplacer();
}

// Re-initialize on navigation
window.addEventListener('popstate', () => {
  setTimeout(initLinkedInFeedReplacer, 500);
});
