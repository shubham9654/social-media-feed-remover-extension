/**
 * Reddit Feed Replacer
 * Replaces Reddit feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener, setupNavigationListener, scheduleHomepageRecheck, startHomepagePolling } from '../utils/chrome-helpers.js';

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
  setupNavigationListener('Reddit', () => setTimeout(initRedditFeedReplacer, 100));

  const settings = await getSettings();
  if (!settings.enabled) return;

  const redditSettings = settings.platforms?.reddit || {};
  const onHome = isHomePage();

  if (redditSettings.hideFeed === true && onHome) {
    await replaceFeed([
      'shreddit-feed',
      '[data-testid="subreddit-posts"]',
      '#AppRouter-main-content',
      'div[slot="feed"]'
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
  
  scheduleHomepageRecheck(initRedditFeedReplacer, onHome);
  startHomepagePolling('Reddit', initRedditFeedReplacer, isHomePage);

  addStorageListener(() => setTimeout(initRedditFeedReplacer, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRedditFeedReplacer);
} else {
  initRedditFeedReplacer();
}

