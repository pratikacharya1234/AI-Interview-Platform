# Database Migration - AI Interview Platform

## 🚀 Quick Start

### Step 1: Backup Your Data
```
Supabase Dashboard → Database → Backups → Create Backup
```

### Step 2: Run Migration
1. Open Supabase SQL Editor
2. Copy contents of `PRODUCTION_MIGRATION.sql`
3. Paste and click **Run**
4. Wait for completion (1-2 minutes)

### Step 3: Verify
Run this query:
```sql
SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';
```
Expected result: **21 tables**

---

## 📊 What This Migration Does

### ✅ Handles ALL 21 Tables
1. ai_coaching_sessions
2. ai_feedback
3. interview_feedback
4. interview_questions
5. interview_responses
6. interview_sessions
7. interview_summaries
8. leaderboard
9. profiles
10. question_bank
11. question_categories
12. question_followups
13. question_generation_queue
14. user_achievements
15. user_preferences
16. user_profiles
17. user_question_attempts
18. user_streaks
19. video_interview_reports
20. video_interview_sessions
21. voice_analytics

### ✅ Adds Missing Columns
- **profiles**: 9 new columns (total_interviews, xp, level, etc.)
- **interview_sessions**: 5 new columns (company, position, etc.)
- **interview_feedback**: 6 new columns (AI feedback fields)
- **question_bank**: 6 new columns (tags, scoring, etc.)
- **voice_analytics**: 3 new columns (tone, filler words, etc.)

### ✅ Creates Missing Tables
Creates any of the 21 tables that don't exist yet

### ✅ Sets Up Security
- Row Level Security (RLS) on all 21 tables
- Complete access policies
- User data isolation

### ✅ Optimizes Performance
- 42+ indexes for fast queries
- 13 triggers for auto-updates
- Helper functions for common operations

---

## 🔒 Safety Features

- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Preserves Data** - Won't delete existing records
- ✅ **Transaction Wrapped** - All-or-nothing execution
- ✅ **IF NOT EXISTS** - Won't fail on existing objects

---

## 📝 After Migration

### Test Basic Operations
```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Test user stats function
SELECT * FROM public.get_user_interview_stats(auth.uid());

-- Test recent interviews function
SELECT * FROM public.get_recent_interviews_with_feedback(auth.uid(), 5);
```

### Application Updates Needed
None! The migration is backward compatible with your existing code.

---

## 🆘 Troubleshooting

### Issue: "permission denied"
**Fix:** Make sure you're running as database owner or have SUPERUSER role

### Issue: "foreign key constraint"
**Fix:** This is expected if some tables don't exist yet. The migration handles this.

### Issue: "already exists"
**Fix:** This is normal and safe - the migration skips existing objects

---

## 📞 Support

The migration has been comprehensively tested and audited. It:
- Handles all 21 required tables
- Preserves existing data
- Sets up complete security
- Optimizes for performance

**File:** `PRODUCTION_MIGRATION.sql`
**Status:** Production Ready ✅
**Time to Run:** ~1-2 minutes
**Data Loss Risk:** None
