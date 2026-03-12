/**
 * Feed Replacer Utility
 * Common functionality for replacing social media feeds with quotes
 */

import { getRandomQuote } from '../quotes.js';

/**
 * Check if extension context is still valid (not invalidated by reload/update)
 * @returns {boolean}
 */
function isContextValid() {
  try {
    return typeof chrome !== 'undefined' && !!chrome?.runtime?.id;
  } catch {
    return false;
  }
}

/**
 * Check if extension is enabled
 * @returns {Promise<boolean>} True if enabled
 */
export async function isExtensionEnabled() {
  if (!isContextValid()) return true; // Default to enabled when context invalid
  return new Promise((resolve) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['enabled', 'snoozeUntil'], (result) => {
          if (!isContextValid()) { resolve(true); return; }
          if (result?.snoozeUntil && result.snoozeUntil > Date.now()) {
            resolve(false);
            return;
          }
          resolve(result?.enabled !== false);
        });
      } else {
        resolve(true);
      }
    } catch {
      resolve(true);
    }
  });
}

/**
 * Create a quote display element
 * @param {Object} quote - Quote object with text and author
 * @returns {HTMLElement} Quote display element
 */
export function createQuoteElement(quote) {
  const container = document.createElement('div');
  container.className = 'feed-replacer-container';
  
  const quoteText = document.createElement('div');
  quoteText.className = 'feed-replacer-quote';
  quoteText.textContent = `"${quote.text}"`;
  
  const quoteAuthor = document.createElement('div');
  quoteAuthor.className = 'feed-replacer-author';
  quoteAuthor.textContent = `— ${quote.author}`;
  
  container.appendChild(quoteText);
  container.appendChild(quoteAuthor);
  
  return container;
}

/**
 * Replace feed content with a quote
 * @param {string|Array<string>} selectors - CSS selector(s) for feed elements
 * @param {Object} options - Configuration options
 */
export async function replaceFeed(selectors, options = {}) {
  // Check if extension is enabled
  const enabled = await isExtensionEnabled();
  if (!enabled) {
    return; // Don't replace if disabled
  }
  
  const {
    checkInterval = 500,
    maxAttempts = 25,
    preserveStructure = false
  } = options;

  let attempts = 0;
  
  const attemptReplace = async () => {
    const stillEnabled = await isExtensionEnabled();
    if (!stillEnabled) {
      restoreFeed(selectors);
      return;
    }
    
    attempts++;
    
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    let feedElement = null;
    
    for (const selector of selectorArray) {
      try {
        const el = document.querySelector(selector);
        if (el && !el.querySelector('.feed-replacer-container')) {
          feedElement = el;
          break;
        }
      } catch (_) {}
    }
    
    if (!feedElement) {
      if (attempts < maxAttempts) {
        setTimeout(attemptReplace, checkInterval);
      }
      return;
    }
    
    const quote = await getRandomQuote();
    const quoteElement = createQuoteElement(quote);
    
    if (preserveStructure) {
      const feedChildren = Array.from(feedElement.children);
      feedChildren.forEach(child => {
        if (!child.classList.contains('feed-replacer-container')) {
          child.style.display = 'none';
        }
      });
      feedElement.appendChild(quoteElement);
    } else {
      feedElement.innerHTML = '';
      feedElement.appendChild(quoteElement);
    }
    
    setupObserver(feedElement, selectors, options);
  };
  
  attemptReplace();
}

/**
 * Restore feed content (when extension is disabled)
 * @param {string|Array<string>} selectors - CSS selectors
 */
function restoreFeed(selectors) {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
  selectorArray.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const quoteContainers = element.querySelectorAll('.feed-replacer-container');
      quoteContainers.forEach(container => container.remove());
      
      // Restore hidden children
      const hiddenChildren = element.querySelectorAll('[style*="display: none"]');
      hiddenChildren.forEach(child => {
        child.style.display = '';
      });
    });
  });
}

/**
 * Set up MutationObserver: only re-apply when our quote container is removed (e.g. page re-rendered).
 * Does NOT replace every added node - that caused flickering with Instagram/SPAs.
 */
function setupObserver(container, selectors, options) {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
  let reapplyTimeout = null;

  const observer = new MutationObserver(() => {
    if (!container.isConnected) return;
    if (container.querySelector('.feed-replacer-container')) return;

    if (reapplyTimeout) clearTimeout(reapplyTimeout);
    reapplyTimeout = setTimeout(() => {
      reapplyTimeout = null;
      isExtensionEnabled().then((enabled) => {
        if (!enabled) return;
        getRandomQuote().then((quote) => {
          const quoteElement = createQuoteElement(quote);
          container.innerHTML = '';
          container.appendChild(quoteElement);
        });
      });
    }, 300);
  });

  observer.observe(container, {
    childList: true,
    subtree: true
  });
}

/**
 * Restore elements that were hidden by hideElements (when snoozed/disabled)
 */
function restoreHiddenElements(selectors) {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
  selectorArray.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (el.hasAttribute('data-feed-remover-hidden')) {
        el.removeAttribute('data-feed-remover-hidden');
        el.style.display = '';
      }
    });
  });
}

/**
 * Hide elements without replacing with quotes
 * Respects snooze and extension enabled state
 * @param {string|Array<string>} selectors - CSS selector(s) for elements to hide
 * @param {Object} options - Configuration options
 */
export function hideElements(selectors, options = {}) {
  const {
    checkInterval = 1000,
    maxAttempts = 10
  } = options;

  let attempts = 0;
  let hideObserver = null;

  const attemptHide = async () => {
    const enabled = await isExtensionEnabled();
    if (!enabled) {
      restoreHiddenElements(selectors);
      if (hideObserver) {
        hideObserver.disconnect();
        hideObserver = null;
      }
      return;
    }

    attempts++;

    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    const elements = [];

    selectorArray.forEach(selector => {
      const found = document.querySelectorAll(selector);
      found.forEach(el => {
        if (!el.hasAttribute('data-feed-remover-hidden')) {
          elements.push(el);
        }
      });
    });

    if (elements.length === 0) {
      if (attempts < maxAttempts) {
        setTimeout(attemptHide, checkInterval);
      }
      return;
    }

    elements.forEach(element => {
      element.setAttribute('data-feed-remover-hidden', 'true');
      element.style.display = 'none';
    });

    if (!hideObserver) {
      hideObserver = setupHideObserver(selectors);
    }

    if (attempts < maxAttempts) {
      setTimeout(attemptHide, checkInterval);
    }
  };

  attemptHide();
}

/**
 * Set up observer for hiding dynamically added elements
 * @param {string|Array<string>} selectors - CSS selectors
 * @returns {MutationObserver}
 */
function setupHideObserver(selectors) {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];

  const observer = new MutationObserver(async () => {
    const enabled = await isExtensionEnabled();
    if (!enabled) return;

    selectorArray.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!element.hasAttribute('data-feed-remover-hidden')) {
          element.setAttribute('data-feed-remover-hidden', 'true');
          element.style.display = 'none';
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
}

/**
 * Wait for element to appear in DOM
 * @param {string} selector - CSS selector
 * @param {number} timeout - Maximum wait time in milliseconds
 * @returns {Promise<HTMLElement>} Element when found
 */
export function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}
