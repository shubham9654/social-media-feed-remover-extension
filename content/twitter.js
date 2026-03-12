/**
 * Twitter/X Feed Replacer
 * Replaces Twitter/X timeline with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener, setupNavigationListener, scheduleHomepageRecheck, startHomepagePolling } from '../utils/chrome-helpers.js';

const FEED_SELECTORS = [
  '[data-testid="primaryColumn"]',
  '[data-testid="homeTimeline"]',
  'section[aria-label*="Timeline"]',
  '[aria-label*="Home timeline"]',
  '[role="main"] section',
  'main section',
  '[data-testid="placementTracking"]'
];

const SELECTORS = {
  trends: ['[data-testid="sidebarColumn"]', '[aria-label*="Trending"]'],
  suggestions: ['[data-testid="sidebarColumn"] [aria-label*="Who to follow"]']
};

function isExplorePage() {
  const url = location.href.toLowerCase();
  const path = (location.pathname || '/').toLowerCase().replace(/\/$/, '') || '/';
  return url.includes('/explore') || path === '/explore';
}

function isHomePage() {
  const url = location.href.toLowerCase();
  const path = (location.pathname || '/').toLowerCase().replace(/\/$/, '') || '/';
  if (path === '/' || path === '/home') return true;
  if (url.includes('/search') || url.includes('/messages') || url.includes('/compose')) return false;
  if (url.includes('/i/') || url.includes('/notifications') || url.includes('/settings')) return false;
  if (url.includes('/profile') || url.includes('/status') || url.includes('/statuses/')) return false;
  if (path.startsWith('/search') || path.startsWith('/messages') || path.startsWith('/compose')) return false;
  return true;
}

async function initTwitterFeedReplacer() {
  setupNavigationListener('Twitter', () => setTimeout(initTwitterFeedReplacer, 100));

  const settings = await getSettings();
  if (!settings.enabled) return;

  const twitterSettings = settings.platforms?.twitter || {};
  const onHome = isHomePage();
  const onExplore = isExplorePage();

  if ((twitterSettings.hideFeed === true && onHome) || (twitterSettings.hideExplore === true && onExplore)) {
    await replaceFeed(FEED_SELECTORS, {
      checkInterval: 500,
      maxAttempts: 40,
      preserveStructure: false
    });
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
  
  scheduleHomepageRecheck(initTwitterFeedReplacer, onHome || onExplore);
  startHomepagePolling('Twitter', initTwitterFeedReplacer, () => isHomePage() || isExplorePage());

  addStorageListener(() => setTimeout(initTwitterFeedReplacer, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTwitterFeedReplacer);
} else {
  initTwitterFeedReplacer();
}

