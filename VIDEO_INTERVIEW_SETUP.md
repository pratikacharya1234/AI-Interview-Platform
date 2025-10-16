# Video Interview Platform - Complete Setup Guide

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Supabase recommended)
- OpenAI API key
- Anthropic Claude API key

### Step 1: Clone and Install
```bash
cd /home/pratik/Desktop/AI-Interview-Platform
npm install
```

### Step 2: Install Additional Dependencies
```bash
npm install openai @anthropic-ai/sdk
```

### Step 3: Database Setup
```bash
# Connect to your PostgreSQL database
psql postgresql://your-connection-string

# Run the video interview schema
\i database/video_interview_schema.sql
```

### Step 4: Environment Variables
```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local and add:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=sk-ant-...
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret
```

### Step 5: Run Development Server
```bash
npm run dev
```

### Step 6: Access Video Interview
Open browser: `http://localhost:3001/interview/video`

---

## Detailed Setup Instructions

### 1. Database Configuration

#### Option A: Supabase (Recommended)
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Run schema:
```bash
psql postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres \
  -f database/video_interview_schema.sql
```

#### Option B: Local PostgreSQL
1. Install PostgreSQL
2. Create database:
```bash
createdb ai_interview_platform
```
3. Run schema:
```bash
psql ai_interview_platform -f database/video_interview_schema.sql
```

#### Option C: Neon.tech
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Run schema via psql or Neon console

### 2. API Keys Setup

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy to `OPENAI_API_KEY` in `.env.local`

**Used for:**
- Whisper (Speech-to-Text)
- GPT-4 (Response evaluation, fallback questions)
- TTS (Text-to-Speech for AI voice)

#### Anthropic Claude API Key
1. Go to https://console.anthropic.com
2. Create API key
3. Copy to `CLAUDE_API_KEY` in `.env.local`

**Used for:**
- Claude-3 (Primary question generation)
- Natural conversation flow

#### Supabase Keys
1. Go to your Supabase project
2. Settings → API
3. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. NextAuth Configuration

Generate secret:
```bash
openssl rand -base64 32
```

Add to `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-generated-secret
```

### 4. Verify Installation

#### Check Database Tables
```bash
psql your-connection-string -c "\dt video_interview*"
```

Expected output:
```
video_interview_sessions
video_interview_transcripts
video_interview_feedback
video_interview_reports
video_interview_live_metrics
video_interview_questions
video_interview_connections
video_interview_audio_chunks
```

#### Test API Endpoints
```bash
# Start dev server
npm run dev

# Test health (in another terminal)
curl http://localhost:3001/api/persona
```

### 5. Browser Requirements

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- WebRTC support
- MediaRecorder API
- getUserMedia API
- Web Audio API

**Note:** HTTPS required for production (WebRTC requirement)

---

## Project Structure

```
AI-Interview-Platform/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── video-interview/
│   │   │       ├── start/route.ts          # Create session
│   │   │       ├── initial-question/route.ts # First question
│   │   │       ├── process/route.ts         # Process audio
│   │   │       ├── end/route.ts             # End session
│   │   │       ├── metrics/route.ts         # Live metrics
│   │   │       └── report/[id]/route.ts     # Get report
│   │   └── interview/
│   │       └── video/
│   │           ├── page.tsx                 # Lobby
│   │           └── report/[id]/page.tsx     # Report
│   ├── components/
│   │   └── VideoInterviewLive.tsx           # Main component
│   └── lib/
│       └── services/
│           ├── video-interview-service.ts   # DB operations
│           └── video-ai-service.ts          # AI integrations
├── database/
│   └── video_interview_schema.sql           # Database schema
├── .env.example                             # Environment template
└── VIDEO_INTERVIEW_COMPLETE.md              # Documentation
```

---

## Testing the Platform

### 1. Test Permissions
1. Navigate to `/interview/video`
2. Click "Grant Permissions"
3. Allow camera and microphone
4. Verify green checkmarks

### 2. Test Interview Flow
1. Select a persona (e.g., "Alex Chen")
2. Enter job title: "Software Engineer"
3. Select interview type: "Technical"
4. Select difficulty: "Medium"
5. Click "Start Video Interview"
6. Wait for first question
7. Click "Start Answer" and speak
8. Click "Stop Answer"
9. Wait for evaluation and next question
10. Repeat 2-3 times
11. Click "End Interview"
12. View comprehensive report

### 3. Verify Features

#### STT (Speech-to-Text)
- Speak clearly into microphone
- Check transcription appears
- Verify accuracy

#### Voice Metrics
- Check speech pace (should be 100-180 WPM)
- Verify filler word detection
- Check clarity score

#### Evaluation
- Technical score (0-10)
- Clarity score (0-10)
- Confidence score (0-10)
- Behavioral score (0-10)
- Feedback summary

#### TTS (Text-to-Speech)
- AI voice plays automatically
- Clear audio quality
- Natural speech

#### Live Metrics
- Scores update after each response
- Rolling averages displayed
- Questions completed counter

#### Final Report
- Overall score calculated
- Strengths listed
- Weaknesses identified
- Recommendations provided
- Statistics displayed

---

## Troubleshooting

### Issue: Camera/Microphone Not Working

**Solution:**
1. Check browser permissions in address bar
2. Ensure HTTPS (required for WebRTC)
3. Try different browser
4. Check system privacy settings

### Issue: "Unauthorized" Error

**Solution:**
1. Verify you're logged in
2. Check NextAuth configuration
3. Clear cookies and re-login
4. Verify `NEXTAUTH_SECRET` is set

### Issue: Whisper API Error

**Solution:**
1. Verify `OPENAI_API_KEY` is correct
2. Check OpenAI account has credits
3. Verify audio format (webm supported)
4. Check audio file size < 25MB

### Issue: Claude API Error

**Solution:**
1. Verify `CLAUDE_API_KEY` is correct
2. Check Anthropic account status
3. Verify API rate limits
4. Check for API outages

### Issue: Database Connection Error

**Solution:**
1. Verify Supabase credentials
2. Check database is running
3. Verify schema is created
4. Check network connectivity

### Issue: Audio Not Playing

**Solution:**
1. Check browser audio permissions
2. Verify volume is not muted
3. Check audio element in DOM
4. Try different browser

### Issue: Slow Response Time

**Solution:**
1. Check internet connection
2. Verify API rate limits
3. Consider upgrading API plans
4. Check server resources

---

## Performance Optimization

### 1. Audio Recording
```javascript
// Optimize MediaRecorder settings
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 128000 // Balance quality/size
})
```

### 2. API Calls
- Use streaming for long responses
- Implement request queuing
- Add retry logic with exponential backoff
- Cache persona data

### 3. Database
- Add indexes on frequently queried columns
- Use connection pooling
- Implement query optimization
- Regular VACUUM and ANALYZE

### 4. Frontend
- Lazy load components
- Optimize re-renders
- Use React.memo for expensive components
- Implement virtual scrolling for transcripts

---

## Production Deployment

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables:**
Set all variables in Vercel dashboard:
- Settings → Environment Variables
- Add all from `.env.example`

### 2. Database Migration

```bash
# Production database
psql postgresql://production-connection-string \
  -f database/video_interview_schema.sql
```

### 3. HTTPS Setup

**Required for WebRTC:**
- Vercel provides HTTPS automatically
- Custom domain: Add SSL certificate
- Local dev: Use ngrok or similar

### 4. Monitoring

**Recommended:**
- Sentry for error tracking
- LogRocket for session replay
- Datadog for performance monitoring
- Supabase dashboard for database metrics

---

## Security Considerations

### 1. API Keys
- Never commit `.env.local` to git
- Use environment variables only
- Rotate keys regularly
- Use service role key server-side only

### 2. Authentication
- Verify session on all API routes
- Implement rate limiting
- Use CSRF protection
- Validate user permissions

### 3. Data Privacy
- Encrypt sensitive data
- Implement data retention policies
- GDPR compliance
- User data deletion

### 4. Audio/Video
- Secure WebRTC connections
- Don't store raw audio permanently
- Implement content moderation
- User consent for recording

---

## Cost Estimation

### API Costs (per interview)

**OpenAI:**
- Whisper STT: ~$0.006 per minute
- GPT-4 evaluation: ~$0.03 per response
- TTS: ~$0.015 per 1000 characters
- **Total per 10-min interview: ~$0.50**

**Anthropic:**
- Claude-3 questions: ~$0.015 per question
- **Total per 5 questions: ~$0.075**

**Database:**
- Supabase free tier: 500MB
- Paid: $25/month for 8GB
- **Cost: ~$0.001 per interview**

**Total per interview: ~$0.58**

### Optimization Tips
- Cache persona prompts
- Batch API requests
- Use cheaper models for simple tasks
- Implement usage limits per user

---

## Support and Resources

### Documentation
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic Claude Docs](https://docs.anthropic.com)
- [Supabase Docs](https://supabase.com/docs)
- [WebRTC Guide](https://webrtc.org/getting-started/overview)

### Community
- GitHub Issues: Report bugs
- Discord: Real-time help
- Stack Overflow: Technical questions

### Professional Support
- Enterprise support available
- Custom integrations
- Training and onboarding
- SLA guarantees

---

## Next Steps

After setup is complete:

1. **Test thoroughly** - Run through complete interview flow
2. **Customize personas** - Add your own interviewer personas
3. **Configure settings** - Adjust difficulty, question count, etc.
4. **Monitor usage** - Track API costs and performance
5. **Gather feedback** - Test with real users
6. **Iterate** - Improve based on feedback

---

## FAQ

**Q: Can I use GPT-3.5 instead of GPT-4?**
A: Yes, change model in `video-ai-service.ts` to `gpt-3.5-turbo`. Quality may decrease.

**Q: Can I use a different TTS service?**
A: Yes, implement alternative in `generateSpeech()` method.

**Q: How do I add more personas?**
A: Insert into `interviewer_personas` table via Supabase dashboard.

**Q: Can I record the video?**
A: Yes, implement MediaRecorder for video track and store URL.

**Q: How do I export reports to PDF?**
A: Use libraries like `jsPDF` or `react-pdf` to generate PDFs.

**Q: Can I integrate with my existing auth?**
A: Yes, modify API routes to use your auth system.

**Q: How do I handle multiple concurrent interviews?**
A: System supports concurrent sessions via unique session IDs.

**Q: Can I customize the evaluation criteria?**
A: Yes, modify prompts in `video-ai-service.ts`.

---

## Status

✅ **READY FOR PRODUCTION**

All components tested and verified:
- Database schema created
- API endpoints functional
- Frontend components working
- AI integrations active
- Error handling implemented
- Documentation complete

**Start building amazing interview experiences!** 🚀
