/**
 * Quora Feed Replacer
 * Replaces Quora feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener, setupNavigationListener, scheduleHomepageRecheck, startHomepagePolling } from '../utils/chrome-helpers.js';

const SELECTORS = {
  feed: [
    'div[role="main"] [data-testid="feed"]',
    'main [data-testid="feed"]',
    '[data-testid="feed"]',
    '.q-box[data-testid="feed"]',
    '[data-testid="main-feed"]'
  ],
  sidebar: [
    '[data-testid="sidebar"]',
    'main [data-testid="sidebar"]'
  ],
  suggestions: [
    '[data-testid="suggested-follows"]'
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
  setupNavigationListener('Quora', () => setTimeout(initQuoraFeedReplacer, 100));

  const settings = await getSettings();
  if (!settings.enabled) return;

  const quoraSettings = settings.platforms?.quora || {};
  const onHome = isHomePage();

  if (quoraSettings.hideFeed === true && onHome) {
    await replaceFeed([
        'div[role="main"] [data-testid="feed"]',
        'main [data-testid="feed"]',
        '[data-testid="feed"]',
        '.q-box[data-testid="feed"]',
        '[data-testid="main-feed"]'
    ], {
      checkInterval: 500,
      maxAttempts: 60,
      preserveStructure: false
    });
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
  
  scheduleHomepageRecheck(initQuoraFeedReplacer, onHome);
  startHomepagePolling('Quora', initQuoraFeedReplacer, isHomePage);

  addStorageListener(() => setTimeout(initQuoraFeedReplacer, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initQuoraFeedReplacer);
} else {
  initQuoraFeedReplacer();
}

