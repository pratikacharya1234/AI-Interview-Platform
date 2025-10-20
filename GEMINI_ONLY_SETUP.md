# Gemini-Only Setup Guide

This platform now uses **Google Gemini exclusively** for all AI features. This simplifies configuration and reduces dependencies.

## 🎯 What Uses Gemini

1. **Question Generation** - Dynamic interview questions based on role and tech stack
2. **Feedback Generation** - Comprehensive interview performance analysis
3. **AI Responses** - Intelligent conversation during interviews
4. **Content Analysis** - Transcript evaluation and scoring

## 🔧 Required Setup

### 1. Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select your Google Cloud project (or create a new one)
5. Copy the generated API key

### 2. Configure Environment Variables

Add to your `.env.local` file:

```env
# ===== REQUIRED =====

# Google Gemini API (All AI features)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here

# Vapi AI (Voice interviews)
NEXT_PUBLIC_VAPI_WEB_TOKEN=your-vapi-web-token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your-vapi-workflow-id

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth (Authentication)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Configure Vapi for Gemini

In your Vapi dashboard, update your workflow configuration:

```json
{
  "assistant": {
    "model": {
      "provider": "google",
      "model": "gemini-1.5-pro",
      "temperature": 0.7,
      "maxTokens": 500
    },
    "voice": {
      "provider": "google",
      "voiceId": "en-US-Neural2-J",
      "languageCode": "en-US"
    },
    "transcriber": {
      "provider": "deepgram",
      "model": "nova-2",
      "language": "en"
    }
  }
}
```

## 📊 Gemini API Pricing

Google Gemini offers generous free tier:

- **Free Tier**: 60 requests per minute
- **Gemini 1.5 Pro**: $0.00125 per 1K characters (input)
- **Gemini 1.5 Flash**: Even cheaper for faster responses

[View current pricing](https://ai.google.dev/pricing)

## 🚀 Features Powered by Gemini

### Question Generation
```typescript
// Generates role-specific interview questions
POST /api/vapi/generate
{
  "role": "Senior Software Engineer",
  "level": "SENIOR",
  "techStack": ["React", "Node.js", "TypeScript"],
  "type": "mixed",
  "amount": 10
}
```

### Feedback Generation
```typescript
// Analyzes interview performance
POST /api/voice-interview/generate-feedback
{
  "interviewId": "uuid",
  "messages": [...],
  "position": "Software Engineer",
  "techStack": ["React", "Node.js"]
}
```

## 🔍 Testing Your Setup

### 1. Test Gemini Connection

```bash
curl http://localhost:3001/api/system-check
```

Expected response:
```json
{
  "apis": {
    "gemini": {
      "configured": true,
      "status": "working"
    }
  }
}
```

### 2. Test Question Generation

```bash
curl -X POST http://localhost:3001/api/vapi/generate \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Software Engineer",
    "level": "MID",
    "techStack": ["React", "Node.js"],
    "type": "technical",
    "amount": 5,
    "company": "Tech Corp"
  }'
```

### 3. Start Voice Interview

1. Navigate to `http://localhost:3001/interview/voice`
2. Fill in interview details
3. Click "Start Voice Interview"
4. Verify Gemini generates questions dynamically

## 🎤 Voice/TTS Configuration

### Browser TTS Fallback

Since we're not using external TTS services, the platform uses:

1. **Vapi's Built-in TTS** - Primary voice output during interviews
2. **Browser Web Speech API** - Fallback for any local TTS needs

This approach:
- ✅ No additional API keys needed
- ✅ Works across all modern browsers
- ✅ No extra costs
- ✅ Reliable fallback mechanism

### Vapi Voice Configuration

Vapi handles all voice synthesis during interviews. Configure in Vapi dashboard:

```json
{
  "voice": {
    "provider": "google",
    "voiceId": "en-US-Neural2-J",
    "languageCode": "en-US",
    "pitch": 0,
    "speakingRate": 1.0
  }
}
```

Available Google voices:
- `en-US-Neural2-J` - Professional male
- `en-US-Neural2-F` - Professional female
- `en-US-Neural2-A` - Neutral
- `en-US-Neural2-C` - Warm female
- `en-US-Neural2-D` - Warm male

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use different API keys** for development and production
3. **Set API quotas** in Google Cloud Console
4. **Monitor usage** regularly
5. **Rotate keys** periodically

## 📈 Monitoring & Limits

### Check Gemini Usage

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Dashboard**
3. Select **Generative Language API**
4. View usage metrics and quotas

### Rate Limits

Default limits (can be increased):
- **Free tier**: 60 requests/minute
- **Paid tier**: 1000 requests/minute

## 🐛 Troubleshooting

### "Gemini API not configured"
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env.local`
- Check the API key is valid
- Ensure Generative Language API is enabled in Google Cloud

### "API quota exceeded"
- Check usage in Google Cloud Console
- Wait for quota reset (1 minute)
- Consider upgrading to paid tier

### "Invalid API key"
- Regenerate API key in Google AI Studio
- Ensure no extra spaces in `.env.local`
- Restart development server after changing env vars

### Voice not working
- Check Vapi configuration in dashboard
- Verify `NEXT_PUBLIC_VAPI_WEB_TOKEN` is set
- Ensure microphone permissions are granted
- Check browser console for errors

## 🎯 Benefits of Gemini-Only Approach

1. **Simplified Setup** - Only one AI API key needed
2. **Cost Effective** - Generous free tier
3. **Consistent Experience** - Same AI model for all features
4. **Better Integration** - Optimized for Google ecosystem
5. **Future-Proof** - Google's latest AI technology

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vapi Documentation](https://docs.vapi.ai)
- [Google AI Studio](https://makersuite.google.com)
- [Gemini Pricing](https://ai.google.dev/pricing)

## ✅ Setup Checklist

- [ ] Created Google AI Studio account
- [ ] Generated Gemini API key
- [ ] Added `GOOGLE_GENERATIVE_AI_API_KEY` to `.env.local`
- [ ] Configured Vapi with Gemini model
- [ ] Set up Supabase database
- [ ] Tested system check endpoint
- [ ] Successfully generated questions
- [ ] Completed a test voice interview
- [ ] Verified feedback generation works

---

**Note**: This platform no longer requires OpenAI, Anthropic, or ElevenLabs API keys. Everything runs on Google Gemini + Vapi for a streamlined, cost-effective solution.
