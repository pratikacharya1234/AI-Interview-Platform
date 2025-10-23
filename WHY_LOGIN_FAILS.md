# Why GitHub Login is Failing

## 🔴 The Problem

Your `/api/auth/debug` endpoint revealed:

```json
{
  "nextauthUrl": "http://localhost:3001",  ← THIS IS THE PROBLEM!
  "expectedCallbackUrl": "http://localhost:3001/api/auth/callback/github"
}
```

But your app is deployed at: `https://interviewmock.vercel.app`

## 🔄 What's Happening (Current - BROKEN)

```
1. User clicks "Sign In with GitHub"
   ↓
2. NextAuth tries to redirect to GitHub with:
   redirect_uri=http://localhost:3001/api/auth/callback/github
   ↓
3. GitHub OAuth App expects:
   redirect_uri=https://interviewmock.vercel.app/api/auth/callback/github
   ↓
4. ❌ MISMATCH! GitHub rejects the request
   ↓
5. Login fails, user sees "Auth state changed: INITIAL_SESSION"
```

## ✅ What Should Happen (After Fix)

```
1. User clicks "Sign In with GitHub"
   ↓
2. NextAuth redirects to GitHub with:
   redirect_uri=https://interviewmock.vercel.app/api/auth/callback/github
   ↓
3. GitHub OAuth App expects:
   redirect_uri=https://interviewmock.vercel.app/api/auth/callback/github
   ↓
4. ✅ MATCH! GitHub shows authorization page
   ↓
5. User clicks "Authorize"
   ↓
6. GitHub redirects back to:
   https://interviewmock.vercel.app/api/auth/callback/github?code=...
   ↓
7. NextAuth exchanges code for access token
   ↓
8. User is logged in and redirected to /dashboard
```

## 🎯 The Fix

### In Vercel Environment Variables:

**Change:**
```bash
NEXTAUTH_URL=http://localhost:3001
```

**To:**
```bash
NEXTAUTH_URL=https://interviewmock.vercel.app
```

### In GitHub OAuth App Settings:

**Change:**
```bash
Authorization callback URL: http://localhost:3001/api/auth/callback/github
```

**To:**
```bash
Authorization callback URL: https://interviewmock.vercel.app/api/auth/callback/github
```

## 🔍 How to Verify It's Fixed

### Before Fix:
```bash
curl https://interviewmock.vercel.app/api/auth/debug
```
Shows:
```json
{
  "status": "ISSUES_FOUND",
  "nextauthUrl": "http://localhost:3001"  ← Wrong!
}
```

### After Fix:
```bash
curl https://interviewmock.vercel.app/api/auth/debug
```
Shows:
```json
{
  "status": "OK",
  "nextauthUrl": "https://interviewmock.vercel.app"  ← Correct!
}
```

## 📊 Visual Comparison

### Current (Broken):
```
Your App:        https://interviewmock.vercel.app
NEXTAUTH_URL:    http://localhost:3001           ← MISMATCH!
GitHub Callback: http://localhost:3001/...       ← MISMATCH!
Result:          ❌ Login fails
```

### After Fix:
```
Your App:        https://interviewmock.vercel.app
NEXTAUTH_URL:    https://interviewmock.vercel.app ← MATCH!
GitHub Callback: https://interviewmock.vercel.app/... ← MATCH!
Result:          ✅ Login works
```

## 🚀 Quick Fix Steps

1. **Vercel Dashboard** → Settings → Environment Variables
   - Edit `NEXTAUTH_URL` → Change to `https://interviewmock.vercel.app`
   - Edit `NEXTAUTH_SECRET` → Change to `6PuMt2V6JnpT/RNDJeVNyEF+ovQ6VCUVlpBKiU9v5b8=`

2. **GitHub Settings** → Developer Settings → OAuth Apps
   - Edit your app (Ov23...05A8)
   - Update Homepage URL → `https://interviewmock.vercel.app`
   - Update Callback URL → `https://interviewmock.vercel.app/api/auth/callback/github`

3. **Vercel Dashboard** → Deployments
   - Click ••• on latest deployment
   - Click "Redeploy"

4. **Test**
   - Visit: `https://interviewmock.vercel.app/auth/signin`
   - Click "Sign In with GitHub"
   - Should work! ✅

## 💡 Why This Happened

You probably:
1. Copied your local `.env.local` to Vercel
2. Local dev uses `http://localhost:3001`
3. Production needs `https://interviewmock.vercel.app`
4. Forgot to update for production

## 🔐 Best Practice

Use **different OAuth Apps** for dev and production:

**Local Development:**
```bash
# .env.local
NEXTAUTH_URL=http://localhost:3001
GITHUB_CLIENT_ID=<dev-oauth-app-id>
GITHUB_CLIENT_SECRET=<dev-oauth-app-secret>
```

**Production (Vercel):**
```bash
# Vercel Environment Variables
NEXTAUTH_URL=https://interviewmock.vercel.app
GITHUB_CLIENT_ID=<prod-oauth-app-id>
GITHUB_CLIENT_SECRET=<prod-oauth-app-secret>
```

This prevents conflicts and makes debugging easier.

---

**TL;DR:** Your Vercel thinks it's running on `localhost:3001` but it's actually on `interviewmock.vercel.app`. Update `NEXTAUTH_URL` in Vercel to fix it!
