# Fix GitHub Authentication on Vercel

## 🔴 Current Issue

Your app is deployed at `https://interviewmock.vercel.app` but GitHub OAuth is not working because:
1. Environment variables are not set in Vercel
2. GitHub OAuth App callback URL doesn't match your Vercel URL

## ✅ Step-by-Step Fix

### Step 1: Create Production GitHub OAuth App

You need a **separate** GitHub OAuth App for production (different from local development).

1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   ```
   Application name: AI Interview Platform (Production)
   Homepage URL: https://interviewmock.vercel.app
   Authorization callback URL: https://interviewmock.vercel.app/api/auth/callback/github
   ```
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"** and copy it immediately

### Step 2: Generate NEXTAUTH_SECRET

Run this command locally:
```bash
openssl rand -base64 32
```

Copy the output - you'll need it for Vercel.

### Step 3: Configure Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project: **AI-Interview-Platform**
3. Go to **Settings** → **Environment Variables**
4. Add these variables (click "Add" for each):

#### Required Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXTAUTH_URL` | `https://interviewmock.vercel.app` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `<paste the generated secret>` | Production, Preview, Development |
| `GITHUB_CLIENT_ID` | `<your production client id>` | Production, Preview, Development |
| `GITHUB_CLIENT_SECRET` | `<your production client secret>` | Production, Preview, Development |

**Important:** 
- Select **all three environments** (Production, Preview, Development) for each variable
- Use the **production** GitHub OAuth credentials (not your local dev ones)

#### Optional but Recommended:

If you're using other features, also add:
```
GOOGLE_GEMINI_API_KEY=<your-gemini-key>
NEXT_PUBLIC_VAPI_WEB_TOKEN=<your-vapi-token>
NEXT_PUBLIC_VAPI_WORKFLOW_ID=<your-vapi-workflow>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>
```

### Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **three dots** (•••) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 5: Test

1. Visit: https://interviewmock.vercel.app/auth/signin
2. Click **"Sign In with GitHub"**
3. You should be redirected to GitHub
4. Authorize the app
5. You should be redirected back to `/dashboard`

## 🔍 Verification Checklist

Before testing, verify:

- [ ] Created a **new** GitHub OAuth App for production
- [ ] Homepage URL is: `https://interviewmock.vercel.app`
- [ ] Callback URL is: `https://interviewmock.vercel.app/api/auth/callback/github`
- [ ] Added `NEXTAUTH_URL` to Vercel (exact URL, no trailing slash)
- [ ] Added `NEXTAUTH_SECRET` to Vercel (32+ character random string)
- [ ] Added `GITHUB_CLIENT_ID` to Vercel (from production OAuth app)
- [ ] Added `GITHUB_CLIENT_SECRET` to Vercel (from production OAuth app)
- [ ] Selected all environments for each variable
- [ ] Redeployed the application

## 🐛 Troubleshooting

### Error: "Configuration"

**Cause:** Environment variables not set in Vercel

**Fix:**
1. Check Vercel Settings → Environment Variables
2. Ensure all 4 required variables are present
3. Redeploy

### Error: "Redirect URI mismatch"

**Cause:** GitHub OAuth callback URL doesn't match

**Fix:**
1. Go to your GitHub OAuth App settings
2. Verify callback URL is **exactly**: `https://interviewmock.vercel.app/api/auth/callback/github`
3. No trailing slash, must match exactly

### Error: "Invalid credentials"

**Cause:** Wrong Client ID or Secret

**Fix:**
1. Verify you're using the **production** OAuth app credentials
2. Check for copy-paste errors (no extra spaces)
3. Regenerate client secret if needed

### Still Not Working?

Check Vercel logs:
1. Go to Vercel Dashboard → Your Project
2. Click on the latest deployment
3. Click **"Runtime Logs"** tab
4. Look for NextAuth errors

Common issues in logs:
- `NEXTAUTH_SECRET` not set
- `GITHUB_CLIENT_ID` not set
- Invalid callback URL

## 📋 Quick Reference

### Your URLs
- **Production URL:** `https://interviewmock.vercel.app`
- **Sign In Page:** `https://interviewmock.vercel.app/auth/signin`
- **Callback URL:** `https://interviewmock.vercel.app/api/auth/callback/github`

### Required Environment Variables
```bash
NEXTAUTH_URL=https://interviewmock.vercel.app
NEXTAUTH_SECRET=<32+ char random string>
GITHUB_CLIENT_ID=<from production OAuth app>
GITHUB_CLIENT_SECRET=<from production OAuth app>
```

### GitHub OAuth App Settings
```
Homepage URL: https://interviewmock.vercel.app
Authorization callback URL: https://interviewmock.vercel.app/api/auth/callback/github
```

## 🔐 Security Best Practices

1. **Use different OAuth apps for dev and production**
   - Local dev: `http://localhost:3000`
   - Production: `https://interviewmock.vercel.app`

2. **Never commit secrets to git**
   - Keep `.env.local` in `.gitignore`
   - Only set secrets in Vercel dashboard

3. **Rotate secrets regularly**
   - Generate new `NEXTAUTH_SECRET` periodically
   - Regenerate GitHub client secret if compromised

4. **Use environment-specific variables**
   - Set different values for Preview vs Production if needed

## 📞 Need Help?

If you're still having issues:

1. **Check Vercel Runtime Logs** for specific errors
2. **Verify GitHub OAuth App** settings match exactly
3. **Test locally first** to ensure code works
4. **Compare environment variables** between local and Vercel

### Test Locally First

Before deploying, test with production-like settings:

```bash
# In .env.local, temporarily use:
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-production-secret>
GITHUB_CLIENT_ID=<your-production-client-id>
GITHUB_CLIENT_SECRET=<your-production-client-secret>

# Update GitHub OAuth App callback to:
# http://localhost:3000/api/auth/callback/github

# Test
npm run dev
```

If it works locally with production credentials, the issue is Vercel configuration.

## ✅ Success Indicators

When properly configured, you should see:
- ✅ No console errors on sign-in page
- ✅ Clicking "Sign In with GitHub" redirects to GitHub
- ✅ After authorization, redirects back to your app
- ✅ User is logged in and sees dashboard
- ✅ Session persists across page refreshes

## 🎯 Next Steps After Fix

Once authentication works:

1. **Test all protected routes** (dashboard, interview, etc.)
2. **Verify session persistence** (refresh page, still logged in)
3. **Test sign out** functionality
4. **Check mobile responsiveness**
5. **Monitor Vercel logs** for any runtime errors

---

**Last Updated:** Based on your deployment at `https://interviewmock.vercel.app`
