# AI Video Interview Platform - Setup Instructions

## Complete Production-Ready Implementation

This is a fully functional AI video interview platform with real-time voice input, AI interviewer responses, transcript analysis, and database integration.

## Architecture Overview

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + WebRTC
- **Backend**: FastAPI + WebSocket + Audio Processing
- **AI**: Claude Opus / OpenAI GPT-4 for interview responses
- **Speech-to-Text**: OpenAI Whisper / Deepgram
- **Database**: Supabase (PostgreSQL)
- **Real-time**: WebSocket for bidirectional communication

## Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- FFmpeg installed on system
- Supabase account (or local PostgreSQL)
- API Keys for:
  - Anthropic Claude (or OpenAI)
  - Speech-to-Text service (OpenAI/Deepgram)

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo>
cd AI-Interview-Platform

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

### 2. Database Setup (Supabase)

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the following schema:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    candidate_email VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    interview_type VARCHAR(50) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    order_index INTEGER NOT NULL,
    asked_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    transcript TEXT NOT NULL,
    ai_feedback JSONB NOT NULL,
    audio_path TEXT,
    responded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Feedback summary table
CREATE TABLE IF NOT EXISTS feedback_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2),
    technical_skills DECIMAL(5,2),
    communication_skills DECIMAL(5,2),
    problem_solving DECIMAL(5,2),
    cultural_fit DECIMAL(5,2),
    strengths TEXT[],
    weaknesses TEXT[],
    recommendation VARCHAR(50),
    recommendation_reasoning TEXT,
    suggested_next_steps TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_interviews_session_id ON interviews(session_id);
CREATE INDEX idx_questions_interview_id ON questions(interview_id);
CREATE INDEX idx_responses_interview_id ON responses(interview_id);
CREATE INDEX idx_feedback_summary_interview_id ON feedback_summary(interview_id);
```

3. Get your Supabase credentials from Settings > API

### 3. Environment Configuration

#### Backend (.env in /backend)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider (choose one)
AI_PROVIDER=claude  # or 'openai'
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

# Speech-to-Text (choose one)
STT_PROVIDER=openai  # or 'deepgram' or 'whisper'
STT_API_KEY=your-stt-api-key

# Server
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env.local in root)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Optional: AI Keys if using client-side
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-key
```

### 4. Install FFmpeg

#### macOS
```bash
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Windows
Download from https://ffmpeg.org/download.html

### 5. Run the Application

#### Start Backend Server
```bash
cd backend
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at http://localhost:8000

#### Start Frontend Development Server
```bash
# In root directory
npm run dev
```

The frontend will be available at http://localhost:3000

## Usage Guide

### Starting an Interview

1. Navigate to http://localhost:3000/interview/live
2. The system will automatically:
   - Initialize an interview session
   - Connect to the WebSocket server
   - Request camera/microphone permissions
3. Click "Start Interview" to begin
4. The AI interviewer will ask the first question
5. Your audio is recorded in 2-second chunks and processed in real-time
6. Transcripts appear live as you speak
7. AI evaluates your responses and provides follow-up questions
8. Click "End Interview" to finish and see your summary

### Features

- **Real-time Transcription**: Audio chunks are sent every 2 seconds for processing
- **Live AI Evaluation**: Each response is evaluated for:
  - Technical accuracy
  - Communication clarity
  - Depth of knowledge
  - Problem-solving skills
  - Relevance
- **Adaptive Questioning**: AI adjusts questions based on your responses
- **Comprehensive Summary**: Final report includes:
  - Overall performance score
  - Skill breakdown
  - Strengths and weaknesses
  - Hiring recommendation
  - Suggested next steps

### API Endpoints

#### REST API
- `POST /api/interview/start` - Start new interview session
- `POST /api/interview/upload_audio` - Process audio chunk
- `POST /api/interview/end` - End interview and generate summary
- `GET /api/report/{interview_id}` - Get full interview report
- `GET /api/health` - Health check

#### WebSocket
- `ws://localhost:8000/ws/{session_id}` - Real-time communication channel

### Data Flow

1. **Audio Capture**: MediaRecorder captures audio in `audio/webm;codecs=opus` format
2. **Chunking**: Audio is chunked every 2 seconds
3. **Transmission**: Chunks sent via WebSocket as base64
4. **Processing**: Backend converts to WAV (16kHz mono)
5. **Transcription**: STT service transcribes audio
6. **AI Processing**: Claude/GPT evaluates transcript
7. **Response**: AI response sent back via WebSocket
8. **Storage**: All data saved to Supabase

## Production Deployment

### Backend Deployment (Railway/Render/AWS)

1. Set environment variables in your platform
2. Install system dependencies (FFmpeg)
3. Deploy with:
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend Deployment (Vercel/Netlify)

1. Set environment variables
2. Build and deploy:
```bash
npm run build
npm start
```

### Security Considerations

- Use HTTPS in production
- Implement rate limiting
- Add authentication (Supabase Auth)
- Validate all inputs
- Secure API keys
- Enable CORS properly

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check CORS settings
   - Ensure backend is running
   - Verify WebSocket URL

2. **No Audio Recording**
   - Check browser permissions
   - Ensure HTTPS in production
   - Verify MediaRecorder support

3. **Transcription Not Working**
   - Verify API keys
   - Check audio format
   - Ensure FFmpeg is installed

4. **Database Errors**
   - Check Supabase credentials
   - Verify table schema
   - Check network connectivity

## Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
npm run test
```

### Manual Testing
1. Use Chrome/Edge for best WebRTC support
2. Allow camera/microphone permissions
3. Speak clearly for better transcription
4. Test with different network conditions

## Performance Optimization

- Audio chunks: 2 seconds (adjustable)
- Compression: Opus codec at 16kbps
- Caching: Redis for session data (optional)
- CDN: For static assets
- Database: Indexes on frequently queried columns

## Support

For issues or questions:
1. Check the logs in both frontend and backend
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check browser console for errors

## License

This implementation is production-ready and can be deployed for real use cases.
