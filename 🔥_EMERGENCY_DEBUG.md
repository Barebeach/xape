# 🔥 EMERGENCY DEBUG - Chrome Store Version Not Working

## 🚨 Problem: Extension works locally but NOT after Chrome Store publish

---

## ✅ STEP 1: Check Console Errors (MOST IMPORTANT!)

1. Go to **axiom.trade**
2. Press **F12**
3. Go to **Console** tab
4. Look for RED errors

### Common Error Messages & Fixes:

| Error | Cause | Fix |
|-------|-------|-----|
| `Refused to connect to 'https://...'` | CSP blocking | Add to host_permissions |
| `Extension context invalidated` | Extension reloaded | Reload page |
| `Failed to fetch` | CORS or network error | Check backend is running |
| `chrome.runtime.id is undefined` | Extension not loaded | Reinstall extension |
| No errors, nothing loads | Content script not running | Check manifest matches |

---

## ✅ STEP 2: Check Extension is Loaded

1. Go to `chrome://extensions/`
2. Find **"XAPE - AI Crypto Agent"**
3. Check:
   - ✅ Enabled toggle is ON
   - ✅ Version shows **1.0.2** (or 1.0.3)
   - ✅ No errors shown
4. Click **"Details"**
5. Check:
   - ✅ "Site access" = "On specific sites"
   - ✅ Shows `axiom.trade` in allowed sites

---

## ✅ STEP 3: Check Content Scripts Loaded

In Console (F12), run:

```javascript
// Check if content.js loaded
console.log('Extension loaded?', typeof skillbarInstance !== 'undefined')
console.log('Config loaded?', typeof window.marketCapSystemEnabled !== 'undefined')

// Check all global functions
console.log('Functions available:', {
  speakResponse: typeof speakResponse,
  performTokenGateCheck: typeof performTokenGateCheck,
  initializeExtension: typeof initializeExtension
})
```

**If all show `undefined`**: Content scripts didn't load!

---

## ✅ STEP 4: Test Backend Connection

In Console, run:

```javascript
// Test backend
fetch('https://postgres-production-958e.up.railway.app/')
  .then(r => r.json())
  .then(d => console.log('✅ Backend OK:', d))
  .catch(e => console.error('❌ Backend FAIL:', e))
```

**Expected result**: `{status: "XAPE Backend Online"}`

---

## ✅ STEP 5: Check Token Gate

In Console, run:

```javascript
// Check if token gate runs
performTokenGateCheck().then(result => {
  console.log('Token gate result:', result)
})
```

**If error `performTokenGateCheck is not defined`**: Content script not loaded!

---

## 🔧 FIXES:

### Fix 1: Update Manifest (CSP & Permissions)
I just updated your `manifest.json` with:
- ✅ Added CSP for external connections
- ✅ Added `unlimitedStorage` permission
- ✅ Added Solana RPC host permissions

### Fix 2: Check Package Contents

Run `PACKAGE_FOR_STORE.bat` and verify these files are included:
- ✅ manifest.json (updated)
- ✅ content.js
- ✅ All xape-*.js files
- ✅ skillbar-classes.js
- ✅ config.js
- ✅ styles.css
- ✅ All icons

### Fix 3: Version Bump

Your manifest now shows **v1.0.3**. You need to:
1. Package extension: `PACKAGE_FOR_STORE.bat`
2. Upload to Chrome Store as UPDATE
3. Wait for approval (1-2 days)

---

## 🎯 QUICK TEST - Load Unpacked Version

To test the fixes RIGHT NOW:

1. Go to `chrome://extensions/`
2. Enable **"Developer mode"**
3. Click **"Load unpacked"**
4. Select your `C:\Users\Phill\Desktop\orgy` folder
5. Go to axiom.trade
6. Check Console for errors

**If it works locally but NOT on Chrome Store version**:
- Problem is with the **published package**
- You need to republish with fixed manifest

---

## 📊 Diagnostic Checklist:

Run through ALL of these and tell me the results:

- [ ] Console shows extension loaded?
- [ ] Console has RED errors? (Copy them!)
- [ ] Backend responds at https://postgres-production-958e.up.railway.app/?
- [ ] Extension shows in chrome://extensions/?
- [ ] Version number matches (1.0.2)?
- [ ] Content scripts show as loaded?
- [ ] Token gate popup appears?
- [ ] Local unpacked version works?

---

## 🚀 Next Steps:

1. **RIGHT NOW**: Load unpacked version to test
2. **Package**: Run `PACKAGE_FOR_STORE.bat`
3. **Upload**: Update version 1.0.3 to Chrome Store
4. **Wait**: 1-2 days for approval

---

## 💬 Tell Me:

Copy the Console output and send it to me. Look for:
- Any RED errors
- What happens when page loads
- Any warnings about blocked requests

