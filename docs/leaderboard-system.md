# AI Interview Pro - Leaderboard & Streak System Documentation

## 📊 System Overview

The AI Interview Pro leaderboard system is a comprehensive gamification solution that ranks users based on performance, consistency, and participation. It includes daily streak tracking, performance bonuses, and real-time leaderboard updates.

## 🏗️ Architecture

### Components

1. **Database (Supabase/PostgreSQL)**
   - User scores tracking
   - Streak management
   - Leaderboard caching
   - Achievement system

2. **Python Ranking Engine**
   - Daily ranking calculations
   - Streak bonus computation
   - Background job processing
   - FastAPI endpoints

3. **Next.js Frontend**
   - Animated leaderboard display
   - Streak widgets
   - Real-time updates
   - Responsive design

4. **Supabase Edge Functions**
   - Caching layer
   - Scheduled updates
   - Performance optimization

## 📐 Algorithm Details

### Performance Score Formula

```
performance_score = (0.6 * ai_accuracy_score) + (0.3 * communication_score) + (0.1 * completion_rate)
```

- **ai_accuracy_score**: AI evaluation of answer quality (0-100)
- **communication_score**: Communication effectiveness rating (0-100)
- **completion_rate**: Interview completion percentage (0-100)

### Streak Bonus Calculation

```
streak_bonus = min(streak_days * 0.05, 0.5)
adjusted_score = performance_score * (1 + streak_bonus)
```

- Maximum bonus: 50% at 10+ days
- Linear scaling: 5% per day up to 10 days

### Ranking Tie-Breaker

When users have identical adjusted scores:
1. Most recent activity timestamp wins
2. Higher performance score (without bonus)
3. User ID (for consistency)

## 🗄️ Database Schema

### Core Tables

#### `user_scores`
- Tracks performance metrics
- Calculated performance_score (generated column)
- Last activity timestamp for tie-breaking

#### `user_streaks`
- Daily streak counter
- Longest streak record
- Freeze functionality
- Total sessions count

#### `leaderboard_cache`
- Pre-computed rankings
- Rank change tracking
- Country-based filtering
- Badge levels

#### `session_logs`
- Daily activity tracking
- Automatic streak updates via triggers
- Performance metrics per session

#### `achievements`
- Milestone tracking
- Streak achievements (3, 7, 14, 30, 60, 100 days)
- Rank achievements

## 🚀 API Endpoints

### Next.js API Routes

#### `GET /api/leaderboard`
Fetch paginated leaderboard data

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `country`: Filter by country code
- `timeframe`: all | weekly | monthly

**Response:**
```json
{
  "leaderboard": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "userPosition": {
    "rank": 15,
    "score": 85.5,
    "streak": 7,
    "badge": "gold",
    "rankChange": 3
  }
}
```

#### `GET /api/streaks`
Get user's streak information

**Response:**
```json
{
  "streak": {
    "current": 7,
    "longest": 14,
    "totalSessions": 45,
    "status": "active",
    "frozen": false
  },
  "sessions": [...],
  "achievements": [...],
  "nextMilestone": 14,
  "streakBonus": 0.35
}
```

#### `POST /api/streaks`
Log session or freeze streak

**Actions:**
- `log_session`: Record new interview session
- `freeze`: Use one-time monthly streak freeze

### Python Ranking Engine

#### `POST /api/ranking/session`
Record session and update streak

#### `POST /api/ranking/update`
Trigger manual ranking recalculation

#### `GET /api/ranking/stats/{user_id}`
Get detailed user statistics

## 🎨 Frontend Components

### LeaderboardDisplay
- Top 3 highlight cards with glow animation
- Paginated rankings table
- User position sticky banner
- Country and timeframe filters
- Smooth Framer Motion animations

### StreakWidget
- Animated flame icon (color changes with streak length)
- Calendar view of activity
- Achievement badges
- Progress to next milestone
- Streak freeze option

## ⚡ Performance Optimizations

### Caching Strategy
1. **Daily Cache Generation**: Rankings computed once at midnight UTC
2. **Edge Function Caching**: Supabase edge functions for fast reads
3. **Client-Side Caching**: React Query or SWR for data fetching
4. **Database Indexes**: Optimized queries with proper indexing

### Database Indexes
```sql
CREATE INDEX idx_user_scores_performance ON user_scores(performance_score DESC, last_activity_timestamp DESC);
CREATE INDEX idx_leaderboard_cache_rank ON leaderboard_cache(global_rank, cache_date);
CREATE INDEX idx_leaderboard_cache_score ON leaderboard_cache(adjusted_score DESC);
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account
- PostgreSQL database

### Installation

1. **Run setup script:**
```bash
chmod +x scripts/setup-leaderboard.sh
./scripts/setup-leaderboard.sh
```

2. **Configure environment variables:**
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
PYTHON_SERVICE_URL=http://localhost:8000
```

3. **Start services:**
```bash
# Terminal 1: Python ranking engine
cd python
source venv/bin/activate
python ranking_engine.py

# Terminal 2: Next.js development
npm run dev
```

## 📅 Scheduled Jobs

### Daily Ranking Update
- **Schedule**: Midnight UTC (00:00)
- **Process**:
  1. Calculate all user rankings
  2. Update leaderboard cache
  3. Store rank history
  4. Check for achievements

### Streak Maintenance
- **Real-time**: Updates on each session
- **Daily check**: Reset broken streaks
- **Freeze expiry**: 24 hours after activation

## 🏆 Badge Levels

| Level | Score Range | Color |
|-------|------------|-------|
| Diamond | 90-100 | Blue-Purple gradient |
| Platinum | 80-89 | Gray gradient |
| Gold | 70-79 | Yellow-Orange gradient |
| Silver | 60-69 | Light gray |
| Bronze | 0-59 | Orange gradient |

## 🔒 Security

### Row Level Security (RLS)
- Users can only view their own scores
- Public leaderboard data is read-only
- Admin-only ranking updates

### API Security
- Supabase Auth integration
- Service role key for admin operations
- Rate limiting on API endpoints

## 📈 Monitoring

### Key Metrics
- Daily active users
- Average streak length
- Ranking distribution
- Cache hit rate
- API response times

### Health Checks
```bash
# Check Python service
curl http://localhost:8000/health

# Check Supabase function
supabase functions list

# Database status
supabase db status
```

## 🐛 Troubleshooting

### Common Issues

1. **Rankings not updating**
   - Check cron job status
   - Verify Python service is running
   - Check Supabase function logs

2. **Streak not incrementing**
   - Verify session_logs trigger
   - Check timezone settings
   - Review streak calculation logic

3. **Performance issues**
   - Check cache expiration
   - Review database indexes
   - Monitor query performance

### Debug Commands
```bash
# View Python logs
journalctl -u ai-interview-ranking -f

# Supabase function logs
supabase functions logs update-leaderboard

# Database queries
supabase db query "SELECT * FROM leaderboard_cache ORDER BY global_rank LIMIT 10"
```

## 🚢 Production Deployment

### Python Service
Deploy to Railway, Heroku, or AWS Lambda

### Database
Use Supabase production instance with proper backups

### Monitoring
- Set up error tracking (Sentry)
- Performance monitoring (DataDog/New Relic)
- Uptime monitoring (UptimeRobot)

## 📝 Future Enhancements

- [ ] Team leaderboards
- [ ] Weekly/Monthly champions
- [ ] Custom achievement system
- [ ] Social sharing features
- [ ] Leaderboard seasons
- [ ] Power-ups and boosters
- [ ] Regional competitions
- [ ] API rate limiting per user

## 📞 Support

For issues or questions:
- Check documentation: `/docs/leaderboard-system.md`
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)
- Discord: [Join Community](https://discord.gg/your-server)
