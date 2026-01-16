# Deployment Checklist - Console Errors Fix

## ✅ Changes Applied

### 1. Fixed Content Security Policy (CSP)
- **File**: `next.config.js`
- **Change**: Added `https://*.mentalwealthacademy.world` and `https://mentalwealthacademy.world` to frame-ancestors directive
- **Impact**: Allows your app to be properly embedded in iframes and launched as a Farcaster/Base mini-app

### 2. Created Documentation
- **File**: `CONSOLE_ERRORS_FIX.md` - Comprehensive analysis of all console errors
- **File**: `.env.example` - Template for environment variables
- **File**: `DEPLOYMENT_CHECKLIST.md` - This file

---

## 🚀 Deployment Steps

### Step 1: Environment Variables
Create a `.env.local` file (if you haven't already) with these required variables:

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your actual values
nano .env.local  # or use your preferred editor
```

**Required Variables**:
- `NEXT_PUBLIC_URL=https://mentalwealthacademy.world` *(or https://www.mentalwealthacademy.world)*
- `NEXT_PUBLIC_APP_URL` *(same as above)*
- `DATABASE_URL` *(your database connection string)*

### Step 2: Test Locally

```bash
# Install dependencies (if needed)
npm install --legacy-peer-deps

# Run development server
npm run dev

# Open http://localhost:3000
# Check console for errors
```

### Step 3: Verify Mini-App Configuration

Test these endpoints locally:

1. **Manifest**: http://localhost:3000/.well-known/farcaster.json
   - Should return JSON with `accountAssociation` and `miniapp` fields
   - ✅ Already configured at `app/.well-known/farcaster.json/route.ts`

2. **Homepage**: http://localhost:3000
   - Should load without CSP errors
   - Check browser console for remaining issues

### Step 4: Build and Deploy

```bash
# Build for production
npm run build

# Test production build locally (optional)
npm start

# Deploy to Vercel/your hosting platform
# If using Vercel:
vercel --prod

# Or push to main branch if auto-deploy is configured
git add .
git commit -m "fix: update CSP frame-ancestors to allow mentalwealthacademy.world"
git push origin main
```

### Step 5: Configure Production Environment Variables

On your hosting platform (Vercel, etc.), set these environment variables:

```bash
NEXT_PUBLIC_URL=https://mentalwealthacademy.world
NEXT_PUBLIC_APP_URL=https://mentalwealthacademy.world
DATABASE_URL=<your_production_database_url>
NEXTAUTH_SECRET=<your_nextauth_secret>
# ... add all other required variables
```

**Important**: After adding/changing environment variables, you must **redeploy** your app.

### Step 6: Test in Production

1. **Basic Access**: Visit https://mentalwealthacademy.world
   - Should load without CSP errors
   
2. **Farcaster Manifest**: Visit https://mentalwealthacademy.world/.well-known/farcaster.json
   - Should return valid JSON
   
3. **Base Build Preview**: https://www.base.dev/preview
   - Enter your domain: `mentalwealthacademy.world`
   - Click "Submit"
   - Test the mini-app launch button
   - Verify no CSP errors in console

### Step 7: Verify Account Association (If Not Done)

If you haven't completed the account association:

1. Go to https://www.base.dev/preview?tab=account
2. Enter your domain: `mentalwealthacademy.world`
3. Click "Submit" and follow instructions
4. Copy the generated `accountAssociation` fields
5. Update `app/.well-known/farcaster.json/route.ts` with the new values
6. Redeploy

---

## 🔍 Post-Deployment Verification

### Check Console Errors

Open your production site in:
- ✅ Chrome (with DevTools open)
- ✅ Firefox
- ✅ Safari
- ✅ Farcaster app (if possible)
- ✅ Base app (if possible)

### Expected Results

**Should NOT see**:
- ❌ CSP frame-ancestors violations
- ❌ Any critical errors that break functionality

**Might still see** (non-critical):
- ⚠️ Analytics errors (ERR_BLOCKED_BY_CLIENT) - normal with ad blockers
- ⚠️ Third-party CORS errors - already suppressed in code
- ⚠️ SVG attribute warnings - third-party library issue

### Test in Mini-App Context

1. Post your app URL in a Farcaster cast
2. Launch from the Base app
3. Verify the app loads correctly in the iframe
4. Check that all functionality works

---

## 📊 Monitoring

### Recommended Tools

1. **Browser DevTools**: Check console regularly
2. **Vercel Analytics** (if using Vercel): Monitor performance
3. **Sentry** (optional): Track errors in production

### Common Issues After Deployment

| Issue | Cause | Solution |
|-------|-------|----------|
| Still seeing CSP errors | Cache not cleared | Hard refresh (Ctrl+Shift+R) or clear cache |
| Mini-app won't load | Environment variables not set | Check Vercel/hosting dashboard |
| 404 on manifest | Build didn't include route | Verify `app/.well-known/farcaster.json/route.ts` exists |
| Database connection errors | Wrong DATABASE_URL | Update environment variable and redeploy |

---

## 🎯 Success Criteria

Your deployment is successful when:

- [x] ✅ CSP frame-ancestors fix is deployed
- [ ] ✅ App loads without CSP errors in production
- [ ] ✅ Farcaster manifest is accessible
- [ ] ✅ App can be embedded in Farcaster/Base
- [ ] ✅ All environment variables are set
- [ ] ✅ Core functionality works (auth, database, etc.)
- [ ] ⚠️ Only non-critical errors remain (analytics, etc.)

---

## 🆘 Troubleshooting

### If CSP Errors Persist

1. **Check the exact error message**: Does it mention your domain?
2. **Verify deployment**: Is the latest code deployed?
3. **Clear all caches**: Browser, CDN, service worker
4. **Check frame-ancestors value**: 
   ```bash
   curl -I https://mentalwealthacademy.world
   ```
   Look for the `Content-Security-Policy` header

### If Mini-App Won't Launch

1. **Verify manifest**: https://mentalwealthacademy.world/.well-known/farcaster.json
2. **Check NEXT_PUBLIC_URL**: Must match your production domain exactly
3. **Test in Base Build Preview**: https://www.base.dev/preview
4. **Verify account association**: Should have valid signature

### If Still Seeing Many Errors

1. **Read CONSOLE_ERRORS_FIX.md**: Detailed explanation of each error
2. **Identify critical vs non-critical**: Analytics errors are expected
3. **Check Network tab**: Look for failed requests
4. **Review environment variables**: Ensure all are set correctly

---

## 📝 Notes

- The CSP fix allows your domain to be framed while maintaining security
- Analytics errors from Privy/Statsig are expected and handled gracefully
- SVG errors from third-party libraries don't affect functionality
- Your mini-app configuration is already properly set up

---

## 🎉 Next Steps After Deployment

1. **Test thoroughly** in production environment
2. **Monitor console** for any new errors
3. **Update dependencies** periodically:
   ```bash
   npm update @farcaster/miniapp-sdk
   npm update @privy-io/react-auth
   ```
4. **Consider adding error monitoring** (Sentry, LogRocket, etc.)
5. **Document any new issues** in CONSOLE_ERRORS_FIX.md

---

**Last Updated**: January 16, 2026
**Status**: Ready for Deployment
**Urgency**: Deploy ASAP to fix CSP issues

---

## 💡 Quick Commands Reference

```bash
# Development
npm run dev

# Build
npm run build

# Production test
npm start

# Deploy (Vercel)
vercel --prod

# Check manifest locally
curl http://localhost:3000/.well-known/farcaster.json

# Check manifest in production
curl https://mentalwealthacademy.world/.well-known/farcaster.json
```

---

**Questions?** Review `CONSOLE_ERRORS_FIX.md` for detailed error analysis.
