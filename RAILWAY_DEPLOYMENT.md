# XAPE Website - Railway Deployment Guide

## 🚀 Quick Deploy to Railway

### Option 1: Deploy via Railway CLI

1. **Install Railway CLI** (if not installed):
```bash
npm install -g @railway/cli
```

2. **Login to Railway**:
```bash
railway login
```

3. **Deploy from this directory**:
```bash
cd website
railway up
```

4. **Generate domain** (after deployment):
```bash
railway domain
```

### Option 2: Deploy via Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app/)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"** or **"Empty Project"**
4. If using GitHub:
   - Connect your GitHub repo
   - Select the `website` folder as the root directory
5. Railway will automatically:
   - Detect the project type
   - Run `npm install`
   - Run `npm run build`
   - Start with `npm run serve`

### Option 3: Deploy via Railway CLI from Current Project

If you're already in the `backend` project on Railway:

1. **Link to existing project**:
```bash
railway link
```

2. **Create new service**:
```bash
railway service
# Select "Create a new service"
# Name it "website" or "xape-website"
```

3. **Deploy**:
```bash
railway up
```

4. **Add domain**:
```bash
railway domain
```

## 📝 Configuration Details

- **Build Command**: `npm run build` (runs TypeScript compilation + Vite build)
- **Start Command**: `npm run serve` (starts Express server)
- **Port**: Railway automatically assigns (via `PORT` env variable)
- **Static Files**: Served from `/dist` directory

## 🔧 Environment Variables

No environment variables required for basic deployment.

## 🌐 Custom Domain

After deployment, you can:
1. Generate a Railway subdomain: `railway domain`
2. Add a custom domain in Railway dashboard under service settings

## 📦 What Gets Deployed

- `dist/` - Built static files (HTML, CSS, JS, images)
- `serve.js` - Express server for serving static files
- `railway.toml` - Railway configuration

## ✅ Verify Deployment

After deployment, Railway will provide a URL like:
`https://your-service.up.railway.app`

Visit the URL to see your XAPE website live!

## 🔄 Continuous Deployment

Connect your GitHub repo to Railway for automatic deployments on push:
1. Go to Service Settings
2. Connect GitHub repo
3. Set root directory to `website`
4. Enable auto-deploys

## 🐛 Troubleshooting

### Build fails:
- Check that all dependencies are in `package.json`
- Verify TypeScript compiles: `npm run build` locally

### Server doesn't start:
- Check Railway logs: `railway logs`
- Ensure Express is in dependencies (not devDependencies)

### 404 errors:
- Express serves all routes to `index.html` for SPA routing
- Check that `dist` folder exists after build

