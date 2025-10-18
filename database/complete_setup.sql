-- Complete Database Setup for AI Interview Platform
-- Run this script in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 1. PROFILES TABLE (User Information)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. INTERVIEW SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interview_type TEXT NOT NULL CHECK (interview_type IN ('behavioral', 'technical', 'video', 'text', 'conversational')),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    duration_minutes INTEGER,
    ai_accuracy_score DECIMAL(5,2),
    communication_score DECIMAL(5,2),
    technical_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    feedback JSONB,
    questions JSONB,
    answers JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. LEADERBOARD & GAMIFICATION
-- ============================================

-- User scores table
CREATE TABLE IF NOT EXISTS user_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ai_accuracy_score DECIMAL(5,2) DEFAULT 0.00 CHECK (ai_accuracy_score >= 0 AND ai_accuracy_score <= 100),
    communication_score DECIMAL(5,2) DEFAULT 0.00 CHECK (communication_score >= 0 AND communication_score <= 100),
    completion_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (completion_rate >= 0 AND completion_rate <= 100),
    performance_score DECIMAL(6,2) GENERATED ALWAYS AS (
        (0.6 * ai_accuracy_score) + (0.3 * communication_score) + (0.1 * completion_rate)
    ) STORED,
    total_interviews INT DEFAULT 0,
    successful_interviews INT DEFAULT 0,
    last_activity_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    country_code VARCHAR(2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
    streak_count INT DEFAULT 1 CHECK (streak_count >= 0),
    longest_streak INT DEFAULT 1 CHECK (longest_streak >= 0),
    total_sessions INT DEFAULT 0,
    streak_frozen BOOLEAN DEFAULT FALSE,
    freeze_used_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Leaderboard cache
CREATE TABLE IF NOT EXISTS leaderboard_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    global_rank INT NOT NULL,
    previous_rank INT,
    rank_change INT GENERATED ALWAYS AS (
        CASE 
            WHEN previous_rank IS NULL THEN 0
            ELSE previous_rank - global_rank
        END
    ) STORED,
    performance_score DECIMAL(6,2) NOT NULL,
    adjusted_score DECIMAL(6,2) NOT NULL,
    streak_bonus DECIMAL(3,2) DEFAULT 0.00,
    streak_count INT DEFAULT 0,
    country_code VARCHAR(2),
    country_name VARCHAR(100),
    badge_level VARCHAR(20),
    last_activity_timestamp TIMESTAMP WITH TIME ZONE,
    cache_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cache_date)
);

-- Session logs for streak tracking
CREATE TABLE IF NOT EXISTS session_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_count INT DEFAULT 1,
    total_duration_minutes INT DEFAULT 0,
    ai_accuracy_score DECIMAL(5,2),
    communication_score DECIMAL(5,2),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_date)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    achievement_description TEXT,
    earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    streak_milestone INT,
    rank_milestone INT,
    UNIQUE(user_id, achievement_type)
);

-- ============================================
-- 4. QUESTIONS BANK
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('behavioral', 'technical', 'system_design', 'coding', 'general')),
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_text TEXT NOT NULL,
    sample_answer TEXT,
    keywords TEXT[],
    tags TEXT[],
    company TEXT,
    role TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. FEEDBACK & ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS interview_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    strengths TEXT[],
    weaknesses TEXT[],
    improvements TEXT[],
    overall_feedback TEXT,
    ai_suggestions JSONB,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. VIDEO INTERVIEW SPECIFIC
-- ============================================
CREATE TABLE IF NOT EXISTS video_interviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    video_url TEXT,
    transcript JSONB,
    facial_analysis JSONB,
    voice_analysis JSONB,
    body_language_score DECIMAL(5,2),
    eye_contact_score DECIMAL(5,2),
    speech_clarity_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. PRACTICE HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS practice_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    answer_text TEXT,
    answer_audio_url TEXT,
    answer_video_url TEXT,
    time_taken_seconds INT,
    score DECIMAL(5,2),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. SUBSCRIPTIONS & BILLING
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_scores_performance ON user_scores(performance_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_rank ON leaderboard_cache(global_rank, cache_date);
CREATE INDEX IF NOT EXISTS idx_session_logs_user_date ON session_logs(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_practice_history_user ON practice_history(user_id);

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Interview sessions policies
CREATE POLICY "Users can view own sessions" ON interview_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON interview_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON interview_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- User scores policies
CREATE POLICY "Users can view own scores" ON user_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON user_scores
    FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboard is public
CREATE POLICY "Leaderboard is viewable by everyone" ON leaderboard_cache
    FOR SELECT USING (true);

-- Streaks policies
CREATE POLICY "Users can view own streaks" ON user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Questions are public
CREATE POLICY "Questions are viewable by everyone" ON questions
    FOR SELECT USING (true);

-- Practice history policies
CREATE POLICY "Users can view own practice history" ON practice_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own practice history" ON practice_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 11. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Initialize user scores
    INSERT INTO user_scores (user_id)
    VALUES (NEW.id);
    
    -- Initialize user streaks
    INSERT INTO user_streaks (user_id)
    VALUES (NEW.id);
    
    -- Create free subscription
    INSERT INTO subscriptions (user_id, plan_type, status)
    VALUES (NEW.id, 'free', 'active');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to update streak on session completion
CREATE OR REPLACE FUNCTION update_streak_on_session()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update session log
        INSERT INTO session_logs (
            user_id,
            session_date,
            ai_accuracy_score,
            communication_score,
            completed
        ) VALUES (
            NEW.user_id,
            CURRENT_DATE,
            NEW.ai_accuracy_score,
            NEW.communication_score,
            TRUE
        )
        ON CONFLICT (user_id, session_date) 
        DO UPDATE SET
            session_count = session_logs.session_count + 1,
            ai_accuracy_score = EXCLUDED.ai_accuracy_score,
            communication_score = EXCLUDED.communication_score;
        
        -- Update user scores
        UPDATE user_scores
        SET 
            ai_accuracy_score = COALESCE(NEW.ai_accuracy_score, ai_accuracy_score),
            communication_score = COALESCE(NEW.communication_score, communication_score),
            total_interviews = total_interviews + 1,
            successful_interviews = successful_interviews + 1,
            last_activity_timestamp = NOW(),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for session completion
DROP TRIGGER IF EXISTS on_session_completed ON interview_sessions;
CREATE TRIGGER on_session_completed
    AFTER UPDATE ON interview_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_streak_on_session();

-- Function to calculate daily leaderboard
CREATE OR REPLACE FUNCTION calculate_daily_leaderboard()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    rank_counter INT := 1;
BEGIN
    -- Clear today's cache
    DELETE FROM leaderboard_cache WHERE cache_date = CURRENT_DATE;
    
    -- Calculate rankings
    FOR user_record IN 
        SELECT 
            us.user_id,
            us.performance_score,
            COALESCE(ust.streak_count, 0) as streak_count,
            us.performance_score * (1 + LEAST(COALESCE(ust.streak_count, 0) * 0.05, 0.5)) as adjusted_score,
            LEAST(COALESCE(ust.streak_count, 0) * 0.05, 0.5) as streak_bonus,
            us.last_activity_timestamp,
            p.username,
            p.avatar_url
        FROM user_scores us
        LEFT JOIN user_streaks ust ON us.user_id = ust.user_id
        LEFT JOIN profiles p ON us.user_id = p.id
        WHERE us.total_interviews > 0
        ORDER BY adjusted_score DESC, us.last_activity_timestamp DESC
    LOOP
        INSERT INTO leaderboard_cache (
            user_id,
            username,
            avatar_url,
            global_rank,
            performance_score,
            adjusted_score,
            streak_bonus,
            streak_count,
            badge_level,
            last_activity_timestamp,
            cache_date
        ) VALUES (
            user_record.user_id,
            COALESCE(user_record.username, 'Anonymous'),
            user_record.avatar_url,
            rank_counter,
            user_record.performance_score,
            user_record.adjusted_score,
            user_record.streak_bonus,
            user_record.streak_count,
            CASE 
                WHEN user_record.performance_score >= 90 THEN 'diamond'
                WHEN user_record.performance_score >= 80 THEN 'platinum'
                WHEN user_record.performance_score >= 70 THEN 'gold'
                WHEN user_record.performance_score >= 60 THEN 'silver'
                ELSE 'bronze'
            END,
            user_record.last_activity_timestamp,
            CURRENT_DATE
        );
        
        rank_counter := rank_counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample questions
INSERT INTO questions (category, difficulty, question_text, sample_answer, tags)
VALUES 
    ('behavioral', 'medium', 'Tell me about a time you had to work with a difficult team member.', 
     'I would describe the situation using the STAR method...', 
     ARRAY['teamwork', 'conflict resolution']),
    ('technical', 'hard', 'Explain the difference between TCP and UDP protocols.', 
     'TCP is connection-oriented while UDP is connectionless...', 
     ARRAY['networking', 'protocols']),
    ('behavioral', 'easy', 'Why do you want to work for our company?', 
     'I am attracted to your company because...', 
     ARRAY['motivation', 'company research'])
ON CONFLICT DO NOTHING;

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
END $$;
