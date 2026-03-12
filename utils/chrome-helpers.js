/**
 * Safe Chrome API helpers - guards against "Extension context invalidated" errors
 * that occur when the extension is reloaded while content scripts are still running.
 */

/**
 * Check if extension context is still valid
 * @returns {boolean}
 */
export function isContextValid() {
  try {
    return typeof chrome !== 'undefined' && !!chrome?.runtime?.id;
  } catch {
    return false;
  }
}

/**
 * Get extension settings (enabled, platforms) - safe from context invalidation
 * @returns {Promise<{enabled: boolean, platforms: Object}>}
 */
export function getSettings() {
  const defaults = { enabled: true, platforms: {} };
  if (!isContextValid()) return Promise.resolve(defaults);
  return new Promise((resolve) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['enabled', 'platforms'], (result) => {
          if (!isContextValid()) { resolve(defaults); return; }
          resolve({
            enabled: result?.enabled !== false,
            platforms: result?.platforms || {}
          });
        });
      } else {
        resolve(defaults);
      }
    } catch {
      resolve(defaults);
    }
  });
}

/**
 * Add storage change listener - no-op if context invalid, listener checks validity before running
 * @param {function} callback - Called when storage changes (only if context still valid)
 */
export function addStorageListener(callback) {
  if (!isContextValid()) return;
  try {
    chrome.storage?.onChanged?.addListener((changes, areaName) => {
      if (areaName === 'local' && isContextValid()) {
        callback();
      }
    });
  } catch {
    // Context invalidated, ignore
  }
}

/**
 * Get current route for navigation comparison (pathname + hash)
 * @returns {string}
 */
export function getCurrentRoute() {
  return (location.pathname || '/') + (location.hash || '');
}

/**
 * Setup navigation listener - detects SPA route changes (pushState, popstate, hashchange)
 * Call this at the START of init so we detect when user navigates back to homepage
 * @param {string} key - Unique key per platform (e.g. 'YouTube')
 * @param {function} onNavigate - Callback when route changes
 */
export function setupNavigationListener(key, onNavigate) {
  const navKey = `__feedReplacerNav${key}`;
  if (window[navKey]) return;
  window[navKey] = true;

  let lastRoute = getCurrentRoute();
  let debounceTimer = null;

  const checkNav = () => {
    const route = getCurrentRoute();
    if (route === lastRoute) return;
    lastRoute = route;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      onNavigate();
    }, 300);
  };

  window.addEventListener('popstate', checkNav);
  window.addEventListener('hashchange', checkNav);

  const origPushState = history.pushState;
  const origReplaceState = history.replaceState;
  history.pushState = function (...args) {
    origPushState.apply(this, args);
    checkNav();
  };
  history.replaceState = function (...args) {
    origReplaceState.apply(this, args);
    checkNav();
  };
}

/**
 * Schedule re-check when on homepage - catches late-loading feed content
 * @param {function} initFn - Init function to re-run
 * @param {boolean} isHome - Whether currently on homepage
 */
export function scheduleHomepageRecheck(initFn, isHome) {
  if (!isHome) return;
  setTimeout(() => initFn(), 1500);
  setTimeout(() => initFn(), 3500);
  setTimeout(() => initFn(), 6000);
}

/**
 * Start continuous polling - reliably detects when user returns to homepage/feed
 * Runs every 2.5s when on homepage (catches navigation that history API misses)
 * @param {string} key - Unique key per platform
 * @param {function} initFn - Init function to run
 * @param {function} isHomePageFn - Returns true when on homepage/feed
 */
export function startHomepagePolling(key, initFn, isHomePageFn) {
  const intervalKey = `__feedReplacerPoll${key}`;
  if (window[intervalKey]) return;

  const runPoll = () => {
    if (isHomePageFn()) initFn();
  };

  window[intervalKey] = setInterval(runPoll, 1500);
  runPoll();
}

/**
 * Watch for DOM changes - detects when SPA swaps content (navigation without history events)
 * @param {string} key - Unique key per platform
 * @param {function} initFn - Init function to run
 * @param {function} isHomePageFn - Returns true when on homepage
 */
export function setupDOMWatch(key, initFn, isHomePageFn) {
  const watchKey = `__feedReplacerDOMWatch${key}`;
  if (window[watchKey]) return;
  window[watchKey] = true;

  let debounceTimer = null;
  const debouncedInit = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      if (isHomePageFn()) initFn();
    }, 400);
  };

  const observer = new MutationObserver((mutations) => {
    const hasSignificantChange = mutations.some(m =>
      m.addedNodes.length > 0 || m.removedNodes.length > 0
    );
    if (hasSignificantChange) debouncedInit();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
