# Deploy XAPE Website to Vercel

## 🚀 **Quick Deployment Steps**

### **Method 1: Using Vercel CLI (Recommended)**

#### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

#### **Step 2: Login to Vercel**
```bash
vercel login
```
- Choose your login method (GitHub, GitLab, Bitbucket, or Email)
- Complete authentication

#### **Step 3: Deploy from Website Directory**
```bash
cd website
vercel
```

#### **Step 4: Follow Prompts**
```
? Set up and deploy "~/website"? [Y/n] Y
? Which scope? Your account
? Link to existing project? [y/N] N
? What's your project's name? xape-website
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

#### **Step 5: Get Your Live URL**
After deployment completes, you'll get:
```
✅ Production: https://xape-website.vercel.app
```

---

### **Method 2: Using Vercel Dashboard (Easiest)**

#### **Step 1: Push to GitHub**
1. Create a GitHub repository for your website
2. Push the `website/` folder to GitHub

#### **Step 2: Import to Vercel**
1. Go to: **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Vercel will auto-detect Vite settings

#### **Step 3: Configure Project**
```
Framework Preset: Vite
Root Directory: ./   (or leave empty if repo is just the website)
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### **Step 4: Deploy**
1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Get your live URL: `https://[project-name].vercel.app`

---

### **Method 3: Drag & Drop (No Git Required)**

#### **Step 1: Build Locally**
```bash
cd website
npm run build
```

This creates a `dist/` folder with your built website.

#### **Step 2: Deploy to Vercel**
1. Go to: **https://vercel.com/new**
2. Click **"Browse"** under "Deploy from"
3. Select the `website/dist/` folder
4. Drag and drop or click to upload
5. Click **"Deploy"**

---

## 🌐 **Custom Domain (xape.io)**

After initial deployment:

1. **In Vercel Dashboard:**
   - Go to your project
   - Click **"Settings"** → **"Domains"**
   - Click **"Add Domain"**
   - Enter: `xape.io`

2. **In Your Domain Registrar (where you bought xape.io):**
   - Add these DNS records:
   
   **A Record:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **CNAME Record:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Wait for DNS Propagation** (5-30 minutes)

4. **Enable HTTPS** (Vercel does this automatically)

Your site will be live at:
- ✅ `https://xape.io`
- ✅ `https://www.xape.io`

---

## 📋 **Pre-Deployment Checklist**

Before deploying, make sure:

- [ ] `website/privacy-policy.html` exists
- [ ] All icons are in `website/public/` or `website/icons/`
- [ ] `npm run build` works locally without errors
- [ ] `website/vercel.json` is configured correctly
- [ ] No `.env` secrets committed to Git (if using GitHub)

---

## ✅ **Post-Deployment Tasks**

After your site is live:

1. **Update Chrome Web Store Submission:**
   - Privacy Policy URL: `https://xape.io/privacy-policy.html`

2. **Update README.md:**
   - Add website link: `https://xape.io`

3. **Test the Live Site:**
   - Visit `https://[your-project].vercel.app`
   - Check privacy policy loads correctly
   - Test all links and navigation

4. **Set Up Environment Variables (if needed):**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add any API keys or secrets
   - Redeploy to apply

---

## 🐛 **Common Issues**

### **Issue 1: Build Fails**
```bash
# Test build locally first:
cd website
npm install
npm run build
```
Fix any TypeScript errors before deploying.

### **Issue 2: Icons Not Loading**
- Make sure icons are in `public/icons/` folder
- Vercel serves files from `dist/` after build
- Check `vite.config.ts` has correct `publicDir`

### **Issue 3: 404 on privacy-policy.html**
- Ensure file is named `privacy-policy.html` (not `.tsx` or `.jsx`)
- File should be in root of `website/` folder
- After build, it should be in `dist/privacy-policy.html`

---

## 📊 **Vercel Features You Get**

- ✅ **Free HTTPS** (automatic SSL)
- ✅ **Global CDN** (fast worldwide)
- ✅ **Automatic Deployments** (on Git push)
- ✅ **Preview Deployments** (for PRs)
- ✅ **Analytics** (page views, performance)
- ✅ **Custom Domains** (xape.io)

---

## 🎯 **Final URLs**

After deployment, you'll have:

```
Live Site: https://xape.io (or https://[project].vercel.app)
Privacy Policy: https://xape.io/privacy-policy.html
```

**Use these URLs in your Chrome Web Store submission!** ✅

---

## 💡 **Pro Tips**

1. **Enable Vercel Analytics** (free on Pro plan)
2. **Set up automatic deployments** from GitHub main branch
3. **Use Vercel preview deployments** to test changes before going live
4. **Monitor performance** with Vercel Insights

---

**Ready to deploy! Choose Method 1, 2, or 3 above.** 🚀

