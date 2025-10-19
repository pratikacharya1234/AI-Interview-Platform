# AI Interview Platform

A production-ready AI-powered interview platform with real-time video/audio processing, speech-to-text, and intelligent evaluation.

## Features

- **Video & Audio Interviews**: Real-time WebRTC-based interview sessions
- **AI-Powered Evaluation**: Intelligent assessment using Claude/GPT-4
- **Speech-to-Text**: Real-time transcription with multiple provider support
- **Live Feedback**: Instant evaluation and scoring during interviews
- **Comprehensive Reports**: Detailed interview summaries and recommendations
- **Database Integration**: Full persistence with Supabase

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: FastAPI, WebSocket, Python
- **AI**: Anthropic Claude, OpenAI GPT-4, Google Gemini
- **Database**: Supabase (PostgreSQL)
- **Speech**: OpenAI Whisper, Deepgram
- **Real-time**: WebRTC, WebSocket

## Environment Variables

Create `.env.local` in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key

# Backend (if using Python backend)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

The application is configured for Vercel deployment:

```bash
# Deploy to Vercel
vercel --prod
```

## Live Demo

[https://interviewmock.vercel.app/](https://interviewmock.vercel.app/)

## License

MIT
