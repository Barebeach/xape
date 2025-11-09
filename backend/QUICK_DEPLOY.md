# ⚡ Quick Deploy to Railway - 5 Minutes

## 🎯 Simple 4-Step Process

### Step 1: Install Railway CLI (if not installed)
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
cd backend
railway login
```
(Browser will open - login with your Railway account)

### Step 3: Deploy!
```bash
railway up
```

### Step 4: Set Environment Variables
Go to Railway dashboard → Your service → Variables tab

**Add these:**
```
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
DISABLE_TOKEN_GATE=false
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

✅ **Done!** Your backend is live with token gate active.

---

## 🔗 Get Your Backend URL

After deployment:
1. Go to railway.app → Your project
2. Click "Settings"
3. Copy the URL under "Domains"
4. Example: `https://your-app.up.railway.app`

---

## 🔧 Update Extension

**Method 1: Quick Update (Console)**
```javascript
// Open Chrome DevTools on axiom.trade
localStorage.setItem('xape_backend_url', 'https://your-app.up.railway.app')
location.reload()
```

**Method 2: Code Update**
Edit `content.js` line ~438:
```javascript
const backendUrl = localStorage.getItem('xape_backend_url') || 'https://YOUR-URL.up.railway.app'
```

---

## ✅ Test It Works

Visit: `https://your-app.up.railway.app/`

Should see: `{"status":"XAPE Backend Online"}`

---

## 🔐 Token Gate Status

✅ **ACTIVE** - Users need **100 XAPE tokens** to use the extension

Test by:
1. Going to axiom.trade
2. Connecting wallet
3. Should show token gate overlay if < 100 XAPE

---

## 📊 View Logs

```bash
railway logs
```

---

## 🔄 Deploy Updates

Made changes? Just run:
```bash
cd backend
railway up
```

---

That's it! 🎉

