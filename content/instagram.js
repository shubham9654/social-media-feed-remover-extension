/**
 * Instagram Feed Replacer
 * Replaces Instagram feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';

// Instagram selectors
const SELECTORS = {
  feed: ['main[role="main"]', 'article', 'section > div > div'],
  explore: ['main[role="main"] article', '[href="/explore/"]', 'section[aria-label*="Explore"]'],
  search: ['main[role="main"] [role="main"]', 'div[role="dialog"]'],
  reels: ['a[href*="/reels/"]', '[aria-label*="Reels"]'],
  stories: ['div[role="button"][aria-label*="Story"]', 'div[role="presentation"]']
};

// Check if we're on explore page
function isExplorePage() {
  const url = location.href.toLowerCase();
  const path = location.pathname.toLowerCase();
  return url.includes('/explore') || path === '/explore' || path === '/explore/';
}

// Check if we're on the homepage
function isHomePage() {
  const url = location.href.toLowerCase();
  const path = location.pathname.toLowerCase();
  // Only affect homepage feed, not search, messages, profiles, etc.
  return path === '/' || path === '/home' || path === '/home/' ||
         (!url.includes('/explore') && !url.includes('/direct') && 
          !url.includes('/messages') && !url.includes('/p/') &&
          !url.includes('/reel/') && !url.includes('/stories/') &&
          !url.includes('/accounts/') && !url.includes('/settings'));
}

async function initInstagramFeedReplacer() {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const instagramSettings = settings.platforms?.instagram || {};
  
  // Hide feed if enabled - replace with quotes (only on homepage)
  if (instagramSettings.hideFeed === true && isHomePage()) {
    if (document.querySelector('.feed-replacer-container')) return;
    await replaceFeed([
      'main[role="main"]',
      'main',
      '[role="main"]',
      'section > main',
      'article',
      'main section',
      'main > div > div > div',
      'div[role="main"]'
    ], {
      checkInterval: 500,
      maxAttempts: 25,
      preserveStructure: false
    });
  }
  
  // Hide explore if enabled (only on explore page)
  if (instagramSettings.hideSearch === true && isExplorePage()) {
    await replaceFeed(SELECTORS.explore, {
      checkInterval: 500,
      maxAttempts: 30,
      preserveStructure: false
    });
  }
  
  // Hide search feed if enabled (for other search pages)
  if (instagramSettings.hideSearch === true && !isExplorePage()) {
    hideElements(SELECTORS.search, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide reels if enabled
  if (instagramSettings.hideReels === true) {
    hideElements(SELECTORS.reels, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide stories if enabled
  if (instagramSettings.hideStories === true) {
    hideElements(SELECTORS.stories, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Handle navigation (pathname + debounce, once only)
  if (!window.__feedReplacerNavInstagram) {
    window.__feedReplacerNavInstagram = true;
    let lastPath = location.pathname;
    let navDebounce = null;
    const onNav = () => {
      const path = location.pathname;
      if (path === lastPath) return;
      lastPath = path;
      if (navDebounce) clearTimeout(navDebounce);
      navDebounce = setTimeout(() => {
        navDebounce = null;
        initInstagramFeedReplacer();
      }, 400);
    };
    window.addEventListener('popstate', onNav);
    const origPushState = history.pushState;
    const origReplaceState = history.replaceState;
    history.pushState = function (...args) {
      origPushState.apply(this, args);
      onNav();
    };
    history.replaceState = function (...args) {
      origReplaceState.apply(this, args);
      onNav();
    };
  }
  
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

