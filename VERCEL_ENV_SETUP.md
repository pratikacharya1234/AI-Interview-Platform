# 🚀 Vercel Environment Variables Setup Guide

## ❌ Current Error
```
Deployment failed — Environment Variable "NEXTAUTH_URL" references Secret "nextauth_url", which does not exist.
```

## ✅ Solution: Add Environment Variables in Vercel Dashboard

### Step 1: Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **AI-Interview-Platform**
3. Navigate to **Settings** → **Environment Variables**

### Step 2: Add Required Environment Variables

Add these variables **EXACTLY** as shown (copy-paste to avoid typos):

#### 🔴 REQUIRED Variables (App won't work without these)

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXTAUTH_URL` | `https://project-wczx.vercel.app` | Production |
| `NEXTAUTH_SECRET` | Generate using command below | Production |
| `GITHUB_CLIENT_ID` | Your GitHub OAuth App Client ID | Production |
| `GITHUB_CLIENT_SECRET` | Your GitHub OAuth App Client Secret | Production |

#### 🟡 OPTIONAL Variables (App works without these)

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `GOOGLE_GEMINI_API_KEY` | Your Gemini API Key (for AI features) | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL (if using) | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key (if using) | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Key (if using) | Production |

### Step 3: Generate NEXTAUTH_SECRET

Run this command in your terminal to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use it as the value for `NEXTAUTH_SECRET`.

### Step 4: Configure GitHub OAuth

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"** or update existing
3. Set these values:
   - **Application name**: AI Interview Platform
   - **Homepage URL**: `https://project-wczx.vercel.app`
   - **Authorization callback URL**: `https://project-wczx.vercel.app/api/auth/callback/github`
4. Click **"Register application"**
5. Copy:
   - **Client ID** → Use for `GITHUB_CLIENT_ID`
   - **Client Secret** (generate if needed) → Use for `GITHUB_CLIENT_SECRET`

### Step 5: Add Variables in Vercel

For each variable:
1. Click **"Add New"** in Environment Variables section
2. Enter the **Key** (e.g., `NEXTAUTH_URL`)
3. Enter the **Value** (e.g., `https://project-wczx.vercel.app`)
4. Select **Production** environment
5. Click **"Save"**

### Step 6: Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"..."** menu → **"Redeploy"**
4. Select **"Redeploy with existing Build Cache"** → **No** (important!)
5. Click **"Redeploy"**

## 📋 Quick Copy-Paste Values

```env
NEXTAUTH_URL=https://project-wczx.vercel.app
NEXTAUTH_SECRET=[YOUR_GENERATED_SECRET_HERE]
GITHUB_CLIENT_ID=[YOUR_GITHUB_CLIENT_ID]
GITHUB_CLIENT_SECRET=[YOUR_GITHUB_CLIENT_SECRET]
```

## 🔍 Verification Checklist

After deployment:
- [ ] No deployment errors
- [ ] Homepage loads at https://project-wczx.vercel.app
- [ ] Sign in button works
- [ ] GitHub OAuth redirects properly
- [ ] After auth, redirects to dashboard

## 🆘 Troubleshooting

### If deployment still fails:
1. **Double-check variable names** - They must match EXACTLY (case-sensitive)
2. **No quotes** in values - Just paste the raw value
3. **No trailing slashes** in URLs
4. **Clear build cache** - Select "Don't use cache" when redeploying

### If authentication fails:
1. Verify `NEXTAUTH_URL` matches your Vercel URL exactly
2. Check GitHub OAuth callback URL matches
3. Ensure `NEXTAUTH_SECRET` is set (any random string works for testing)

### Common Mistakes to Avoid:
- ❌ Don't use `@secret_name` syntax in environment values
- ❌ Don't include quotes around values
- ❌ Don't add trailing slashes to URLs
- ❌ Don't forget to select "Production" environment

## 📝 Example Working Configuration

Here's what your Vercel Environment Variables page should look like:

```
NEXTAUTH_URL             = https://project-wczx.vercel.app        [Production]
NEXTAUTH_SECRET          = abc123xyz789...                         [Production]
GITHUB_CLIENT_ID         = Iv1.8a61f9b3a7aba766                    [Production]
GITHUB_CLIENT_SECRET     = 1234567890abcdef...                     [Production]
```

## 🎯 Expected Result

After following these steps:
1. ✅ Deployment succeeds without errors
2. ✅ Site loads at https://project-wczx.vercel.app
3. ✅ Authentication works with GitHub
4. ✅ All navigation links functional

---

**Need more help?** Check the [Vercel Function Logs](https://vercel.com/dashboard/[your-project]/functions) for detailed error messages.
