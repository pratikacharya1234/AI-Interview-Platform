# ⚠️ URGENT: Fix Vercel Environment Variables

## 🔴 Current Issues Found

Your debug endpoint shows:
```json
{
  "status": "ISSUES_FOUND",
  "config": {
    "nextauthUrl": "http://localhost:3001",  ❌ WRONG - This is localhost!
    "nextauthSecret": "SET (hidden)",        ⚠️ Too short
    "githubClientId": "Ov23...05A8",         ✅ SET
    "githubClientSecret": "SET (hidden)"     ✅ SET
  },
  "issues": [
    "NEXTAUTH_SECRET is too short (should be 32+ characters)"
  ]
}
```

## ✅ Fix These 2 Issues in Vercel

### Issue 1: NEXTAUTH_URL is pointing to localhost

**Current (WRONG):** `http://localhost:3001`  
**Should be:** `https://interviewmock.vercel.app`

### Issue 2: NEXTAUTH_SECRET is too short

**Current:** Less than 32 characters  
**Should be:** 32+ character random string

---

## 🎯 Step-by-Step Fix

### 1. Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Select your project: **AI-Interview-Platform**
3. Click **Settings** → **Environment Variables**

### 2. Update NEXTAUTH_URL

Find the `NEXTAUTH_URL` variable and **edit it**:

**Change from:**
```
http://localhost:3001
```

**Change to:**
```
https://interviewmock.vercel.app
```

**Important:** 
- Must be `https://` (not `http://`)
- No trailing slash
- Must match your Vercel deployment URL exactly

### 3. Update NEXTAUTH_SECRET

Find the `NEXTAUTH_SECRET` variable and **edit it**:

**Replace with this new secure secret:**
```
6PuMt2V6JnpT/RNDJeVNyEF+ovQ6VCUVlpBKiU9v5b8=
```

Or generate your own:
```bash
openssl rand -base64 32
```

### 4. Verify GitHub OAuth App Callback URL

Since you're changing the URL, make sure your GitHub OAuth App matches:

1. Go to: https://github.com/settings/developers
2. Find your OAuth App (Client ID: Ov23...05A8)
3. Verify **Authorization callback URL** is:
   ```
   https://interviewmock.vercel.app/api/auth/callback/github
   ```
4. If it's not, update it and save

### 5. Redeploy

After updating the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click **•••** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (~2 minutes)

### 6. Test

After redeployment:

**A. Check configuration:**
```
https://interviewmock.vercel.app/api/auth/debug
```

Should show:
```json
{
  "status": "OK",
  "config": {
    "nextauthUrl": "https://interviewmock.vercel.app",
    "expectedCallbackUrl": "https://interviewmock.vercel.app/api/auth/callback/github"
  },
  "issues": []
}
```

**B. Test login:**
```
https://interviewmock.vercel.app/auth/signin
```

Click "Sign In with GitHub" - should work now!

---

## 📋 Quick Checklist

Before testing, verify:

- [ ] `NEXTAUTH_URL` = `https://interviewmock.vercel.app` (no trailing slash)
- [ ] `NEXTAUTH_SECRET` = 32+ character string (use the one above or generate new)
- [ ] `GITHUB_CLIENT_ID` = Your GitHub OAuth App Client ID
- [ ] `GITHUB_CLIENT_SECRET` = Your GitHub OAuth App Client Secret
- [ ] All variables are set for **all environments** (Production, Preview, Development)
- [ ] GitHub OAuth App callback URL = `https://interviewmock.vercel.app/api/auth/callback/github`
- [ ] Redeployed after making changes

---

## 🔍 Why This Happened

Your Vercel environment variables were copied from your local `.env.local` file, which has:
```bash
NEXTAUTH_URL=http://localhost:3001  # ❌ This is for local development only!
```

For production (Vercel), you need:
```bash
NEXTAUTH_URL=https://interviewmock.vercel.app  # ✅ Your actual deployment URL
```

---

## 💡 Pro Tip: Separate Dev and Production

To avoid confusion, use different OAuth Apps:

**Local Development:**
- GitHub OAuth App: "AI Interview Platform (Dev)"
- Callback URL: `http://localhost:3001/api/auth/callback/github`
- In `.env.local`: `NEXTAUTH_URL=http://localhost:3001`

**Production (Vercel):**
- GitHub OAuth App: "AI Interview Platform (Production)"
- Callback URL: `https://interviewmock.vercel.app/api/auth/callback/github`
- In Vercel: `NEXTAUTH_URL=https://interviewmock.vercel.app`

This way, local testing doesn't interfere with production.

---

## ✅ Expected Result

After fixing:

1. Visit: `https://interviewmock.vercel.app/auth/signin`
2. Click "Sign In with GitHub"
3. Redirected to GitHub authorization page
4. Click "Authorize"
5. Redirected back to your app at `/dashboard`
6. You're logged in! 🎉

---

## 🆘 Still Having Issues?

If it still doesn't work after these changes:

1. **Check Vercel Runtime Logs:**
   - Vercel Dashboard → Your Project → Latest Deployment → Runtime Logs
   - Look for NextAuth errors

2. **Clear browser cache:**
   - Old cookies might interfere
   - Try incognito/private mode

3. **Verify all 4 environment variables are set:**
   - Run `/api/auth/debug` endpoint again
   - Should show "status": "OK"

4. **Check GitHub OAuth App status:**
   - Make sure it's not suspended
   - Verify callback URL matches exactly

---

**Generated secret for you:** `6PuMt2V6JnpT/RNDJeVNyEF+ovQ6VCUVlpBKiU9v5b8=`

**Use this for NEXTAUTH_SECRET in Vercel!**
