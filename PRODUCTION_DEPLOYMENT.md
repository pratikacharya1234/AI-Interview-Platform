# Production Deployment Guide - Vercel

Your production URL: **https://interviewmock.vercel.app/**

## ⚠️ CRITICAL - Do These Steps in Order

### Step 1: Configure Vercel Environment Variables

1. Go to: https://vercel.com → Your Project → Settings → Environment Variables
2. Add these variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key-from-supabase` |

3. Select Environment: **Production, Preview, and Development**
4. Click **Save**
5. **IMPORTANT**: Go to Deployments tab and click **Redeploy** (with "Use existing Build Cache" UNCHECKED)

### Step 2: Configure Supabase for Production

#### 2a. Add Redirect URLs in Supabase

1. Go to Supabase Dashboard → Your Project
2. Navigate to: **Authentication** → **URL Configuration**
3. In **Redirect URLs** section, add:
   ```
   https://interviewmock.vercel.app/auth/callback
   https://interviewmock.vercel.app
   ```
4. Click **Save**

#### 2b. Configure GitHub Provider in Supabase

1. In Supabase Dashboard: **Authentication** → **Providers** → **GitHub**
2. Make sure GitHub provider is **Enabled**
3. Enter your GitHub OAuth credentials (see Step 3 below)

### Step 3: Configure GitHub OAuth App

You have two options:

#### Option A: Create New OAuth App (Recommended for Production)

1. Go to: https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: `AI Interview Platform - Production`
   - **Homepage URL**: `https://interviewmock.vercel.app`
   - **Application description**: Your description
   - **Authorization callback URL**: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
     - ⚠️ Replace `YOUR-PROJECT-ID` with your actual Supabase project ID
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** → Copy the **Client Secret**
7. Go back to Supabase → **Authentication** → **Providers** → **GitHub**
8. Paste **Client ID** and **Client Secret**
9. Click **Save**

#### Option B: Update Existing OAuth App

1. Go to your existing OAuth app in GitHub
2. Add production URL to callback URLs
3. Update in Supabase if needed

### Step 4: Verify Deployment

1. Clear browser cache and cookies
2. Go to: `https://interviewmock.vercel.app/auth/supabase-signin`
3. Click **Continue with GitHub**
4. Authorize the app
5. You should be redirected to dashboard

## Troubleshooting

### "Invalid Redirect URL" Error

- Check that you added the EXACT URLs to Supabase redirect URLs
- Make sure there are no trailing slashes
- Verify the protocol is `https://` not `http://`

### Environment Variables Not Working

- Make sure you redeployed AFTER adding env variables
- Check the deployment logs in Vercel for any errors
- Use Vercel CLI to check: `vercel env ls`

### Session Not Persisting

- Check browser console for cookie errors
- Verify cookies are not blocked in browser settings
- Make sure you're using HTTPS (Vercel does this automatically)

### GitHub OAuth Error

- Verify callback URL in GitHub OAuth app matches: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
- Check that Client ID and Secret are correct in Supabase
- Make sure GitHub OAuth app is not suspended

## Monitoring

Check these after deployment:

- [ ] Vercel deployment shows "Ready"
- [ ] No errors in Vercel deployment logs
- [ ] Environment variables are set in Vercel
- [ ] Redirect URLs configured in Supabase
- [ ] GitHub OAuth app configured
- [ ] Can sign in successfully
- [ ] Dashboard loads after sign in
- [ ] Can sign out successfully

## Quick Commands

```bash
# Check environment variables
vercel env ls

# Pull environment variables locally
vercel env pull

# Trigger new deployment
vercel --prod

# View deployment logs
vercel logs
```

## Need Help?

If you're still having issues:
1. Check Vercel deployment logs
2. Check browser console (F12) for errors
3. Check Network tab to see which request is failing
4. Verify all environment variables are set
