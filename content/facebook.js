/**
 * Facebook Feed Replacer
 * Replaces Facebook news feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';

const SELECTORS = {
  feed: ['[role="feed"]', '[role="main"]', 'div[data-pagelet="FeedUnit"]'],
  stories: ['[aria-label*="Story"]', '[role="article"][aria-label*="story"]']
};

async function initFacebookFeedReplacer() {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const facebookSettings = settings.platforms?.facebook || {};
  
  // Hide feed if enabled
  if (facebookSettings.hideFeed !== false) {
    await replaceFeed('[role="main"]', {
      checkInterval: 500,
      maxAttempts: 20,
      preserveStructure: false
    });
  }
  
  // Hide stories if enabled
  if (facebookSettings.hideStories !== false) {
    hideElements(SELECTORS.stories, {
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
      setTimeout(initFacebookFeedReplacer, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Listen for storage changes
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        setTimeout(initFacebookFeedReplacer, 100);
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
  document.addEventListener('DOMContentLoaded', initFacebookFeedReplacer);
} else {
  initFacebookFeedReplacer();
}

// Re-initialize on navigation (Facebook is a SPA)
window.addEventListener('popstate', () => {
  setTimeout(initFacebookFeedReplacer, 500);
});
