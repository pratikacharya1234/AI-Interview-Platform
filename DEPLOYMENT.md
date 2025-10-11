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