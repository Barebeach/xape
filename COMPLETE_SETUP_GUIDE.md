# 🚀 XAPE Complete Setup Guide

## ✅ What's Been Done

### 1. Backend Deployed to Railway ✅
- **URL:** `https://postgres-production-958e.up.railway.app`
- **Status:** Online and running
- **Database:** PostgreSQL connected
- **API:** All endpoints working

### 2. Extension Updated ✅
- **Backend Connection:** Now points to Railway (no more localhost)
- **Files Modified:**
  - `skillbar-classes.js` - All API calls updated
  - `manifest.json` - Railway URL added to permissions
  - `config.js` - NEW configuration file
- **Status:** Ready to use

### 3. Website Ready ✅
- **Dev Server:** Running on `http://localhost:5173`
- **Production Build:** Compiled and ready
- **Status:** Ready to deploy to Railway

---

## 🎯 Quick Start - Using the Extension

### Step 1: Reload Extension
1. Open Chrome and go to `chrome://extensions/`
2. Find "XAPE - AI Crypto Agent"
3. Click the **🔄 Reload** button

### Step 2: Visit Axiom
1. Go to https://axiom.trade
2. Look for the **XAPE AI button** (glowing cyan button)
3. Click it to activate

### Step 3: Test Connection
1. Open browser console (F12)
2. Look for these messages:
   ```
   ✅ XAPE Configuration loaded
   🌐 Backend URL: https://postgres-production-958e.up.railway.app
   ```

### Step 4: Use XAPE
- **Click the XAPE button** to open the AI panel
- **Ask questions:** "What is Bitcoin?"
- **Voice commands:** Click the microphone icon
- **Real-time news:** Automatically appears when available

---

## 🌐 Website Deployment (Optional)

The website is already built and ready. To deploy:

### Option 1: Railway CLI
```bash
cd website
railway link
# Select: backend project
# Create new service: "website"
railway up
railway domain
```

### Option 2: Railway Dashboard
1. Go to https://railway.app
2. Open your "backend" project
3. Click **"+ New"** → **"Service"**
4. Select **"From GitHub"** or **"Empty Service"**
5. Set root directory to `/website`
6. Deploy

Your website will be live at: `https://your-website.up.railway.app`

---

## 🧪 Testing Everything

### Test 1: Backend API
Open `test-backend-connection.html` in your browser:
```bash
# Open file directly or use a local server
start test-backend-connection.html
```

This will test all API endpoints automatically.

### Test 2: Extension on Axiom
1. Visit https://axiom.trade
2. Open console (F12)
3. Check for XAPE initialization logs
4. Click XAPE button
5. Ask: "Tell me about Solana"

### Test 3: Voice Commands
1. Click XAPE button on Axiom
2. Click the microphone icon
3. Say: "What is Bitcoin?"
4. XAPE should respond with voice

---

## 📁 Project Structure

```
orgy/
├── backend/                          # Backend (DEPLOYED ✅)
│   ├── server.js                     # Main server
│   ├── package.json                  # Dependencies
│   ├── railway.toml                  # Railway config
│   └── config.env                    # Environment (local only)
│
├── website/                          # Website (Ready to deploy)
│   ├── src/                          # Source files
│   ├── public/                       # Static assets
│   ├── dist/                         # Built files
│   ├── package.json                  # Dependencies
│   ├── railway.toml                  # Railway config
│   └── serve.js                      # Production server
│
├── Extension Files:                  # Chrome Extension (UPDATED ✅)
│   ├── manifest.json                 # Extension manifest
│   ├── config.js                     # Backend configuration
│   ├── content.js                    # Main content script
│   ├── skillbar-classes.js           # API calls (updated)
│   ├── xape-speech.js                # Voice system
│   └── popup.html/js                 # Extension popup
│
└── Documentation:
    ├── DEPLOYMENT_STATUS.md          # Deployment summary
    ├── BACKEND_API_REFERENCE.md      # API documentation
    ├── COMPLETE_SETUP_GUIDE.md       # This file
    └── test-backend-connection.html  # Test tool
```

---

## 🔧 Configuration Files

### Backend URL (config.js)
```javascript
const XAPE_CONFIG = {
  BACKEND_URL: 'https://postgres-production-958e.up.railway.app',
  // ... other config
}
```

### Change Backend URL (if needed)
**Option 1:** Edit `config.js` and reload extension

**Option 2:** In browser console:
```javascript
localStorage.setItem('xape_backend_url', 'YOUR_NEW_URL')
```

---

## 🎨 Features Working

- ✅ AI Chat (OpenAI powered)
- ✅ Voice Commands (Speech Recognition)
- ✅ Real-time Crypto News
- ✅ Token Gating (Solana)
- ✅ Wallet Analysis
- ✅ Market Data Integration
- ✅ Scam Detection
- ✅ Animated Heatmaps
- ✅ Keyboard Shortcuts (Q/W/E/R/A/S/D/F)

---

## 🐛 Troubleshooting

### Extension Not Connecting
**Problem:** XAPE doesn't appear on axiom.trade

**Solutions:**
1. Reload extension: `chrome://extensions/` → Reload
2. Hard refresh page: `Ctrl + Shift + R`
3. Check console for errors: `F12`
4. Verify backend is online: Visit `https://postgres-production-958e.up.railway.app`

### Backend Not Responding
**Problem:** API calls failing

**Solutions:**
1. Check Railway status: Go to Railway dashboard
2. View logs: `railway logs` (in backend folder)
3. Restart service: In Railway dashboard
4. Check environment variables are set

### Voice Not Working
**Problem:** XAPE doesn't respond to voice

**Solutions:**
1. Check microphone permissions in browser
2. Click the microphone icon in XAPE panel
3. Ensure browser supports Speech Recognition (Chrome/Edge)
4. Check console for errors

### News Not Updating
**Problem:** No crypto news appearing

**Solutions:**
1. News fetches every 5 minutes (cached)
2. Force refresh: Click "fetch news" button in XAPE
3. Check API key in Railway environment variables
4. View backend logs for API errors

---

## 🔐 Security Notes

### Environment Variables (Railway)
These are set on Railway (not in code):
- `DATABASE_URL` - PostgreSQL connection
- `OPENAI_API_KEY` - OpenAI API key
- `PORT` - Auto-assigned by Railway
- `NODE_ENV` - production

### Never Commit:
- ❌ `config.env` (contains API keys)
- ❌ `.env` files
- ❌ `node_modules/`

---

## 📊 Monitoring

### Check Backend Health
```bash
# Using curl
curl https://postgres-production-958e.up.railway.app/

# Should return: {"status": "online", ...}
```

### Check Railway Logs
```bash
cd backend
railway logs
```

### Check Database
Railway provides a PostgreSQL dashboard in the project.

---

## 🎯 Next Steps

1. ✅ Test extension on axiom.trade
2. ⏳ Deploy website (optional)
3. ⏳ Set up custom domain (optional)
4. ⏳ Add Telegram bot (optional)
5. ⏳ Monitor usage and optimize

---

## 📞 Support

### Files to Check:
- `DEPLOYMENT_STATUS.md` - Current status
- `BACKEND_API_REFERENCE.md` - API docs
- `test-backend-connection.html` - Test tool

### Common Commands:
```bash
# Reload extension
# Go to chrome://extensions/ and click reload

# View website locally
cd website
npm run dev

# View backend logs
cd backend
railway logs

# Deploy website
cd website
railway up
```

---

## ✨ You're All Set!

Your XAPE AI Assistant is now:
- 🌐 Connected to hosted backend (Railway)
- 🧠 Powered by OpenAI
- 🗣️ Voice-enabled
- 📰 Real-time news integrated
- 🔐 Token-gated
- ⚡ Fast and responsive

**Just reload the extension and visit axiom.trade!**

---

Made with 🧠 by XAPE Team

