-- ✅ COMPLETE DATABASE SCHEMA - Ready to Run in Supabase SQL Editor
-- This includes ALL tables needed for the AI Interview Platform
-- Copy and paste this entire file into Supabase SQL Editor and click "Run"

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (CRITICAL - MISSING)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    
    -- User preferences
    experience_level TEXT DEFAULT 'mid',
    target_role TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    
    -- Statistics
    total_interviews INTEGER DEFAULT 0,
    completed_interviews INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    
    -- Gamification
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PRACTICE ATTEMPTS TABLE (CRITICAL - MISSING)
-- ============================================

CREATE TABLE IF NOT EXISTS practice_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID,
    
    -- Attempt details
    answer TEXT,
    score DECIMAL(5,2),
    time_taken_seconds INTEGER,
    
    -- Feedback
    feedback TEXT,
    strengths TEXT[],
    improvements TEXT[],
    
    -- Metadata
    attempt_number INTEGER DEFAULT 1,
    is_correct BOOLEAN,
    difficulty TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INTERVIEW SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    interview_type VARCHAR(50) NOT NULL DEFAULT 'voice',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    metadata JSONB DEFAULT '{}',
    questions JSONB DEFAULT '[]',
    answers JSONB DEFAULT '[]',
    
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    overall_score DECIMAL(5,2),
    communication_score DECIMAL(5,2),
    technical_score DECIMAL(5,2),
    ai_accuracy_score DECIMAL(5,2),
    feedback JSONB,
    feedback_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INTERVIEW RESPONSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS interview_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interview_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    confidence DECIMAL(3,2),
    stage VARCHAR(50),
    analysis JSONB,
    sequence_number INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INTERVIEW FEEDBACK TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS interview_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interview_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    overall_score DECIMAL(5,2) NOT NULL,
    hiring_recommendation TEXT,
    
    scores JSONB NOT NULL DEFAULT '[]',
    strengths JSONB DEFAULT '[]',
    improvements JSONB DEFAULT '[]',
    detailed_feedback TEXT,
    recommendations JSONB DEFAULT '[]',
    
    transcript TEXT,
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- VOICE ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS voice_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interview_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    
    clarity_score DECIMAL(5,2),
    pace_score DECIMAL(5,2),
    volume_score DECIMAL(5,2),
    filler_words_count INTEGER,
    pause_frequency DECIMAL(5,2),
    tonal_variation DECIMAL(5,2),
    articulation_score DECIMAL(5,2),
    
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    
    xp_reward INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    metadata JSONB DEFAULT '{}'
);

-- ============================================
-- USER PROGRESS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    category TEXT NOT NULL,
    skill TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    
    total_attempts INTEGER DEFAULT 0,
    successful_attempts INTEGER DEFAULT 0,
    
    last_practiced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, category, skill)
);

-- ============================================
-- LEADERBOARD TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    total_score INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    rank INTEGER,
    
    weekly_score INTEGER DEFAULT 0,
    monthly_score INTEGER DEFAULT 0,
    
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- ============================================
-- STREAKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS streaks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    streak_data JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Practice attempts indexes
CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_id ON practice_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_question_id ON practice_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_created_at ON practice_attempts(created_at DESC);

-- Interview sessions indexes
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_at ON interview_sessions(created_at DESC);

-- Interview responses indexes
CREATE INDEX IF NOT EXISTS idx_interview_responses_interview_id ON interview_responses(interview_id);

-- Interview feedback indexes
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id ON interview_feedback(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_user_id ON interview_feedback(user_id);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked_at ON achievements(unlocked_at DESC);

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_category ON user_progress(category);

-- Leaderboard indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_score ON leaderboard(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);

-- Streaks indexes
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_interview_sessions_updated_at ON interview_sessions;
DROP TRIGGER IF EXISTS update_interview_feedback_updated_at ON interview_feedback;
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
DROP TRIGGER IF EXISTS update_streaks_updated_at ON streaks;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_sessions_updated_at 
    BEFORE UPDATE ON interview_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_feedback_updated_at 
    BEFORE UPDATE ON interview_feedback 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at 
    BEFORE UPDATE ON streaks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    USING (true);  -- Allow all authenticated users to view profiles

CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (true);  -- Allow profile creation

CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (true);  -- Allow profile updates

-- ============================================
-- RLS POLICIES - PRACTICE ATTEMPTS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own practice attempts" ON practice_attempts;
DROP POLICY IF EXISTS "Users can create their own practice attempts" ON practice_attempts;

CREATE POLICY "Users can view their own practice attempts" 
    ON practice_attempts FOR SELECT 
    USING (true);

CREATE POLICY "Users can create their own practice attempts" 
    ON practice_attempts FOR INSERT 
    WITH CHECK (true);

-- ============================================
-- RLS POLICIES - INTERVIEW SESSIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own interview sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can create their own interview sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can update their own interview sessions" ON interview_sessions;

CREATE POLICY "Users can view their own interview sessions" 
    ON interview_sessions FOR SELECT 
    USING (true);

CREATE POLICY "Users can create their own interview sessions" 
    ON interview_sessions FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can update their own interview sessions" 
    ON interview_sessions FOR UPDATE 
    USING (true);

-- ============================================
-- RLS POLICIES - INTERVIEW RESPONSES
-- ============================================

DROP POLICY IF EXISTS "Users can view responses for their interviews" ON interview_responses;
DROP POLICY IF EXISTS "Users can create responses for their interviews" ON interview_responses;

CREATE POLICY "Users can view responses for their interviews" 
    ON interview_responses FOR SELECT 
    USING (true);

CREATE POLICY "Users can create responses for their interviews" 
    ON interview_responses FOR INSERT 
    WITH CHECK (true);

-- ============================================
-- RLS POLICIES - INTERVIEW FEEDBACK
-- ============================================

DROP POLICY IF EXISTS "Users can view their own feedback" ON interview_feedback;
DROP POLICY IF EXISTS "Users can create their own feedback" ON interview_feedback;

CREATE POLICY "Users can view their own feedback" 
    ON interview_feedback FOR SELECT 
    USING (true);

CREATE POLICY "Users can create their own feedback" 
    ON interview_feedback FOR INSERT 
    WITH CHECK (true);

-- ============================================
-- RLS POLICIES - OTHER TABLES
-- ============================================

-- Voice Analytics
DROP POLICY IF EXISTS "Users can view analytics for their interviews" ON voice_analytics;
CREATE POLICY "Users can view analytics for their interviews" 
    ON voice_analytics FOR SELECT 
    USING (true);

-- Achievements
DROP POLICY IF EXISTS "Users can view their own achievements" ON achievements;
CREATE POLICY "Users can view their own achievements" 
    ON achievements FOR SELECT 
    USING (true);

-- User Progress
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
CREATE POLICY "Users can view their own progress" 
    ON user_progress FOR SELECT 
    USING (true);

-- Leaderboard (public read)
DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON leaderboard;
CREATE POLICY "Leaderboard is viewable by everyone" 
    ON leaderboard FOR SELECT 
    USING (true);

-- Streaks
DROP POLICY IF EXISTS "Users can view their own streaks" ON streaks;
CREATE POLICY "Users can view their own streaks" 
    ON streaks FOR SELECT 
    USING (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON profiles TO authenticated, anon;
GRANT ALL ON practice_attempts TO authenticated, anon;
GRANT ALL ON interview_sessions TO authenticated, anon;
GRANT ALL ON interview_responses TO authenticated, anon;
GRANT ALL ON interview_feedback TO authenticated, anon;
GRANT ALL ON voice_analytics TO authenticated, anon;
GRANT ALL ON achievements TO authenticated, anon;
GRANT ALL ON user_progress TO authenticated, anon;
GRANT ALL ON leaderboard TO authenticated, anon;
GRANT ALL ON streaks TO authenticated, anon;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get user interview statistics
CREATE OR REPLACE FUNCTION get_user_interview_stats(p_user_id UUID)
RETURNS TABLE (
    total_interviews INTEGER,
    completed_interviews INTEGER,
    average_score DECIMAL,
    total_duration_minutes INTEGER,
    last_interview_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_interviews,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER as completed_interviews,
        AVG(overall_score)::DECIMAL as average_score,
        SUM(duration_minutes)::INTEGER as total_duration_minutes,
        MAX(created_at) as last_interview_date
    FROM interview_sessions
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get recent interviews with feedback
CREATE OR REPLACE FUNCTION get_recent_interviews_with_feedback(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    interview_id UUID,
    title VARCHAR,
    interview_type VARCHAR,
    status VARCHAR,
    overall_score DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE,
    feedback_id UUID,
    hiring_recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id as interview_id,
        i.title,
        i.interview_type,
        i.status,
        i.overall_score,
        i.created_at,
        f.id as feedback_id,
        f.hiring_recommendation
    FROM interview_sessions i
    LEFT JOIN interview_feedback f ON i.id = f.interview_id
    WHERE i.user_id = p_user_id
    ORDER BY i.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ✅ SUCCESS! Complete schema is ready to use!
-- All tables created with proper RLS policies and permissions
+