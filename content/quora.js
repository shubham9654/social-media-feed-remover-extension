/**
 * Quora Feed Replacer
 * Replaces Quora feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener, setupNavigationListener, scheduleHomepageRecheck, startHomepagePolling } from '../utils/chrome-helpers.js';

const FEED_TARGET_ATTR = 'data-feed-remover-target';
const FEED_TARGET_VALUE = 'quora-feed';

const SELECTORS = {
  feed: [
    'div[role="main"] [data-testid="feed"]',
    'main [data-testid="feed"]',
    '[data-testid="feed"]',
    '.q-box[data-testid="feed"]',
    '[data-testid="main-feed"]',
    // Fallbacks for UI variants (scoped to main content only)
    'main .ContentWrapper',
    'main .content',
    'main .q-box.qu-px--medium'
  ],
  sidebar: [
    '[data-testid="sidebar"]',
    'main [data-testid="sidebar"]'
  ],
  suggestions: [
    '[data-testid="suggested-follows"]'
  ]
};

function tagQuoraFeedTarget() {
  // Prefer explicit testids if present
  let el =
    document.querySelector('div[role="main"] [data-testid="feed"]') ||
    document.querySelector('main [data-testid="feed"]') ||
    document.querySelector('[data-testid="feed"]') ||
    document.querySelector('[data-testid="main-feed"]') ||
    document.querySelector('.q-box[data-testid="feed"]');

  // Heuristic: find a container that wraps multiple answer/question cards
  if (!el) {
    const main = document.querySelector('main') || document.querySelector('div[role="main"]');
    if (main) {
      const answerLink = main.querySelector('a[href*="/answer/"]');
      if (answerLink) {
        el = answerLink.closest('[data-testid]') || answerLink.closest('.ContentWrapper') || answerLink.closest('.q-box');
      }
      if (!el) {
        el = main.querySelector('.ContentWrapper') || main.querySelector('.q-box.qu-px--medium') || main;
      }
    }
  }

  if (!el) return null;
  el.setAttribute(FEED_TARGET_ATTR, FEED_TARGET_VALUE);
  return el;
}

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
    tagQuoraFeedTarget();
    await replaceFeed([
        `[${FEED_TARGET_ATTR}="${FEED_TARGET_VALUE}"]`,
        'div[role="main"] [data-testid="feed"]',
        'main [data-testid="feed"]',
        '[data-testid="feed"]',
        '.q-box[data-testid="feed"]',
        '[data-testid="main-feed"]',
        'main .ContentWrapper',
        'main .content',
        'main .q-box.qu-px--medium'
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

