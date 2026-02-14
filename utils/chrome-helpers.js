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
