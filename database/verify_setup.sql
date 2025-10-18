-- Verification Script for Database Setup
-- Run this after complete_setup.sql to verify everything was created correctly

-- 1. Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verify key tables and their row counts
SELECT 
    'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 
    'interview_sessions', COUNT(*) FROM interview_sessions
UNION ALL
SELECT 
    'user_scores', COUNT(*) FROM user_scores
UNION ALL
SELECT 
    'user_streaks', COUNT(*) FROM user_streaks
UNION ALL
SELECT 
    'leaderboard_cache', COUNT(*) FROM leaderboard_cache
UNION ALL
SELECT 
    'questions', COUNT(*) FROM questions
UNION ALL
SELECT 
    'achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 
    'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 
    'video_interviews', COUNT(*) FROM video_interviews
UNION ALL
SELECT 
    'practice_history', COUNT(*) FROM practice_history;

-- 3. Check if sample questions were inserted
SELECT * FROM questions LIMIT 5;

-- 4. Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. Check foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 6. Verify triggers were created
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- If everything looks good, you should see:
-- ✅ 12+ tables created
-- ✅ 3 sample questions inserted
-- ✅ RLS enabled on all tables (rowsecurity = true)
-- ✅ Foreign keys properly set up
-- ✅ Triggers for user creation and session completion
