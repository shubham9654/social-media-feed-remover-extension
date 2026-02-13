/**
 * Feed Replacer Utility
 * Common functionality for replacing social media feeds with quotes
 */

import { getRandomQuote } from '../quotes.js';

/**
 * Check if extension is enabled
 * @returns {Promise<boolean>} True if enabled
 */
export async function isExtensionEnabled() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['enabled'], (result) => {
        resolve(result.enabled !== false); // Default to true
      });
    } else {
      resolve(true); // Default to enabled if storage not available
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
    checkInterval = 1000,
    maxAttempts = 10,
    preserveStructure = false,
    customContainer = null
  } = options;

  let attempts = 0;
  
  const attemptReplace = async () => {
    // Re-check enabled status on each attempt
    const stillEnabled = await isExtensionEnabled();
    if (!stillEnabled) {
      // If disabled, restore original content
      restoreFeed(selectors);
      return;
    }
    
    attempts++;
    
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    let feedElement = null;
    
    // Try each selector until we find a match
    for (const selector of selectorArray) {
      feedElement = document.querySelector(selector);
      if (feedElement) break;
    }
    
    if (!feedElement) {
      if (attempts < maxAttempts) {
        setTimeout(attemptReplace, checkInterval);
      }
      return;
    }
    
    // Check if already replaced
    if (feedElement.querySelector('.feed-replacer-container')) {
      return;
    }
    
    // Get a random quote
    const quote = await getRandomQuote();
    
    // Create quote element
    const quoteElement = createQuoteElement(quote);
    
    // Replace or hide feed content
    if (preserveStructure) {
      // Hide feed content but keep structure
      const feedChildren = Array.from(feedElement.children);
      feedChildren.forEach(child => {
        if (!child.classList.contains('feed-replacer-container')) {
          child.style.display = 'none';
        }
      });
      feedElement.appendChild(quoteElement);
    } else {
      // Clear and replace
      feedElement.innerHTML = '';
      feedElement.appendChild(quoteElement);
    }
    
    // Set up observer to handle dynamic content
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
 * Set up MutationObserver to handle dynamically loaded content
 * @param {HTMLElement} container - Container element to observe
 * @param {string|Array<string>} selectors - CSS selectors for feed elements
 * @param {Object} options - Configuration options
 */
function setupObserver(container, selectors, options) {
  const observer = new MutationObserver((mutations) => {
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if new feed content was added
          for (const selector of selectorArray) {
            if (node.matches && node.matches(selector)) {
              getRandomQuote().then(quote => {
                const quoteElement = createQuoteElement(quote);
                
                if (options.preserveStructure) {
                  node.style.display = 'none';
                  container.appendChild(quoteElement);
                } else {
                  node.innerHTML = '';
                  node.appendChild(quoteElement);
                }
              });
            }
            
            // Check children
            const feedChildren = node.querySelectorAll?.(selector);
            feedChildren?.forEach((child) => {
              if (!child.querySelector('.feed-replacer-container')) {
                getRandomQuote().then(quote => {
                  const quoteElement = createQuoteElement(quote);
                  
                  if (options.preserveStructure) {
                    child.style.display = 'none';
                    container.appendChild(quoteElement);
                  } else {
                    child.innerHTML = '';
                    child.appendChild(quoteElement);
                  }
                });
              }
            });
          }
        }
      });
    });
  });
  
  observer.observe(container, {
    childList: true,
    subtree: true
  });
}

/**
 * Hide elements without replacing with quotes
 * @param {string|Array<string>} selectors - CSS selector(s) for elements to hide
 * @param {Object} options - Configuration options
 */
export function hideElements(selectors, options = {}) {
  const {
    checkInterval = 1000,
    maxAttempts = 10
  } = options;

  let attempts = 0;
  
  const attemptHide = () => {
    attempts++;
    
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    const elements = [];
    
    // Find all matching elements
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
    
    // Hide elements
    elements.forEach(element => {
      element.setAttribute('data-feed-remover-hidden', 'true');
      element.style.display = 'none';
    });
    
    // Set up observer to handle dynamically added elements
    setupHideObserver(selectors);
    
    // Continue checking for more elements
    if (attempts < maxAttempts) {
      setTimeout(attemptHide, checkInterval);
    }
  };
  
  attemptHide();
}

/**
 * Set up observer for hiding dynamically added elements
 * @param {string|Array<string>} selectors - CSS selectors
 */
function setupHideObserver(selectors) {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
  
  const observer = new MutationObserver(() => {
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
