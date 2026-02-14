/**
 * LinkedIn Feed Replacer
 * Replaces LinkedIn feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener } from '../utils/chrome-helpers.js';

const SELECTORS = {
  feed: ['main[role="main"] .scaffold-finite-scroll__content', '.feed-container'],
  suggestions: ['[aria-label*="People you may know"]', '[data-testid="people-you-may-know"]']
};

// Check if we're on the homepage
function isHomePage() {
  const url = location.href.toLowerCase();
  const path = location.pathname.toLowerCase();
  // Only affect homepage feed, not search, messages, profiles, etc.
  return path === '/' || path === '/feed' || path === '/feed/' ||
         (!url.includes('/search') && !url.includes('/messaging') && 
          !url.includes('/in/') && !url.includes('/company/') &&
          !url.includes('/jobs') && !url.includes('/learning') &&
          !url.includes('/settings'));
}

async function initLinkedInFeedReplacer() {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const linkedinSettings = settings.platforms?.linkedin || {};
  
  // Hide feed if enabled - replace with quotes (only on homepage)
  if (linkedinSettings.hideFeed === true && isHomePage()) {
    if (document.querySelector('.feed-replacer-container')) return;
    await replaceFeed([
      'main[role="main"] .scaffold-finite-scroll__content',
      '.scaffold-finite-scroll__content',
      '.feed-shared-update-v2',
      '.feed-container',
      'main[role="main"]',
      'div[class*="feed-shared-update-v2"]',
      'main'
    ], {
      checkInterval: 500,
      maxAttempts: 25,
      preserveStructure: false
    });
  }
  
  // Hide suggestions if enabled
  if (linkedinSettings.hideSuggestions === true) {
    hideElements(SELECTORS.suggestions, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Handle navigation (pathname + debounce, once only — no document MutationObserver)
  if (!window.__feedReplacerNavLinkedIn) {
    window.__feedReplacerNavLinkedIn = true;
    let lastPath = location.pathname;
    let navDebounce = null;
    const onNav = () => {
      const path = location.pathname;
      if (path === lastPath) return;
      lastPath = path;
      if (navDebounce) clearTimeout(navDebounce);
      navDebounce = setTimeout(() => {
        navDebounce = null;
        initLinkedInFeedReplacer();
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
  
  addStorageListener(() => setTimeout(initLinkedInFeedReplacer, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLinkedInFeedReplacer);
} else {
  initLinkedInFeedReplacer();
}

