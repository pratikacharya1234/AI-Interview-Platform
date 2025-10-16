# Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
cd AI-Interview-Platform
npm install
```

### Step 2: Setup Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
```

### Step 3: Setup Database
```bash
# Connect to Supabase
psql postgresql://[YOUR_CONNECTION_STRING]

# Run schema
\i database/production_schema.sql
```

### Step 4: Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3001`

## Test the Features

### 1. Test Persona System
```bash
curl http://localhost:3001/api/persona
```

### 2. Test Gamification
```bash
# Login first, then:
curl http://localhost:3001/api/gamification?action=progress
```

### 3. Test Company Profiles
```bash
curl http://localhost:3001/api/company
```

## What You Get

- **7 Interviewer Personas** ready to use
- **12 Achievements** configured
- **7 Company Profiles** (Google, Amazon, Meta, etc.)
- **8 API Endpoints** fully functional
- **15+ Database Tables** with sample data

## Next Steps

1. Read **IMPLEMENTATION_GUIDE.md** for detailed features
2. Check **API_DOCUMENTATION.md** for API usage
3. See **DEPLOYMENT_PRODUCTION.md** for deployment

## Common Issues

**Database connection error?**
- Verify Supabase credentials in `.env.local`
- Check if production_schema.sql ran successfully

**API returns 401?**
- Make sure you're logged in
- Check NextAuth configuration

**Build errors?**
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`

## Production Deployment

**Vercel (Easiest)**
```bash
vercel --prod
```

**Docker**
```bash
docker build -t ai-interview-platform .
docker run -p 3001:3001 ai-interview-platform
```

See **DEPLOYMENT_PRODUCTION.md** for complete guide.

## Features to Try

1. **Multi-Persona Interviews**: Select different interviewers
2. **Voice Analysis**: Analyze interview responses
3. **Gamification**: Earn XP and unlock achievements
4. **Learning Paths**: Generate personalized learning paths
5. **Company Simulations**: Practice for specific companies
6. **Resume Parsing**: Upload and parse resumes
7. **Analytics**: View performance metrics

## Support

- Documentation in project root
- API docs: API_DOCUMENTATION.md
- Deployment: DEPLOYMENT_PRODUCTION.md
