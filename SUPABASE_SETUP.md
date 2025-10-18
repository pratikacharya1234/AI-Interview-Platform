# 🚀 Complete Supabase Backend Setup Guide

## Prerequisites
- Supabase account (create at https://supabase.com)
- Project created in Supabase Dashboard
- Access to SQL Editor in Supabase Setup for AI Interview Platform

This document provides comprehensive setup instructions and usage guidelines for the AI Interview Platform's Supabase database.

## Database Schema

The platform uses 7 core tables to manage the complete interview experience:

### Core Tables

1. **`profiles`** - Extended user profiles with interview preferences
2. **`interviews`** - Interview sessions and their metadata
3. **`interview_questions`** - Question bank with categories and difficulty levels
4. **`interview_responses`** - User responses with AI analysis
5. **`performance_metrics`** - Detailed performance tracking
6. **`github_repositories`** - GitHub integration and code analysis
7. **`study_plans`** - Personalized learning paths

### Database Views

- **`user_performance_summary`** - Aggregated performance metrics per user
- **`question_usage_stats`** - Question usage analytics
- **`recent_interview_activity`** - Latest interview activity across platform

## Setup Instructions

### 1. Local Development Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase (if not already done)
supabase init

# Start local Supabase
supabase start

# Apply migrations
supabase db push
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# GitHub OAuth (for auth and API)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_key

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_app_password
```

### 3. Production Deployment

1. Create a new Supabase project at https://supabase.com
2. Run the migration script in SQL Editor:
   ```sql
   -- Copy and paste contents from supabase/migrations/001_initial_schema.sql
   ```
3. Configure authentication providers in Supabase Dashboard
4. Set up environment variables in your hosting platform

## Usage Examples

### Profile Management

```typescript
import { ProfileService } from '@/lib/supabase/database'

// Get user profile
const profile = await ProfileService.getById(userId)

// Update profile preferences
await ProfileService.update(userId, {
  preferred_language: 'TypeScript',
  experience_level: 'senior',
  target_companies: ['Google', 'Meta', 'Netflix']
})

// Sync GitHub data
await ProfileService.updateGitHubData(userId, githubData, 'username')
```

### Interview Management

```typescript
import { InterviewService, QuestionService } from '@/lib/supabase/database'

// Create new interview
const interview = await InterviewService.create({
  user_id: userId,
  type: 'technical',
  difficulty: 'medium',
  category: 'frontend',
  status: 'scheduled'
})

// Get questions for interview
const questions = await QuestionService.getRandom('technical', 'medium', 5)

// Update interview status
await InterviewService.updateStatus(interview.id, 'in-progress')
```

### Response and Performance Tracking

```typescript
import { ResponseService, PerformanceService } from '@/lib/supabase/database'

// Record user response
const response = await ResponseService.create({
  interview_id: interviewId,
  question_id: questionId,
  user_response: 'User answer here...',
  response_time_seconds: 180
})

// Add AI feedback
await ResponseService.updateWithFeedback(
  response.id,
  8.5, // AI score
  { clarity: 9, technical_accuracy: 8, completeness: 8 },
  ['Consider edge cases', 'Add error handling']
)

// Track performance
await PerformanceService.create({
  user_id: userId,
  interview_id: interviewId,
  metric_type: 'overall_score',
  score: 85,
  details: { breakdown: 'Technical: 90, Communication: 80' }
})
```

### GitHub Integration

```typescript
import { GitHubService } from '@/lib/supabase/database'

// Sync user repositories
await GitHubService.upsertRepositories([
  {
    user_id: userId,
    repo_id: 12345,
    name: 'awesome-project',
    language: 'TypeScript',
    stargazers_count: 150,
    // ... other repo data
  }
])

// Update AI analysis
await GitHubService.updateAnalysis(repoId, {
  code_quality: 'high',
  architecture_patterns: ['MVC', 'Clean Architecture'],
  suggested_improvements: ['Add more tests', 'Improve documentation']
})
```

### Study Plans

```typescript
import { StudyPlanService } from '@/lib/supabase/database'

// Create personalized study plan
const studyPlan = await StudyPlanService.create({
  user_id: userId,
  title: 'Frontend System Design Mastery',
  goals: ['Master React patterns', 'Learn system design'],
  timeline_weeks: 8,
  content: {
    modules: [
      { name: 'React Advanced Patterns', duration: '2 weeks' },
      { name: 'System Design Fundamentals', duration: '3 weeks' }
    ]
  }
})

// Update progress
await StudyPlanService.updateProgress(studyPlan.id, {
  completed_modules: 1,
  current_module: 2,
  completion_percentage: 25
})
```

### Real-time Subscriptions

```typescript
import { SubscriptionService } from '@/lib/supabase/database'

// Subscribe to interview updates
const subscription = SubscriptionService.subscribeToInterview(
  interviewId,
  (interview) => {
    console.log('Interview updated:', interview.status)
  }
)

// Subscribe to user's interviews
const userSubscription = SubscriptionService.subscribeToUserInterviews(
  userId,
  (interviews) => {
    console.log('User interviews updated:', interviews.length)
  }
)

// Cleanup subscriptions
subscription.unsubscribe()
userSubscription.unsubscribe()
```

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Profiles**: Users can only access their own profile
- **Interviews**: Users can only see their own interviews
- **Responses**: Users can only see responses to their interviews
- **Performance**: Users can only see their own metrics
- **GitHub Repos**: Users can only access their own repositories
- **Study Plans**: Users can only see their own study plans

### Data Privacy

- Sensitive data is encrypted at rest
- Personal information is protected by RLS policies
- GitHub tokens are handled securely through Supabase Auth
- AI analysis data is anonymized when possible

## Performance Optimizations

### Database Indexes

Strategic indexes are created for:
- User lookups (profiles.id, profiles.github_username)
- Interview queries (interviews.user_id, interviews.status)
- Question filtering (questions.type, questions.difficulty, questions.category)
- Performance tracking (performance_metrics.user_id, performance_metrics.recorded_at)
- GitHub integration (github_repositories.user_id)

### Query Optimization

- Use compound indexes for complex filters
- Implement pagination for large result sets
- Cache frequently accessed data (questions, user preferences)
- Use database views for complex aggregations

## Maintenance

### Regular Tasks

1. **Monitor Question Usage**: Use `question_usage_stats` view to balance question rotation
2. **Performance Analysis**: Review `user_performance_summary` for insights
3. **Data Cleanup**: Archive old interviews and responses periodically
4. **Index Maintenance**: Monitor query performance and adjust indexes

### Database Functions

Key PostgreSQL functions included:

- `increment_question_usage()`: Tracks question usage for rotation
- `calculate_performance_metrics()`: Computes user performance scores
- `update_profile_stats()`: Updates profile statistics on data changes

### Monitoring

Set up alerts for:
- High database CPU usage
- Slow query performance
- Failed authentication attempts
- Storage quota approaching limits

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify environment variables are set correctly
   - Check Supabase project status
   - Ensure network connectivity

2. **Permission Denied**
   - Verify RLS policies are correct
   - Check user authentication status
   - Ensure proper user context in queries

3. **Type Errors**
   - Regenerate types: `supabase gen types typescript > types/database.ts`
   - Check TypeScript configuration
   - Verify import statements

### Development Tools

```bash
# Generate fresh TypeScript types
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# Reset local database
supabase db reset

# View real-time logs
supabase logs --follow

# Check migration status
supabase migration list
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

---

**Note**: This setup provides a production-ready foundation for the AI Interview Platform. All components are designed for scalability, security, and maintainability.