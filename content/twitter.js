/**
 * Twitter/X Feed Replacer
 * Replaces Twitter/X timeline with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener } from '../utils/chrome-helpers.js';

const SELECTORS = {
  feed: ['[data-testid="primaryColumn"]', '[data-testid="homeTimeline"]'],
  explore: ['[data-testid="primaryColumn"]', '[aria-label*="Explore"]', '[href="/explore"]'],
  trends: ['[data-testid="sidebarColumn"]', '[aria-label*="Trending"]'],
  suggestions: ['[data-testid="sidebarColumn"] [aria-label*="Who to follow"]']
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
  // Only affect homepage, not search, messages, profiles, etc.
  return path === '/' || path === '/home' || path === '/home/' || 
         (!url.includes('/search') && !url.includes('/messages') && 
          !url.includes('/compose') && !url.includes('/i/') &&
          !url.includes('/notifications') && !url.includes('/settings') &&
          !url.includes('/profile') && !url.includes('/status'));
}

async function initTwitterFeedReplacer() {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  // Only replace feed on homepage
  if (!isHomePage()) {
    return;
  }
  
  const twitterSettings = settings.platforms?.twitter || {};
  
  // Hide feed if enabled (only on homepage)
  if (twitterSettings.hideFeed === true && isHomePage()) {
    if (!document.querySelector('.feed-replacer-container')) {
      await replaceFeed('[data-testid="primaryColumn"]', {
        checkInterval: 500,
        maxAttempts: 20,
        preserveStructure: false
      });
    }
  }
  
  // Hide explore if enabled (only on explore page)
  if (twitterSettings.hideExplore === true && isExplorePage()) {
    if (!document.querySelector('.feed-replacer-container')) {
      await replaceFeed('[data-testid="primaryColumn"]', {
        checkInterval: 500,
        maxAttempts: 20,
        preserveStructure: false
      });
    }
  }
  
  // Hide trends if enabled
  if (twitterSettings.hideTrends === true) {
    hideElements(SELECTORS.trends, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide suggestions if enabled
  if (twitterSettings.hideSuggestions === true) {
    hideElements(SELECTORS.suggestions, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Handle navigation (pathname + debounce, once only — no document MutationObserver)
  if (!window.__feedReplacerNavTwitter) {
    window.__feedReplacerNavTwitter = true;
    let lastPath = location.pathname;
    let navDebounce = null;
    const onNav = () => {
      const path = location.pathname;
      if (path === lastPath) return;
      lastPath = path;
      if (navDebounce) clearTimeout(navDebounce);
      navDebounce = setTimeout(() => {
        navDebounce = null;
        initTwitterFeedReplacer();
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
  
  addStorageListener(() => setTimeout(initTwitterFeedReplacer, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTwitterFeedReplacer);
} else {
  initTwitterFeedReplacer();
}

