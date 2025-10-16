# Video Interview Platform - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (1 minute)
```bash
cd /home/pratik/Desktop/AI-Interview-Platform
npm install openai @anthropic-ai/sdk
```

### Step 2: Setup Database (1 minute)
```bash
# Replace with your database connection string
psql postgresql://your-connection-string \
  -f database/video_interview_schema.sql
```

### Step 3: Configure Environment (2 minutes)
```bash
# Copy template
cp .env.example .env.local

# Edit .env.local and add these required keys:
```

**Required Keys:**
```env
# Supabase (get from https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# Anthropic (get from https://console.anthropic.com)
CLAUDE_API_KEY=sk-ant-...

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

### Step 4: Run (1 minute)
```bash
npm run dev
```

### Step 5: Test
Open browser: **http://localhost:3001/interview/video**

---

## ✅ Verification Checklist

### Database
```bash
# Check tables exist
psql your-db -c "\dt video_interview*"
```
Should show 8 tables.

### API Keys
```bash
# Test OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Claude
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

### Application
1. Navigate to `/interview/video`
2. Click "Grant Permissions" → Allow camera/mic
3. Select persona → Enter job title
4. Click "Start Video Interview"
5. Speak when prompted
6. Verify transcription appears
7. Check AI responds with voice

---

## 🎯 What You Get

### Features
- ✅ Real-time video interview
- ✅ AI interviewer with voice
- ✅ Speech-to-text transcription
- ✅ Live performance feedback
- ✅ Comprehensive final report

### Tech Stack
- **Frontend**: Next.js 14, React, WebRTC
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **AI**: OpenAI (Whisper, GPT-4, TTS), Anthropic (Claude-3)

---

## 📊 Cost Per Interview

| Service | Cost |
|---------|------|
| Whisper STT (10 min) | $0.06 |
| GPT-4 Evaluation (5 responses) | $0.15 |
| Claude-3 Questions (5 questions) | $0.075 |
| OpenAI TTS (300 words) | $0.045 |
| **Total** | **~$0.33** |

---

## 🔧 Common Issues

### "Camera not working"
- Check browser permissions (click lock icon in address bar)
- Ensure HTTPS (required for WebRTC)
- Try Chrome/Firefox

### "Unauthorized error"
- Verify you're logged in
- Check `NEXTAUTH_SECRET` is set
- Clear cookies and re-login

### "Whisper API error"
- Verify `OPENAI_API_KEY` is correct
- Check account has credits
- Ensure audio format is webm

### "Database connection error"
- Verify Supabase credentials
- Check schema is created
- Test connection with psql

---

## 📁 Key Files

```
database/
  video_interview_schema.sql          # Database schema

src/lib/services/
  video-interview-service.ts          # Database operations
  video-ai-service.ts                 # AI integrations

src/app/api/video-interview/
  start/route.ts                      # Create session
  process/route.ts                    # Main processing
  end/route.ts                        # Generate report

src/components/
  VideoInterviewLive.tsx              # Main component

src/app/interview/video/
  page.tsx                            # Lobby
  report/[reportId]/page.tsx          # Report
```

---

## 🎓 How It Works

```
1. User starts interview
   ↓
2. Camera/mic activated (WebRTC)
   ↓
3. AI asks first question (Claude-3)
   ↓
4. AI speaks question (OpenAI TTS)
   ↓
5. User speaks answer
   ↓
6. Audio recorded (MediaRecorder)
   ↓
7. Transcribed (Whisper)
   ↓
8. Evaluated (GPT-4)
   ↓
9. Next question generated (Claude-3)
   ↓
10. Repeat steps 4-9
    ↓
11. End interview
    ↓
12. Generate final report
```

---

## 📚 Documentation

- **Complete Guide**: `VIDEO_INTERVIEW_COMPLETE.md`
- **Setup Guide**: `VIDEO_INTERVIEW_SETUP.md`
- **Summary**: `VIDEO_INTERVIEW_SUMMARY.md`
- **This File**: `VIDEO_INTERVIEW_QUICKSTART.md`

---

## 🚀 Deploy to Production

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

---

## ✨ Next Steps

1. ✅ Complete setup above
2. 🧪 Test with real interview
3. 🎨 Customize personas
4. 📊 Monitor usage
5. 🚀 Deploy to production

---

## 💡 Pro Tips

- Use Chrome for best WebRTC support
- Speak clearly for better transcription
- Keep responses 30-90 seconds
- Check API usage in dashboards
- Monitor costs regularly

---

## 🎯 Success!

You now have a fully functional AI video interview platform!

**Ready to conduct interviews:** http://localhost:3001/interview/video

---

**Questions?** Check the detailed documentation files or create an issue.

**Happy Interviewing!** 🎉
