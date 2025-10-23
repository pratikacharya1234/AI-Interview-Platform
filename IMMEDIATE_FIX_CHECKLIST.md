# 🚨 IMMEDIATE FIX CHECKLIST - GitHub Login Not Working

## Current Status
- ✅ Code is updated with better error handling
- ❌ Vercel environment variables are WRONG
- ❌ GitHub OAuth App callback URL needs verification

---

## ⚡ DO THIS NOW (5 minutes)

### 1️⃣ Fix Vercel Environment Variables

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Update these 2 variables:**

#### Variable 1: NEXTAUTH_URL
```
Current: http://localhost:3001  ❌ WRONG
Change to: https://interviewmock.vercel.app  ✅ CORRECT
```

#### Variable 2: NEXTAUTH_SECRET
```
Current: <too short>  ❌ WRONG
Change to: 6PuMt2V6JnpT/RNDJeVNyEF+ovQ6VCUVlpBKiU9v5b8=  ✅ CORRECT
```

**Make sure to select ALL ENVIRONMENTS (Production, Preview, Development) for both!**

---

### 2️⃣ Update GitHub OAuth App

**Go to:** https://github.com/settings/developers

**Find your OAuth App** (Client ID: Ov23...05A8)

**Verify these settings:**
```
Homepage URL: https://interviewmock.vercel.app
Authorization callback URL: https://interviewmock.vercel.app/api/auth/callback/github
```

**If they say `http://localhost:3001`, UPDATE THEM!**

---

### 3️⃣ Redeploy on Vercel

1. Go to **Deployments** tab
2. Click **•••** (three dots) on latest deployment
3. Click **"Redeploy"**
4. Wait 2 minutes

---

### 4️⃣ Test

After redeployment:

**A. Check config:**
```
https://interviewmock.vercel.app/api/auth/debug
```
Should show: `"status": "OK"`

**B. Test login:**
```
https://interviewmock.vercel.app/auth/signin
```
1. Open browser console (F12)
2. Click "Sign In with GitHub"
3. Check console for debug messages
4. Should redirect to GitHub

---

## 🔍 What to Look For

### In Browser Console (F12)
After clicking "Sign In with GitHub", you should see:
```
=== GitHub Sign In Debug ===
Current URL: https://interviewmock.vercel.app/auth/signin
Callback URL: /dashboard
Sign in result: { ok: true, url: "..." }
Sign in successful! Redirecting...
```

### If You See Errors
- `Configuration` → Environment variables not set correctly
- `OAuthSignin` → NEXTAUTH_URL is wrong
- `OAuthCallback` → GitHub callback URL doesn't match

---

## 📋 Quick Verification

Before testing, confirm:

- [ ] Vercel `NEXTAUTH_URL` = `https://interviewmock.vercel.app`
- [ ] Vercel `NEXTAUTH_SECRET` = 32+ character string
- [ ] Vercel `GITHUB_CLIENT_ID` = Set (from OAuth app)
- [ ] Vercel `GITHUB_CLIENT_SECRET` = Set (from OAuth app)
- [ ] All variables selected for ALL environments
- [ ] GitHub OAuth App Homepage = `https://interviewmock.vercel.app`
- [ ] GitHub OAuth App Callback = `https://interviewmock.vercel.app/api/auth/callback/github`
- [ ] Redeployed after changes

---

## 🎯 Expected Result

1. Click "Sign In with GitHub"
2. Browser redirects to `https://github.com/login/oauth/authorize?...`
3. You see GitHub authorization page
4. Click "Authorize"
5. Redirects back to `https://interviewmock.vercel.app/dashboard`
6. You're logged in! ✅

---

## 🆘 If Still Not Working

### Check Vercel Runtime Logs
1. Vercel Dashboard → Your Project
2. Click latest deployment
3. Click "Runtime Logs" tab
4. Look for NextAuth errors

### Common Log Errors
```
"NEXTAUTH_SECRET not set" → Add to Vercel env vars
"redirect_uri_mismatch" → Update GitHub OAuth callback URL
"Invalid client" → Wrong GitHub credentials
```

### Test Locally First
To verify the code works:
```bash
# Update .env.local
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=6PuMt2V6JnpT/RNDJeVNyEF+ovQ6VCUVlpBKiU9v5b8=
GITHUB_CLIENT_ID=<your-client-id>
GITHUB_CLIENT_SECRET=<your-client-secret>

# Update GitHub OAuth App callback to:
# http://localhost:3001/api/auth/callback/github

# Run
npm run dev

# Test at http://localhost:3001/auth/signin
```

If it works locally, the issue is Vercel configuration.

---

## 🔐 Security Note

The NEXTAUTH_SECRET I generated for you:
```
6PuMt2V6JnpT/RNDJeVNyEF+ovQ6VCUVlpBKiU9v5b8=
```

This is secure and random. Use it for both local and production.

---

## ✅ Success Checklist

When working, you'll see:
- [ ] No errors in browser console
- [ ] Redirects to GitHub authorization page
- [ ] After authorization, redirects back to your app
- [ ] Dashboard loads with user info
- [ ] Session persists on page refresh
- [ ] Can access protected routes

---

**THE MAIN ISSUE:** Your Vercel has `NEXTAUTH_URL=http://localhost:3001` instead of your actual deployment URL. Fix that first!
