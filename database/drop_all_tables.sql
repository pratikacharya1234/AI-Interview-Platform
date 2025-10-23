-- =====================================================
-- AI Interview Platform - DROP ALL TABLES
-- =====================================================
-- WARNING: This script will DROP ALL tables and data
-- Use with EXTREME CAUTION in production environments
-- Always backup your data before running this script
-- =====================================================

-- Disable triggers temporarily to avoid cascading issues
SET session_replication_role = 'replica';

-- =====================================================
-- DROP STORAGE POLICIES AND BUCKETS
-- =====================================================

-- Drop storage policies
DROP POLICY IF EXISTS "Users can delete their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own audio files" ON storage.objects;

-- Drop storage bucket (optional - comment out if you want to keep files)
-- DELETE FROM storage.buckets WHERE id = 'interview-audio';

-- =====================================================
-- DROP ALL VIEWS
-- =====================================================

DROP VIEW IF EXISTS question_usage_stats CASCADE;
DROP VIEW IF EXISTS recent_interview_activity CASCADE;
DROP VIEW IF EXISTS user_performance_summary CASCADE;

-- =====================================================
-- DROP ALL FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS get_recent_interviews_with_feedback(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_user_interview_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_interview_count() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_voice_interview_timestamp() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- DROP ALL TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS interview_summaries_updated_at ON interview_summaries;
DROP TRIGGER IF EXISTS voice_interview_updated_at ON voice_interviews;
DROP TRIGGER IF EXISTS on_interview_status_change ON public.interviews;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_study_plans_updated_at ON public.study_plans;
DROP TRIGGER IF EXISTS update_github_repositories_updated_at ON public.github_repositories;
DROP TRIGGER IF EXISTS update_interviews_updated_at ON public.interviews;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON public.leaderboard;
DROP TRIGGER IF EXISTS update_video_interview_sessions_updated_at ON public.video_interview_sessions;
DROP TRIGGER IF EXISTS update_interview_questions_updated_at ON public.interview_questions;
DROP TRIGGER IF EXISTS update_interview_sessions_updated_at ON public.interview_sessions;
DROP TRIGGER IF EXISTS update_question_bank_updated_at ON public.question_bank;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_ai_coaching_sessions_updated_at ON public.ai_coaching_sessions;
DROP TRIGGER IF EXISTS update_question_categories_updated_at ON public.question_categories;
DROP TRIGGER IF EXISTS update_interview_feedback_updated_at ON interview_feedback;

-- =====================================================
-- DROP ALL TABLES (in correct order to handle FK constraints)
-- =====================================================

-- Drop dependent tables first
DROP TABLE IF EXISTS public.voice_interview_analytics CASCADE;
DROP TABLE IF EXISTS public.voice_interview_responses CASCADE;
DROP TABLE IF EXISTS public.voice_interview_questions CASCADE;
DROP TABLE IF EXISTS public.voice_interviews CASCADE;
DROP TABLE IF EXISTS public.interview_summaries CASCADE;
DROP TABLE IF EXISTS public.video_interview_reports CASCADE;
DROP TABLE IF EXISTS public.video_interview_sessions CASCADE;
DROP TABLE IF EXISTS public.ai_coaching_sessions CASCADE;
DROP TABLE IF EXISTS public.ai_feedback CASCADE;
DROP TABLE IF EXISTS public.interview_questions CASCADE;
DROP TABLE IF EXISTS public.interview_responses CASCADE;
DROP TABLE IF EXISTS public.interview_feedback CASCADE;
DROP TABLE IF EXISTS public.voice_analytics CASCADE;
DROP TABLE IF EXISTS public.user_question_attempts CASCADE;
DROP TABLE IF EXISTS public.question_generation_queue CASCADE;
DROP TABLE IF EXISTS public.question_followups CASCADE;
DROP TABLE IF EXISTS public.question_bank CASCADE;
DROP TABLE IF EXISTS public.question_categories CASCADE;
DROP TABLE IF EXISTS public.user_streaks CASCADE;
DROP TABLE IF EXISTS public.leaderboard CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.performance_metrics CASCADE;
DROP TABLE IF EXISTS public.study_plans CASCADE;
DROP TABLE IF EXISTS public.github_repositories CASCADE;
DROP TABLE IF EXISTS public.interview_sessions CASCADE;
DROP TABLE IF EXISTS public.interviews CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- DROP EXTENSIONS (optional - comment out if used by other apps)
-- =====================================================

-- DROP EXTENSION IF EXISTS "btree_gin" CASCADE;
-- DROP EXTENSION IF EXISTS "pg_trgm" CASCADE;
-- DROP EXTENSION IF EXISTS "pgcrypto" CASCADE;
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Run this query to verify all tables are dropped:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- =====================================================
-- NOTES
-- =====================================================
-- After running this script:
-- 1. All data will be permanently deleted
-- 2. All RLS policies will be removed
-- 3. All indexes will be dropped
-- 4. All triggers and functions will be removed
-- 5. Run create_all_tables.sql to recreate the schema
-- =====================================================
