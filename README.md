# Social Media Feed Remover

A modern Chrome extension that removes distracting social media feeds and replaces them with inspirational quotes. Stay focused, stay productive.

## Features

- 🎯 **Removes feeds** from major social media platforms
- 💬 **Inspirational quotes** to keep you motivated
- 🎨 **Beautiful UI** with modern design
- ⚡ **Fast & lightweight** - built with modern technologies
- 🔄 **Auto-updates** - handles dynamic content loading
- 🎛️ **Easy toggle** - enable/disable with one click
- ⚙️ **Granular controls** - customize what to hide on each platform
- 🌐 **Cross-browser** - works on Chrome, Edge, Brave, and other Chromium browsers

## Supported Platforms

- **Facebook** - Hide news feed and stories
- **Twitter/X** - Hide timeline, trends, and suggestions
- **Instagram** - Hide feed, search, reels, and stories
- **LinkedIn** - Hide feed and suggestions
- **Reddit** - Hide feed and sidebar
- **YouTube** - Hide home feed, shorts, sidebar, comments, explore, trending, and end screen

## Quick Start

See [docs/QUICKSTART.md](docs/QUICKSTART.md) for a 5-minute setup guide!

## Installation

### For Development

1. **Clone or download this repository**
   ```bash
   git clone <your-repo-url>
   cd social-media-feed-remover
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create icons** (required before building)
   - Open `create-icons.html` in your browser
   - Save the generated icons to `icons/` folder
   - Or create your own 16x16, 48x48, 128x128 PNG icons

4. **Build the extension**
   ```bash
   npm run build
   ```
   
   For development with auto-rebuild:
   ```bash
   npm run dev
   ```

5. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### For Production Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Create ZIP package**
   ```bash
   npm run package
   ```
   This creates `dist/social-media-feed-remover.zip`

3. **Deploy to Chrome Web Store**
   - See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full guide
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Click "New Item"
   - Upload the ZIP file
   - Fill in store listing details
   - Submit for review

## Project Structure

```
social-media-feed-remover/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic
├── quotes.js              # Quote database
├── build.js               # Build script
├── package.json           # Dependencies
├── content/               # Content scripts for each platform
│   ├── facebook.js
│   ├── twitter.js
│   ├── instagram.js
│   ├── linkedin.js
│   ├── reddit.js
│   └── youtube.js
├── options.html           # Options page for granular controls
├── options.js             # Options page logic
├── utils/                 # Shared utilities
│   └── feed-replacer.js
├── styles/                # CSS styles
│   └── feed-replacer.css
├── icons/                 # Extension icons (create these)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── docs/                  # Documentation
    ├── QUICKSTART.md      # 5-minute setup guide
    ├── DEPLOYMENT.md      # Chrome Web Store guide
    ├── PROJECT_SUMMARY.md # Project overview
    └── icons.md           # Icon creation guide
```

## Development

### Adding New Platforms

1. Create a new content script in `content/` directory
2. Add platform selectors and initialization logic
3. Update `manifest.json` to include the new content script
4. Rebuild the extension

### Customizing Platform Controls

Click the extension icon → "Options" to customize what sections to hide on each platform:
- **YouTube**: Toggle home feed, shorts, sidebar, comments, explore, trending, end screen
- **Instagram**: Toggle feed, search, reels, stories
- **Facebook**: Toggle feed and stories
- **Twitter/X**: Toggle timeline, trends, suggestions
- **LinkedIn**: Toggle feed and suggestions
- **Reddit**: Toggle feed and sidebar

### Customizing Quotes

Edit `quotes.js` to add, remove, or modify quotes. The extension will automatically use the updated quotes.

### Styling

Modify `styles/feed-replacer.css` to change the appearance of the quote display.

## Technologies Used

- **Manifest V3** - Latest Chrome extension standard
- **ESBuild** - Fast JavaScript bundler
- **Modern JavaScript** - ES6+ features
- **CSS3** - Modern styling with gradients and animations

## Browser Compatibility

✅ **Works on all Chromium-based browsers:**
- Google Chrome 88+
- Microsoft Edge 88+
- Brave Browser
- Opera
- Vivaldi
- Other Chromium-based browsers

The extension uses Manifest V3, the latest Chrome extension standard, ensuring compatibility across all modern Chromium browsers.

## Privacy

This extension:
- ✅ Does not collect any user data
- ✅ Does not track browsing behavior
- ✅ Does not send data to external servers
- ✅ Works entirely locally in your browser

## License

MIT License - feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Troubleshooting

### Extension not working?

1. Make sure you've built the extension (`npm run build`)
2. Reload the extension in `chrome://extensions/`
3. Refresh the social media page
4. Check the browser console for errors

### Feed still showing?

Some platforms use dynamic content loading. The extension should handle this automatically, but if issues persist:
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Check if the platform's HTML structure has changed
3. Update the selectors in the relevant content script

## Support

For issues, feature requests, or questions, please open an issue on GitHub.

---

**Made with ❤️ to help you stay focused and productive**
