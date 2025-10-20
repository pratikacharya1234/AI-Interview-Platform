# Setup Guide: Vapi & Gemini Configuration

This guide will help you set up your AI Interview Platform with Vapi for voice interviews and Google Gemini for AI-powered question generation.

## ✅ What's Been Updated

1. **Removed Dependencies:**
   - ❌ ElevenLabs TTS (replaced with OpenAI TTS)
   - ❌ Runware Image Generation (removed entirely)
   - ❌ Leonardo AI (removed entirely)

2. **Active Services:**
   - ✅ Vapi AI for voice interviews
   - ✅ Google Gemini for question generation
   - ✅ OpenAI for TTS and additional AI features
   - ✅ Anthropic Claude (optional) for enhanced feedback

## 🔧 Required Environment Variables

Add these to your `.env.local` file:

```env
# ===== REQUIRED FOR VOICE INTERVIEWS =====

# Vapi Configuration (Required for voice interviews)
NEXT_PUBLIC_VAPI_WEB_TOKEN=your-vapi-web-token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your-vapi-workflow-id

# Google Gemini API (Required for question generation)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# ===== OPTIONAL BUT RECOMMENDED =====

# OpenAI API (For TTS and enhanced AI features)
OPENAI_API_KEY=your-openai-api-key

# Anthropic Claude (For better feedback generation)
ANTHROPIC_API_KEY=your-anthropic-api-key

# ===== SUPABASE DATABASE =====

NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ===== AUTHENTICATION =====

NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 📝 Step-by-Step Setup

### 1. Get Vapi Credentials

1. Sign up at [Vapi.ai](https://vapi.ai)
2. Go to Dashboard → API Keys
3. Copy your Web Token
4. Create a new Workflow for interviews
5. Copy the Workflow ID

### 2. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select your Google Cloud project (or create a new one)
4. Copy the API key

### 3. (Optional) Get OpenAI API Key

1. Sign up at [OpenAI Platform](https://platform.openai.com)
2. Go to API Keys section
3. Create a new API key
4. Copy and save it

### 4. Configure Vapi Workflow

In your Vapi dashboard, configure your workflow with:

```json
{
  "assistant": {
    "model": {
      "provider": "openai",
      "model": "gpt-4-turbo-preview",
      "temperature": 0.7
    },
    "voice": {
      "provider": "openai",
      "voiceId": "alloy"
    },
    "firstMessage": "Hello! I'm your AI interviewer. Let's begin the interview.",
    "systemPrompt": "You are a professional interviewer conducting a job interview..."
  }
}
```

### 5. Test Your Configuration

Run the system check to verify everything is working:

```bash
# Start the development server
npm run dev

# Visit the system check endpoint
curl http://localhost:3001/api/system-check
```

Expected response:
```json
{
  "apis": {
    "gemini": {
      "configured": true,
      "status": "working"
    },
    "openai": {
      "configured": true,
      "status": "configured"
    }
  },
  "features": {
    "voiceInterview": {
      "status": "available"
    }
  }
}
```

## 🎯 Feature Availability

### With Gemini Only:
- ✅ Question generation for interviews
- ✅ Basic AI responses
- ✅ Interview feedback (basic)
- ⚠️ Browser TTS fallback for voice

### With Gemini + OpenAI:
- ✅ Enhanced question generation
- ✅ High-quality TTS voices
- ✅ Better AI responses
- ✅ Advanced feedback analysis

### With All Services (Gemini + OpenAI + Anthropic):
- ✅ Multi-model question generation
- ✅ Best-in-class feedback
- ✅ Fallback redundancy
- ✅ Optimal performance

## 🚀 Testing Voice Interviews

1. Navigate to: `http://localhost:3001/interview/voice`
2. Enter interview details:
   - Position: Software Engineer
   - Company: Your Company
   - Experience: Mid Level
   - Tech Stack: React, Node.js, TypeScript
3. Click "Start Voice Interview"
4. Allow microphone permissions
5. Begin speaking when prompted

## 🔍 Troubleshooting

### Vapi Not Working
- Check that `NEXT_PUBLIC_VAPI_WEB_TOKEN` is set correctly
- Verify `NEXT_PUBLIC_VAPI_WORKFLOW_ID` matches your workflow
- Ensure your Vapi account has credits

### Gemini API Errors
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is valid
- Check API quotas in Google Cloud Console
- Ensure the Gemini API is enabled in your project

### TTS Not Working
- If using OpenAI TTS, verify `OPENAI_API_KEY` is set
- Browser will fallback to Web Speech API if OpenAI is not available
- Check browser console for specific errors

### No Audio Output
- Ensure browser has microphone permissions
- Check system audio settings
- Try a different browser (Chrome/Edge recommended)

## 📊 API Usage Monitoring

Monitor your API usage:

- **Vapi**: Dashboard at vapi.ai
- **Gemini**: [Google Cloud Console](https://console.cloud.google.com)
- **OpenAI**: [OpenAI Usage](https://platform.openai.com/usage)
- **Anthropic**: [Anthropic Console](https://console.anthropic.com)

## 🎉 Success Checklist

- [ ] Vapi credentials configured
- [ ] Gemini API key added
- [ ] Database schema applied to Supabase
- [ ] System check shows all green
- [ ] Voice interview page loads
- [ ] Can start and complete an interview
- [ ] Feedback is generated successfully

## 📚 Additional Resources

- [Vapi Documentation](https://docs.vapi.ai)
- [Gemini API Docs](https://ai.google.dev/docs)
- [OpenAI TTS Guide](https://platform.openai.com/docs/guides/text-to-speech)
- [Project README](./README.md)

---

**Note**: All ElevenLabs and image generation services have been completely removed from the codebase. The system now uses OpenAI TTS as the primary text-to-speech provider with browser TTS as a fallback.
