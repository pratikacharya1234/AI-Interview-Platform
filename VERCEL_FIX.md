# 🔧 Vercel Deployment Fix Guide

## Current Issues & Solutions

### 1. ❌ NextAuth Session Error
```
[next-auth][error][CLIENT_FETCH_ERROR] 
NetworkError when attempting to fetch resource
```

**Solution:**
Add these environment variables in Vercel Dashboard:

```bash
NEXTAUTH_URL=https://project-wczx.vercel.app
NEXTAUTH_SECRET=[generate using: openssl rand -base64 32]
GITHUB_CLIENT_ID=[your GitHub OAuth app client ID]
GITHUB_CLIENT_SECRET=[your GitHub OAuth app secret]
```

### 2. ❌ 404 Errors on Routes
Routes like `/features`, `/pricing`, `/about` returning 404

**Solution:**
✅ Already fixed - Created the missing pages:
- `/app/features/page.tsx`
- `/app/pricing/page.tsx`
- `/app/about/page.tsx`
- `/app/signin/page.tsx` (redirects to `/auth/signin`)

### 3. ❌ Sign-in Redirect Issue
App trying to redirect to `/signin` instead of `/auth/signin`

**Solution:**
✅ Already fixed - Created redirect in `vercel.json` and `/app/signin/page.tsx`

## 📋 Quick Fix Checklist

### Step 1: Update GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Select your OAuth App
3. Update these URLs:
   - **Homepage URL**: `https://project-wczx.vercel.app`
   - **Authorization callback URL**: `https://project-wczx.vercel.app/api/auth/callback/github`

### Step 2: Add Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```bash
# Required
NEXTAUTH_URL=https://project-wczx.vercel.app
NEXTAUTH_SECRET=<generate-random-32-char-string>
GITHUB_CLIENT_ID=<from-github-oauth-app>
GITHUB_CLIENT_SECRET=<from-github-oauth-app>
GOOGLE_GEMINI_API_KEY=<your-gemini-api-key>

# Optional (app works without these)
NEXT_PUBLIC_SUPABASE_URL=<if-you-have-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<if-you-have-supabase>
SUPABASE_SERVICE_ROLE_KEY=<if-you-have-supabase>
```

### Step 3: Redeploy
1. After adding environment variables
2. Go to Deployments tab
3. Click on the three dots menu on latest deployment
4. Select "Redeploy"
5. Choose "Use existing Build Cache" → No (to ensure env vars are loaded)

## 🎯 Testing After Fix

1. **Test Authentication:**
   - Go to https://project-wczx.vercel.app
   - Click "Sign In" or "Get Started"
   - Should redirect to GitHub OAuth
   - After auth, should redirect to dashboard

2. **Test Navigation:**
   - Click on Features, Pricing, About links
   - All should load without 404 errors

3. **Test AI Features:**
   - Go to Dashboard
   - Start a practice interview
   - Should work if GOOGLE_GEMINI_API_KEY is set

## 🚀 Generate Required Secrets

### Generate NEXTAUTH_SECRET:
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator (less secure)
# Visit: https://generate-secret.vercel.app/32
```

### Get Google Gemini API Key:
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Get GitHub OAuth Credentials:
1. Go to https://github.com/settings/developers
2. Click "New OAuth App" (or use existing)
3. Fill in:
   - Application name: AI Interview Pro
   - Homepage URL: https://project-wczx.vercel.app
   - Authorization callback URL: https://project-wczx.vercel.app/api/auth/callback/github
4. Copy Client ID and Client Secret

## 🔍 Verify Deployment

After redeployment, check:

1. **Function Logs:**
   - Vercel Dashboard → Functions tab
   - Check for any errors in API routes

2. **Build Logs:**
   - Vercel Dashboard → Deployments
   - Click on deployment → View Build Logs

3. **Browser Console:**
   - Open DevTools (F12)
   - Check Console for any client-side errors
   - Check Network tab for failed requests

## 📝 Common Issues & Solutions

### Issue: Still getting CLIENT_FETCH_ERROR
- Double-check NEXTAUTH_URL matches exactly: `https://project-wczx.vercel.app`
- Ensure no trailing slash in NEXTAUTH_URL
- Verify NEXTAUTH_SECRET is set

### Issue: GitHub OAuth not working
- Ensure callback URL in GitHub matches exactly
- Check Client ID and Secret are correct
- Try regenerating the Client Secret

### Issue: AI features not working
- Verify GOOGLE_GEMINI_API_KEY is valid
- Check API quota limits
- Test key at https://makersuite.google.com/app/prompts

## ✅ Expected Result

After applying these fixes:
1. ✅ No more CLIENT_FETCH_ERROR
2. ✅ Authentication works properly
3. ✅ All navigation links work
4. ✅ AI features functional (with valid API key)
5. ✅ Clean deployment without errors

## 📧 Need Help?

If issues persist after following this guide:
1. Check Vercel Function logs for detailed errors
2. Review browser console for client-side issues
3. Ensure all environment variables are properly set
4. Try clearing browser cache and cookies

---
*Last updated: October 2024*
*Deployment URL: https://project-wczx.vercel.app*
