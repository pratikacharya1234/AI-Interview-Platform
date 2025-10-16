# Navigation Guide - New Features Integration

## Updated Navigation Structure

The sidebar navigation has been updated to include all new features with proper organization and visual indicators.

## Navigation Sections

### 1. Dashboard
- **Route**: `/dashboard`
- **Icon**: Home
- **Description**: Main dashboard with overview

### 2. Interviews (Expanded)
**New Features Added:**
- **Multi-Persona Interviews** (NEW)
  - Route: `/interview/persona`
  - Icon: Users
  - Access 7 unique interviewer personalities
  
- **Company Simulations** (NEW)
  - Route: `/interview/company`
  - Icon: Building2
  - Practice with Google, Amazon, Meta, Microsoft, Apple, Netflix, Stripe

**Existing Features:**
- Start New Interview: `/interview`
- Text Interview: `/interview/text`
- Voice Interview: `/interview/conversational`
- Interview History: `/interview/history`
- Feedback & Results: `/interview/feedback`

### 3. Gamification (NEW SECTION)
**Badge**: "New"
**Icon**: Trophy

- **Achievements**
  - Route: `/achievements`
  - View and unlock 12 unique achievements
  - Rarity: Common to Legendary
  
- **Leaderboard**
  - Route: `/leaderboard`
  - Compete with peers globally
  - Multiple categories and time periods
  
- **Daily Streak**
  - Route: `/streak`
  - Track consecutive days
  - Maintain streaks for bonus XP
  
- **XP & Levels**
  - Route: `/progress`
  - View current level and XP
  - Track progress to next level

### 4. Learning Paths (NEW SECTION)
**Badge**: "New"
**Icon**: Map

- **My Learning Paths**
  - Route: `/learning/paths`
  - Personalized learning journeys
  - Target role and company specific
  
- **Skill Assessment**
  - Route: `/learning/skills`
  - Track proficiency across skills
  - View improvement over time
  
- **Study Resources**
  - Route: `/resources`
  - Curated learning materials
  
- **Practice Questions**
  - Route: `/practice`
  - Practice interview questions
  
- **Coding Challenges**
  - Route: `/coding`
  - Algorithm and coding practice

### 5. Analytics (Reorganized)
**Icon**: BarChart3

- **Performance Dashboard**
  - Route: `/analytics`
  - Overall performance metrics
  
- **Voice Analysis** (NEW)
  - Route: `/analytics/voice`
  - Badge: "New"
  - Confidence, tone, and speech metrics
  
- **Progress Tracking**
  - Route: `/interview/performance`
  - Track improvement over time
  
- **Performance Reports**
  - Route: `/reports`
  - Detailed performance reports

### 6. Mentorship (NEW SECTION)
**Badge**: "New"
**Icon**: GraduationCap

- **Find Mentors**
  - Route: `/mentor/find`
  - Browse available mentors by expertise
  
- **My Mentors**
  - Route: `/mentor/my-mentors`
  - View your connected mentors
  
- **Mentor Feedback**
  - Route: `/mentor/feedback`
  - Detailed feedback from mentors

### 7. AI Features
- Route: `/ai/coach`
- Icon: Zap
- AI-powered coaching and features

### 8. Account
- My Profile: `/profile`
- Settings: `/settings`
- Preferences: `/preferences`
- Subscription: `/subscription`

### 9. Help & Support
- Help Center: `/help`
- Tutorials: `/tutorials`
- Contact Support: `/contact`

## Visual Indicators

### Badges
- **"New"** badge appears on:
  - Multi-Persona Interviews
  - Company Simulations
  - Gamification section
  - Learning Paths section
  - Voice Analysis
  - Mentorship section

### Active States
- Active routes are highlighted with:
  - Primary color background
  - Bold font weight
  - Primary text color

### Expandable Sections
- Sections with children show chevron icons
- Click to expand/collapse
- Auto-expand when child route is active

## Default Expanded Sections

The following sections are expanded by default:
- Interviews (most commonly used)

## Mobile Responsive

- Sidebar collapses to icon-only view on mobile
- Icons remain visible
- Click to expand full navigation

## Implementation Details

### File Location
`src/components/navigation/sidebar.tsx`

### New Icons Added
- `Users` - Multi-persona interviews
- `Building2` - Company simulations
- `Trophy` - Gamification/Leaderboard
- `Flame` - Daily streak
- `Map` - Learning paths
- `GraduationCap` - Mentorship
- `UserCircle` - My mentors

### Navigation State
- Uses React state for expansion
- Persists active route highlighting
- Smooth transitions and animations

## API Integration

Each navigation item connects to corresponding API endpoints:

### Persona System
- GET `/api/persona` - List all personas
- POST `/api/persona` - Select optimal persona

### Gamification
- GET `/api/gamification?action=progress` - User XP and level
- GET `/api/gamification?action=achievements` - Earned achievements
- GET `/api/gamification?action=leaderboard` - Rankings

### Learning Paths
- GET `/api/learning-path?action=paths` - User's learning paths
- GET `/api/learning-path?action=skills` - Skill assessments
- POST `/api/learning-path` - Generate new path

### Company Simulations
- GET `/api/company` - List all companies
- GET `/api/company?name=Google` - Company details
- POST `/api/company` - Create simulation

### Voice Analysis
- GET `/api/voice-analysis?sessionId=xxx&action=analytics` - Session analytics
- POST `/api/voice-analysis` - Analyze voice response

### Mentor System
- GET `/api/mentor?action=available` - Available mentors
- POST `/api/mentor` - Submit feedback or request session

### Analytics
- GET `/api/analytics?action=summary` - Performance summary
- GET `/api/analytics?action=insights` - AI insights

## User Flow Examples

### Starting a Persona Interview
1. Navigate to **Interviews** → **Multi-Persona Interviews**
2. Select from 7 interviewer personalities
3. Choose difficulty and interview type
4. Start interview with selected persona

### Viewing Achievements
1. Navigate to **Gamification** → **Achievements**
2. View earned and available achievements
3. Check progress towards locked achievements
4. See XP rewards and rarity

### Creating Learning Path
1. Navigate to **Learning Paths** → **My Learning Paths**
2. Click "Generate New Path"
3. Select target role and company
4. System analyzes weak areas
5. Personalized path created with modules

### Finding a Mentor
1. Navigate to **Mentorship** → **Find Mentors**
2. Filter by expertise area
3. View mentor profiles and ratings
4. Request mentorship session

## Accessibility

- Keyboard navigation supported
- ARIA labels on all interactive elements
- Screen reader friendly
- High contrast mode compatible

## Future Enhancements

Planned additions to navigation:
- Resume upload section
- GitHub integration panel
- Real-time notifications
- Quick actions menu
- Search functionality

## Testing Navigation

To test all navigation routes:
```bash
# Start development server
npm run dev

# Navigate to dashboard
http://localhost:3001/dashboard

# Test each new feature route
http://localhost:3001/interview/persona
http://localhost:3001/interview/company
http://localhost:3001/achievements
http://localhost:3001/leaderboard
http://localhost:3001/learning/paths
http://localhost:3001/analytics/voice
http://localhost:3001/mentor/find
```

## Summary

All new features are now properly integrated into the navigation system with:
- Clear visual hierarchy
- Intuitive organization
- "New" badges for discoverability
- Consistent icon usage
- Responsive design
- Full API integration

The navigation provides easy access to all 8 major feature sets implemented in the platform.
