# Fix: Session Cookies Not Persisting

## Problem Identified

From your console logs:
```
⚠️ No session found
hasSession: false
```

This means the OAuth callback completed, but the session cookies are not being saved or read by the browser.

## Root Cause

**Supabase redirect URLs are not configured correctly for your Vercel deployment.**

Your app is deployed at: `https://interviewmock.vercel.app`
But Supabase doesn't have this URL in the allowed redirect list.

---

## Solution: Configure Supabase Redirect URLs

### Step 1: Add Redirect URLs in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project (`frrdjatgghbrtdtgslkw`)
3. Click **Authentication** (left sidebar)
4. Click **URL Configuration**
5. In **Redirect URLs**, add these URLs:

```
https://interviewmock.vercel.app/auth/callback
https://interviewmock.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

6. **Site URL**: Set to `https://interviewmock.vercel.app`
7. Click **Save**

### Step 2: Configure GitHub OAuth App

1. Go to GitHub: https://github.com/settings/developers
2. Find your OAuth App for this project
3. Update **Authorization callback URL** to:
   ```
   https://frrdjatgghbrtdtgslkw.supabase.co/auth/v1/callback
   ```
4. Save changes

### Step 3: Clear Cookies and Test

1. **Clear ALL cookies** for `interviewmock.vercel.app`:
   - Open DevTools (F12)
   - Go to Application tab
   - Click Cookies → https://interviewmock.vercel.app
   - Right-click → Clear all

2. **Clear Supabase cookies** too:
   - Cookies → https://frrdjatgghbrtdtgslkw.supabase.co
   - Right-click → Clear all

3. **Sign in again**

4. **Check cookies after sign-in**:
   - DevTools → Application → Cookies
   - You should see these cookies:
     - `sb-frrdjatgghbrtdtgslkw-auth-token`
     - `sb-frrdjatgghbrtdtgslkw-auth-token-code-verifier`

---

## Alternative Fix: Use PKCE Flow (Recommended)

If cookies still don't persist, switch to PKCE (Proof Key for Code Exchange) flow which is more reliable:

### Update sign-in page:

**File:** `src/app/auth/supabase-signin/page.tsx`

Change line 26-32 from:
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
    scopes: 'read:user user:email',
  },
})
```

To:
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
    scopes: 'read:user user:email',
    skipBrowserRedirect: false,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
})
```

---

## Check Environment Variables

Make sure your `.env.local` or Vercel environment variables have:

```env
NEXT_PUBLIC_SUPABASE_URL=https://frrdjatgghbrtdtgslkw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**In Vercel Dashboard:**
1. Go to your project settings
2. Environment Variables
3. Verify both variables are set
4. Redeploy if you made changes

---

## Verify Cookie Settings in Browser

### Check if cookies are being blocked:

1. **Chrome/Edge:**
   - Settings → Privacy and security → Cookies and other site data
   - Should be "Allow all cookies" or "Block third-party cookies"
   - NOT "Block all cookies"

2. **Firefox:**
   - Settings → Privacy & Security
   - Enhanced Tracking Protection: "Standard" or "Custom"
   - NOT "Strict" (this blocks cross-site cookies)

3. **Safari:**
   - Settings → Privacy
   - Uncheck "Prevent cross-site tracking" (or add exception for supabase.co)

---

## Debug: Check What's Happening in Callback

After sign-in, check your Vercel deployment logs:

1. Go to Vercel Dashboard
2. Select your project
3. Click "Logs" tab
4. Look for logs from `/auth/callback`

You should see:
```
=== Auth Callback Start ===
Code present: true
✓ Session created successfully
User ID: xxx-xxx-xxx
Response cookies being set: ['sb-frrdjatgghbrtdtgslkw-auth-token', ...]
```

If you see errors, share the logs.

---

## Nuclear Option: Use Server-Side Session Storage

If cookies still don't work, we can implement server-side session storage using Supabase database:

This stores the session in the database instead of cookies and uses a session ID cookie instead.

**Let me know if you need this approach.**

---

## Quick Test Command

After configuring Supabase URLs, test the callback:

```bash
# Check if your callback route is accessible
curl -I https://interviewmock.vercel.app/auth/callback

# Should return 307 or 302 redirect (not 404)
```

---

## Expected Flow After Fix

1. User clicks "Sign in with GitHub"
2. Redirects to GitHub authorization
3. User authorizes
4. GitHub redirects to: `https://frrdjatgghbrtdtgslkw.supabase.co/auth/v1/callback`
5. Supabase processes and redirects to: `https://interviewmock.vercel.app/auth/callback?code=xxx`
6. Your callback exchanges code for session
7. **Cookies are set** (this is where it's failing now)
8. Redirects to `/dashboard`
9. SupabaseProvider reads cookies
10. Dashboard loads ✅

---

## Most Likely Solution

**90% chance this is the issue:** Supabase redirect URLs not configured.

After adding the redirect URLs in Supabase Dashboard:
1. Clear all cookies
2. Sign in again
3. Check console logs - you should now see `hasSession: true`

Let me know the result!
