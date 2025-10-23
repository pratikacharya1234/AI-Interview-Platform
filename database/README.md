# AI Interview Platform Database Schema

## 🚀 **Quick Start**

### **Use This File**: `READY_TO_RUN.sql` ✅

This is the **fixed, idempotent** schema that can be run multiple times without errors.

---

## Database Setup

This directory contains production-ready SQL scripts for the AI Interview Platform database.

## 📁 Files

### Core Scripts

- **`create_all_tables.sql`** - Complete production schema (✅ USE THIS)
  - Creates all tables, indexes, RLS policies, triggers, and functions
  - Single file with everything you need
  - Production-ready with real-world logic

- **`drop_all_tables.sql`** - Safely removes all database objects (⚠️ USE WITH CAUTION)
  - Drops all tables and data
  - Removes policies, indexes, triggers, and functions
  - Use for fresh starts or troubleshooting

### Documentation

- **`DATABASE_SETUP.md`** - Comprehensive setup guide
  - Detailed schema documentation
  - Security policies explained
  - Helper functions reference
  - Troubleshooting guide
  - Production checklist

## 🚀 Quick Start

### Fresh Installation

1. Open your **Supabase SQL Editor**
2. Copy the entire contents of **`create_all_tables.sql`**
3. Paste and click **Run**
4. ✅ Done!

### Reset Everything

1. **⚠️ BACKUP YOUR DATA FIRST**
2. Run **`drop_all_tables.sql`** in Supabase SQL Editor
3. Then run **`create_all_tables.sql`**

## 📊 What's Included

### Tables Created
- ✅ `profiles` - User profiles and statistics
- ✅ `practice_attempts` - Practice session records
- ✅ `interview_sessions` - Interview metadata
- ✅ `interview_responses` - Conversation transcripts
- ✅ `interview_feedback` - AI-generated feedback
- ✅ `voice_analytics` - Voice quality metrics
- ✅ `achievements` - User achievements
- ✅ `user_progress` - Skill progression
- ✅ `leaderboard` - Rankings
- ✅ `streaks` - Activity tracking

### Features
- ✅ Row Level Security (RLS) on all tables
- ✅ Automatic timestamp updates
- ✅ Optimized indexes for performance
- ✅ Helper functions for common queries
- ✅ Proper foreign key relationships
- ✅ Storage bucket for audio files
- ✅ Triggers for data consistency

## 🔒 Security

- **RLS Enabled:** All tables have Row Level Security
- **User Isolation:** Users can only access their own data
- **Public Leaderboard:** Rankings visible to all users
- **Secure Functions:** Helper functions use SECURITY DEFINER

## 📚 Documentation

For detailed information, see **[DATABASE_SETUP.md](./DATABASE_SETUP.md)**:
- Complete schema reference
- Security policies explained
- Helper functions guide
- Troubleshooting tips
- Production checklist

## 🛠️ Helper Functions

```sql
-- Get user interview statistics
SELECT * FROM get_user_interview_stats('user-id');

-- Get recent interviews with feedback
SELECT * FROM get_recent_interviews_with_feedback('user-id', 10);
```

## ⚠️ Important Notes

1. **Always backup before running drop_all_tables.sql**
2. **Test in development first**
3. **RLS policies are production-ready**
4. **Indexes are optimized for performance**
5. **All timestamps are in UTC**

## 🐛 Troubleshooting

### Can't access data?
- Check if you're authenticated
- Verify RLS policies match your use case
- See DATABASE_SETUP.md for detailed troubleshooting

### Foreign key errors?
- Ensure parent records exist first
- Check table creation order
- Verify user IDs match

### Performance issues?
- Check if indexes are being used
- Run `VACUUM ANALYZE`
- Review slow queries in Supabase dashboard

## 📝 Version

**Current Version:** 2.0.0
- Consolidated schema
- Voice + Text interviews
- Gamification system
- Production-ready

---

**Need more help?** Check [DATABASE_SETUP.md](./DATABASE_SETUP.md) for comprehensive documentation.

## Overview
This directory contains the complete production-ready database schema for the AI Interview Platform.

## Files
- **`READY_TO_RUN.sql`** ⭐ - **USE THIS ONE** - Fixed schema ready for Supabase
- `voice_interview_production_schema.sql` - Voice interview schema (also fixed)
- `production_schema.sql` - Complete database schema with all tables, indexes, RLS policies, and triggers

## ✅ **Recent Fixes Applied**

1. **Fixed Foreign Keys** - Now references `auth.users` instead of `users`
2. **Idempotent Triggers** - Added `DROP TRIGGER IF EXISTS` to prevent duplicate errors
3. **Idempotent Policies** - Added `DROP POLICY IF EXISTS` for RLS policies
4. **Safe to Re-run** - Can now run the schema multiple times without errors

## Features
The schema includes:

### Core Tables
- **User Management**: user_profiles, user_preferences
- **Question Bank**: question_bank, question_categories, question_followups
- **Interview Sessions**: interview_sessions, interview_questions, interview_summaries
- **AI Features**: ai_feedback, ai_coaching_sessions
- **Video Interviews**: video_interview_sessions, video_interview_reports
- **Gamification**: user_achievements, leaderboard, user_streaks
- **Queue Management**: question_generation_queue
- **Tracking**: user_question_attempts

### Security Features
- Row Level Security (RLS) policies for all tables
- Proper foreign key constraints
- Check constraints for data validation
- UUID primary keys for security

### Performance Optimizations
- Indexes on frequently queried columns
- GIN indexes for full-text search
- Partial indexes for filtered queries
- Composite indexes for complex queries

### Data Integrity
- Automatic timestamp updates via triggers
- Cascading deletes where appropriate
- Unique constraints to prevent duplicates
- JSONB fields for flexible metadata

## Deployment Instructions

### Prerequisites
- Supabase project or PostgreSQL 14+ database
- Database admin access

### Installation Steps

1. **Connect to your database**
   ```bash
   psql -h your-database-host -U your-username -d your-database
   ```

2. **Run the schema file**
   ```bash
   psql -h your-database-host -U your-username -d your-database -f production_schema.sql
   ```

   Or in Supabase:
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `production_schema.sql`
   - Paste and run the SQL

3. **Verify installation**
   ```sql
   -- Check if tables were created
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   
   -- Check if RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

## Important Notes

### No Dummy Data
This schema contains **NO dummy data**. It's a clean, production-ready schema that you can deploy directly to your production database.

### Supabase Integration
The schema is designed to work with Supabase Auth:
- `user_profiles` table references `auth.users`
- RLS policies use `auth.uid()` for user identification

### Extensibility
The schema uses JSONB `metadata` fields in most tables for flexibility. You can store additional data without schema changes.

### Performance Considerations
- Indexes are created for common query patterns
- Consider adding more indexes based on your specific query patterns
- Monitor query performance and add indexes as needed

## Table Relationships

```
auth.users
    ├── user_profiles (1:1)
    ├── user_preferences (1:1)
    ├── interview_sessions (1:many)
    ├── ai_feedback (1:many)
    ├── video_interview_sessions (1:many)
    ├── user_achievements (1:many)
    ├── leaderboard (1:many)
    └── user_streaks (1:many)

question_categories
    └── question_bank (1:many)
        ├── question_followups (1:many)
        └── interview_questions (many:many via interview_sessions)

interview_sessions
    ├── interview_questions (1:many)
    ├── interview_summaries (1:1)
    └── video_interview_sessions (1:1)
        └── video_interview_reports (1:many)
```

## Maintenance

### Regular Tasks
1. **Vacuum and Analyze**
   ```sql
   VACUUM ANALYZE;
   ```

2. **Update Statistics**
   ```sql
   ANALYZE;
   ```

3. **Check Index Usage**
   ```sql
   SELECT schemaname, tablename, indexname, idx_scan
   FROM pg_stat_user_indexes
   ORDER BY idx_scan;
   ```

### Backup Strategy
- Set up regular automated backups
- Test restore procedures regularly
- Keep backups in multiple locations

## Support
For issues or questions about the schema, please refer to the main project documentation or create an issue in the repository.
