# Deployment Guide - Social Media Feed Remover

This guide will walk you through deploying your Chrome extension to the Chrome Web Store.

## Prerequisites

1. **Google Account** - You'll need a Google account
2. **Chrome Web Store Developer Account** - One-time $5 registration fee
3. **Extension Files** - Built and ready extension

## Step 1: Prepare Your Extension

### 1.1 Create Icons

Before building, you need to create extension icons:

1. Open `create-icons.html` in your browser
2. Click "Generate Icons" 
3. Right-click each canvas and save as:
   - `icons/icon16.png`
   - `icons/icon48.png`
   - `icons/icon128.png`

Alternatively, create your own icons:
- Use design tools (Figma, Canva, Photoshop, etc.)
- Size: 16x16, 48x48, 128x128 pixels
- Format: PNG with transparency
- Design: Simple, recognizable, works at small sizes

### 1.2 Build the Extension

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Verify the dist/ folder contains all files
```

### 1.3 Test Locally

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder
5. Test on supported social media sites:
   - Facebook
   - Twitter/X
   - Instagram
   - LinkedIn
   - Reddit

### 1.4 Create ZIP Package

```bash
npm run package
```

This creates `dist/social-media-feed-remover.zip` ready for upload.

## Step 2: Chrome Web Store Developer Account

### 2.1 Register as Developer

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 registration fee
4. Accept the Developer Agreement

## Step 3: Upload Your Extension

### 3.1 Create New Item

1. In the Developer Dashboard, click **"New Item"**
2. Click **"Choose File"** and select `dist/social-media-feed-remover.zip`
3. Click **"Upload"**

### 3.2 Fill Store Listing

Complete all required fields:

#### **Product Details**

- **Name**: Social Media Feed Remover
- **Summary**: Remove distracting social media feeds and replace them with inspirational quotes
- **Description**: 
  ```
  Stay focused and productive with Social Media Feed Remover. This extension removes distracting feeds from Facebook, Twitter/X, Instagram, LinkedIn, and Reddit, replacing them with inspirational quotes.
  
  Features:
  • Removes feeds from major social media platforms
  • Beautiful quote display with modern design
  • Easy toggle to enable/disable
  • Works with dynamic content loading
  • Privacy-focused - no data collection
  
  Perfect for anyone who wants to use social media without getting sucked into endless scrolling.
  ```

#### **Graphics**

- **Icon**: Upload `icons/icon128.png`
- **Screenshots**: Take 1-5 screenshots showing:
  - Extension popup
  - Quote display on Facebook
  - Quote display on Twitter/X
  - Settings/options (if any)
  
  Screenshot requirements:
  - Minimum: 1280x800 or 640x400 pixels
  - Format: PNG or JPEG
  - Show actual extension in use

- **Promotional Images** (optional but recommended):
  - Small tile: 440x280 pixels
  - Large tile: 920x680 pixels
  - Marquee: 1400x560 pixels

#### **Categorization**

- **Category**: Productivity
- **Language**: English (and others if you translate)
- **Tags**: productivity, focus, social-media, distraction-blocker

#### **Privacy**

- **Single purpose**: Yes
- **Host permissions**: Explain why you need access to social media sites
- **Data handling**: 
  - No user data collection
  - No external data transmission
  - All processing is local

### 3.3 Privacy Practices

Fill out the privacy section:

- **Does your extension collect user data?** No
- **Does your extension transmit user data?** No
- **Does your extension use encryption?** N/A (no data transmission)

### 3.4 Distribution

- **Visibility**: Choose "Public" or "Unlisted"
- **Regions**: Select where to distribute (or "All regions")
- **Pricing**: Free

## Step 4: Submit for Review

1. Review all information
2. Click **"Submit for Review"**
3. Wait for review (typically 1-7 days)

## Step 5: After Approval

Once approved:

1. Your extension will be live on the Chrome Web Store
2. Users can install it
3. You'll receive email notifications about:
   - New installs
   - Reviews
   - Updates needed

## Step 6: Updating Your Extension

When you need to update:

1. Update version in `manifest.json`:
   ```json
   "version": "1.0.1"
   ```

2. Rebuild:
   ```bash
   npm run build
   npm run package
   ```

3. In Developer Dashboard:
   - Go to your extension
   - Click "Package"
   - Upload new ZIP
   - Add release notes
   - Submit update

## Tips for Success

### Store Listing Optimization

- **Clear description**: Explain what it does and why users need it
- **Good screenshots**: Show the extension working
- **Keywords**: Use relevant tags for discoverability
- **Regular updates**: Keep it updated with platform changes

### Maintaining Your Extension

- **Monitor reviews**: Respond to user feedback
- **Fix bugs**: Address issues quickly
- **Update selectors**: Social media sites change their HTML structure
- **Test regularly**: Test on all supported platforms

### Common Issues

**Rejection Reasons:**
- Missing privacy policy (if collecting data)
- Vague description
- Poor screenshots
- Violation of single purpose policy
- Security issues

**Solutions:**
- Be clear about what your extension does
- Provide detailed descriptions
- Include good screenshots
- Follow Chrome Web Store policies
- Test thoroughly before submission

## Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/devguide/)

## Support

If you encounter issues:
1. Check Chrome Web Store policies
2. Review rejection reasons (if rejected)
3. Test extension thoroughly
4. Check browser console for errors

---

Good luck with your deployment! 🚀
