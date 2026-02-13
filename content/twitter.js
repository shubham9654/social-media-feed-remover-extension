/**
 * Twitter/X Feed Replacer
 * Replaces Twitter/X timeline with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';

const SELECTORS = {
  feed: ['[data-testid="primaryColumn"]', '[data-testid="homeTimeline"]'],
  trends: ['[data-testid="sidebarColumn"]', '[aria-label*="Trending"]'],
  suggestions: ['[data-testid="sidebarColumn"] [aria-label*="Who to follow"]']
};

async function initTwitterFeedReplacer() {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const twitterSettings = settings.platforms?.twitter || {};
  
  // Hide feed if enabled
  if (twitterSettings.hideFeed !== false) {
    await replaceFeed('[data-testid="primaryColumn"]', {
      checkInterval: 500,
      maxAttempts: 20,
      preserveStructure: false
    });
  }
  
  // Hide trends if enabled
  if (twitterSettings.hideTrends !== false) {
    hideElements(SELECTORS.trends, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide suggestions if enabled
  if (twitterSettings.hideSuggestions !== false) {
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
      setTimeout(initTwitterFeedReplacer, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Listen for storage changes
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        setTimeout(initTwitterFeedReplacer, 100);
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
  document.addEventListener('DOMContentLoaded', initTwitterFeedReplacer);
} else {
  initTwitterFeedReplacer();
}

// Re-initialize on navigation
window.addEventListener('popstate', () => {
  setTimeout(initTwitterFeedReplacer, 500);
});
