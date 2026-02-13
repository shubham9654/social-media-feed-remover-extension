/**
 * Reddit Feed Replacer
 * Replaces Reddit feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';

const SELECTORS = {
  feed: ['shreddit-feed', '[data-testid="subreddit-posts"]'],
  sidebar: ['[data-testid="subreddit-sidebar"]', '#sidebar']
};

async function initRedditFeedReplacer() {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const redditSettings = settings.platforms?.reddit || {};
  
  // Hide feed if enabled
  if (redditSettings.hideFeed !== false) {
    await replaceFeed('shreddit-feed, [data-testid="subreddit-posts"]', {
      checkInterval: 500,
      maxAttempts: 20,
      preserveStructure: false
    });
  }
  
  // Hide sidebar if enabled
  if (redditSettings.hideSidebar !== false) {
    hideElements(SELECTORS.sidebar, {
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
      setTimeout(initRedditFeedReplacer, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Listen for storage changes
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        setTimeout(initRedditFeedReplacer, 100);
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
  document.addEventListener('DOMContentLoaded', initRedditFeedReplacer);
} else {
  initRedditFeedReplacer();
}

// Re-initialize on navigation
window.addEventListener('popstate', () => {
  setTimeout(initRedditFeedReplacer, 500);
});
