# 🚂 Railway Deployment Guide - XAPE Backend

This guide will help you deploy the XAPE backend to Railway with the **TOKEN GATE ACTIVATED**.

---

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI**: Install globally
   ```bash
   npm install -g @railway/cli
   ```
3. **Git**: Ensure your code is in a Git repository

---

## 🚀 Quick Deployment (Automated)

### Option 1: Use the Deployment Script (Windows)

1. Open `DEPLOY_TO_RAILWAY.bat` (double-click or run in terminal)
2. Follow the prompts
3. Done! ✅

### Option 2: Manual Deployment via CLI

```bash
cd backend

# Login to Railway
railway login

# Initialize project (first time only)
railway init

# Deploy
railway up

# Open in browser to configure
railway open
```

---

## ⚙️ Environment Variables Setup

After deploying, you **MUST** set these environment variables in Railway:

### Required Variables:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add the following:

```
OPENAI_API_KEY=your-openai-api-key-here
DISABLE_TOKEN_GATE=false
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PORT=3000
ALLOWED_ORIGINS=*
```

### Critical Settings:

- **`DISABLE_TOKEN_GATE=false`** - This ENABLES the token gate
- **`OPENAI_API_KEY`** - Your OpenAI API key (required for AI chat)
- **`SOLANA_RPC_URL`** - Solana RPC endpoint (defaults to mainnet if not set)

---

## 🔐 Token Gate Configuration

The token gate is now **ACTIVE** with these settings:

- **Token Mint**: `CRZ2GA5jMsQJRX9jqgeapnwEKx3Cchkzc3bFVmbxpump`
- **Required Amount**: 100 XAPE tokens
- **Verification**: On page load + every API call

Users without 100 XAPE tokens will see a blocking overlay and cannot use the extension.

---

## 📡 Get Your Backend URL

After deployment:

1. Go to Railway dashboard
2. Click on your service
3. Go to "Settings" tab
4. Under "Domains", you'll see your public URL:
   - Format: `https://your-project-name.up.railway.app`
5. **Copy this URL** - you'll need it for the extension

---

## 🔧 Update Extension with New Backend URL

After getting your Railway URL, update the extension:

### Method 1: Update localStorage (Temporary)

1. Open Chrome DevTools (F12) on axiom.trade
2. Go to Console tab
3. Run:
   ```javascript
   localStorage.setItem('xape_backend_url', 'https://your-project-name.up.railway.app')
   location.reload()
   ```

### Method 2: Update Code (Permanent)

1. Open `content.js`
2. Find line ~438:
   ```javascript
   const backendUrl = localStorage.getItem('xape_backend_url') || 'https://postgres-production-958e.up.railway.app'
   ```
3. Replace with your new URL:
   ```javascript
   const backendUrl = localStorage.getItem('xape_backend_url') || 'https://YOUR-NEW-URL.up.railway.app'
   ```
4. Save and reload the extension

---

## 🧪 Test Your Deployment

1. **Check if backend is running:**
   ```bash
   curl https://your-project-name.up.railway.app/
   ```
   Should return: `{ "status": "XAPE Backend Online" }`

2. **Test token balance endpoint:**
   ```bash
   curl -X POST https://your-project-name.up.railway.app/api/check-token-balance \
     -H "Content-Type: application/json" \
     -d '{"walletAddress":"YOUR_WALLET_ADDRESS"}'
   ```
   Should return token balance data

3. **Load the extension:**
   - Go to axiom.trade
   - Connect Phantom wallet
   - Extension should check token balance and either:
     - ✅ Load if you have 100+ XAPE tokens
     - 🚫 Show overlay if you don't have enough tokens

---

## 📊 Monitor Your Deployment

### View Logs:
```bash
railway logs
```

### Check Status:
```bash
railway status
```

### Open Dashboard:
```bash
railway open
```

---

## 🐛 Troubleshooting

### Issue: "Extension context invalidated"
- **Solution**: Reload the Chrome extension

### Issue: "Backend returned HTML instead of JSON"
- **Cause**: Backend is down or URL is wrong
- **Solution**: Check Railway logs, verify URL

### Issue: Token gate not working
- **Check**: 
  1. `DISABLE_TOKEN_GATE=false` is set in Railway
  2. Backend logs show token checks
  3. Wallet is connected
  4. Using correct token mint address

### Issue: Deployment fails
- **Check**:
  1. Railway CLI is installed: `railway --version`
  2. Logged in: `railway whoami`
  3. All dependencies in package.json
  4. No syntax errors: `node server.js` locally

---

## 🔄 Update Existing Deployment

When you make changes:

```bash
cd backend
railway up
```

Railway will automatically:
1. Build the new code
2. Run tests (if configured)
3. Deploy with zero downtime
4. Restart the service

---

## 💰 Railway Pricing

- **Free Tier**: $5/month credit (enough for development)
- **Usage-based**: Pay for what you use
- **Estimate**: Small backend ~$5-10/month

Monitor usage in Railway dashboard.

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Environment variables set (especially `DISABLE_TOKEN_GATE=false`)
- [ ] Public URL obtained
- [ ] Extension updated with new backend URL
- [ ] Token gate tested (with wallet that has/doesn't have tokens)
- [ ] AI chat functionality tested
- [ ] Logs checked for errors

---

## 🆘 Need Help?

1. Check Railway logs: `railway logs`
2. Check Railway docs: [docs.railway.app](https://docs.railway.app)
3. Check XAPE backend logs in Railway dashboard

---

**🔐 Token Gate Status: ACTIVE**  
**💪 Users need 100 XAPE tokens to use the extension**

