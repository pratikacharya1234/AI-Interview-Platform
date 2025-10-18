# Production Deployment Guide

This guide covers the deployment of the AI Interview Platform to production environments.

## Prerequisites

- Supabase account and project
- Vercel/Netlify account (or preferred hosting platform)
- GitHub repository
- Domain name (optional)

## Supabase Project Setup

### 1. Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note your project URL and API keys
3. Navigate to SQL Editor in your Supabase dashboard

### 2. Deploy Database Schema

Copy and execute the contents of `supabase/migrations/001_initial_schema.sql` in the SQL Editor:

```sql
-- Copy the entire contents of the migration file
-- This will create all tables, policies, views, and functions
```

### 3. Configure Authentication

1. Go to Authentication → Settings in your Supabase dashboard
2. Configure GitHub OAuth:
   - Enable GitHub provider
   - Add your GitHub OAuth app credentials
   - Set redirect URLs for your production domain

### 4. Set Up Row Level Security

RLS policies are automatically created by the migration script. Verify they're active:
- Check Authentication → Policies in the dashboard
- Ensure all tables have appropriate policies enabled

## Deployment Guide for AI Interview Platform

## 🚀 Quick Deployment to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pratikacharya1234/AI-Interview-Platform)

## Prerequisites

1. **Vercel Account** - [Sign up for free](https://vercel.com/signup)
2. **GitHub Account** - For OAuth authentication
3. **API Keys** - See required keys below

## 🔑 Environment Variables Setup

### Required Variables (App won't work without these)

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NEXTAUTH_URL` | Your deployment URL | `https://your-app.vercel.app` (set after deployment) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | Run: `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | [GitHub Developer Settings](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret | Same as above |
| `GOOGLE_GEMINI_API_KEY` | For AI features | [Google AI Studio](https://makersuite.google.com/app/apikey) |

### Optional Variables (For additional features)

| Variable | Description | Required For |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Database features |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Database features |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | Database features |
| `ELEVENLABS_API_KEY` | ElevenLabs API | Voice features |
| `LEONARDO_API_KEY` | Leonardo AI | Image generation |

## 📝 Step-by-Step Deployment

### Step 1: GitHub OAuth Setup

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: AI Interview Pro
   - **Homepage URL**: `https://your-app.vercel.app`
   - **Authorization callback URL**: `https://your-app.vercel.app/api/auth/callback/github`
4. Click **"Register application"**
5. Copy the **Client ID** and generate a **Client Secret**

### Step 2: Deploy to Vercel

1. Click the deploy button above or go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import the GitHub repository
3. Configure environment variables:
   ```
   NEXTAUTH_URL=https://[your-project].vercel.app
   NEXTAUTH_SECRET=[generated-secret]
   GITHUB_CLIENT_ID=[your-github-client-id]
   GITHUB_CLIENT_SECRET=[your-github-client-secret]
   GOOGLE_GEMINI_API_KEY=[your-gemini-api-key]
   ```
4. Click **"Deploy"**

### Step 3: Post-Deployment Configuration

1. **Update NEXTAUTH_URL**:
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Update `NEXTAUTH_URL` with your actual deployment URL
   - Redeploy the project

2. **Update GitHub OAuth**:
   - Return to GitHub OAuth App settings
   - Update URLs with your actual Vercel deployment URL

## 🧪 Testing Your Deployment

1. **Authentication Test**:
   - Visit your deployed app
   - Click "Sign In"
   - Authenticate with GitHub
   - Verify redirect to dashboard

2. **AI Features Test**:
   - Start a practice interview
   - Test text-based interview
   - Verify AI responses

3. **Navigation Test**:
   - Check all navigation links
   - Verify mobile responsiveness
   - Test command palette (Cmd/Ctrl + K)

## 🐛 Troubleshooting Common Issues

### Issue: "CLIENT_FETCH_ERROR" on sign-in

**Solution**:
- Verify `NEXTAUTH_URL` matches your deployment URL exactly
- Ensure `NEXTAUTH_SECRET` is set
- Check GitHub OAuth callback URL

### Issue: 404 errors on navigation

**Solution**:
- Clear browser cache
- Verify all pages are deployed
- Check Vercel build logs

### Issue: AI features not working

**Solution**:
- Verify `GOOGLE_GEMINI_API_KEY` is valid
- Check API quotas
- Review Vercel Functions logs

### Issue: Database features not working

**Solution**:
- Supabase variables are optional
- App works without database
- Features will use mock data if Supabase is not configured

## 📊 Monitoring & Analytics

### Vercel Analytics
- Enable Web Analytics in Vercel Dashboard
- Monitor performance metrics
- Track user engagement

### Error Tracking
- Check Vercel Functions logs
- Monitor browser console for client errors
- Review build logs for compilation issues

## 🔄 Updating Your Deployment

1. **Automatic Updates**:
   - Push changes to main branch
   - Vercel auto-deploys on push

2. **Manual Redeploy**:
   - Go to Vercel Dashboard
   - Click "Redeploy"
   - Select deployment to redeploy

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/pratikacharya1234/AI-Interview-Platform/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/pratikacharya1234/AI-Interview-Platform/discussions)
- **Email Support**: support@aiinterviewpro.com

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## Environment Configuration

### 1. Production Environment Variables

Create `.env.production` with these required variables:

```bash
# Supabase (from your project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GitHub OAuth (from GitHub Developer Settings)
GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret

# OpenAI (from OpenAI API dashboard)
OPENAI_API_KEY=your-openai-api-key

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
JWT_SECRET=your-secure-random-string
```

### 2. GitHub OAuth App Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create a new OAuth app:
   - Application name: "AI Interview Platform"
   - Homepage URL: `https://your-domain.com`
   - Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
3. Note the Client ID and Client Secret

## Deployment Platforms

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Netlify Deployment

1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: `npm run build && npm run export`
   - Publish directory: `out`
3. Add environment variables in site settings

### Custom Server Deployment

For custom servers (VPS, AWS EC2, etc.):

```bash
# Clone repository
git clone https://github.com/your-username/ai-interview-platform.git
cd ai-interview-platform

# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start
```

## Domain and SSL Setup

### 1. Configure Custom Domain

1. Update `NEXT_PUBLIC_APP_URL` in environment variables
2. Configure DNS records to point to your hosting platform
3. Enable SSL/TLS certificates (automatic on Vercel/Netlify)

### 2. Update Supabase Settings

1. Go to Authentication → Settings in Supabase
2. Update "Site URL" to your production domain
3. Add production domain to "Additional Redirect URLs"

## Database Management

### 1. Backup Strategy

Set up automated backups in Supabase:
- Go to Settings → Database
- Enable automatic backups
- Configure backup retention period

### 2. Monitoring

Set up monitoring for:
- Database performance metrics
- API usage and rate limits
- Authentication errors
- Application performance

### 3. Scaling Considerations

For high-traffic applications:
- Monitor database connection limits
- Consider read replicas for analytics queries
- Implement caching strategies
- Set up CDN for static assets

## Security Checklist

### 1. Authentication Security

- [ ] GitHub OAuth configured with production credentials
- [ ] JWT secrets are cryptographically secure
- [ ] Row Level Security policies tested and active
- [ ] API rate limiting configured

### 2. Application Security

- [ ] All environment variables secured
- [ ] HTTPS enforced for production
- [ ] Content Security Policy headers configured
- [ ] API endpoints protected with authentication

### 3. Database Security

- [ ] Database passwords are strong and unique
- [ ] Service role key kept secure and never exposed
- [ ] Regular security updates applied
- [ ] Database access logs monitored

## Performance Optimization

### 1. Frontend Optimization

```typescript
// Enable Next.js optimization features
// next.config.js
module.exports = {
  compress: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif']
  },
  experimental: {
    optimizeCss: true
  }
}
```

### 2. Database Optimization

- Monitor slow queries in Supabase dashboard
- Optimize indexes for common query patterns
- Use database views for complex aggregations
- Implement pagination for large data sets

## Monitoring and Maintenance

### 1. Application Monitoring

Set up monitoring for:
- Application errors and exceptions
- API response times
- User authentication failures
- Database query performance

### 2. Regular Maintenance Tasks

- Review and rotate API keys quarterly
- Monitor database storage usage
- Update dependencies regularly
- Review and audit user permissions

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify GitHub OAuth configuration
   - Check redirect URLs match exactly
   - Ensure JWT secrets are properly set

2. **Database Connection Issues**
   - Check connection string format
   - Verify network connectivity
   - Monitor connection pool usage

3. **API Rate Limiting**
   - Implement proper error handling
   - Add retry logic with exponential backoff
   - Monitor API usage patterns

### Support Resources

- Supabase Documentation: https://supabase.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- GitHub OAuth Setup: https://docs.github.com/en/apps/oauth-apps

---

This production deployment guide ensures a secure, scalable deployment of your AI Interview Platform.