# AI Interview Platform - Database Setup Guide

## 📋 Overview

This directory contains production-ready SQL scripts for the AI Interview Platform database. The schema supports:

- **Voice Interviews** - Real-time voice interview sessions with Vapi AI integration
- **Text Interviews** - Traditional text-based interview sessions
- **AI Feedback** - Comprehensive AI-powered feedback and analysis
- **Gamification** - Achievements, streaks, leaderboards, and XP system
- **Analytics** - Voice analytics, performance metrics, and user progress tracking
- **User Management** - Profiles, preferences, and authentication

## 🚀 Quick Start

### Option 1: Fresh Installation

1. Open your **Supabase SQL Editor**
2. Copy the entire contents of `create_all_tables.sql`
3. Paste and click **Run**
4. ✅ Done! All tables, indexes, RLS policies, and functions are created

### Option 2: Reset Everything

If you need to start fresh or fix issues:

1. **⚠️ BACKUP YOUR DATA FIRST** (if you have important data)
2. Open **Supabase SQL Editor**
3. Copy the entire contents of `drop_all_tables.sql`
4. Paste and click **Run** (this will delete all tables and data)
5. Then run `create_all_tables.sql` to recreate everything

## 📁 Files

### `create_all_tables.sql`
**Purpose:** Creates the complete database schema from scratch

**Contains:**
- ✅ All table definitions with proper constraints
- ✅ Indexes for optimal performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for automatic timestamp updates
- ✅ Helper functions for common queries
- ✅ Proper foreign key relationships

**Tables Created:**
1. `profiles` - User profiles and statistics
2. `practice_attempts` - Practice session records
3. `interview_sessions` - Interview session metadata
4. `interview_responses` - Conversation transcripts
5. `interview_feedback` - AI-generated feedback
6. `voice_analytics` - Voice quality metrics
7. `achievements` - User achievements and badges
8. `user_progress` - Skill progression tracking
9. `leaderboard` - Global and periodic rankings
10. `streaks` - Daily/weekly activity streaks

### `drop_all_tables.sql`
**Purpose:** Safely removes all database objects

**⚠️ WARNING:** This script will:
- Drop all tables and their data
- Remove all RLS policies
- Delete all indexes
- Remove all triggers and functions
- Clear storage policies (audio files remain unless uncommented)

**Use Cases:**
- Starting fresh in development
- Fixing schema conflicts
- Migrating to a new structure
- Troubleshooting database issues

## 🗄️ Database Schema

### Core Tables

#### `profiles`
User profiles extending Supabase auth.users
```sql
- id (TEXT, PRIMARY KEY)
- email, name, avatar_url, bio
- experience_level, target_role, tech_stack
- total_interviews, completed_interviews, average_score
- total_xp, level, streak_days
- Gamification and metadata fields
```

#### `interview_sessions`
Main interview session records
```sql
- id (UUID, PRIMARY KEY)
- user_id, title, description
- interview_type (voice/text), status
- questions (JSONB), metadata (JSONB)
- started_at, completed_at, duration_minutes
- overall_score, feedback_id
```

#### `interview_responses`
Conversation transcripts and messages
```sql
- id (UUID, PRIMARY KEY)
- interview_id, role (user/assistant/system)
- content, timestamp
- confidence, stage, analysis (JSONB)
- sequence_number
```

#### `interview_feedback`
Comprehensive AI feedback
```sql
- id (UUID, PRIMARY KEY)
- interview_id, user_id
- overall_score, hiring_recommendation
- scores, strengths, improvements (JSONB arrays)
- detailed_feedback, recommendations
- transcript, duration_seconds
```

#### `voice_analytics`
Voice quality metrics
```sql
- id (UUID, PRIMARY KEY)
- interview_id
- clarity_score, pace_score, volume_score
- filler_words_count, pause_frequency
- tonal_variation, articulation_score
- analysis (JSONB)
```

### Gamification Tables

#### `achievements`
User achievements and badges
```sql
- id (UUID, PRIMARY KEY)
- user_id, achievement_type, title
- description, icon, xp_reward
- unlocked_at, metadata
```

#### `leaderboard`
Global and periodic rankings
```sql
- id (UUID, PRIMARY KEY)
- user_id, total_score, total_xp, rank
- weekly_score, monthly_score
- last_updated
```

#### `streaks`
Activity streak tracking
```sql
- id (UUID, PRIMARY KEY)
- user_id, current_streak, longest_streak
- last_activity_date, streak_data (JSONB)
```

## 🔒 Security

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Profiles:** Users can view/update their own profile
- **Interviews:** Users can only access their own interview data
- **Feedback:** Users can only view their own feedback
- **Leaderboard:** Public read access for all users
- **Achievements:** Users can only view their own achievements

### Permissions

Proper permissions are granted to:
- `authenticated` - Logged-in users
- `anon` - Anonymous users (limited access)

## 🔧 Helper Functions

### `get_user_interview_stats(user_id)`
Returns comprehensive interview statistics for a user
```sql
SELECT * FROM get_user_interview_stats('user-id-here');
```

### `get_recent_interviews_with_feedback(user_id, limit)`
Returns recent interviews with associated feedback
```sql
SELECT * FROM get_recent_interviews_with_feedback('user-id-here', 10);
```

## 📊 Indexes

Optimized indexes are created for:
- User lookups (email, user_id)
- Interview queries (status, created_at)
- Feedback retrieval (interview_id, user_id)
- Leaderboard rankings (total_score, rank)
- Time-based queries (created_at DESC)

## 🔄 Automatic Triggers

### Updated At Triggers
Automatically updates `updated_at` timestamp on:
- profiles
- interview_sessions
- interview_feedback
- user_progress
- streaks

## 🎯 Real-World Logic Implementation

### 1. **Interview Flow**
```
User starts interview → interview_sessions created
↓
Questions asked → interview_responses stored
↓
Interview completed → interview_feedback generated
↓
Analytics calculated → voice_analytics populated
↓
XP awarded → profiles.total_xp updated
↓
Achievements unlocked → achievements created
↓
Leaderboard updated → leaderboard recalculated
```

### 2. **Streak Management**
- Tracks daily activity
- Updates current_streak automatically
- Records longest_streak milestone
- Resets on missed days

### 3. **Gamification System**
- XP earned per interview
- Level progression based on total_xp
- Achievements unlock at milestones
- Leaderboard updates in real-time

### 4. **Performance Optimization**
- Composite indexes on frequently queried columns
- JSONB for flexible metadata storage
- Proper foreign key constraints with CASCADE deletes
- Efficient RLS policies

## 🛠️ Maintenance

### Backup Strategy
```sql
-- Backup all data before major changes
pg_dump your_database > backup_$(date +%Y%m%d).sql
```

### Common Operations

**Check table sizes:**
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**View active policies:**
```sql
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

**Check index usage:**
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 🐛 Troubleshooting

### Issue: Foreign Key Constraint Errors
**Solution:** Ensure parent records exist before creating child records. Check the order of table creation in `create_all_tables.sql`.

### Issue: RLS Policy Blocking Access
**Solution:** Verify the user is authenticated and policies match your use case. Temporarily disable RLS for debugging:
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Issue: Duplicate Key Violations
**Solution:** Check UNIQUE constraints. Use `ON CONFLICT` clauses in INSERT statements:
```sql
INSERT INTO profiles (id, email) VALUES (...)
ON CONFLICT (id) DO UPDATE SET ...;
```

### Issue: Performance Degradation
**Solution:** 
1. Check if indexes are being used: `EXPLAIN ANALYZE your_query;`
2. Vacuum and analyze tables: `VACUUM ANALYZE;`
3. Review slow queries in Supabase dashboard

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Performance](https://supabase.com/docs/guides/database/performance)

## ✅ Production Checklist

Before deploying to production:

- [ ] Run `create_all_tables.sql` in a staging environment first
- [ ] Test all RLS policies with different user roles
- [ ] Verify indexes are created and being used
- [ ] Test helper functions with sample data
- [ ] Set up automated backups
- [ ] Monitor query performance
- [ ] Document any custom modifications
- [ ] Test CASCADE delete behavior
- [ ] Verify storage bucket permissions
- [ ] Set up monitoring and alerts

## 🤝 Contributing

When modifying the schema:

1. Always test in development first
2. Document changes in this README
3. Update both `create_all_tables.sql` and `drop_all_tables.sql`
4. Test migration path from old to new schema
5. Update application code to match schema changes

## 📝 Version History

- **v2.0.0** (Current) - Consolidated schema with voice/text interviews, gamification
- **v1.0.0** - Initial production schema

---

**Need Help?** Check the main project README or open an issue on GitHub.
