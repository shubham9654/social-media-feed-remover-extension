/**
 * Background Service Worker
 * Handles extension lifecycle and storage
 */

// Default settings - hide main feed ON, everything else OFF
const defaultSettings = {
  enabled: true,
  platforms: {
    youtube: {
      hideHomeFeed: true,
      hideShorts: false,
      hideSidebar: false,
      hideComments: false,
      hideExplore: false,
      hideTrending: false,
      hideEndScreen: false
    },
    instagram: {
      hideFeed: true,
      hideSearch: false,
      hideReels: false,
      hideStories: false
    },
    facebook: {
      hideFeed: true,
      hideExplore: false,
      hideStories: false
    },
    twitter: {
      hideFeed: true,
      hideExplore: false,
      hideTrends: false,
      hideSuggestions: false
    },
    linkedin: {
      hideFeed: true,
      hideSuggestions: false
    },
    reddit: {
      hideFeed: true,
      hideSidebar: false
    },
    quora: {
      hideFeed: true,
      hideSidebar: false,
      hideSuggestions: false
    }
  },
  customQuotes: [],
  snoozeUntil: null
};

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Social Media Feed Remover installed');
    
    // Set default settings
    chrome.storage.local.set(defaultSettings, () => {
      console.log('Default settings initialized');
    });
  } else if (details.reason === 'update') {
    console.log('Social Media Feed Remover updated');
    
    // Merge with existing settings on update
    chrome.storage.local.get(null, (existing) => {
      const merged = {
        ...defaultSettings,
        ...existing,
        platforms: {
          ...defaultSettings.platforms,
          ...(existing.platforms || {})
        }
      };
      
      // Merge each platform's settings
      Object.keys(defaultSettings.platforms).forEach(platform => {
        merged.platforms[platform] = {
          ...defaultSettings.platforms[platform],
          ...(existing.platforms?.[platform] || {})
        };
      });
      
      chrome.storage.local.set(merged);
    });
  }
});

// Snooze alarm name
const SNOOZE_ALARM_NAME = 'snoozeEnd';

// When snooze is set, schedule an alarm to clear it when time is up
function scheduleSnoozeEnd(snoozeUntil) {
  chrome.alarms.clear(SNOOZE_ALARM_NAME);
  if (snoozeUntil && snoozeUntil > Date.now()) {
    chrome.alarms.create(SNOOZE_ALARM_NAME, { when: snoozeUntil });
  }
}

// When storage changes (e.g. user sets snooze from options), schedule alarm
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes.snoozeUntil) return;
  const newVal = changes.snoozeUntil.newValue;
  scheduleSnoozeEnd(newVal);
});

// When alarm fires, clear snooze so extension works again automatically
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SNOOZE_ALARM_NAME) {
    chrome.storage.local.set({ snoozeUntil: null });
    chrome.alarms.clear(SNOOZE_ALARM_NAME);
  }
});

// Restore alarm on startup (service worker may have been inactive)
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['snoozeUntil'], (result) => {
    scheduleSnoozeEnd(result.snoozeUntil);
  });
});

// Also restore when service worker wakes up (e.g. after browser restart)
chrome.storage.local.get(['snoozeUntil'], (result) => {
  scheduleSnoozeEnd(result.snoozeUntil);
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getQuote') {
    sendResponse({ success: true });
  }
  return true;
});

// Listen for tab updates to re-inject if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Content scripts handle their own initialization
  }
});
