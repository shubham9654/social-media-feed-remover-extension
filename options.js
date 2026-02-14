/**
 * Options Page Script
 * Handles settings UI and storage with auto-save
 */

function safeChrome(cb) {
  try {
    if (typeof chrome !== 'undefined' && chrome?.runtime?.id) {
      return cb();
    }
  } catch {
    // Extension context invalidated
  }
}

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

// Platform configuration
const platformConfig = {
  youtube: {
    name: 'YouTube',
    urls: ['www.youtube.com', 'youtube.com'],
    regions: [
      { id: 'hideHomeFeed', label: 'Main feed', description: 'Replace homepage feed with quotes' },
      { id: 'hideShorts', label: 'Shorts', description: 'Hide YouTube Shorts section' },
      { id: 'hideSidebar', label: 'Sidebar recommendations', description: 'Hide recommended videos in sidebar' },
      { id: 'hideComments', label: 'Comments', description: 'Hide video comments section' },
      { id: 'hideExplore', label: 'Explore/Guide', description: 'Hide navigation guide menu' },
      { id: 'hideTrending', label: 'Trending', description: 'Hide trending videos section' },
      { id: 'hideEndScreen', label: 'End screen', description: 'Hide recommendations at end of videos' }
    ],
    visitUrl: 'https://www.youtube.com'
  },
  instagram: {
    name: 'Instagram',
    urls: ['www.instagram.com'],
    regions: [
      { id: 'hideFeed', label: 'Main feed', description: 'Replace main feed with quotes' },
      { id: 'hideSearch', label: 'Explore', description: 'Hide explore/search feed' },
      { id: 'hideReels', label: 'Reels', description: 'Hide Instagram Reels section' },
      { id: 'hideStories', label: 'Stories', description: 'Hide stories section' }
    ],
    visitUrl: 'https://www.instagram.com'
  },
  facebook: {
    name: 'Facebook',
    urls: ['www.facebook.com', 'web.facebook.com'],
    regions: [
      { id: 'hideFeed', label: 'News feed', description: 'Replace news feed with quotes' },
      { id: 'hideExplore', label: 'Explore', description: 'Hide explore section' },
      { id: 'hideStories', label: 'Stories', description: 'Hide stories section' }
    ],
    visitUrl: 'https://www.facebook.com'
  },
  twitter: {
    name: 'Twitter/X',
    urls: ['www.twitter.com', 'twitter.com', 'x.com'],
    regions: [
      { id: 'hideFeed', label: 'Timeline', description: 'Replace timeline with quotes' },
      { id: 'hideExplore', label: 'Explore', description: 'Hide explore section' },
      { id: 'hideTrends', label: 'Trends', description: 'Hide trending topics sidebar' },
      { id: 'hideSuggestions', label: 'Who to Follow', description: 'Hide suggestions sidebar' }
    ],
    visitUrl: 'https://twitter.com'
  },
  linkedin: {
    name: 'LinkedIn',
    urls: ['www.linkedin.com'],
    regions: [
      { id: 'hideFeed', label: 'Feed', description: 'Replace feed with quotes' },
      { id: 'hideSuggestions', label: 'Suggestions', description: 'Hide "People you may know" section' }
    ],
    visitUrl: 'https://www.linkedin.com'
  },
  reddit: {
    name: 'Reddit',
    urls: ['www.reddit.com', 'old.reddit.com'],
    regions: [
      { id: 'hideFeed', label: 'Feed', description: 'Replace feed with quotes' },
      { id: 'hideSidebar', label: 'Sidebar', description: 'Hide subreddit sidebar' }
    ],
    visitUrl: 'https://www.reddit.com'
  },
  quora: {
    name: 'Quora',
    urls: ['www.quora.com'],
    regions: [
      { id: 'hideFeed', label: 'Feed', description: 'Replace feed with quotes' },
      { id: 'hideSidebar', label: 'Sidebar', description: 'Hide sidebar content' },
      { id: 'hideSuggestions', label: 'Suggestions', description: 'Hide suggested follows and topics' }
    ],
    visitUrl: 'https://www.quora.com'
  }
};

let currentSettings = {};
let selectedPlatform = null;

// Initialize tabs
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.getElementById(`${tabName}Tab`).classList.add('active');
    });
  });
}

let snoozeCountdownInterval = null;

// Initialize snooze buttons (in Snooze tab)
function initSnooze() {
  const snoozeButtons = document.querySelectorAll('.snooze-btn');
  const snoozeStatus = document.getElementById('snoozeStatus');
  const snoozeStatusText = document.getElementById('snoozeStatusText');
  const snoozeCountdown = document.getElementById('snoozeCountdown');
  const cancelSnoozeBtn = document.getElementById('cancelSnoozeBtn');

  function formatCountdown(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function updateSnoozeUI(snoozeUntil) {
    const isSnoozed = snoozeUntil && snoozeUntil > Date.now();
    snoozeButtons.forEach(b => b.classList.remove('active'));

    if (isSnoozed) {
      snoozeStatus.classList.remove('hidden');
      const remaining = snoozeUntil - Date.now();
      snoozeStatusText.textContent = 'Feed blocking paused';
      snoozeCountdown.textContent = `Resumes in ${formatCountdown(remaining)}`;

      const presetMinutes = [1, 5, 10, 30, 60, 1440];
      const totalMinutes = Math.ceil(remaining / 60000);
      const closest = presetMinutes.reduce((a, b) =>
        Math.abs(b - totalMinutes) < Math.abs(a - totalMinutes) ? b : a
      );
      snoozeButtons.forEach(btn => {
        if (parseInt(btn.getAttribute('data-minutes')) === closest) {
          btn.classList.add('active');
        }
      });

      if (!snoozeCountdownInterval) {
        snoozeCountdownInterval = setInterval(() => {
          safeChrome(() => {
            chrome.storage.local.get(['snoozeUntil'], (r) => {
              try {
                if (r?.snoozeUntil && r.snoozeUntil > Date.now()) {
                  snoozeCountdown.textContent = `Resumes in ${formatCountdown(r.snoozeUntil - Date.now())}`;
                } else {
                  clearSnoozeUI();
                }
              } catch { clearSnoozeUI(); }
            });
          });
        }, 1000);
      }
    } else {
      clearSnoozeUI();
    }
  }

  function clearSnoozeUI() {
    snoozeStatus.classList.add('hidden');
    snoozeButtons.forEach(b => b.classList.remove('active'));
    if (snoozeCountdownInterval) {
      clearInterval(snoozeCountdownInterval);
      snoozeCountdownInterval = null;
    }
  }

  snoozeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.getAttribute('data-minutes'));
      const snoozeUntil = Date.now() + (minutes * 60 * 1000);

      snoozeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      safeChrome(() => {
        chrome.storage.local.set({ snoozeUntil }, () => {
          try { updateSnoozeUI(snoozeUntil); showSaveStatus(`Snoozed for ${minutes} minute${minutes === 1 ? '' : 's'}`, true); } catch {}
          safeChrome(() => {
            chrome.tabs.query({ active: true }, (tabs) => {
              try { if (tabs?.[0]) chrome.tabs.reload(tabs[0].id); } catch {}
            });
          });
        });
      });
    });
  });

  cancelSnoozeBtn.addEventListener('click', () => {
    safeChrome(() => {
      chrome.storage.local.set({ snoozeUntil: null }, () => {
        try { clearSnoozeUI(); showSaveStatus('Snooze cancelled', true); } catch {}
        safeChrome(() => {
          chrome.tabs.query({ active: true }, (tabs) => {
            try { if (tabs?.[0]) chrome.tabs.reload(tabs[0].id); } catch {}
          });
        });
      });
    });
  });

  safeChrome(() => {
    chrome.storage.local.get(['snoozeUntil'], (result) => {
      try { updateSnoozeUI(result?.snoozeUntil); } catch {}
    });
  });

  safeChrome(() => {
    chrome.storage?.onChanged?.addListener((changes, areaName) => {
      try {
        if (areaName === 'local' && changes?.snoozeUntil) {
          updateSnoozeUI(changes.snoozeUntil.newValue);
        }
      } catch {}
    });
  });
}

// Render platform list
function renderPlatformList() {
  const platformsList = document.getElementById('platformsList');
  const platforms = Object.keys(platformConfig);
  
  platformsList.innerHTML = platforms.map(platformId => {
    const config = platformConfig[platformId];
    const platformSettings = currentSettings.platforms?.[platformId] || {};
    // Check if main feed (first region) is enabled
    const mainFeedRegion = config.regions[0];
    const isEnabled = platformSettings[mainFeedRegion.id] === true;
    
    return `
      <div class="platform-item ${selectedPlatform === platformId ? 'selected' : ''}" data-platform="${platformId}">
        <div class="platform-info">
          <div class="platform-name">${config.name}</div>
          <div class="platform-urls">${config.urls.join(', ')}</div>
        </div>
        <div class="platform-toggle">
          <label class="toggle-switch">
            <input type="checkbox" class="platform-toggle-input" data-platform="${platformId}" ${isEnabled ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
      </div>
    `;
  }).join('');
  
  // Add click handlers
  platformsList.querySelectorAll('.platform-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.toggle-switch')) {
        const platformId = item.getAttribute('data-platform');
        selectPlatform(platformId);
      }
    });
  });
  
  // Add toggle handlers
  platformsList.querySelectorAll('.platform-toggle-input').forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      const platformId = toggle.getAttribute('data-platform');
      const isChecked = toggle.checked;
      
      // If enabling platform, enable only main feed (first region)
      // If disabling platform, disable all regions
      const config = platformConfig[platformId];
      const updates = {};
      
      if (isChecked) {
        // Enable only main feed (first region)
        const mainFeedRegion = config.regions[0];
        updates[mainFeedRegion.id] = true;
        // Disable all other regions
        config.regions.slice(1).forEach(region => {
          updates[region.id] = false;
        });
      } else {
        // Disable all regions
        config.regions.forEach(region => {
          updates[region.id] = false;
        });
      }
      
      if (!currentSettings.platforms) currentSettings.platforms = {};
      if (!currentSettings.platforms[platformId]) currentSettings.platforms[platformId] = {};
      
      Object.assign(currentSettings.platforms[platformId], updates);
      
      safeChrome(() => {
        chrome.storage.local.set(currentSettings, () => {
          try {
            renderPlatformDetails(platformId);
            renderPlatformList();
            showSaveStatus('Settings saved!', true);
          } catch {}
        });
      });
    });
  });
}

// Select platform
function selectPlatform(platformId) {
  selectedPlatform = platformId;
  renderPlatformList();
  renderPlatformDetails(platformId);
}

// Render platform details
function renderPlatformDetails(platformId) {
  const platformDetails = document.getElementById('platformDetails');
  const config = platformConfig[platformId];
  const platformSettings = currentSettings.platforms?.[platformId] || {};
  
  platformDetails.innerHTML = `
    <div class="platform-details-header">
      <div class="platform-details-title">${config.name}</div>
      <a href="${config.visitUrl}" target="_blank" class="visit-site-link">Visit site</a>
    </div>
    <div class="hide-regions-title">Hide regions:</div>
    <div class="regions-list">
      ${config.regions.map(region => {
        const isChecked = platformSettings[region.id] === true;
        return `
          <div class="region-item">
            <div class="region-label">
              <strong>${region.label}</strong>
              <span>${region.description}</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="${platformId}-${region.id}" ${isChecked ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  // Add change handlers for region toggles
  config.regions.forEach(region => {
    const checkbox = document.getElementById(`${platformId}-${region.id}`);
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        if (!currentSettings.platforms) currentSettings.platforms = {};
        if (!currentSettings.platforms[platformId]) currentSettings.platforms[platformId] = {};
        
        currentSettings.platforms[platformId][region.id] = checkbox.checked;
        
        safeChrome(() => {
          chrome.storage.local.set(currentSettings, () => {
            try {
              renderPlatformList();
              showSaveStatus('Settings saved!', true);
            } catch {}
          });
        });
      });
    }
  });
}

// Load settings
function loadSettings() {
  const applySettings = (result = {}) => {
    currentSettings = {
      enabled: result?.enabled !== false,
      platforms: result?.platforms || defaultSettings.platforms,
      customQuotes: result?.customQuotes || [],
      snoozeUntil: result?.snoozeUntil || null
    };
    if (!selectedPlatform) {
      selectedPlatform = Object.keys(platformConfig)[0];
    }
    renderPlatformList();
    renderPlatformDetails(selectedPlatform);
    loadCustomQuotes(currentSettings.customQuotes);
  };

  try {
    if (typeof chrome !== 'undefined' && chrome?.storage) {
      chrome.storage.local.get(['enabled', 'platforms', 'customQuotes', 'snoozeUntil'], (result) => {
        try { applySettings(result); } catch { applySettings(); }
      });
    } else {
      applySettings();
    }
  } catch {
    applySettings(); // Context invalidated
  }
}

// Show save status
function showSaveStatus(message, success) {
  const statusDiv = document.getElementById('saveStatus');
  statusDiv.textContent = message;
  statusDiv.className = 'save-status ' + (success ? 'success' : '');
  
  setTimeout(() => {
    statusDiv.className = 'save-status';
  }, 2000);
}

// Custom Quotes Management
function loadCustomQuotes(quotes) {
  const quotesList = document.getElementById('quotesList');
  
  if (!quotes || quotes.length === 0) {
    quotesList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><div>No custom quotes yet. Add your first quote above!</div></div>';
    return;
  }
  
  quotesList.innerHTML = quotes.map((quote, index) => `
    <div class="quote-item">
      <div class="quote-content">
        <div class="quote-text">"${quote.text}"</div>
        <div class="quote-author">— ${quote.author || 'Unknown'}</div>
      </div>
      <button type="button" class="delete-quote-btn" data-index="${index}">Delete</button>
    </div>
  `).join('');
  
  // Add delete handlers
  document.querySelectorAll('.delete-quote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.getAttribute('data-index'));
      deleteCustomQuote(index);
    });
  });
}

function addCustomQuote() {
  const quoteText = document.getElementById('quoteText').value.trim();
  const quoteAuthor = document.getElementById('quoteAuthor').value.trim();
  
  if (!quoteText) {
    alert('Please enter a quote');
    return;
  }
  
  const customQuotes = currentSettings.customQuotes || [];
  customQuotes.push({
    text: quoteText,
    author: quoteAuthor || 'Unknown'
  });
  
  currentSettings.customQuotes = customQuotes;
  
  safeChrome(() => {
    chrome.storage.local.set({ customQuotes }, () => {
      try {
        document.getElementById('quoteText').value = '';
        document.getElementById('quoteAuthor').value = '';
        loadCustomQuotes(customQuotes);
        showSaveStatus('Quote added!', true);
      } catch {}
    });
  });
}

function deleteCustomQuote(index) {
  const customQuotes = currentSettings.customQuotes || [];
  customQuotes.splice(index, 1);
  
  currentSettings.customQuotes = customQuotes;
  
  safeChrome(() => {
    chrome.storage.local.set({ customQuotes }, () => {
      try {
        loadCustomQuotes(customQuotes);
        showSaveStatus('Quote deleted!', true);
      } catch {}
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initSnooze();
  loadSettings();
  
  // Add quote button handler
  document.getElementById('addQuoteBtn').addEventListener('click', addCustomQuote);
  
  // Allow Enter key to add quote
  document.getElementById('quoteText').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      addCustomQuote();
    }
  });
});
