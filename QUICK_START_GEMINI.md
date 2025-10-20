# 🚀 Quick Start - Gemini Only

## 1️⃣ Get Gemini API Key (2 minutes)

```bash
# Visit Google AI Studio
https://makersuite.google.com/app/apikey

# Click "Create API Key" → Copy the key
```

## 2️⃣ Configure Environment (1 minute)

Create `.env.local`:

```env
# Required
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key-here
NEXT_PUBLIC_VAPI_WEB_TOKEN=your-vapi-token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your-workflow-id

# Database
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Auth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret
```

## 3️⃣ Start Development (30 seconds)

```bash
npm install
npm run dev
```

## 4️⃣ Test Setup (1 minute)

```bash
# Test Gemini connection
curl http://localhost:3001/api/system-check

# Should see: "gemini": { "status": "working" }
```

## 5️⃣ Try Voice Interview (2 minutes)

1. Open `http://localhost:3001/interview/voice`
2. Fill in details:
   - Position: "Software Engineer"
   - Company: "Your Company"
   - Tech Stack: Add "React", "Node.js"
3. Click "Start Voice Interview"
4. Allow microphone access
5. Start talking!

## ✅ That's It!

Total setup time: **~7 minutes**

## 🎯 What You Get

- ✅ AI-powered question generation
- ✅ Real-time voice interviews
- ✅ Comprehensive feedback
- ✅ Performance analytics
- ✅ All powered by Gemini!

## 💰 Cost

- **Free tier**: 60 requests/minute
- **Most users**: $0-5/month
- **Heavy usage**: $10-20/month

## 📚 Need More Help?

- [Full Setup Guide](./GEMINI_ONLY_SETUP.md)
- [Migration Guide](./MIGRATION_TO_GEMINI.md)
- [Complete Documentation](./GEMINI_MIGRATION_COMPLETE.md)

---

**Questions?** Check the troubleshooting section in [GEMINI_ONLY_SETUP.md](./GEMINI_ONLY_SETUP.md)
