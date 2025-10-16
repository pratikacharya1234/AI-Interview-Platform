# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure all environment variables are set in your production environment:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# AI Services
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

### 2. Database Setup

```bash
# Connect to production Supabase
psql postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Run production schema
\i database/production_schema.sql

# Verify tables
\dt

# Check personas
SELECT name, role, company_type FROM interviewer_personas;

# Check achievements
SELECT name, rarity, xp_reward FROM achievements;
```

### 3. Build Optimization

```bash
# Install dependencies
npm ci --production

# Build for production
npm run build

# Test production build locally
npm start
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Configure Environment Variables**
- Go to Vercel Dashboard
- Select your project
- Settings → Environment Variables
- Add all variables from `.env.local`

5. **Configure Domains**
- Settings → Domains
- Add your custom domain
- Update NEXTAUTH_URL to your domain

### Option 2: Docker

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001

CMD ["node", "server.js"]
```

2. **Build Docker Image**
```bash
docker build -t ai-interview-platform .
```

3. **Run Container**
```bash
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_key \
  -e NEXTAUTH_URL=https://your-domain.com \
  -e NEXTAUTH_SECRET=your_secret \
  -e GITHUB_CLIENT_ID=your_client_id \
  -e GITHUB_CLIENT_SECRET=your_client_secret \
  -e GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key \
  ai-interview-platform
```

### Option 3: AWS EC2

1. **Launch EC2 Instance**
- Ubuntu 22.04 LTS
- t3.medium or larger
- Security group: Allow ports 80, 443, 3001

2. **SSH into Instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

4. **Clone and Setup**
```bash
git clone your-repo-url
cd AI-Interview-Platform
npm install
npm run build
```

5. **Configure PM2**
```bash
# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ai-interview-platform',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

6. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/ai-interview-platform
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ai-interview-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Setup SSL with Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check API endpoints
curl https://your-domain.com/api/persona
curl https://your-domain.com/api/company

# Check database connection
# Login to your app and verify data loads
```

### 2. Setup Monitoring

**Vercel Analytics**
- Automatically enabled on Vercel
- View in Vercel Dashboard

**Custom Monitoring**
```bash
# Install monitoring tools
npm install @sentry/nextjs

# Configure Sentry
npx @sentry/wizard -i nextjs
```

### 3. Setup Backups

**Supabase Backups**
- Automatic daily backups on paid plans
- Manual backups: Project Settings → Database → Backups

**Custom Backup Script**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### 4. Performance Optimization

**Enable Caching**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120'
          }
        ]
      }
    ]
  }
}
```

**CDN Configuration**
- Vercel automatically uses CDN
- For custom deployments, use CloudFlare or AWS CloudFront

### 5. Security Hardening

**Rate Limiting**
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s')
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
}
```

**Security Headers**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

## Scaling Considerations

### Database Optimization
- Enable connection pooling in Supabase
- Add indexes for frequently queried fields
- Use database views for complex queries
- Implement query caching

### API Optimization
- Implement Redis caching for static data
- Use edge functions for low-latency responses
- Batch database queries where possible
- Implement pagination for large datasets

### Frontend Optimization
- Enable Next.js Image Optimization
- Implement code splitting
- Use dynamic imports for heavy components
- Enable compression

## Monitoring & Alerts

### Setup Alerts
```bash
# Uptime monitoring
curl -X POST https://api.uptimerobot.com/v2/newMonitor \
  -d "api_key=YOUR_API_KEY" \
  -d "friendly_name=AI Interview Platform" \
  -d "url=https://your-domain.com" \
  -d "type=1"
```

### Log Aggregation
- Use Vercel Logs for Vercel deployments
- Use CloudWatch for AWS deployments
- Use Datadog or New Relic for comprehensive monitoring

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check Supabase status
curl https://status.supabase.com

# Verify connection string
psql $DATABASE_URL -c "SELECT 1"
```

**API Timeout Issues**
- Increase timeout in vercel.json
- Optimize database queries
- Implement caching

**Memory Issues**
- Increase Node.js memory limit
- Optimize bundle size
- Implement lazy loading

## Rollback Procedure

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Docker
```bash
# Tag current version
docker tag ai-interview-platform:latest ai-interview-platform:backup

# Pull previous version
docker pull ai-interview-platform:previous

# Restart container
docker-compose restart
```

## Support

For production support:
- Email: support@ai-interview-platform.com
- Slack: #production-support
- On-call: +1-XXX-XXX-XXXX

## License

MIT License - Production Deployment Guide
