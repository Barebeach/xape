# 🔧 FIX BACKEND URL - QUICK STEPS

## ❌ Problem:
Extension is still using OLD backend URL: `https://postgres-production-958e.up.railway.app`

## ✅ Solution:

### **STEP 1: Clear Browser Cache**

1. Open **axiom.trade** in your browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this command and press **Enter**:

```javascript
localStorage.removeItem('xape_backend_url');
localStorage.setItem('xape_backend_url', 'https://lively-compassion-production.up.railway.app');
console.log('✅ Backend URL updated to:', localStorage.getItem('xape_backend_url'));
location.reload();
```

### **STEP 2: Reload Extension**

1. Go to `chrome://extensions/`
2. Find **XAPE - AI Crypto Agent**
3. Click the **🔄 Reload** button (circular arrow)
4. Go back to **axiom.trade** and press **F5**

---

## 🧪 Test It:

After the reload, open Console and you should see:

```
📡 Checking token balance at: https://lively-compassion-production.up.railway.app/api/check-token-balance
```

✅ **NOT** the old `postgres-production-958e` URL!

---

## 📝 Note About Chrome Store Version:

The version already published on Chrome Store (v1.0.2) has the OLD backend URL hardcoded.

**Options:**
1. **Keep it as-is** - Users won't have token gating (backend is down)
2. **Update it** - Submit new version (v1.0.8) with correct URL

For now, you can test locally with the unpacked extension after following the steps above.

