# Troubleshooting: Blank Dashboard After Sign-In

## Problem
After signing in with GitHub, you're redirected to `/dashboard` but see only a blank page instead of your dashboard.

## Root Causes Identified

### 1. **Missing Database Records** ⚠️ **MOST LIKELY**
When you sign in for the first time, Supabase creates a record in `auth.users`, but the application needs additional records in several tables:
- `profiles`
- `user_profiles`
- `user_preferences`
- `user_streaks`
- `user_scores`

**Without these records, the dashboard APIs fail and show a blank page.**

### 2. **Session Not Being Saved**
Cookies from the auth callback might not be persisting correctly.

### 3. **SupabaseProvider Not Loading User**
The client-side Supabase provider might not be reading the session correctly.

---

## Solution: Step-by-Step Diagnostic Process

### **Step 1: Run the Database Migration** 🔧

**THIS IS THE MOST IMPORTANT STEP!**

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Copy the entire contents of `migrations/fix_auth_and_dashboard.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for "Success. No rows returned"

This migration:
- ✅ Creates a database trigger that automatically creates user profiles on sign-in
- ✅ Creates all required tables with proper schemas
- ✅ Backfills records for existing users
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Adds performance indexes

### **Step 2: Clear Browser Data and Test** 🔄

After running the migration:

1. **Sign Out** (if signed in)
2. **Clear Browser Cookies and Cache:**
   - Chrome: Ctrl+Shift+Delete → "Cookies and other site data" → Clear data
   - Firefox: Ctrl+Shift+Delete → Cookies → Clear
3. **Close all browser tabs** for your app
4. **Open browser DevTools** (F12 or Cmd+Option+I)
5. Go to the **Console** tab
6. **Sign in again with GitHub**

### **Step 3: Check Browser Console Logs** 📋

After signing in, you should see logs in the browser console:

**✅ Expected Success Flow:**
```
=== SupabaseProvider: Initializing auth ===
Current pathname: /dashboard
Document cookies: [long string of cookies]
Supabase URL: https://xxxxx.supabase.co...
Calling supabase.auth.getSession()...
✓ Session loaded: { hasSession: true, userId: "xxx-xxx-xxx", email: "you@email.com", ... }
✓ User authenticated: you@email.com
=== SupabaseProvider: Auth initialization complete ===
🔄 Supabase auth state changed: INITIAL_SESSION { hasSession: true, ... }
```

**❌ Problem Indicators:**
```
⚠️ No session found
// OR
❌ Error getting session: [some error]
// OR
ModernLayout: No user detected, showing redirect message
```

### **Step 4: Check Network Tab** 🌐

1. In DevTools, go to **Network** tab
2. Look for the request to `/api/dashboard/stats`
3. Click on it and check the **Response**:

**✅ Good Response:**
```json
{
  "success": true,
  "stats": {
    "totalInterviews": 0,
    "averageScore": 0,
    ...
  },
  "user": {
    "id": "your-user-id",
    "email": "your@email.com"
  }
}
```

**❌ Bad Response:**
```json
{
  "success": false,
  "message": "Please sign in to view your statistics"
}
// OR 500 error
```

### **Step 5: Verify Database Records** 🗄️

In Supabase Dashboard:

1. Go to **Table Editor** (left sidebar)
2. Check the following tables have a record with your user_id:
   - ✅ `auth.users` (should have your record)
   - ✅ `profiles` (check if your record exists)
   - ✅ `user_profiles` (check if your record exists)
   - ✅ `user_preferences` (check if your record exists)
   - ✅ `user_streaks` (check if your record exists)

**If any table is missing your record**, the migration didn't run correctly. Run it again.

### **Step 6: Check Server Logs** 📝

If you're running locally:

```bash
npm run dev
```

Then sign in and look for these logs in your terminal:

**✅ Good Flow:**
```
=== Auth Callback Start ===
Full URL: http://localhost:3000/auth/callback?code=xxx&redirect=/dashboard
Code present: true
✓ Session created successfully
User ID: your-user-id
User email: your@email.com
Response cookies being set: ['sb-access-token', 'sb-refresh-token', ...]
=== Auth Callback End ===
Redirecting to: /dashboard
```

**❌ Problem Indicators:**
```
❌ Error getting session: ...
// OR
No code provided in callback
// OR
No session returned after code exchange
```

---

## Common Issues and Fixes

### Issue 1: "Verifying authentication..." message stays forever

**Cause:** Cookies are not being set or read correctly.

**Fix:**
1. Check if cookies are blocked in your browser (especially in incognito/private mode)
2. Verify your Supabase URL and Anon Key are correct in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Make sure you're using the same domain (don't mix localhost and 127.0.0.1)
4. Clear all cookies and try again

### Issue 2: Dashboard APIs return 401 Unauthorized

**Cause:** Session cookies are not being sent with API requests.

**Fix:**
1. Check if middleware is correctly handling authentication
2. Verify RLS policies are set up correctly (run the migration)
3. Check browser console for CORS errors

### Issue 3: "No rows returned" or empty dashboard stats

**Cause:** User records exist but no interview data yet.

**This is normal for new users!** The dashboard should still load and show zeros.

**If it's blank instead of showing zeros:**
1. Check modern-dashboard.tsx is handling loading/error states
2. Check console for JavaScript errors
3. Run the migration to ensure database schema is correct

### Issue 4: Infinite redirect loop

**Cause:** Middleware thinks user is not authenticated even though they are.

**Fix:**
1. Check middleware.ts is not blocking dashboard route
2. Verify cookies are being set with correct domain and path
3. Clear all cookies and cache, then try again

### Issue 5: "Multiple GoTrueClient instances" warning

**Cause:** Multiple Supabase clients being created.

**Fix:**
The singleton pattern in `src/lib/supabase/client.ts` should prevent this. If you still see it:
1. Check you're not creating clients manually anywhere
2. Use `useSupabase()` hook instead of creating new clients
3. Restart the dev server

---

## Environment Variables Checklist ✅

Make sure these are set in your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Gemini (optional for now)
GEMINI_API_KEY=your_key

# Remove these if present (they're from NextAuth)
# NEXTAUTH_URL - DELETE
# NEXTAUTH_SECRET - DELETE
```

---

## Advanced Debugging

### Enable Detailed Logging

The code now has comprehensive logging. Check:

1. **Browser Console** - Client-side auth flow
2. **Terminal/Server Logs** - Server-side auth flow
3. **Network Tab** - API responses
4. **Supabase Logs** - Go to your Supabase Dashboard → Logs

### Test Authentication API Endpoint

Create a test file to verify auth is working:

```bash
# After signing in, test if you can access protected API
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Cookie: $(curl -c - http://localhost:3000 | grep supabase)"
```

### Check Middleware Is Running

Add this to `middleware.ts` line 4:
```typescript
console.log('Middleware running for:', request.nextUrl.pathname)
```

Restart dev server and watch logs when you navigate to `/dashboard`.

---

## Still Not Working?

If you've tried all the above and still see a blank dashboard:

1. **Share these details:**
   - Browser console logs (full output)
   - Server terminal logs (full output)
   - Network tab screenshot showing `/api/dashboard/stats` response
   - Screenshot of Supabase Table Editor showing `profiles` and `user_profiles` tables

2. **Temporary workaround:**
   - Manually create records in database:
   ```sql
   -- Replace 'your-user-id-here' with your actual user ID from auth.users
   INSERT INTO profiles (id, email, username, full_name)
   VALUES (
     'your-user-id-here',
     'your@email.com',
     'username',
     'Your Name'
   );

   INSERT INTO user_profiles (user_id, display_name)
   VALUES ('your-user-id-here', 'Your Name');

   INSERT INTO user_preferences (user_id)
   VALUES ('your-user-id-here');

   INSERT INTO user_streaks (user_id, streak_type)
   VALUES ('your-user-id-here', 'daily_practice');
   ```

3. **Nuclear option (start fresh):**
   ```bash
   # Clear all local data
   rm -rf .next node_modules
   npm install
   npm run build
   npm run dev
   ```

---

## What Changed

I've added extensive logging to help diagnose the issue:

### Files Updated:
1. **`src/components/providers/supabase-provider.tsx`**
   - Added detailed console logs for auth initialization
   - Added emoji indicators for different auth events
   - Logs show exactly what's happening with your session

2. **`src/components/layout/modern-layout.tsx`**
   - Changed `return null` to show a message instead of blank page
   - Now you'll see "Verifying authentication..." instead of nothing

3. **`src/app/auth/callback/route.ts`**
   - Added logging to show cookies being set
   - Logs show if session was created successfully
   - Shows redirect target

4. **`migrations/fix_auth_and_dashboard.sql`**
   - **RUN THIS FIRST!** - Creates database trigger for auto profile creation

---

## Next Steps

1. ✅ Run the migration SQL in Supabase Dashboard
2. ✅ Clear browser cookies and cache
3. ✅ Sign in again with DevTools console open
4. ✅ Check console logs and share them if still not working

The logs will tell us exactly where the authentication flow is breaking!
