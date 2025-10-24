# Complete NextAuth → Supabase + Gemini Voice Pipeline Migration Plan

## Phase 1: Authentication Migration (Priority: CRITICAL) ✅ In Progress

### 1.1 Core Auth Infrastructure (DONE)
- ✅ Created `/src/lib/auth/supabase-auth.ts` - Server-side auth utilities
- ✅ Created `/src/lib/auth/client-auth.ts` - Client-side auth functions
- ✅ Existing Supabase client already configured

### 1.2 Remove NextAuth (TODO - HIGH PRIORITY)

**Files to DELETE:**
```
src/app/api/auth/[...nextauth]/route.ts
src/app/api/auth/debug/route.ts
src/lib/auth.ts
src/lib/auth-unified.ts
src/lib/github.ts (if only used for NextAuth)
```

**API Routes to Update (30+ files):**
Replace this pattern:
```ts
import { getServerSession } from 'next-auth/next'
const session = await getServerSession(authOptions)
```

With:
```ts
import { requireAuth } from '@/lib/auth/supabase-auth'
const user = await requireAuth()
```

Files:
- src/app/api/gamification/route.ts
- src/app/api/ai/coaching/route.ts
- src/app/api/ai/feedback/route.ts
- src/app/api/ai/voice/route.ts
- src/app/api/ai/metrics/route.ts
- src/app/api/ai/prep/route.ts
- src/app/api/analytics/route.ts
- src/app/api/mentor/route.ts
- src/app/api/company/route.ts
- src/app/api/persona/route.ts
- src/app/api/interview/history/route.ts
- src/app/api/interview/save/route.ts
- src/app/api/voice-analysis/route.ts
- src/app/api/speech-to-text/route.ts
- src/app/api/system-check/route.ts
- src/app/api/video-interview/report/[reportId]/route.ts
- src/app/api/video-interview/initial-question/route.ts
- src/app/api/video-interview/metrics/route.ts
- src/app/api/video-interview/end/route.ts
- src/app/api/video-interview/process/route.ts
- src/app/api/video-interview/start/route.ts
- src/app/api/learning-path/route.ts
- src/app/api/resume/route.ts

**Client Components to Update:**
Replace this pattern:
```ts
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
```

With:
```ts
import { useSupabase } from '@/components/providers/supabase-provider'
const { user, loading } = useSupabase()
```

Files:
- src/components/VideoInterviewNew.tsx
- src/components/AIInterviewComponent.tsx
- src/components/navigation/landing-navigation.tsx
- src/contexts/AIFeaturesContext.tsx

### 1.3 Environment Variables

**REMOVE:**
```
NEXTAUTH_URL
NEXTAUTH_SECRET
GITHUB_CLIENT_ID (if not used elsewhere)
GITHUB_CLIENT_SECRET (if not used elsewhere)
```

**ENSURE EXISTS:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## Phase 2: Gemini Voice Pipeline (Priority: CRITICAL) ✅ In Progress

### 2.1 Core Services (DONE)
- ✅ Created `/src/lib/services/gemini-service.ts` - Gemini AI integration
- ✅ Created `/src/lib/services/tts-service.ts` - Google Cloud TTS

### 2.2 Voice Interview API Routes (IN PROGRESS)

**Created:**
- ✅ `/src/app/api/interview/voice/start/route.ts`

**TODO:**
Create these API routes:

#### `/src/app/api/interview/voice/process-answer/route.ts`
```ts
POST - Process user's audio answer
- Accept audio blob + session ID + question ID
- Send audio to Gemini for analysis
- Generate next question or feedback
- Convert response to speech
- Store in database
- Return analysis + next question + audio URL
```

#### `/src/app/api/interview/voice/complete/route.ts`
```ts
POST - Complete interview and generate comprehensive feedback
- Accept session ID
- Fetch all Q&A pairs
- Generate comprehensive feedback using Gemini Pro
- Calculate final scores
- Store performance metrics
- Return detailed feedback
```

#### `/src/app/api/interview/voice/history/route.ts`
```ts
GET - Get user's voice interview history
- Pagination support
- Filter by date range, difficulty, role
- Return session summaries with scores
```

#### `/src/app/api/interview/voice/feedback/[sessionId]/route.ts`
```ts
GET - Get detailed feedback for specific session
- Fetch session data
- Return comprehensive feedback and scores
- Include improvement recommendations
```

### 2.3 Database Schema Updates

**Run this SQL in Supabase:**

```sql
-- Add voice-specific columns to interview_sessions
ALTER TABLE interview_sessions
ADD COLUMN IF NOT EXISTS interview_type VARCHAR(20) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS voice_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_response_time INTEGER; -- seconds

-- Add audio URLs to interview_qa
ALTER TABLE interview_qa
ADD COLUMN IF NOT EXISTS question_audio_url TEXT,
ADD COLUMN IF NOT EXISTS answer_audio_url TEXT,
ADD COLUMN IF NOT EXISTS answer_duration INTEGER, -- seconds
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audio_cache_key ON audio_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_interview_type ON interview_sessions(interview_type);
CREATE INDEX IF NOT EXISTS idx_voice_enabled ON interview_sessions(voice_enabled);

-- RLS policies for audio_cache
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audio cache is publicly readable"
  ON audio_cache FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert audio cache"
  ON audio_cache FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Create Supabase Storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can read audio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-files');

CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio-files' AND
    auth.role() = 'authenticated'
  );
```

### 2.4 Frontend Components (TODO)

#### `/src/components/interview/VoiceRecorder.tsx`
```tsx
- useMediaRecorder or custom audio recording
- Real-time waveform visualization
- Start/stop/pause controls
- Audio level meters
- Error handling for permissions
- Browser compatibility checks
```

#### `/src/components/interview/AudioPlayer.tsx`
```tsx
- Play/pause controls
- Progress bar
- Speed control (0.75x, 1x, 1.25x, 1.5x)
- Replay button
- Loading states
```

#### `/src/components/interview/VoiceInterviewInterface.tsx`
```tsx
- Main interview UI
- Question display (text + audio)
- VoiceRecorder integration
- AudioPlayer for AI responses
- Progress indicator
- Interview transcript sidebar
- Real-time feedback display
```

#### `/src/components/interview/FeedbackDisplay.tsx`
```tsx
- Score visualization (radial charts)
- Strengths/weaknesses cards
- Detailed feedback sections
- Improvement plan checklist
- Industry comparison
- Download/share options
```

#### `/src/app/interview/voice/page.tsx`
```tsx
- Interview setup form (role, position, difficulty)
- VoiceInterviewInterface wrapper
- Loading states
- Error boundaries
- Success completion flow
```

### 2.5 Audio Utilities (TODO)

#### `/src/lib/utils/audioUtils.ts`
```ts
- recordAudio() - MediaRecorder wrapper
- stopRecording() - Get audio blob
- convertWebMToWAV() - Format conversion if needed
- getAudioDuration() - Calculate duration
- validateAudioFile() - Check size, format
- compressAudio() - Reduce file size
```

---

## Phase 3: Testing & Quality Assurance

### 3.1 Authentication Testing
- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] OAuth with GitHub
- [ ] Password reset flow
- [ ] Email verification
- [ ] Session persistence
- [ ] Auto token refresh
- [ ] Sign out functionality
- [ ] Protected routes redirect
- [ ] API route authentication

### 3.2 Voice Interview Testing
- [ ] Start interview (all difficulty levels)
- [ ] Record audio answer
- [ ] Gemini audio processing
- [ ] TTS generation and playback
- [ ] Next question generation
- [ ] Complete interview
- [ ] View comprehensive feedback
- [ ] View interview history
- [ ] Microphone permissions
- [ ] Error handling (network issues)
- [ ] Browser compatibility (Chrome, Firefox, Safari)
- [ ] Mobile device support

### 3.3 Performance Testing
- [ ] Audio file upload speed
- [ ] TTS generation time
- [ ] Gemini response time
- [ ] Database query performance
- [ ] Storage quota management
- [ ] API rate limiting

---

## Phase 4: Documentation

### 4.1 Update README.md
- Setup instructions
- Environment variables
- Database setup
- OAuth configuration
- Google Cloud setup
- Gemini API setup

### 4.2 API Documentation
- All endpoints with examples
- Request/response schemas
- Error codes and messages
- Rate limiting info

### 4.3 Component Documentation
- Props and usage examples
- State management
- Event handlers
- Accessibility features

---

## Implementation Priority Order

1. **CRITICAL - Remove NextAuth** (Blocks everything)
   - Update all 30+ API routes
   - Update 4 client components
   - Delete NextAuth files
   - Test authentication flow

2. **CRITICAL - Voice Interview API Routes**
   - Process answer route
   - Complete interview route
   - History route
   - Feedback route

3. **HIGH - Database Schema**
   - Run migration SQL
   - Create storage bucket
   - Test RLS policies

4. **HIGH - Frontend Components**
   - VoiceRecorder
   - AudioPlayer
   - VoiceInterviewInterface
   - FeedbackDisplay

5. **MEDIUM - Audio Utilities**
   - Recording helpers
   - Conversion functions
   - Validation

6. **LOW - Polish & Documentation**
   - README updates
   - API docs
   - Component docs
   - Testing

---

## Environment Variables Checklist

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini API (REQUIRED)
GEMINI_API_KEY=your-gemini-api-key

# Google Cloud TTS (REQUIRED)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_TTS_KEY={"type":"service_account",...}

# App Config (REQUIRED)
NEXT_PUBLIC_APP_URL=https://interviewmock.vercel.app
```

---

## NPM Dependencies to Install

```bash
npm install @google/generative-ai
npm install @google-cloud/text-to-speech
npm install zod
```

---

## Quick Start Commands

```bash
# 1. Install new dependencies
npm install @google/generative-ai @google-cloud/text-to-speech zod

# 2. Set environment variables in Vercel and .env.local

# 3. Run database migration SQL in Supabase SQL Editor

# 4. Test build
npm run build

# 5. Deploy to Vercel
git push origin main
```

---

## Success Metrics

- ✅ Zero NextAuth references in codebase
- ✅ All API routes use Supabase auth
- ✅ Users can start voice interviews
- ✅ Audio recording works across browsers
- ✅ Gemini processes audio and generates feedback
- ✅ TTS generates natural speech
- ✅ Users receive comprehensive feedback
- ✅ Interview history displays correctly
- ✅ No console errors
- ✅ Build completes successfully
- ✅ All tests pass

---

## Risk Mitigation

1. **Create backup branch before starting**
2. **Test each phase before moving to next**
3. **Keep Supabase backup/snapshots**
4. **Monitor API costs (Gemini + TTS)**
5. **Implement rate limiting early**
6. **Add comprehensive error logging**
7. **Test on multiple devices/browsers**
8. **Have rollback plan ready**
