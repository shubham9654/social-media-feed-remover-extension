/**
 * LinkedIn Feed Replacer
 * Replaces LinkedIn feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener, setupNavigationListener, scheduleHomepageRecheck, startHomepagePolling } from '../utils/chrome-helpers.js';

const FEED_TARGET_ATTR = 'data-feed-remover-target';
const FEED_TARGET_VALUE = 'linkedin-feed';

const SELECTORS = {
  // Keep this tight: do NOT target `main` or broad containers, otherwise sidebars get wiped.
  // Primary feed containers based on current LinkedIn DOM (similar to News Feed Eradicator):
  // - The main scaffold feed
  // - The mainFeed update list container
  feed: [
    'main > div.relative > .scaffold-finite-scroll',
    "div[componentkey^='container-update-list_mainFeed']",
    'main[role="main"] .scaffold-finite-scroll__content',
    'div.scaffold-layout__main .scaffold-finite-scroll__content',
    '.scaffold-finite-scroll__content',
    'div.scaffold-layout__main',
    '.feed-container'
  ],
  suggestions: ['[aria-label*="People you may know"]', '[data-testid="people-you-may-know"]']
};

function tagLinkedInFeedTarget() {
  // 1) Preferred: main feed containers (center column)
  let el =
    document.querySelector('main > div.relative > .scaffold-finite-scroll') ||
    document.querySelector("div[componentkey^='container-update-list_mainFeed']") ||
    document.querySelector('main[role="main"] .scaffold-finite-scroll__content') ||
    document.querySelector('div.scaffold-layout__main .scaffold-finite-scroll__content') ||
    document.querySelector('.scaffold-finite-scroll__content');

  // 2) Heuristic: find a parent container that contains multiple feed update cards
  if (!el) {
    const update = document.querySelector('.feed-shared-update-v2');
    if (update) {
      el =
        update.closest("div[componentkey^='container-update-list_mainFeed']") ||
        update.closest('.scaffold-finite-scroll__content') ||
        update.closest('div.scaffold-layout__main') ||
        update.closest('main[role="main"]');
    }
  }

  // 3) Last resort (still center column): scaffold main area (avoid left/right rails)
  if (!el) {
    el = document.querySelector('div.scaffold-layout__main');
  }

  if (!el) return null;
  el.setAttribute(FEED_TARGET_ATTR, FEED_TARGET_VALUE);
  return el;
}

// Check if we're on the homepage
function isHomePage() {
  const url = location.href.toLowerCase();
  const path = location.pathname.toLowerCase();
  // Only affect homepage feed, not search, messages, profiles, etc.
  return path === '/' || path === '/feed' || path === '/feed/' ||
         (!url.includes('/search') && !url.includes('/messaging') && 
          !url.includes('/in/') && !url.includes('/company/') &&
          !url.includes('/jobs') && !url.includes('/learning') &&
          !url.includes('/settings'));
}

async function initLinkedInFeedReplacer() {
  setupNavigationListener('LinkedIn', () => setTimeout(initLinkedInFeedReplacer, 100));

  const settings = await getSettings();
  if (!settings.enabled) return;

  const linkedinSettings = settings.platforms?.linkedin || {};
  const onHome = isHomePage();

  if (linkedinSettings.hideFeed === true && onHome) {
    tagLinkedInFeedTarget();
    await replaceFeed([
      `[${FEED_TARGET_ATTR}="${FEED_TARGET_VALUE}"]`,
      ...SELECTORS.feed
    ], {
      checkInterval: 500,
      maxAttempts: 60,
      preserveStructure: false
    });
  }
  
  // Hide suggestions if enabled
  if (linkedinSettings.hideSuggestions === true) {
    hideElements(SELECTORS.suggestions, {
      checkInterval: 500,
      maxAttempts: 20
    });
  }
  
  scheduleHomepageRecheck(initLinkedInFeedReplacer, onHome);
  startHomepagePolling('LinkedIn', initLinkedInFeedReplacer, isHomePage);

  addStorageListener(() => setTimeout(initLinkedInFeedReplacer, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLinkedInFeedReplacer);
} else {
  initLinkedInFeedReplacer();
}

