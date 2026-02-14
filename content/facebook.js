/**
 * Facebook Feed Replacer
 * Replaces Facebook news feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener } from '../utils/chrome-helpers.js';

const SELECTORS = {
  feed: ['[role="feed"]', '[role="main"]', 'div[data-pagelet="FeedUnit"]'],
  explore: ['[data-pagelet="ExploreFeed"]', '[aria-label*="Explore"]', '[href*="/explore"]'],
  stories: ['[aria-label*="Story"]', '[role="article"][aria-label*="story"]']
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
  return path === '/' || path === '/home' || path === '/home.php' ||
         (!url.includes('/search') && !url.includes('/messages') && 
          !url.includes('/watch') && !url.includes('/marketplace') &&
          !url.includes('/groups') && !url.includes('/events') &&
          !url.includes('/pages') && !url.includes('/profile.php'));
}

async function initFacebookFeedReplacer() {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const facebookSettings = settings.platforms?.facebook || {};
  
  // Hide feed if enabled - replace with quotes (only on homepage)
  if (facebookSettings.hideFeed === true && isHomePage()) {
    if (document.querySelector('.feed-replacer-container')) return;
    await replaceFeed([
      '[role="feed"]',
      '[role="main"]',
      'div[data-pagelet="FeedUnit"]',
      '[data-pagelet="FeedUnit"]',
      'div[data-pagelet="MainFeed"]',
      '[aria-label="Feed"]',
      'div[role="main"]'
    ], {
      checkInterval: 500,
      maxAttempts: 25,
      preserveStructure: false
    });
  }
  
  // Hide explore if enabled (only on explore page)
  if (facebookSettings.hideExplore === true && isExplorePage()) {
    await replaceFeed(SELECTORS.explore, {
      checkInterval: 500,
      maxAttempts: 30,
      preserveStructure: false
    });
  }
  
  // Hide stories if enabled
  if (facebookSettings.hideStories === true) {
    hideElements(SELECTORS.stories, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Handle navigation (pathname + debounce, once only)
  if (!window.__feedReplacerNavFacebook) {
    window.__feedReplacerNavFacebook = true;
    let lastPath = location.pathname;
    let navDebounce = null;
    const onNav = () => {
      const path = location.pathname;
      if (path === lastPath) return;
      lastPath = path;
      if (navDebounce) clearTimeout(navDebounce);
      navDebounce = setTimeout(() => {
        navDebounce = null;
        initFacebookFeedReplacer();
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
  
  addStorageListener(() => setTimeout(initFacebookFeedReplacer, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFacebookFeedReplacer);
} else {
  initFacebookFeedReplacer();
}

