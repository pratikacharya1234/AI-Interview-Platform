# 🚀 Production Environment Setup

## Required Environment Variables for Production

Add these to your Vercel/Netlify/Railway environment variables:

### 1. Essential Variables (MUST HAVE)
```env
# Supabase (Required for Auth)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[your-anon-key]

# NextAuth (Required for Sessions)
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=[generate-with-command-below]
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

### 2. Optional Variables (For Full Features)
```env
# GitHub OAuth (Optional - for GitHub login)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# AI Features (Optional - for interview AI)
OPENAI_API_KEY=sk-...
GOOGLE_GEMINI_API_KEY=AI...
```

---

## Vercel Deployment Steps

### Step 1: Import Project
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework Preset: **Next.js**
4. Root Directory: **./** (leave as is)

### Step 2: Add Environment Variables
1. In Vercel project settings
2. Go to **Settings** → **Environment Variables**
3. Add each variable from above
4. **Important**: Set NEXTAUTH_URL to your Vercel URL:
   ```
   https://[your-project].vercel.app
   ```

### Step 3: Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Visit your site!

---

## Netlify Deployment Steps

### Step 1: Deploy Site
1. Go to https://app.netlify.com
2. Drag your project folder or connect GitHub
3. Build command: `npm run build`
4. Publish directory: `.next`

### Step 2: Add Environment Variables
1. Go to **Site settings** → **Environment variables**
2. Add all variables from above
3. Set NEXTAUTH_URL to your Netlify URL:
   ```
   https://[your-site].netlify.app
   ```

### Step 3: Add Redirects
Create `netlify.toml` in root:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

---

## Railway Deployment

### Step 1: Create New Project
1. Go to https://railway.app
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository

### Step 2: Add Variables
1. Go to **Variables** tab
2. Add all environment variables
3. Set NEXTAUTH_URL to Railway URL:
   ```
   https://[your-app].up.railway.app
   ```

### Step 3: Deploy
Railway auto-deploys on push!

---

## Production Checklist

### Before Deploying:
- [ ] Set all required environment variables
- [ ] NEXTAUTH_URL matches your production URL
- [ ] NEXTAUTH_SECRET is generated (not placeholder)
- [ ] Supabase project is in production mode

### After Deploying:
- [ ] Test sign up with email
- [ ] Test sign in
- [ ] Test protected routes
- [ ] Check console for errors

---

## Common Production Issues

### "Invalid login credentials"
**Solution**: Users need to sign up first
- Direct them to sign up flow
- Or use demo account

### "NEXTAUTH_URL mismatch"
**Solution**: Ensure NEXTAUTH_URL exactly matches your domain
```env
# Correct
NEXTAUTH_URL=https://myapp.vercel.app

# Wrong (trailing slash)
NEXTAUTH_URL=https://myapp.vercel.app/
```

### "GitHub login not working"
**Solution**: Update GitHub OAuth callback URL
1. Go to GitHub OAuth app settings
2. Update callback URL to:
   ```
   https://your-domain.com/api/auth/callback/github
   ```

### "Supabase connection failed"
**Solution**: Check Supabase URL and keys
- Ensure no extra spaces in keys
- Check if Supabase project is paused

---

## Minimal Production Setup (Fastest)

If you want to deploy ASAP with minimal config:

### 1. Only add these 4 variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXTAUTH_URL=https://your-site.vercel.app
NEXTAUTH_SECRET=any-random-32-char-string
```

### 2. Users can:
- Sign up with email/password
- Use demo account
- Access all features

### 3. GitHub login will show but won't work
- That's okay! Email auth works fine
- Add GitHub OAuth later if needed

---

## Testing Production

### Quick Test:
1. Visit: `https://your-site.vercel.app/auth/signin`
2. Click **"Try Demo Account"**
3. Should redirect to dashboard

### Full Test:
1. Sign up with new email
2. Sign in
3. Visit `/dashboard`
4. Visit `/interview/audio`
5. Check browser console for errors

---

## Support

If auth isn't working in production:
1. Check environment variables are set
2. Check NEXTAUTH_URL matches exactly
3. Try email auth instead of GitHub
4. Check Vercel/Netlify function logs

The app is designed to work even with minimal configuration!
