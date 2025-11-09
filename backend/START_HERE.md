# 🚀 XAPE Backend - Railway Deployment

## 📁 What's in this folder?

✅ **Ready to deploy with TOKEN GATE ACTIVATED**

### Deployment Files:
- `DEPLOY_TO_RAILWAY.bat` - Automated deployment script (just double-click!)
- `QUICK_DEPLOY.md` - 5-minute deployment guide
- `RAILWAY_SETUP.md` - Complete setup documentation
- `set-railway-env.bat` - Set environment variables automatically

### Server Files:
- `server.js` - Main backend server with token gating
- `package.json` - Dependencies
- `railway.toml` - Railway configuration
- `config.env` - Local environment variables (NOT uploaded to Railway)

---

## ⚡ FASTEST WAY TO DEPLOY (30 seconds)

### 1️⃣ Install Railway CLI (first time only)
```bash
npm install -g @railway/cli
```

### 2️⃣ Run the deployment script
**Just double-click:** `DEPLOY_TO_RAILWAY.bat`

OR run in terminal:
```bash
cd "C:\Users\Phill\Desktop\rest of s\backend"
.\DEPLOY_TO_RAILWAY.bat
```

### 3️⃣ Set your OpenAI API key in Railway
After deployment completes:
1. Browser will open Railway dashboard
2. Click your service → "Variables" tab
3. Add: `OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE`

### 4️⃣ Get your URL and test
1. Copy the URL from Railway (Settings → Domains)
2. Visit: `https://your-app.up.railway.app/`
3. Should see: `{"status":"XAPE Backend Online"}`

✅ **Done! Your backend is live with token gate active!**

---

## 🔐 Token Gate Settings

**Status**: ✅ **ACTIVE**

- **Token Required**: 100 XAPE tokens
- **Token Mint**: `CRZ2GA5jMsQJRX9jqgeapnwEKx3Cchkzc3bFVmbxpump`
- **Enforcement**: Page load + every API call
- **Disable**: Set `DISABLE_TOKEN_GATE=true` in Railway (not recommended)

Users without 100 XAPE tokens will see a blocking overlay and cannot use the extension.

---

## 🔧 Connect Extension to Railway Backend

After deployment, update your extension with the new URL:

### Quick Method (Chrome DevTools):
1. Go to axiom.trade
2. Press F12 (open DevTools)
3. Console tab, paste:
```javascript
localStorage.setItem('xape_backend_url', 'https://YOUR-URL.up.railway.app')
location.reload()
```

### Permanent Method (Edit Code):
1. Open `content.js` in your extension folder
2. Find line ~438:
```javascript
const backendUrl = localStorage.getItem('xape_backend_url') || 'https://postgres-production-958e.up.railway.app'
```
3. Replace with your Railway URL:
```javascript
const backendUrl = localStorage.getItem('xape_backend_url') || 'https://YOUR-URL.up.railway.app'
```
4. Reload extension in Chrome

---

## 📊 Monitor Your Backend

### View live logs:
```bash
railway logs
```

### Check status:
```bash
railway status
```

### Open dashboard:
```bash
railway open
```

---

## ✅ Post-Deployment Checklist

After deploying, verify:

- [ ] Backend is live (visit URL, see `{"status":"XAPE Backend Online"}`)
- [ ] Environment variables set in Railway:
  - [ ] `OPENAI_API_KEY` - Your OpenAI key
  - [ ] `DISABLE_TOKEN_GATE=false` - Token gate enabled
  - [ ] `SOLANA_RPC_URL` - Solana RPC endpoint
- [ ] Extension updated with new backend URL
- [ ] Token gate works (test with wallet that has/doesn't have 100 XAPE)
- [ ] AI chat works when token gate passes
- [ ] Logs show no errors (`railway logs`)

---

## 🧪 Test Token Gate

### Test Case 1: User WITHOUT tokens
1. Go to axiom.trade
2. Connect wallet (with < 100 XAPE)
3. Should see: **Blocking overlay** with message:
   - "🔒 XAPE Token Required"
   - "You need 100 XAPE tokens to use this extension"
   - Button: "Get XAPE Tokens"

### Test Case 2: User WITH tokens
1. Go to axiom.trade
2. Connect wallet (with 100+ XAPE)
3. Should see: **Extension loads normally**
   - Skillbar appears at bottom
   - All features accessible

### Test Case 3: No wallet connected
1. Go to axiom.trade (no wallet)
2. Should see: **Blocking overlay**
   - "👛 Wallet Not Connected"
   - Button: "Connect Wallet"

---

## 🔄 Deploy Future Updates

Made changes to your backend? Just run:

```bash
cd "C:\Users\Phill\Desktop\rest of s\backend"
railway up
```

Railway automatically:
- ✅ Builds new code
- ✅ Runs with zero downtime
- ✅ Keeps all environment variables
- ✅ Restarts service

---

## 💰 Estimated Costs

- **Free Tier**: $5/month credit (good for development)
- **Production**: ~$5-10/month for small backend
- **Monitor usage**: Railway dashboard

---

## 🐛 Common Issues

### "Railway CLI not found"
**Fix:** Install it
```bash
npm install -g @railway/cli
```

### "Not logged in to Railway"
**Fix:** Login
```bash
railway login
```

### "Backend returned HTML instead of JSON"
**Fix:** Backend is down or wrong URL
- Check Railway logs: `railway logs`
- Verify URL in extension matches Railway URL

### "Extension context invalidated"
**Fix:** Reload extension
- Go to `chrome://extensions`
- Click reload button on XAPE extension

### Token gate not blocking users
**Fix:** Check Railway environment variables
- `DISABLE_TOKEN_GATE` should be `false` (or not set)
- Restart service if you just changed it

---

## 📚 Additional Resources

- **Quick Start**: `QUICK_DEPLOY.md`
- **Full Guide**: `RAILWAY_SETUP.md`
- **Railway Docs**: https://docs.railway.app
- **Solana Docs**: https://docs.solana.com

---

## 🎯 Summary

You have everything you need to deploy! Just run:

```bash
.\DEPLOY_TO_RAILWAY.bat
```

The script will:
1. ✅ Check if Railway CLI is installed
2. ✅ Login to Railway (if needed)
3. ✅ Deploy your backend
4. ✅ Show you next steps

**Token Gate Status**: 🔒 **ACTIVE** - 100 XAPE tokens required

---

**Need help?** Check `RAILWAY_SETUP.md` for detailed troubleshooting.

