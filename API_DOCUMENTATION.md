# AI Interview Platform - API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication
All endpoints require authentication via NextAuth session. Include credentials in requests.

## Endpoints

### Persona Management

#### Get All Personas
```http
GET /api/persona
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Alex Chen",
    "role": "Senior Software Engineer",
    "company_type": "Google",
    "description": "Focuses on algorithms...",
    "personality_traits": ["analytical", "detail-oriented"],
    "interview_style": "technical-deep-dive",
    "difficulty_preference": "hard",
    "focus_areas": ["algorithms", "data-structures"]
  }
]
```

#### Select Optimal Persona
```http
POST /api/persona
Content-Type: application/json

{
  "interview_type": "technical",
  "difficulty": "hard",
  "company_name": "Google"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Alex Chen",
  "role": "Senior Software Engineer",
  ...
}
```

### Gamification

#### Get User Progress
```http
GET /api/gamification?action=progress
```

**Response:**
```json
{
  "user_id": "uuid",
  "total_xp": 2500,
  "current_level": 5,
  "xp_to_next_level": 500,
  "xp_progress_percentage": 75,
  "streak_days": 7,
  "total_interviews": 15,
  "achievements_earned": 8,
  "rank": 42
}
```

#### Get Achievements
```http
GET /api/gamification?action=achievements
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "achievement_id": "uuid",
    "earned_at": "2024-01-15T10:30:00Z",
    "achievement": {
      "name": "First Interview",
      "description": "Complete your first interview",
      "xp_reward": 100,
      "rarity": "common"
    }
  }
]
```

#### Get Leaderboard
```http
GET /api/gamification?action=leaderboard&category=overall&timePeriod=all-time
```

**Response:**
```json
[
  {
    "user_id": "uuid",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "score": 5000,
    "rank": 1
  }
]
```

#### Award XP
```http
POST /api/gamification
Content-Type: application/json

{
  "action": "award_xp",
  "xp_amount": 250,
  "source": "interview_completion"
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "total_xp": 2750,
  "current_level": 5,
  "xp_to_next_level": 250
}
```

### Learning Paths

#### Get Learning Paths
```http
GET /api/learning-path?action=paths
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Path to Senior SWE at Google",
    "target_role": "Senior Software Engineer",
    "target_company": "Google",
    "difficulty_level": "intermediate",
    "estimated_duration_days": 90,
    "current_progress": 45,
    "status": "active",
    "modules": [...],
    "milestones": [...]
  }
]
```

#### Generate Learning Path
```http
POST /api/learning-path
Content-Type: application/json

{
  "action": "generate_path",
  "target_role": "Senior Software Engineer",
  "target_company": "Google"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Path to Senior SWE at Google",
  "modules": [
    {
      "title": "Data Structures Mastery",
      "type": "technical",
      "duration_days": 14,
      "topics": ["arrays", "trees", "graphs"]
    }
  ]
}
```

#### Assess Skill
```http
POST /api/learning-path
Content-Type: application/json

{
  "action": "assess_skill",
  "skill_name": "Algorithms",
  "score": 85
}
```

### Company Simulations

#### Get All Companies
```http
GET /api/company
```

**Response:**
```json
[
  {
    "id": "uuid",
    "company_name": "Google",
    "industry": "Technology",
    "size": "Large",
    "tech_stack": ["Go", "Python", "Java"],
    "difficulty_rating": 9,
    "culture_values": ["Innovation", "User Focus"]
  }
]
```

#### Get Company Profile
```http
GET /api/company?name=Google
```

#### Get Company Statistics
```http
GET /api/company?name=Google&action=stats
```

**Response:**
```json
{
  "total_interviews": 150,
  "average_score": 72,
  "pass_rate": 65,
  "common_challenges": [
    "Complex algorithm optimization",
    "System design at scale"
  ],
  "success_factors": [
    "Clear communication",
    "Optimal solutions"
  ]
}
```

#### Create Company Simulation
```http
POST /api/company
Content-Type: application/json

{
  "company_name": "Google",
  "position": "Senior Software Engineer",
  "difficulty": "hard"
}
```

**Response:**
```json
{
  "session_id": "uuid"
}
```

### Voice Analysis

#### Get Session Analytics
```http
GET /api/voice-analysis?sessionId=uuid&action=analytics
```

**Response:**
```json
{
  "analyses": [
    {
      "id": "uuid",
      "session_id": "uuid",
      "response_index": 0,
      "transcript": "In my previous role...",
      "confidence_score": 85,
      "speech_pace": 145,
      "filler_words_count": 3,
      "clarity_score": 88,
      "emotion_detected": "confident",
      "tone_analysis": {
        "primary_tone": "positive",
        "enthusiasm_score": 75
      },
      "recommendations": [
        "Excellent confidence level",
        "Reduce filler words slightly"
      ]
    }
  ],
  "summary": {
    "average_confidence": 85,
    "average_clarity": 88,
    "total_filler_words": 12,
    "average_speech_pace": 145,
    "dominant_emotion": "confident"
  }
}
```

#### Analyze Voice Response
```http
POST /api/voice-analysis
Content-Type: application/json

{
  "session_id": "uuid",
  "response_index": 0,
  "audio_url": "https://storage.example.com/audio.mp3",
  "transcript": "In my previous role at Amazon..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "confidence_score": 85,
  "tone_analysis": {
    "primary_tone": "confident",
    "emotional_valence": 65,
    "enthusiasm_score": 75
  },
  "speech_pace": 145,
  "filler_words_count": 3,
  "clarity_score": 88,
  "recommendations": [...]
}
```

### Mentor System

#### Get Available Mentors
```http
GET /api/mentor?action=available&expertise=algorithms
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "expertise_areas": ["algorithms", "system-design"],
    "years_experience": 10,
    "current_company": "Google",
    "current_role": "Staff Engineer",
    "rating": 4.8,
    "total_reviews": 25,
    "sessions_conducted": 50,
    "is_available": true
  }
]
```

#### Submit Mentor Feedback
```http
POST /api/mentor
Content-Type: application/json

{
  "action": "submit_feedback",
  "session_id": "uuid",
  "mentor_id": "uuid",
  "feedback_data": {
    "feedback_text": "Strong technical skills...",
    "technical_strengths": ["Algorithm design", "Code quality"],
    "technical_weaknesses": ["Time complexity analysis"],
    "communication_notes": "Clear explanations",
    "recommendations": ["Practice more DP problems"],
    "resources": [
      {
        "title": "Dynamic Programming Patterns",
        "type": "article",
        "url": "https://example.com",
        "description": "Comprehensive guide"
      }
    ]
  }
}
```

### Resume Processing

#### Get Resume Data
```http
GET /api/resume
```

**Response:**
```json
{
  "personal_info": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "experience": [...],
  "education": [...],
  "skills": {
    "languages": ["Python", "JavaScript"],
    "frameworks": ["React", "Django"]
  }
}
```

#### Parse Resume
```http
POST /api/resume
Content-Type: application/json

{
  "action": "parse",
  "resume_text": "John Doe\njohn@example.com\n\nExperience:\n..."
}
```

#### Generate Questions from Resume
```http
POST /api/resume
Content-Type: application/json

{
  "action": "generate_questions"
}
```

**Response:**
```json
{
  "questions": [
    "Tell me about your role as Senior Engineer at Amazon.",
    "Walk me through your E-commerce Platform project.",
    "What's your experience level with Python?"
  ]
}
```

### Analytics

#### Get Analytics Summary
```http
GET /api/analytics?action=summary&days=30
```

**Response:**
```json
{
  "total_interviews": 15,
  "total_time_minutes": 450,
  "average_score": 78,
  "improvement_trend": 12,
  "completion_rate": 93,
  "strongest_areas": ["Algorithms", "System Design"],
  "weakest_areas": ["Behavioral Questions"],
  "recent_performance": [...]
}
```

#### Get Skill Breakdown
```http
GET /api/analytics?action=skills
```

**Response:**
```json
[
  {
    "skill_name": "Algorithms",
    "current_score": 85,
    "previous_score": 75,
    "change": 10,
    "trend": "improving",
    "practice_count": 12
  }
]
```

#### Get Performance by Type
```http
GET /api/analytics?action=by-type
```

**Response:**
```json
{
  "technical": {
    "average_score": 82,
    "total_interviews": 8,
    "highest_score": 95,
    "lowest_score": 68,
    "trend": "improving"
  },
  "behavioral": {
    "average_score": 75,
    "total_interviews": 5,
    "trend": "stable"
  }
}
```

#### Get AI Insights
```http
GET /api/analytics?action=insights
```

**Response:**
```json
{
  "insights": [
    "Excellent progress! Your scores have improved by 15% recently.",
    "You're making great progress in Algorithms!",
    "Focus on improving: Behavioral Questions, System Design"
  ]
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Production endpoints are rate-limited to:
- 100 requests per minute per user
- 1000 requests per hour per user

## Webhooks

Coming soon: Real-time updates via webhooks for:
- Achievement unlocks
- Level ups
- Mentor feedback received
- Learning path milestones

## SDK Support

Official SDKs available for:
- JavaScript/TypeScript
- Python
- Go

## Support

For API support:
- Email: api-support@ai-interview-platform.com
- Documentation: https://docs.ai-interview-platform.com
- Status Page: https://status.ai-interview-platform.com
