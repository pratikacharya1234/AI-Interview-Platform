# GitHub Authentication Setup Guide

This application uses **GitHub OAuth as the ONLY authentication method**. All email/password authentication has been removed.

## Quick Setup

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: AI Interview Platform (or your preferred name)
   - **Homepage URL**: 
     - Local: `http://localhost:3000`
     - Production: `https://your-domain.com`
   - **Authorization callback URL**: 
     - Local: `http://localhost:3000/api/auth/callback/github`
     - Production: `https://your-domain.com/api/auth/callback/github`
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"** and copy it

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# GitHub OAuth (REQUIRED)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Other required variables...
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Start the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and click **"Sign In with GitHub"**

## Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel Dashboard:
   - `NEXTAUTH_URL` = `https://your-app.vercel.app`
   - `NEXTAUTH_SECRET` = (generate new one)
   - `GITHUB_CLIENT_ID` = (from GitHub OAuth App)
   - `GITHUB_CLIENT_SECRET` = (from GitHub OAuth App)
   - Other required variables...

4. Update GitHub OAuth App:
   - Homepage URL: `https://your-app.vercel.app`
   - Callback URL: `https://your-app.vercel.app/api/auth/callback/github`

5. Deploy!

## Troubleshooting

### "GitHub login not working"

1. **Check environment variables are set correctly**
   ```bash
   # Verify in your terminal
   echo $GITHUB_CLIENT_ID
   echo $NEXTAUTH_URL
   ```

2. **Verify callback URL matches exactly**
   - GitHub OAuth App callback URL must match `{NEXTAUTH_URL}/api/auth/callback/github`

3. **Check NextAuth secret is set**
   - Must be a secure random string
   - Generate with: `openssl rand -base64 32`

4. **Clear browser cookies and try again**
   - Sometimes old session cookies cause issues

5. **Check browser console for errors**
   - Open DevTools (F12) and check Console tab

### "Redirect URI mismatch"

This means your GitHub OAuth App callback URL doesn't match your application URL.

**Fix:**
1. Go to your GitHub OAuth App settings
2. Update the Authorization callback URL to match exactly:
   - `http://localhost:3000/api/auth/callback/github` (local)
   - `https://your-domain.com/api/auth/callback/github` (production)

### "Configuration error"

This usually means environment variables are missing.

**Check:**
- `NEXTAUTH_URL` is set
- `NEXTAUTH_SECRET` is set
- `GITHUB_CLIENT_ID` is set
- `GITHUB_CLIENT_SECRET` is set

## Features

- ✅ GitHub OAuth authentication only
- ✅ Automatic user profile creation
- ✅ Session management with JWT
- ✅ Protected routes with middleware
- ✅ 30-day session duration
- ❌ No email/password authentication
- ❌ No Supabase auth required

## Security Notes

- Never commit `.env.local` to version control
- Use different OAuth apps for development and production
- Rotate secrets regularly
- Keep `NEXTAUTH_SECRET` secure and random

## Need Help?

1. Check the [NextAuth.js documentation](https://next-auth.js.org/)
2. Review [GitHub OAuth documentation](https://docs.github.com/en/apps/oauth-apps)
3. Check application logs for detailed error messages
