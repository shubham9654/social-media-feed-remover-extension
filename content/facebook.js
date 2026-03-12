/**
 * Facebook Feed Replacer
 * Replaces Facebook news feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener, setupNavigationListener, scheduleHomepageRecheck, startHomepagePolling } from '../utils/chrome-helpers.js';

const SELECTORS = {
  // Keep feed selectors tight; `[role="main"]` is too broad and can include side columns.
  feed: ['[role="feed"]', 'div[data-pagelet="MainFeed"]', 'div[data-pagelet="FeedUnit"]'],
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
  setupNavigationListener('Facebook', () => setTimeout(initFacebookFeedReplacer, 100));

  const settings = await getSettings();
  if (!settings.enabled) return;

  const facebookSettings = settings.platforms?.facebook || {};
  const onHome = isHomePage();

  if (facebookSettings.hideFeed === true && onHome) {
    await replaceFeed([
      '[role="feed"]',
      'div[data-pagelet="FeedUnit"]',
      '[data-pagelet="FeedUnit"]',
      'div[data-pagelet="MainFeed"]',
      '[aria-label="Feed"]'
    ], {
      checkInterval: 500,
      maxAttempts: 30,
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
  
  scheduleHomepageRecheck(initFacebookFeedReplacer, onHome);
  startHomepagePolling('Facebook', initFacebookFeedReplacer, isHomePage);

  addStorageListener(() => setTimeout(initFacebookFeedReplacer, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFacebookFeedReplacer);
} else {
  initFacebookFeedReplacer();
}

