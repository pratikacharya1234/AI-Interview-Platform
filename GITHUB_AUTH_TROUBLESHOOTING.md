# GitHub Authentication Troubleshooting Guide

## 🔴 Your Current Issue

Based on your error logs from `https://interviewmock.vercel.app`:
```
Performance metric: https://interviewmock.vercel.app/auth/signin?redirect=%2Fdashboard undefined
Auth state changed: INITIAL_SESSION
github not working
```

This indicates **GitHub OAuth is not properly configured on Vercel**.

## 🔍 Quick Diagnosis

### Step 1: Check Configuration Status

Visit this URL in your browser:
```
https://interviewmock.vercel.app/api/auth/debug
```

This will show you:
- ✅ Which environment variables are set
- ❌ Which ones are missing
- 📋 What your callback URL should be

### Step 2: Identify the Problem

The debug endpoint will tell you exactly what's wrong. Common issues:

#### Issue A: "NEXTAUTH_URL is not set"
**Fix:** Add to Vercel environment variables:
```
NEXTAUTH_URL=https://interviewmock.vercel.app
```

#### Issue B: "NEXTAUTH_SECRET is not set"
**Fix:** Generate and add to Vercel:
```bash
openssl rand -base64 32
```

#### Issue C: "GITHUB_CLIENT_ID is not set"
**Fix:** Create GitHub OAuth App and add credentials to Vercel

#### Issue D: "GITHUB_CLIENT_SECRET is not set"
**Fix:** Add GitHub OAuth App secret to Vercel

## ✅ Complete Fix (Step-by-Step)

### 1. Create Production GitHub OAuth App

**Go to:** https://github.com/settings/developers

Click **"New OAuth App"** and enter:

```
Application name: AI Interview Platform (Production)
Homepage URL: https://interviewmock.vercel.app
Authorization callback URL: https://interviewmock.vercel.app/api/auth/callback/github
```

**Important:** The callback URL must be **EXACTLY** as shown above:
- ✅ `https://interviewmock.vercel.app/api/auth/callback/github`
- ❌ `https://interviewmock.vercel.app/api/auth/callback/github/` (no trailing slash)
- ❌ `http://interviewmock.vercel.app/api/auth/callback/github` (must be https)

After creating:
1. Copy the **Client ID**
2. Click **"Generate a new client secret"**
3. Copy the **Client Secret** immediately (you can't see it again)

### 2. Set Vercel Environment Variables

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these **4 required variables**:

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXTAUTH_URL` | `https://interviewmock.vercel.app` | All (Production, Preview, Development) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` | All |
| `GITHUB_CLIENT_ID` | From GitHub OAuth App | All |
| `GITHUB_CLIENT_SECRET` | From GitHub OAuth App | All |

**Critical:**
- Select **all three environments** for each variable
- No trailing slashes in `NEXTAUTH_URL`
- Use the **production** GitHub OAuth credentials

### 3. Redeploy

After adding variables:
1. Go to **Deployments** tab
2. Click **•••** on latest deployment
3. Click **"Redeploy"**
4. Wait for completion (~2 minutes)

### 4. Verify

After redeployment:

**A. Check configuration:**
```
https://interviewmock.vercel.app/api/auth/debug
```
Should show: `"status": "OK"`

**B. Test login:**
```
https://interviewmock.vercel.app/auth/signin
```
Click "Sign In with GitHub" - should redirect to GitHub

**C. Check browser console:**
Open DevTools (F12) → Console tab
Should see: `Initiating GitHub sign in...`

## 🐛 Common Errors & Fixes

### Error: "Configuration"

**Symptom:** Button doesn't do anything, or shows "Configuration error"

**Cause:** Environment variables not set in Vercel

**Fix:**
1. Check `/api/auth/debug` endpoint
2. Add missing variables in Vercel Settings
3. Redeploy

### Error: "Redirect URI mismatch"

**Symptom:** GitHub shows error page: "The redirect_uri MUST match the registered callback URL"

**Cause:** GitHub OAuth App callback URL doesn't match

**Fix:**
1. Go to GitHub OAuth App settings
2. Update callback URL to: `https://interviewmock.vercel.app/api/auth/callback/github`
3. Save changes
4. Try again (no redeploy needed)

### Error: "Invalid client"

**Symptom:** GitHub shows: "The client_id and/or client_secret passed are incorrect"

**Cause:** Wrong credentials in Vercel

**Fix:**
1. Verify you're using the **production** OAuth app credentials
2. Check for copy-paste errors (extra spaces, newlines)
3. Regenerate client secret if needed
4. Update in Vercel
5. Redeploy

### Error: Nothing happens when clicking button

**Symptom:** Button shows loading spinner briefly, then nothing

**Cause:** JavaScript error or network issue

**Fix:**
1. Open browser console (F12)
2. Look for red error messages
3. Check Network tab for failed requests
4. Common issues:
   - CORS errors → Check `NEXTAUTH_URL` is correct
   - 404 errors → Redeploy to ensure routes are built
   - 500 errors → Check Vercel runtime logs

### Error: "Access Denied"

**Symptom:** After authorizing on GitHub, redirected back with error

**Cause:** User denied access, or OAuth app has issues

**Fix:**
1. Try again and click "Authorize" on GitHub
2. Check GitHub OAuth App is not suspended
3. Verify app has correct permissions (read:user, user:email)

## 📋 Verification Checklist

Before testing, ensure:

- [ ] Created **new** GitHub OAuth App for production (not reusing local dev one)
- [ ] Homepage URL: `https://interviewmock.vercel.app`
- [ ] Callback URL: `https://interviewmock.vercel.app/api/auth/callback/github` (exact match)
- [ ] Copied Client ID and Secret
- [ ] Added `NEXTAUTH_URL` to Vercel (no trailing slash)
- [ ] Added `NEXTAUTH_SECRET` to Vercel (32+ chars)
- [ ] Added `GITHUB_CLIENT_ID` to Vercel
- [ ] Added `GITHUB_CLIENT_SECRET` to Vercel
- [ ] Selected **all environments** for each variable
- [ ] Redeployed after adding variables
- [ ] Checked `/api/auth/debug` shows "OK"

## 🔬 Advanced Debugging

### Check Vercel Runtime Logs

1. Go to Vercel Dashboard → Your Project
2. Click on latest deployment
3. Click **"Runtime Logs"** tab
4. Look for errors containing "nextauth" or "github"

Common log errors:
```
Error: NEXTAUTH_SECRET not set
→ Add NEXTAUTH_SECRET to Vercel env vars

Error: Cannot find module 'next-auth'
→ Ensure next-auth is in dependencies, redeploy

Error: redirect_uri_mismatch
→ Update GitHub OAuth App callback URL
```

### Check Network Requests

1. Open DevTools (F12) → Network tab
2. Click "Sign In with GitHub"
3. Look for these requests:

**Expected flow:**
```
1. POST /api/auth/signin/github → 302 redirect
2. GET https://github.com/login/oauth/authorize → GitHub login page
3. GET /api/auth/callback/github?code=... → 302 redirect
4. GET /dashboard → Success!
```

**If stuck at step 1:** Environment variables issue
**If stuck at step 2:** GitHub OAuth App issue
**If stuck at step 3:** Callback URL mismatch

### Test with cURL

Test the auth endpoint directly:

```bash
curl -I https://interviewmock.vercel.app/api/auth/signin/github
```

Expected response:
```
HTTP/2 302
location: https://github.com/login/oauth/authorize?...
```

If you get 500 or error, check Vercel logs.

## 🎯 Quick Fix Commands

### Generate new NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Check if environment variables are set (locally)
```bash
node verify-github-auth.js
```

### Test configuration endpoint
```bash
curl https://interviewmock.vercel.app/api/auth/debug
```

## 📞 Still Not Working?

If you've followed all steps and it still doesn't work:

1. **Delete and recreate GitHub OAuth App**
   - Sometimes OAuth apps get into a bad state
   - Create fresh one with exact URLs

2. **Clear all browser data**
   - Cookies, cache, local storage
   - Try incognito/private mode

3. **Try a different browser**
   - Rules out browser-specific issues

4. **Check GitHub status**
   - Visit https://www.githubstatus.com/
   - OAuth might be down

5. **Compare with working example**
   - Test with a known working NextAuth + GitHub setup
   - Verify your code matches expected patterns

## ✅ Success Indicators

When working correctly, you should see:

1. **On sign-in page:**
   - No console errors
   - Button is clickable
   - Console shows: "Initiating GitHub sign in..."

2. **After clicking button:**
   - Redirects to GitHub (github.com URL)
   - Shows authorization page
   - Lists your app name

3. **After authorizing:**
   - Redirects back to your app
   - URL briefly shows: `/api/auth/callback/github?code=...`
   - Then redirects to `/dashboard`
   - User is logged in

4. **On dashboard:**
   - User info is displayed
   - Session persists on refresh
   - Can navigate to protected routes

## 🔐 Security Notes

- **Never share** your `GITHUB_CLIENT_SECRET`
- **Never commit** `.env.local` to git
- **Use different OAuth apps** for dev vs production
- **Rotate secrets** if compromised
- **Remove `/api/auth/debug`** endpoint in production (or add authentication)

---

**For your specific deployment:** `https://interviewmock.vercel.app`

**Most likely issue:** Environment variables not set in Vercel

**Quick fix:** Follow "Complete Fix (Step-by-Step)" section above
