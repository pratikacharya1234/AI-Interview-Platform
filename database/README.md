# AI Interview Platform Database Schema

## Overview
This directory contains the complete production-ready database schema for the AI Interview Platform.

## Files
- `production_schema.sql` - Complete database schema with all tables, indexes, RLS policies, and triggers

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
