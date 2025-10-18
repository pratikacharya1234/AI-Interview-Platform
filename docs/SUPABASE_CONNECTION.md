# 🔗 Complete Supabase Backend Connection Guide

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project name**: `ai-interview-platform`
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Click "Create Project" and wait for setup

## Step 2: Get Your API Keys

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Add them to your `.env.local` file

## Step 3: Setup Database Tables

1. Go to **SQL Editor** in Supabase Dashboard
2. Click "New Query"
3. Copy and paste the entire contents of `/database/complete_setup.sql`
4. Click "Run" to execute the script
5. You should see "Database setup completed successfully!" message

## Step 4: Configure Authentication

### Enable Email/Password Auth:
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email settings:
   - Enable email confirmations (optional)
   - Set redirect URLs

### Enable GitHub OAuth:
1. In **Authentication** → **Providers**
2. Enable **GitHub**
3. Add your GitHub OAuth credentials:
   - Client ID
   - Client Secret
4. Set callback URL: `https://your-project.supabase.co/auth/v1/callback`

### Enable Google OAuth (Optional):
1. Enable **Google** provider
2. Add Google OAuth credentials
3. Set authorized redirect URIs

## Step 5: Update Environment Variables

Create or update `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# OAuth Providers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Python Service (for ranking engine)
PYTHON_SERVICE_URL=http://localhost:8000

# Optional: AI Services
GOOGLE_GEMINI_API_KEY=your-gemini-key
ELEVENLABS_API_KEY=your-elevenlabs-key
```

## Step 6: Test Database Connection

Run this test script to verify connection:

```typescript
// test-connection.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testConnection() {
  try {
    // Test 1: Check if tables exist
    const { data: tables, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return
    }
    
    console.log('✅ Successfully connected to Supabase!')
    
    // Test 2: Check auth
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Current user:', user ? user.email : 'Not authenticated')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testConnection()
```

## Step 7: API Routes Integration

The platform includes these Supabase-integrated API routes:

### Interview Management
- `POST /api/interview/create` - Create new interview session
- `GET /api/interview/[id]` - Get interview details
- `PUT /api/interview/[id]` - Update interview session
- `POST /api/interview/complete` - Mark interview as complete

### Leaderboard & Gamification
- `GET /api/leaderboard` - Get leaderboard rankings
- `GET /api/streaks` - Get user streak data
- `POST /api/streaks` - Update streak information

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/profile/stats` - Get user statistics

## Step 8: Database Service Usage

Use the provided database service for all operations:

```typescript
import { DatabaseService } from '@/lib/supabase/database'

// Client-side usage
const db = new DatabaseService(false)

// Get user profile
const { data: profile, error } = await db.getOrCreateProfile(userId)

// Create interview session
const { data: session } = await db.createInterviewSession({
  user_id: userId,
  interview_type: 'behavioral',
  title: 'Practice Interview',
  status: 'pending'
})

// Update scores
await db.updateUserScores(userId, {
  ai_accuracy_score: 85,
  communication_score: 90,
  completion_rate: 100
})

// Get leaderboard
const { data: leaderboard } = await db.getLeaderboard(20, 0)
```

## Step 9: Real-time Subscriptions (Optional)

Enable real-time updates for live features:

```typescript
// Subscribe to interview updates
const subscription = supabase
  .channel('interview-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'interview_sessions',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Interview updated:', payload.new)
    }
  )
  .subscribe()

// Clean up subscription
subscription.unsubscribe()
```

## Step 10: Production Deployment

### For Vercel:
1. Add all environment variables in Vercel Dashboard
2. Set `NEXTAUTH_URL` to your production URL
3. Update OAuth callback URLs to production domain
4. Enable Supabase connection pooling for better performance

### Security Checklist:
- [ ] RLS policies are enabled on all tables
- [ ] Service role key is only used server-side
- [ ] API routes validate user authentication
- [ ] Sensitive operations check user permissions
- [ ] Rate limiting is configured

## Troubleshooting

### Common Issues:

**1. "relation does not exist" error**
- Run the complete_setup.sql script in SQL Editor
- Ensure all migrations completed successfully

**2. Authentication not working**
- Check NEXTAUTH_URL matches your domain
- Verify OAuth callback URLs are correct
- Ensure auth providers are enabled in Supabase

**3. Permission denied errors**
- Check RLS policies are properly configured
- Verify user is authenticated
- Ensure proper role assignments

**4. Slow queries**
- Check if indexes are created
- Enable connection pooling
- Use pagination for large datasets

## Monitoring

### Supabase Dashboard:
- **Database** → Monitor query performance
- **Authentication** → Track user signups
- **Storage** → Monitor file uploads
- **Logs** → Debug issues

### Key Metrics to Track:
- Active users
- Interview completion rate
- Average session duration
- Leaderboard participation
- Streak retention

## Support

- **Documentation**: [Supabase Docs](https://supabase.com/docs)
- **Discord**: [Supabase Discord](https://discord.supabase.com)
- **GitHub Issues**: Report platform-specific issues

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run database setup
# Copy complete_setup.sql content to Supabase SQL Editor and run

# Test connection
npm run test:db

# Start development server
npm run dev

# Build for production
npm run build
```

Your Supabase backend is now fully connected and ready to use! 🎉
