/**
 * Instagram Feed Replacer
 * Replaces Instagram feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener, setupNavigationListener, scheduleHomepageRecheck, startHomepagePolling } from '../utils/chrome-helpers.js';

// Instagram selectors
const SELECTORS = {
  // Keep this narrow to avoid wiping right-side suggestions/sidebars.
  // On Instagram web, the central feed is typically the `section` inside `main[role="main"]`.
  feed: [
    'main[role="main"] section',
    'main[role="main"] section > div',
    'main[role="main"] article'
  ],
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
  setupNavigationListener('Instagram', () => setTimeout(initInstagramFeedReplacer, 100));

  const settings = await getSettings();
  if (!settings.enabled) return;

  const instagramSettings = settings.platforms?.instagram || {};
  const onHome = isHomePage();

  if (instagramSettings.hideFeed === true && onHome) {
    await replaceFeed([
      // Do NOT target `main` or `[role="main"]` broadly; that removes side panels/navigation.
      'main[role="main"] section',
      'main[role="main"] section > div',
      'main[role="main"] article'
    ], {
      checkInterval: 500,
      maxAttempts: 30,
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
  
  scheduleHomepageRecheck(initInstagramFeedReplacer, onHome);
  startHomepagePolling('Instagram', initInstagramFeedReplacer, isHomePage);

  addStorageListener(() => setTimeout(initInstagramFeedReplacer, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInstagramFeedReplacer);
} else {
  initInstagramFeedReplacer();
}

