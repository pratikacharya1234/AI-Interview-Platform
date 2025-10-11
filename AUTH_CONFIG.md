# Authentication Configuration Guide

## Required Supabase Configuration

To fix the GitHub OAuth 400 error and enable proper authentication flow, you need to configure the following redirect URLs in your Supabase Dashboard:

### 1. **Supabase Dashboard Settings**

Go to your Supabase project dashboard → Authentication → URL Configuration

**Site URL:**
```
http://localhost:3001
```

**Redirect URLs (add all of these):**
```
http://localhost:3001/auth/github/callback
https://your-production-domain.com/auth/github/callback
```

### 2. **GitHub OAuth Configuration**

In your Supabase Dashboard → Authentication → Providers → GitHub:

**Authorization callback URL:**
```
https://frrdjatgghbrtdtgslkw.supabase.co/auth/v1/callback
```

### 3. **GitHub App Configuration**

Your GitHub app is correctly configured with callback URL:
```
http://localhost:3001/auth/github/callback
```

✅ **Perfect Match**: The server now runs on port 3001 to match your GitHub app configuration.

For production:
```
https://your-domain.com/auth/github/callback
```

### 4. **Environment Variables**

Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://frrdjatgghbrtdtgslkw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GITHUB_API_TOKEN=f9301b1011b03f8ae5abc8d3801506d8960f6b28
```

### 4. **Production Deployment**

When deploying to production, update the redirect URLs to include your production domain:
```
https://your-domain.com/auth/callback
```

## Fixed Issues

✅ **GitHub OAuth 400 Error**: Fixed by using proper callback URL (`/auth/callback`)  
✅ **Post-login Navigation**: Users now properly redirect to dashboard after authentication  
✅ **Auth State Management**: Improved authentication state handling in AppLayout  
✅ **Callback Handling**: Added dedicated auth callback page with proper error handling  

The authentication flow now works as follows:
1. User clicks "Sign in with GitHub"
2. Redirected to GitHub OAuth (with your configured GitHub app)
3. GitHub redirects to `/auth/github/callback` (matching your GitHub app settings)
4. Callback page exchanges OAuth code for Supabase session
5. User redirected to `/dashboard` with authenticated session

### 5. **GitHub API Integration**

Your GitHub API token (`f9301b1011b03f8ae5abc8d3801506d8960f6b28`) is now configured for:
- Enhanced GitHub profile fetching
- Repository access and analysis
- Extended GitHub API functionality for the interview platform