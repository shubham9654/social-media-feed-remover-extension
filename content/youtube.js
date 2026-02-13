/**
 * YouTube Feed Replacer
 * Replaces YouTube feeds and allows granular control over different sections
 */

import { hideElements, replaceFeed } from '../utils/feed-replacer.js';

// YouTube selectors for different sections
const SELECTORS = {
  homeFeed: [
    'ytd-rich-grid-renderer',
    '#contents.ytd-rich-grid-renderer',
    'ytd-two-column-browse-results-renderer',
    '#primary #contents'
  ],
  shorts: [
    'ytd-reel-shelf-renderer',
    'ytd-shorts',
    '[is-shorts]',
    'ytd-rich-section-renderer[is-shorts]'
  ],
  sidebar: [
    '#secondary',
    'ytd-watch-next-secondary-results-renderer',
    '#related'
  ],
  comments: [
    '#comments',
    'ytd-comments',
    '#comment-section'
  ],
  explore: [
    'ytd-guide-renderer',
    '#guide',
    'ytd-mini-guide-renderer'
  ],
  trending: [
    'ytd-trending-renderer',
    '[page-subtype="trending"]'
  ],
  endScreen: [
    'ytd-watch-next-secondary-results-renderer',
    '#secondary ytd-compact-video-renderer'
  ]
};

async function initYouTubeFeedReplacer() {
  // Get settings
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const youtubeSettings = settings.platforms?.youtube || {};
  
  // Hide home feed if enabled
  if (youtubeSettings.hideHomeFeed !== false) {
    replaceFeed(SELECTORS.homeFeed, {
      checkInterval: 500,
      maxAttempts: 20,
      preserveStructure: false
    });
  }
  
  // Hide shorts if enabled
  if (youtubeSettings.hideShorts !== false) {
    hideElements(SELECTORS.shorts, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide sidebar recommendations if enabled
  if (youtubeSettings.hideSidebar !== false) {
    hideElements(SELECTORS.sidebar, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide comments if enabled
  if (youtubeSettings.hideComments !== false) {
    hideElements(SELECTORS.comments, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide explore/guide if enabled
  if (youtubeSettings.hideExplore !== false) {
    hideElements(SELECTORS.explore, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide trending if enabled
  if (youtubeSettings.hideTrending !== false) {
    hideElements(SELECTORS.trending, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide end screen recommendations if enabled
  if (youtubeSettings.hideEndScreen !== false) {
    hideElements(SELECTORS.endScreen, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Handle navigation changes (SPA)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(initYouTubeFeedReplacer, 1000);
    }
  });
  
  urlObserver.observe(document, { subtree: true, childList: true });
  
  // Listen for storage changes
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        setTimeout(initYouTubeFeedReplacer, 100);
      }
    });
  }
}

/**
 * Get extension settings
 */
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
  document.addEventListener('DOMContentLoaded', initYouTubeFeedReplacer);
} else {
  initYouTubeFeedReplacer();
}

// Re-initialize on navigation
window.addEventListener('popstate', () => {
  setTimeout(initYouTubeFeedReplacer, 500);
});
