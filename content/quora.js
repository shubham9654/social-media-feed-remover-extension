/**
 * Quora Feed Replacer
 * Replaces Quora feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';

const SELECTORS = {
  feed: [
    '.q-box.qu-borderAll.qu-borderRadius--small.qu-bg--white',
    '[data-testid="feed"]',
    '.q-box[data-testid="feed"]',
    '.ContentWrapper',
    '.q-box.qu-px--medium'
  ],
  sidebar: [
    '.q-box.qu-borderAll.qu-borderRadius--small.qu-bg--white',
    '[data-testid="sidebar"]',
    '.q-box.qu-px--medium.qu-py--small'
  ],
  suggestions: [
    '[data-testid="suggested-follows"]',
    '.q-box.qu-borderAll.qu-borderRadius--small'
  ]
};

// Check if we're on the homepage
function isHomePage() {
  const url = location.href.toLowerCase();
  const path = location.pathname.toLowerCase();
  // Only affect homepage feed, not search, questions, profiles, etc.
  return path === '/' || path === '/home' || path === '/home/' ||
         (!url.includes('/search') && !url.includes('/question') && 
          !url.includes('/profile') && !url.includes('/topic') &&
          !url.includes('/answer') && !url.includes('/spaces') &&
          !url.includes('/settings'));
}

async function initQuoraFeedReplacer() {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const quoraSettings = settings.platforms?.quora || {};
  
  // Hide feed if enabled - replace with quotes (only on homepage)
  if (quoraSettings.hideFeed === true && isHomePage()) {
    if (!document.querySelector('.feed-replacer-container')) {
      await replaceFeed([
        '[data-testid="feed"]',
        '.q-box.qu-borderAll.qu-borderRadius--small.qu-bg--white',
        '.ContentWrapper',
        'main .q-box',
        '.q-box[data-testid="feed"]'
      ], {
        checkInterval: 500,
        maxAttempts: 30,
        preserveStructure: false
      });
    }
  }
  
  // Hide sidebar if enabled
  if (quoraSettings.hideSidebar === true) {
    hideElements(SELECTORS.sidebar, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide suggestions if enabled
  if (quoraSettings.hideSuggestions === true) {
    hideElements(SELECTORS.suggestions, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Handle navigation (pathname + debounce, once only — no document MutationObserver)
  if (!window.__feedReplacerNavQuora) {
    window.__feedReplacerNavQuora = true;
    let lastPath = location.pathname;
    let navDebounce = null;
    const onNav = () => {
      const path = location.pathname;
      if (path === lastPath) return;
      lastPath = path;
      if (navDebounce) clearTimeout(navDebounce);
      navDebounce = setTimeout(() => {
        navDebounce = null;
        initQuoraFeedReplacer();
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
        setTimeout(initQuoraFeedReplacer, 100);
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
  document.addEventListener('DOMContentLoaded', initQuoraFeedReplacer);
} else {
  initQuoraFeedReplacer();
}

