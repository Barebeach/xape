# XAPE - AI Crypto Agent Extension

AI-powered crypto analysis for axiom.trade with voice commands and real-time insights.

## 📦 Project Structure

### Core Files
- `manifest.json` - Extension configuration
- `content.js` - Main content script initialization
- `skillbar-classes.js` - Main AxiomSkillBar class (7,376 lines)
- `popup.html` / `popup.js` - Extension popup
- `styles.css` - All styling

### Utility Modules (11 files)
1. `xape-phonetic-utils.js` - Speech recognition corrections
2. `xape-data-extractors.js` - Coin data scraping
3. `xape-wallet-analysis.js` - Red flag detection
4. `xape-helper-utils.js` - Page detection & helpers
5. `xape-speech.js` - Text-to-speech
6. `xape-ui-builder.js` - UI components
7. `xape-html-templates.js` - HTML templates
8. `xape-voice-processor.js` - Voice command processing
9. `xape-validation.js` - Input validation
10. `xape-animations.js` - Canvas animations
11. `xape-market-cap.js` - Market cap calculations

### Feature Modules
- `border-animation.js` - Initialization animations
- `scam-detector.js` - Scam detection logic
- `cabal-monitor.js` - Cabal tracking
- `time-grouping.js` - Time-based grouping

### Assets
- `logo.png` - Extension logo
- `xape.mp3` - Initialization sound
- `icons/` - Extension icons
- `backend/` - Node.js backend server

## 🚀 Quick Start

1. **Start Backend**:
   ```bash
   START_BACKEND.bat
   ```

2. **Load Extension**:
   - Open Chrome
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this folder

3. **Initialize**:
   - Navigate to `axiom.trade/pulse`
   - Say "initialize"
   - Use Caps Lock to talk to XAPE

## 🎯 Features

- **Voice Commands**: Control with your voice
- **Market Analysis**: Real-time coin data
- **Wallet Analysis**: Detect suspicious patterns
- **Trading Skillbar**: Quick buy/sell hotkeys
- **Heatmap System**: Visual market cap indicators
- **Balance Tracking**: Monitor SOL/USDC balance
- **P&L Tracking**: Track profit/loss on trades

## 📊 Code Statistics

- **Total Lines**: ~9,200 lines
- **Main File**: 7,376 lines (AxiomSkillBar class)
- **Utility Files**: ~1,800 lines (11 modules)
- **Reduction**: 10.5% from original 8,243 lines

## 🔧 Development

### Testing
- `TEST_BACKEND.bat` - Test backend connection
- `TEST_XAPE.bat` - Test XAPE functionality

### Backups
- `skillbar-classes.js.backup` - Main file backup
- `styles.css.backup` - Styles backup

## ⚠️ Important Notes

- Extension requires backend server running
- Voice commands use browser's speech recognition
- Caps Lock toggles listening mode
- Works only on axiom.trade domain

## 📝 Version

**v0.1** - Initial release with core features

## 🎉 Status

✅ Extension works  
✅ Code is modular  
✅ 11 utility files extracted  
✅ Clean codebase  
✅ Ready for production  

---

**Reload extension and test!** 🚀

















