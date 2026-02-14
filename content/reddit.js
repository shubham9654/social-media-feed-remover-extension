/**
 * Reddit Feed Replacer
 * Replaces Reddit feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener } from '../utils/chrome-helpers.js';

const SELECTORS = {
  feed: ['shreddit-feed', '[data-testid="subreddit-posts"]'],
  sidebar: ['[data-testid="subreddit-sidebar"]', '#sidebar']
};

// Check if we're on the homepage or a feed page
function isHomePage() {
  const url = location.href.toLowerCase();
  const path = location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  if (path === '/' || path === '/home' || path === '/hot' || path === '/best' || path === '/new' || path === '/top' || path === '/rising') return true;
  if (/^\/r\/[\w-]+(\/(hot|new|top|rising|best))?$/.test(path)) return true;
  return !url.includes('/search') && !url.includes('/message') && !url.includes('/user/') && !url.includes('/settings') && !url.includes('/prefs');
}

async function initRedditFeedReplacer() {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const redditSettings = settings.platforms?.reddit || {};
  
  // Hide feed if enabled - replace with quotes (only on homepage)
  if (redditSettings.hideFeed === true && isHomePage()) {
    if (document.querySelector('.feed-replacer-container')) return;
    await replaceFeed([
      'shreddit-feed',
      '[data-testid="subreddit-posts"]',
      '#AppRouter-main-content',
      'faceplate-tracker',
      'shreddit-post',
      'div[slot="feed"]',
      'main'
    ], {
      checkInterval: 500,
      maxAttempts: 25,
      preserveStructure: false
    });
  }
  
  // Hide sidebar if enabled
  if (redditSettings.hideSidebar === true) {
    hideElements(SELECTORS.sidebar, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  // Handle navigation (pathname + debounce, once only — no document MutationObserver)
  if (!window.__feedReplacerNavReddit) {
    window.__feedReplacerNavReddit = true;
    let lastPath = location.pathname;
    let navDebounce = null;
    const onNav = () => {
      const path = location.pathname;
      if (path === lastPath) return;
      lastPath = path;
      if (navDebounce) clearTimeout(navDebounce);
      navDebounce = setTimeout(() => {
        navDebounce = null;
        initRedditFeedReplacer();
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
  
  addStorageListener(() => setTimeout(initRedditFeedReplacer, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRedditFeedReplacer);
} else {
  initRedditFeedReplacer();
}

