# XAPE - Chrome Web Store Submission Guide

## 📋 Extension Information

### Basic Details
- **Name**: XAPE - AI Crypto Agent
- **Version**: 1.0
- **Category**: Productivity
- **Language**: English

### Short Description (132 characters max)
```
AI-powered crypto analysis for axiom.trade with voice assistant, real-time insights, and scam detection.
```

### Detailed Description
```
XAPE is your AI-powered cryptocurrency trading assistant designed specifically for axiom.trade. 

✨ KEY FEATURES (v1):
• 🎨 Heatmap: Color-coded coins by market cap (red→yellow→green→blue→purple)
• 💙 Cabal Alerts: Blue glow when cabals buy - instant visual alert
• 👁️ X-Ray Vision: High contrast design - spot opportunities instantly
• 📰 News: Ask XAPE for latest crypto news & market updates
• 🔍 Analysis: Real-time holder tracking, wallet ages, scam detection
• 🤖 AI Assistant: Natural language interaction with XAPE
• 🎯 Smart Monitoring: Track market cap growth, holder counts in real-time
• 🛡️ Security: Token-gated access (100 XAPE tokens required)

🎤 VOICE CONTROL:
• Press Caps Lock to activate XAPE
• Blue orb indicates XAPE is listening
• Say "stop" to interrupt at any time
• Natural language commands (e.g., "stop breaking news")
• Click orb anytime to see how it works

🚀 COMING IN v2:
• Advanced AI trading strategies
• Portfolio management
• Multi-DEX support
• Advanced charting tools

⚠️ REQUIREMENTS:
• Must hold 100 XAPE tokens for access
• Works exclusively on axiom.trade
• Microphone access required for voice features

🔐 PRIVACY & SECURITY:
• No personal data collection
• Secure wallet integration
• Token verification via blockchain
• All data processed locally

Perfect for crypto traders who want intelligent, real-time market insights with hands-free voice control.
```

### Screenshots Required
1. **Main Extension Interface** - Show skillbar with features
2. **Heatmap View** - Color-coded coins
3. **Cabal Alert** - Blue glow demonstration
4. **Voice Assistant** - XAPE orb active
5. **News Feature** - Breaking news display

---

## 🔒 Permissions Justification

### Required Permissions:

1. **storage**
   - **Why**: Store user preferences, token balance cache, news state
   - **User Benefit**: Persistent settings across sessions

2. **activeTab**
   - **Why**: Interact with axiom.trade page content
   - **User Benefit**: Real-time coin data extraction and display

3. **scripting**
   - **Why**: Inject XAPE UI and monitoring features
   - **User Benefit**: Seamless integration with axiom.trade

### Host Permissions:

1. **`*://*.twitter.com/*`, `*://twitter.com/*`**
   - **Why**: Analyze token social media links
   - **User Benefit**: Social media verification for scam detection

2. **`https://postgres-production-958e.up.railway.app/*`**
   - **Why**: Backend API for AI features, news, token verification
   - **User Benefit**: Real-time AI responses and blockchain data

3. **`http://localhost:3000/*`, `http://127.0.0.1:3000/*`**
   - **Why**: Development/testing endpoints (can be removed for production)
   - **User Benefit**: N/A (remove these for store submission)

---

## 📦 Files to Include

### Essential Files:
- ✅ `manifest.json`
- ✅ `content.js`
- ✅ `skillbar-classes.js`
- ✅ `border-animation.js`
- ✅ `scam-detector.js`
- ✅ `cabal-monitor.js`
- ✅ `time-grouping.js`
- ✅ `xape-phonetic-utils.js`
- ✅ `xape-data-extractors.js`
- ✅ `xape-wallet-analysis.js`
- ✅ `xape-helper-utils.js`
- ✅ `xape-speech.js`
- ✅ `xape-ui-builder.js`
- ✅ `xape-html-templates.js`
- ✅ `xape-voice-processor.js`
- ✅ `xape-validation.js`
- ✅ `xape-animations.js`
- ✅ `xape-market-cap.js`
- ✅ `config.js`
- ✅ `styles.css`
- ✅ `popup.html`
- ✅ `popup.js`

### Icons:
- ✅ `icons/logo16.png`
- ✅ `icons/logo.png`
- ✅ `icons/brain.gif`

### Documentation:
- ✅ `README.md`

### Files to EXCLUDE:
- ❌ `backend/` (backend code not needed in extension)
- ❌ `website/` (marketing site not needed)
- ❌ `node_modules/`
- ❌ `.git/`
- ❌ `*.backup` files
- ❌ `.bat` files
- ❌ `*.rar` archives
- ❌ Testing scripts

---

## ⚠️ Pre-Submission Checklist

### Code Cleanup:
- ✅ Removed localhost URLs from production (keep only Railway backend)
- ✅ Removed excessive console.log spam
- ✅ Removed "Voice" feature from v1 description (moving to v2)
- ⚠️ Keep only essential error logging (console.error for critical issues)

### Testing:
- [ ] Test on fresh Chrome profile
- [ ] Verify token gating works
- [ ] Test voice commands (Caps Lock activation)
- [ ] Test "stop" command interruption
- [ ] Verify news toggle (enable/disable)
- [ ] Test name extraction (setup flow)
- [ ] Check all features on axiom.trade

### Privacy & Security:
- [ ] Review all API calls (ensure HTTPS)
- [ ] Verify no PII collection
- [ ] Check token verification security
- [ ] Ensure localStorage data is minimal

### Final Review:
- [ ] All console.log spam removed
- [ ] No hardcoded credentials
- [ ] Backend URL is production (Railway)
- [ ] Manifest version is correct (1.0)
- [ ] Icons are correct size (16x16, 128x128)
- [ ] README is user-friendly

---

## 🚀 Submission Steps

1. **Clean Build**:
   ```bash
   # Remove unnecessary files
   rm -rf backend/ website/ node_modules/ *.backup *.bat *.rar
   ```

2. **Update manifest.json**:
   - Remove localhost permissions (lines for localhost:3000)
   - Verify version number
   - Check all URLs

3. **Create ZIP**:
   - Include only essential extension files
   - Do NOT include backend, website, or dev files
   - ZIP should be < 2MB

4. **Upload to Chrome Web Store**:
   - Go to: https://chrome.google.com/webstore/devconsole
   - Click "New Item"
   - Upload ZIP file
   - Fill in store listing details
   - Upload 5 screenshots (1280x800 or 640x400)
   - Add promotional images (optional)

5. **Store Listing**:
   - Copy description from above
   - Add screenshots
   - Set privacy policy URL (if applicable)
   - Select "Productivity" category
   - Set age rating (13+)

6. **Submit for Review**:
   - Review all information
   - Submit for Google review
   - Wait 1-3 days for approval

---

## 📸 Screenshot Guidelines

### Required Sizes:
- **Small**: 640x400 or 1280x800 (PNG or JPEG)
- **Promotional**: 1400x560 (PNG or JPEG, optional)

### Screenshot Ideas:
1. **Hero Shot**: Full axiom.trade with XAPE active
2. **Heatmap**: Show color-coded coins (red to purple)
3. **Cabal Alert**: Coin with blue glow
4. **Voice Assistant**: XAPE orb with blue indicator
5. **News Feed**: Breaking news displayed

---

## ⚡ Quick Reference

### Token Contract:
- **XAPE Token**: (Add Solana token address here)
- **Required Balance**: 100 XAPE
- **Blockchain**: Solana

### Backend API:
- **Production**: https://postgres-production-958e.up.railway.app
- **Endpoints**: /api/chat, /api/news, /api/balance

### Support:
- **Issues**: (Add GitHub issues URL)
- **Contact**: (Add support email)

---

## 📝 Post-Approval Checklist

- [ ] Announce on social media
- [ ] Update website with Chrome Store link
- [ ] Add badge to README
- [ ] Monitor user reviews
- [ ] Track usage analytics
- [ ] Plan v2 features

---

**Last Updated**: October 22, 2024
**Prepared By**: XAPE Development Team

