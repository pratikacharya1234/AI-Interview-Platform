# Video Interview Feature

## Overview
The Video Interview feature provides a face-to-face interview experience with an AI interviewer, using camera, microphone, and real-time recording capabilities.

## Features

### 🎥 Camera Support
- **Live Video Feed**: Real-time camera preview during interview
- **Toggle Camera**: Turn video on/off during interview
- **Professional Interface**: Clean, modern video layout
- **Responsive Design**: Works on desktop and mobile devices

### 🎙️ Audio Controls
- **Mute/Unmute**: Control microphone during interview
- **Speech Recognition**: Automatic transcription of candidate responses
- **Text-to-Speech**: AI interviewer speaks questions naturally
- **Audio Quality**: High-quality audio processing

### ⏺️ Recording & Data Management
- **Session Recording**: Full interview recording (video + audio)
- **Real-time Transcription**: Live conversion of speech to text
- **Database Integration**: All data saved to backend database
- **Session Persistence**: Resume interrupted interviews

### 🤖 AI Interview Features
- **Natural Questions**: 6 comprehensive interview questions
- **Real-time Feedback**: Instant AI analysis of responses
- **Performance Metrics**: Confidence score, response analysis
- **Progress Tracking**: Visual progress bar and question counter

### 📊 Analytics & Feedback
- **Comprehensive Metrics**: Response length, timing, word count
- **Confidence Scoring**: AI-powered confidence assessment
- **Improvement Recommendations**: Personalized feedback
- **Performance History**: Track progress over time

## Technical Implementation

### Frontend Components
```
src/components/VideoInterview.tsx - Main video interview component
src/app/interview/conversational/page.tsx - Interview page
src/app/api/interview/save/route.ts - Backend API
```

### Key Technologies
- **WebRTC**: Camera and microphone access
- **MediaRecorder API**: Video recording capabilities
- **Speech Recognition API**: Voice-to-text conversion
- **Speech Synthesis API**: Text-to-speech for AI responses
- **Next.js API Routes**: Backend data handling

### Database Schema
```sql
-- Main tables
interview_sessions: Core interview data
interview_messages: Conversation transcript
interview_metrics: Performance analytics
interview_feedback: AI-generated feedback
```

## Usage Flow

### 1. Pre-Interview Setup
- Grant camera and microphone permissions
- Test video feed and audio levels
- Configure interview settings (camera on/off, mute options)

### 2. Interview Process
- AI asks 6 structured questions
- Candidate responds via voice (auto-transcribed)
- Real-time progress tracking
- Mute/unmute controls available
- End interview option always available

### 3. Post-Interview
- Automatic session saving to database
- Performance metrics calculation
- AI feedback generation
- Recording URL generation

## API Endpoints

### POST /api/interview/save
Save completed interview session
```json
{
  "id": "interview-123",
  "startTime": "2025-01-01T10:00:00Z",
  "duration": 1800,
  "messages": [...],
  "videoEnabled": true,
  "recordingUrl": "blob:..."
}
```

### GET /api/interview/save?id={interviewId}
Retrieve specific interview session

### GET /api/interview/save
Get all interviews for current user

## Browser Compatibility

### Required Features
- ✅ WebRTC (Camera/Microphone)
- ✅ MediaRecorder API
- ✅ Speech Recognition API
- ✅ Speech Synthesis API

### Supported Browsers
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Mobile Support
- iOS Safari 14+
- Chrome Mobile 88+
- Samsung Internet 13+

## Security & Privacy

### Data Protection
- 🔒 User authentication required
- 🔒 Session-based access control
- 🔒 Encrypted data transmission
- 🔒 Secure recording storage

### Privacy Features
- 📹 Camera control (on/off toggle)
- 🎙️ Microphone control (mute/unmute)
- 🗑️ Recording deletion options
- 👤 User-owned data only

## Performance Metrics

### Calculated Metrics
- **Total Questions**: Number of questions asked
- **Total Responses**: Number of candidate responses
- **Total Words**: Word count in responses
- **Average Response Length**: Words per response
- **Average Response Time**: Time between question and response
- **Confidence Score**: AI-calculated confidence level (0-100)
- **Completion Rate**: Percentage of questions answered

### AI Feedback Categories
- Overall interview performance
- Communication strengths
- Areas for improvement
- Specific recommendations
- Skill-based scoring (communication, technical, problem-solving, cultural fit)

## Integration Examples

### Starting an Interview
```typescript
import VideoInterview from '@/components/VideoInterview'

function InterviewPage() {
  const handleComplete = (interviewId: string) => {
    router.push(`/interview/feedback?id=${interviewId}`)
  }
  
  return (
    <VideoInterview onComplete={handleComplete} />
  )
}
```

### Accessing Interview Data
```typescript
// Get user's interviews
const response = await fetch('/api/interview/save')
const { interviews } = await response.json()

// Get specific interview
const response = await fetch(`/api/interview/save?id=${interviewId}`)
const { interview } = await response.json()
```

## Future Enhancements

### Planned Features
- 📱 Mobile app support
- 🌍 Multi-language interviews
- 🎨 Custom interview themes
- 📈 Advanced analytics dashboard
- 🤝 Group interview support
- 🎯 Role-specific question banks

### Technical Improvements
- 📊 Real-time sentiment analysis
- 🎭 Facial expression analysis
- 🗣️ Voice tone analysis
- 📝 Automated interview summaries
- 🔗 Calendar integration
- ☁️ Cloud recording storage

## Troubleshooting

### Common Issues
1. **Camera not working**: Check browser permissions
2. **No audio**: Verify microphone permissions
3. **Recording failed**: Ensure sufficient storage space
4. **Interview not saving**: Check network connection

### Error Handling
- Graceful fallback for unsupported browsers
- Automatic permission request handling
- Network error recovery
- Session state preservation

## Development Setup

### Prerequisites
- Node.js 18+
- Next.js 14+
- Modern browser with WebRTC support

### Installation
```bash
npm install
npm run dev
```

### Testing
```bash
# Test video interview component
npm run test:interview

# Test API endpoints
npm run test:api
```

This video interview feature transforms the traditional text-based interview into an immersive, realistic experience that closely mirrors real-world interview scenarios.