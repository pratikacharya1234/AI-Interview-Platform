# NextAuth → Supabase + Gemini Voice Pipeline Migration

## 🎯 Overview

This migration removes ALL NextAuth code and implements:
1. **Supabase Authentication** - Complete replacement for NextAuth
2. **Gemini Voice Interview Pipeline** - Real-time voice-based interviews using Google Gemini AI

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install @google/generative-ai @google-cloud/text-to-speech zod
```

### 2. Set Environment Variables

**In Vercel Dashboard** and `.env.local`:

```env
# Supabase (REQUIRED - already exists)
NEXT_PUBLIC_SUPABASE_URL=https://frrdjatgghbrtdtgslkw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini API (NEW - REQUIRED)
GEMINI_API_KEY=your-gemini-api-key

# Google Cloud TTS (NEW - REQUIRED)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_TTS_KEY={"type":"service_account",...}

# App Config
NEXT_PUBLIC_APP_URL=https://interviewmock.vercel.app
```

**REMOVE these from Vercel:**
```
NEXTAUTH_URL
NEXTAUTH_SECRET
```

### 3. Run Database Migration

Go to Supabase SQL Editor and run:

```sql
-- Add voice interview columns
ALTER TABLE interview_sessions
ADD COLUMN IF NOT EXISTS interview_type VARCHAR(20) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS voice_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_response_time INTEGER;

ALTER TABLE interview_qa
ADD COLUMN IF NOT EXISTS question_audio_url TEXT,
ADD COLUMN IF NOT EXISTS answer_audio_url TEXT,
ADD COLUMN IF NOT EXISTS answer_duration INTEGER,
ADD COLUMN IF NOT EXISTS clarity_score INTEGER,
ADD COLUMN IF NOT EXISTS confidence_score INTEGER,
ADD COLUMN IF NOT EXISTS relevance_score INTEGER;

-- Create audio cache table
CREATE TABLE IF NOT EXISTS audio_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accessed_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audio_cache_key ON audio_cache(cache_key);

-- RLS for audio_cache
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audio cache is publicly readable"
  ON audio_cache FOR SELECT USING (true);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can read audio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-files');

CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio-files' AND auth.role() = 'authenticated');
```

### 4. Run Migration Script

```bash
# Make script executable
chmod +x scripts/migrate-auth.sh

# Run migration (creates backup branch first)
./scripts/migrate-auth.sh
```

This script will:
- ✅ Create backup branch
- ✅ Delete NextAuth files
- ✅ Update all API routes to use Supabase
- ✅ Update all client components
- ✅ Remove next-auth package
- ✅ Format code
- ✅ Test build

### 5. Manual Review (Important!)

After running the script, review changes:

```bash
git diff
```

Check for any remaining NextAuth references:

```bash
grep -r "next-auth" src/
grep -r "getServerSession" src/
grep -r "NextAuth" src/
```

### 6. Test Locally

```bash
npm run dev
```

**Test these flows:**
1. Sign in with GitHub (should use Supabase)
2. Access protected routes
3. Call API endpoints
4. Sign out

### 7. Deploy

```bash
git add -A
git commit -m "feat: Migrate from NextAuth to Supabase Auth + Gemini Voice Pipeline"
git push origin main
```

---

## 📁 New Files Created

### Authentication
- `src/lib/auth/supabase-auth.ts` - Server-side auth utilities
- `src/lib/auth/client-auth.ts` - Client-side auth functions

### Gemini Voice Pipeline
- `src/lib/services/gemini-service.ts` - Gemini AI integration
- `src/lib/services/tts-service.ts` - Google Cloud TTS
- `src/app/api/interview/voice/start/route.ts` - Start voice interview
- `src/app/api/interview/voice/process-answer/route.ts` - Process audio answers
- `src/components/interview/VoiceRecorder.tsx` - Audio recording component

### Documentation
- `MIGRATION_PLAN.md` - Complete migration plan
- `MIGRATION_README.md` - This file
- `scripts/migrate-auth.sh` - Automation script

---

## 🔧 API Changes

### Before (NextAuth)
```ts
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
const userId = session.user.id
```

### After (Supabase)
```ts
import { requireAuth } from '@/lib/auth/supabase-auth'

const user = await requireAuth() // Throws if not authenticated
const userId = user.id
```

### Client Components

### Before (NextAuth)
```tsx
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
const loading = status === 'loading'
const user = session?.user
```

### After (Supabase)
```tsx
import { useSupabase } from '@/components/providers/supabase-provider'

const { user, loading } = useSupabase()
```

---

## 🎙️ Voice Interview API

### Start Interview
```ts
POST /api/interview/voice/start

Body: {
  role: "behavioral" | "technical",
  position: "Software Engineer",
  difficulty: "easy" | "medium" | "hard",
  industry?: "Technology"
}

Response: {
  session: { id, role, position, difficulty },
  question: { id, number, text, audioUrl }
}
```

### Process Answer
```ts
POST /api/interview/voice/process-answer

Body: FormData {
  audio: File (audio blob),
  sessionId: string,
  questionId: string
}

Response: {
  analysis: { score, relevance, clarity, confidence, feedback, strengths, improvements },
  continue: boolean,
  nextQuestion?: { id, number, text, audioUrl },
  progress: { completed, total, percentage }
}
```

---

## 🧪 Testing Checklist

### Authentication
- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with GitHub OAuth
- [ ] Password reset
- [ ] Email verification
- [ ] Session persistence
- [ ] Auto token refresh
- [ ] Sign out
- [ ] Protected routes redirect
- [ ] API authentication

### Voice Interviews
- [ ] Microphone permission request
- [ ] Start recording
- [ ] Stop recording
- [ ] Pause/resume recording
- [ ] Audio visualization works
- [ ] Audio uploads to Supabase
- [ ] Gemini processes audio
- [ ] TTS generates speech
- [ ] Next question plays
- [ ] Interview completes
- [ ] Feedback displays

### Cross-browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 🚨 Troubleshooting

### "Unauthorized" errors in API routes

**Problem:** User is authenticated but API returns 401

**Solution:**
```ts
// Check if requireAuth is imported
import { requireAuth } from '@/lib/auth/supabase-auth'

// Make sure you're calling it correctly
const user = await requireAuth() // Not const session = ...
```

### Microphone not working

**Problem:** getUserMedia fails or permission denied

**Solutions:**
1. Check HTTPS - voice recording requires secure context
2. Check browser permissions
3. Test in different browser
4. Check console for specific error

### Gemini API errors

**Problem:** "Invalid API key" or rate limits

**Solutions:**
1. Verify GEMINI_API_KEY in environment variables
2. Check API quota in Google AI Studio
3. Implement rate limiting
4. Add retry logic with exponential backoff

### TTS not generating audio

**Problem:** Google Cloud TTS fails

**Solutions:**
1. Verify GOOGLE_CLOUD_PROJECT_ID
2. Check service account key JSON in GOOGLE_CLOUD_TTS_KEY
3. Enable Text-to-Speech API in Google Cloud Console
4. Check billing is enabled

### Build fails

**Problem:** TypeScript errors after migration

**Common fixes:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for type errors
npm run type-check
```

---

## 📊 Cost Estimation

### Gemini API
- **Gemini 2.0 Flash:** ~$0.075 per 1M characters
- **Gemini 1.5 Pro:** ~$3.50 per 1M characters
- **Estimated:** ~$0.10 per voice interview

### Google Cloud TTS
- **Standard voices:** $4.00 per 1M characters
- **WaveNet/Neural2:** $16.00 per 1M characters
- **Estimated:** ~$0.05 per voice interview

### Supabase
- **Free tier:** 500MB database, 1GB file storage
- **Pro:** $25/month for 8GB database, 100GB storage
- **Estimated:** Pro plan sufficient for 1000+ users

**Total per voice interview:** ~$0.15-0.20

---

## 🎯 Next Steps After Migration

1. **Implement remaining voice features:**
   - Complete interview API route
   - Feedback display component
   - Interview history page

2. **Add analytics:**
   - Track interview completion rates
   - Monitor API costs
   - User engagement metrics

3. **Optimize performance:**
   - Audio file compression
   - TTS caching
   - Gemini response caching

4. **Add features:**
   - Multi-language support
   - Custom interview templates
   - Team/organization accounts
   - Interview scheduling

5. **Enhance UX:**
   - Practice mode (no cost)
   - Sample questions preview
   - Progress tracking
   - Achievement system

---

## 📞 Support

If you encounter issues:

1. Check `MIGRATION_PLAN.md` for detailed steps
2. Review console logs (browser + server)
3. Check Supabase logs
4. Check Vercel deployment logs
5. Verify all environment variables are set

---

## ✅ Migration Completion Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database migration run successfully
- [ ] Migration script executed
- [ ] Code reviewed (no NextAuth references)
- [ ] Local testing passed
- [ ] Build succeeds
- [ ] Deployed to Vercel
- [ ] Production testing passed
- [ ] Old NextAuth env vars removed
- [ ] Documentation updated
- [ ] Team notified

**Migration Status:** 🚧 In Progress

**Created:** $(date)
**By:** Claude Code Migration Assistant
