/**
 * Instagram Feed Replacer
 * Replaces Instagram feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';

// Instagram selectors
const SELECTORS = {
  feed: ['main[role="main"]', 'article', 'section > div > div'],
  search: ['main[role="main"] [role="main"]', 'div[role="dialog"]'],
  reels: ['a[href*="/reels/"]', '[aria-label*="Reels"]'],
  stories: ['div[role="button"][aria-label*="Story"]', 'div[role="presentation"]']
};

async function initInstagramFeedReplacer() {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const instagramSettings = settings.platforms?.instagram || {};
  
  // Hide feed if enabled
  if (instagramSettings.hideFeed !== false) {
    await replaceFeed('main[role="main"]', {
      checkInterval: 500,
      maxAttempts: 20,
      preserveStructure: false
    });
  }
  
  // Hide search feed if enabled
  if (instagramSettings.hideSearch !== false) {
    hideElements(SELECTORS.search, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide reels if enabled
  if (instagramSettings.hideReels !== false) {
    hideElements(SELECTORS.reels, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide stories if enabled
  if (instagramSettings.hideStories !== false) {
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
      setTimeout(initInstagramFeedReplacer, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Listen for storage changes
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        setTimeout(initInstagramFeedReplacer, 100);
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
  document.addEventListener('DOMContentLoaded', initInstagramFeedReplacer);
} else {
  initInstagramFeedReplacer();
}

// Re-initialize on navigation
window.addEventListener('popstate', () => {
  setTimeout(initInstagramFeedReplacer, 500);
});
