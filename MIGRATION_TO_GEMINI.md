# Migration to Gemini-Only Architecture

## 🎯 Overview

The AI Interview Platform has been updated to use **Google Gemini exclusively** for all AI features, removing dependencies on OpenAI, Anthropic, and ElevenLabs.

## 📋 What Changed

### ✅ Added
- Google Gemini for all AI operations
- Simplified TTS with browser fallback
- Streamlined configuration

### ❌ Removed
- OpenAI API integration
- Anthropic Claude API integration
- ElevenLabs TTS service
- Runware/Leonardo image generation
- Multiple AI provider fallback chains

### 🔄 Updated
- Interview configuration to use Gemini
- Question generation API
- Feedback generation API
- Voice streaming with browser TTS fallback
- Environment variable structure

## 🚀 Migration Steps

### 1. Update Environment Variables

**Remove these (no longer needed):**
```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
CLAUDE_API_KEY=
ELEVENLABS_API_KEY=
LEONARDO_API_KEY=
RUNWARE_API_KEY=
```

**Keep/Add these:**
```env
# Required
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key
NEXT_PUBLIC_VAPI_WEB_TOKEN=your-vapi-token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your-workflow-id

# Database
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Update Vapi Configuration

In your Vapi dashboard, update the assistant configuration:

**Before:**
```json
{
  "model": {
    "provider": "openai",
    "model": "gpt-4-turbo-preview"
  },
  "voice": {
    "provider": "elevenlabs",
    "voiceId": "rachel"
  }
}
```

**After:**
```json
{
  "model": {
    "provider": "google",
    "model": "gemini-1.5-pro",
    "temperature": 0.7
  },
  "voice": {
    "provider": "google",
    "voiceId": "en-US-Neural2-J",
    "languageCode": "en-US"
  }
}
```

### 3. Install/Update Dependencies

No new dependencies required! The platform now uses:
- `@google/generative-ai` (already installed)
- `@vapi-ai/web` (already installed)

### 4. Test Your Setup

```bash
# Start the development server
npm run dev

# Test system check
curl http://localhost:3001/api/system-check

# Test question generation
curl -X POST http://localhost:3001/api/vapi/generate \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Software Engineer",
    "level": "MID",
    "techStack": ["React"],
    "type": "technical",
    "amount": 5
  }'
```

## 📊 Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| Question Generation | OpenAI/Claude/Gemini | Gemini only |
| Feedback Analysis | Claude/OpenAI/Fallback | Gemini only |
| Text-to-Speech | ElevenLabs/OpenAI | Browser TTS |
| Voice Interviews | Vapi + ElevenLabs | Vapi + Google |
| Image Generation | Runware/Leonardo | Removed |
| API Keys Required | 5-7 | 2-3 |
| Monthly Cost (est.) | $50-100 | $5-20 |

## 💰 Cost Savings

### Before (Multiple Services)
- OpenAI: ~$20-40/month
- Anthropic: ~$15-30/month
- ElevenLabs: ~$11-99/month
- **Total: $46-169/month**

### After (Gemini Only)
- Google Gemini: $0-20/month (generous free tier)
- Vapi: $10-50/month (based on usage)
- **Total: $10-70/month**

**Savings: 50-70% reduction in AI costs**

## 🎯 Benefits

1. **Simplified Setup**
   - Only 1 AI API key needed (Gemini)
   - Fewer environment variables
   - Less configuration complexity

2. **Cost Effective**
   - Gemini has generous free tier
   - No TTS service costs
   - Reduced API expenses

3. **Better Performance**
   - Single AI provider = consistent responses
   - No fallback chain delays
   - Optimized for Gemini's strengths

4. **Easier Maintenance**
   - Fewer dependencies to update
   - Single AI provider to monitor
   - Simpler debugging

5. **Future-Proof**
   - Google's latest AI technology
   - Regular model updates
   - Strong ecosystem support

## 🔧 Technical Changes

### Files Modified
```
src/constants/interview.ts          - Updated to Gemini config
src/lib/voice-stream.ts             - Browser TTS fallback
src/app/api/vapi/generate/route.ts  - Gemini-only generation
src/app/api/voice-interview/generate-feedback/route.ts - Gemini feedback
src/app/api/system-check/route.ts   - Updated checks
.env.example                         - Simplified variables
```

### Files Removed
```
src/app/api/tts/elevenlabs/route.ts - Removed ElevenLabs
src/app/api/tts/openai/route.ts     - Removed OpenAI TTS
src/app/api/generate-image/route.ts - Removed image generation
```

### Files Added
```
src/app/api/tts/google/route.ts     - Browser TTS fallback
GEMINI_ONLY_SETUP.md                - Setup guide
MIGRATION_TO_GEMINI.md              - This file
```

## 🐛 Troubleshooting

### Issue: Questions not generating
**Solution:**
1. Check `GOOGLE_GENERATIVE_AI_API_KEY` is set
2. Verify API key is valid in Google AI Studio
3. Check API quota in Google Cloud Console

### Issue: Voice not working
**Solution:**
1. Verify Vapi configuration uses Google voice
2. Check browser microphone permissions
3. Ensure `NEXT_PUBLIC_VAPI_WEB_TOKEN` is set

### Issue: Feedback generation fails
**Solution:**
1. Check Gemini API quota
2. Verify interview transcript is not empty
3. Check browser console for detailed errors

## 📚 Documentation

- [Gemini-Only Setup Guide](./GEMINI_ONLY_SETUP.md)
- [Vapi Configuration](https://docs.vapi.ai)
- [Gemini API Docs](https://ai.google.dev/docs)

## ✅ Migration Checklist

- [ ] Removed old API keys from `.env.local`
- [ ] Added `GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] Updated Vapi dashboard configuration
- [ ] Tested system check endpoint
- [ ] Verified question generation works
- [ ] Completed test voice interview
- [ ] Confirmed feedback generation
- [ ] Updated production environment variables
- [ ] Monitored Gemini API usage

## 🎉 Success Indicators

After migration, you should see:
- ✅ System check shows Gemini as "working"
- ✅ Questions generate successfully
- ✅ Voice interviews complete without errors
- ✅ Feedback generates with detailed analysis
- ✅ No API key errors in logs
- ✅ Reduced monthly costs

---

**Need Help?** Check the [Gemini-Only Setup Guide](./GEMINI_ONLY_SETUP.md) for detailed instructions.
