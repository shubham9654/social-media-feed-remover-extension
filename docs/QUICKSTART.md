# Quick Start Guide

Get your Social Media Feed Remover extension up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Icons (Required)

Before building, you need extension icons:

**Option A: Use the Icon Generator**
1. Open `create-icons.html` in your browser
2. Icons will auto-generate
3. Right-click each canvas and save as:
   - `icons/icon16.png` (16x16)
   - `icons/icon48.png` (48x48)
   - `icons/icon128.png` (128x128)

**Option B: Create Your Own**
- Use any image editor (Figma, Canva, Photoshop, etc.)
- Create 16x16, 48x48, and 128x128 PNG images
- Save them in the `icons/` folder

## Step 3: Build the Extension

```bash
npm run build
```

This creates a `dist/` folder with all extension files.

## Step 4: Load Extension

**For Chrome/Edge/Brave:**
1. Open your browser
2. Go to `chrome://extensions/` (or `edge://extensions/` for Edge)
3. Enable **"Developer mode"** (toggle in top right)
4. Click **"Load unpacked"**
5. Select the `dist` folder

## Step 5: Test It!

Visit these sites and see your feeds replaced with quotes:
- [Facebook](https://www.facebook.com)
- [Twitter/X](https://twitter.com)
- [Instagram](https://www.instagram.com)
- [LinkedIn](https://www.linkedin.com)
- [Reddit](https://www.reddit.com)
- [YouTube](https://www.youtube.com)

## Step 6: Configure Options

1. Click the extension icon in your browser's toolbar
2. Click **"Options"** to customize what to hide on each platform
3. Toggle specific sections (e.g., YouTube shorts, Instagram reels, etc.)
4. Save settings and reload pages to see changes

## Step 7: Toggle On/Off

Click the extension icon to open the popup and toggle the extension on/off.

## Development Mode

For development with auto-rebuild:

```bash
npm run dev
```

This watches for changes and rebuilds automatically. You'll still need to reload the extension in Chrome after each change.

## Troubleshooting

**Extension not working?**
- Make sure you ran `npm run build`
- Reload the extension in `chrome://extensions/`
- Refresh the social media page
- Check browser console (F12) for errors

**Icons missing?**
- Extension won't load without icons
- Make sure `icons/icon16.png`, `icon48.png`, and `icon128.png` exist
- They should be in the `icons/` folder (not `dist/icons/`)

**Feed still showing?**
- Some sites load content dynamically
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check if the site's HTML structure changed

## Next Steps

- **Customize platform controls**: Click extension icon → Options
- **Customize quotes**: Edit `quotes.js`
- **Modify styles**: Edit `styles/feed-replacer.css`
- **Add new platforms**: Create scripts in `content/` directory
- **Deploy**: See [DEPLOYMENT.md](DEPLOYMENT.md) for Chrome Web Store publishing

## Browser Compatibility

✅ Works on all Chromium-based browsers:
- Google Chrome 88+
- Microsoft Edge 88+
- Brave Browser
- Opera
- Vivaldi

---

Happy coding! 🚀
