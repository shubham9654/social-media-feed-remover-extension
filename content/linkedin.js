/**
 * LinkedIn Feed Replacer
 * Replaces LinkedIn feed with inspirational quotes
 */

import { replaceFeed, hideElements } from '../utils/feed-replacer.js';
import { getSettings, addStorageListener, setupNavigationListener, scheduleHomepageRecheck, startHomepagePolling } from '../utils/chrome-helpers.js';

const SELECTORS = {
  // Keep this tight: do NOT target `main` or broad containers, otherwise sidebars get wiped.
  feed: [
    'main[role="main"] .scaffold-finite-scroll__content',
    'div.scaffold-layout__main .scaffold-finite-scroll__content',
    '.scaffold-finite-scroll__content',
    'div.scaffold-layout__main',
    '.feed-container'
  ],
  suggestions: ['[aria-label*="People you may know"]', '[data-testid="people-you-may-know"]']
};

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
    await replaceFeed([
      'main[role="main"] .scaffold-finite-scroll__content',
      'div.scaffold-layout__main .scaffold-finite-scroll__content',
      '.scaffold-finite-scroll__content',
      'div.scaffold-layout__main',
      '.feed-container',
      // Intentionally avoid `main` / `[role="main"]` fallbacks - they remove sidebars & nav scaffolding.
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

