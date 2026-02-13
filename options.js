/**
 * Options Page Script
 * Handles settings UI and storage with auto-save
 */

// Default settings
const defaultSettings = {
  enabled: true,
  platforms: {
    youtube: {
      hideHomeFeed: true,
      hideShorts: true,
      hideSidebar: true,
      hideComments: true,
      hideExplore: true,
      hideTrending: true,
      hideEndScreen: true
    },
    instagram: {
      hideFeed: true,
      hideSearch: true,
      hideReels: true,
      hideStories: true
    },
    facebook: {
      hideFeed: true,
      hideStories: true
    },
    twitter: {
      hideFeed: true,
      hideTrends: true,
      hideSuggestions: true
    },
    linkedin: {
      hideFeed: true,
      hideSuggestions: true
    },
    reddit: {
      hideFeed: true,
      hideSidebar: true
    }
  },
  customQuotes: []
};

// Initialize accordion functionality
function initAccordion() {
  const accordions = document.querySelectorAll('.accordion');
  
  accordions.forEach(accordion => {
    const header = accordion.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      accordion.classList.toggle('active');
    });
  });
}

// Auto-save function
function autoSave() {
  const settings = {
    enabled: true,
    platforms: {
      youtube: {
        hideHomeFeed: document.getElementById('youtube-hideHomeFeed').checked,
        hideShorts: document.getElementById('youtube-hideShorts').checked,
        hideSidebar: document.getElementById('youtube-hideSidebar').checked,
        hideComments: document.getElementById('youtube-hideComments').checked,
        hideExplore: document.getElementById('youtube-hideExplore').checked,
        hideTrending: document.getElementById('youtube-hideTrending').checked,
        hideEndScreen: document.getElementById('youtube-hideEndScreen').checked
      },
      instagram: {
        hideFeed: document.getElementById('instagram-hideFeed').checked,
        hideSearch: document.getElementById('instagram-hideSearch').checked,
        hideReels: document.getElementById('instagram-hideReels').checked,
        hideStories: document.getElementById('instagram-hideStories').checked
      },
      facebook: {
        hideFeed: document.getElementById('facebook-hideFeed').checked,
        hideStories: document.getElementById('facebook-hideStories').checked
      },
      twitter: {
        hideFeed: document.getElementById('twitter-hideFeed').checked,
        hideTrends: document.getElementById('twitter-hideTrends').checked,
        hideSuggestions: document.getElementById('twitter-hideSuggestions').checked
      },
      linkedin: {
        hideFeed: document.getElementById('linkedin-hideFeed').checked,
        hideSuggestions: document.getElementById('linkedin-hideSuggestions').checked
      },
      reddit: {
        hideFeed: document.getElementById('reddit-hideFeed').checked,
        hideSidebar: document.getElementById('reddit-hideSidebar').checked
      }
    }
  };
  
  chrome.storage.local.get(['customQuotes'], (result) => {
    settings.customQuotes = result.customQuotes || [];
    chrome.storage.local.set(settings, () => {
      showSaveStatus('Settings saved!', true);
    });
  });
}

// Load settings
function loadSettings() {
  chrome.storage.local.get(['enabled', 'platforms', 'customQuotes'], (result) => {
    const settings = {
      enabled: result.enabled !== false,
      platforms: result.platforms || defaultSettings.platforms,
      customQuotes: result.customQuotes || []
    };
    
    // Apply settings to form
    applySettingsToForm(settings);
    
    // Load custom quotes
    loadCustomQuotes(settings.customQuotes);
  });
}

// Apply settings to form
function applySettingsToForm(settings) {
  // YouTube
  document.getElementById('youtube-hideHomeFeed').checked = settings.platforms.youtube?.hideHomeFeed !== false;
  document.getElementById('youtube-hideShorts').checked = settings.platforms.youtube?.hideShorts !== false;
  document.getElementById('youtube-hideSidebar').checked = settings.platforms.youtube?.hideSidebar !== false;
  document.getElementById('youtube-hideComments').checked = settings.platforms.youtube?.hideComments !== false;
  document.getElementById('youtube-hideExplore').checked = settings.platforms.youtube?.hideExplore !== false;
  document.getElementById('youtube-hideTrending').checked = settings.platforms.youtube?.hideTrending !== false;
  document.getElementById('youtube-hideEndScreen').checked = settings.platforms.youtube?.hideEndScreen !== false;
  
  // Instagram
  document.getElementById('instagram-hideFeed').checked = settings.platforms.instagram?.hideFeed !== false;
  document.getElementById('instagram-hideSearch').checked = settings.platforms.instagram?.hideSearch !== false;
  document.getElementById('instagram-hideReels').checked = settings.platforms.instagram?.hideReels !== false;
  document.getElementById('instagram-hideStories').checked = settings.platforms.instagram?.hideStories !== false;
  
  // Facebook
  document.getElementById('facebook-hideFeed').checked = settings.platforms.facebook?.hideFeed !== false;
  document.getElementById('facebook-hideStories').checked = settings.platforms.facebook?.hideStories !== false;
  
  // Twitter
  document.getElementById('twitter-hideFeed').checked = settings.platforms.twitter?.hideFeed !== false;
  document.getElementById('twitter-hideTrends').checked = settings.platforms.twitter?.hideTrends !== false;
  document.getElementById('twitter-hideSuggestions').checked = settings.platforms.twitter?.hideSuggestions !== false;
  
  // LinkedIn
  document.getElementById('linkedin-hideFeed').checked = settings.platforms.linkedin?.hideFeed !== false;
  document.getElementById('linkedin-hideSuggestions').checked = settings.platforms.linkedin?.hideSuggestions !== false;
  
  // Reddit
  document.getElementById('reddit-hideFeed').checked = settings.platforms.reddit?.hideFeed !== false;
  document.getElementById('reddit-hideSidebar').checked = settings.platforms.reddit?.hideSidebar !== false;
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
    quotesList.innerHTML = '<div class="empty-state">No custom quotes yet. Add your first quote above!</div>';
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
  
  chrome.storage.local.get(['customQuotes'], (result) => {
    const customQuotes = result.customQuotes || [];
    customQuotes.push({
      text: quoteText,
      author: quoteAuthor || 'Unknown'
    });
    
    chrome.storage.local.set({ customQuotes }, () => {
      document.getElementById('quoteText').value = '';
      document.getElementById('quoteAuthor').value = '';
      loadCustomQuotes(customQuotes);
      showSaveStatus('Quote added!', true);
    });
  });
}

function deleteCustomQuote(index) {
  chrome.storage.local.get(['customQuotes'], (result) => {
    const customQuotes = result.customQuotes || [];
    customQuotes.splice(index, 1);
    
    chrome.storage.local.set({ customQuotes }, () => {
      loadCustomQuotes(customQuotes);
      showSaveStatus('Quote deleted!', true);
    });
  });
}

// Set up auto-save for all toggles
function setupAutoSave() {
  const allToggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
  
  allToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      autoSave();
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initAccordion();
  loadSettings();
  setupAutoSave();
  
  // Add quote button handler
  document.getElementById('addQuoteBtn').addEventListener('click', addCustomQuote);
  
  // Allow Enter key to add quote
  document.getElementById('quoteText').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      addCustomQuote();
    }
  });
});
