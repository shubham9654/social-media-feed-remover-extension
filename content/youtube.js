/**
 * YouTube Feed Replacer
 * Replaces YouTube feeds and allows granular control over different sections
 */

import { hideElements, replaceFeed } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener } from '../utils/chrome-helpers.js';

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

// Check if we're on the homepage
function isHomePage() {
  const url = location.href.toLowerCase();
  const path = location.pathname.toLowerCase();
  // Only affect homepage feed, not search, watch pages, channels, etc.
  return path === '/' || path === '/feed' || path === '/feed/' ||
         (!url.includes('/watch') && !url.includes('/search') && 
          !url.includes('/channel') && !url.includes('/user') &&
          !url.includes('/playlist') && !url.includes('/c/') &&
          !url.includes('/results') && !url.includes('/shorts'));
}

async function initYouTubeFeedReplacer() {
  // Get settings
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const youtubeSettings = settings.platforms?.youtube || {};
  
  // Hide home feed if enabled (only on homepage)
  if (youtubeSettings.hideHomeFeed === true && isHomePage()) {
    if (!document.querySelector('.feed-replacer-container')) {
      await replaceFeed(SELECTORS.homeFeed, {
        checkInterval: 500,
        maxAttempts: 20,
        preserveStructure: false
      });
    }
  }
  
  // Hide shorts if enabled
  if (youtubeSettings.hideShorts === true) {
    hideElements(SELECTORS.shorts, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide sidebar recommendations if enabled
  if (youtubeSettings.hideSidebar === true) {
    hideElements(SELECTORS.sidebar, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide comments if enabled
  if (youtubeSettings.hideComments === true) {
    hideElements(SELECTORS.comments, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide explore/guide if enabled
  if (youtubeSettings.hideExplore === true) {
    hideElements(SELECTORS.explore, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide trending if enabled
  if (youtubeSettings.hideTrending === true) {
    hideElements(SELECTORS.trending, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Hide end screen recommendations if enabled
  if (youtubeSettings.hideEndScreen === true) {
    hideElements(SELECTORS.endScreen, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Handle navigation (pathname + debounce, once only — no document MutationObserver)
  if (!window.__feedReplacerNavYouTube) {
    window.__feedReplacerNavYouTube = true;
    let lastPath = location.pathname;
    let navDebounce = null;
    const onNav = () => {
      const path = location.pathname;
      if (path === lastPath) return;
      lastPath = path;
      if (navDebounce) clearTimeout(navDebounce);
      navDebounce = setTimeout(() => {
        navDebounce = null;
        initYouTubeFeedReplacer();
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
  addStorageListener(() => setTimeout(initYouTubeFeedReplacer, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initYouTubeFeedReplacer);
} else {
  initYouTubeFeedReplacer();
}

