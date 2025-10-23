-- =====================================================
-- AI INTERVIEW PLATFORM - PRODUCTION MIGRATION
-- =====================================================
-- Version: 1.0 FINAL
-- Date: 2025-10-23
-- Description: Complete migration for ALL 21 tables
-- Safe to run: Preserves existing data, idempotent
-- =====================================================

BEGIN;

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ALTER EXISTING TABLES - ADD MISSING COLUMNS
-- =====================================================

-- Profiles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_interviews') THEN
        ALTER TABLE public.profiles ADD COLUMN total_interviews INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'completed_interviews') THEN
        ALTER TABLE public.profiles ADD COLUMN completed_interviews INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'average_score') THEN
        ALTER TABLE public.profiles ADD COLUMN average_score DECIMAL(5,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_xp') THEN
        ALTER TABLE public.profiles ADD COLUMN total_xp INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'level') THEN
        ALTER TABLE public.profiles ADD COLUMN level INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
        ALTER TABLE public.profiles ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'experience_level') THEN
        ALTER TABLE public.profiles ADD COLUMN experience_level TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skills') THEN
        ALTER TABLE public.profiles ADD COLUMN skills TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Interview sessions table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_sessions' AND column_name = 'current_stage') THEN
        ALTER TABLE public.interview_sessions ADD COLUMN current_stage TEXT DEFAULT 'intro';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_sessions' AND column_name = 'company') THEN
        ALTER TABLE public.interview_sessions ADD COLUMN company TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_sessions' AND column_name = 'position') THEN
        ALTER TABLE public.interview_sessions ADD COLUMN position TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_sessions' AND column_name = 'ai_accuracy_score') THEN
        ALTER TABLE public.interview_sessions ADD COLUMN ai_accuracy_score DECIMAL(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_sessions' AND column_name = 'feedback_id') THEN
        ALTER TABLE public.interview_sessions ADD COLUMN feedback_id UUID;
    END IF;
END $$;

-- Interview feedback table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_feedback' AND column_name = 'technical_feedback') THEN
        ALTER TABLE public.interview_feedback ADD COLUMN technical_feedback TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_feedback' AND column_name = 'behavioral_feedback') THEN
        ALTER TABLE public.interview_feedback ADD COLUMN behavioral_feedback TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_feedback' AND column_name = 'communication_feedback') THEN
        ALTER TABLE public.interview_feedback ADD COLUMN communication_feedback TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_feedback' AND column_name = 'ai_generated') THEN
        ALTER TABLE public.interview_feedback ADD COLUMN ai_generated BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_feedback' AND column_name = 'ai_model') THEN
        ALTER TABLE public.interview_feedback ADD COLUMN ai_model TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_feedback' AND column_name = 'ai_confidence') THEN
        ALTER TABLE public.interview_feedback ADD COLUMN ai_confidence DECIMAL(3,2);
    END IF;
END $$;

-- Question bank table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'tags') THEN
        ALTER TABLE public.question_bank ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'expected_answer') THEN
        ALTER TABLE public.question_bank ADD COLUMN expected_answer TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'evaluation_criteria') THEN
        ALTER TABLE public.question_bank ADD COLUMN evaluation_criteria JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'times_asked') THEN
        ALTER TABLE public.question_bank ADD COLUMN times_asked INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'average_score') THEN
        ALTER TABLE public.question_bank ADD COLUMN average_score DECIMAL(5,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'success_rate') THEN
        ALTER TABLE public.question_bank ADD COLUMN success_rate DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

-- Voice analytics table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'voice_analytics' AND column_name = 'tone_score') THEN
        ALTER TABLE public.voice_analytics ADD COLUMN tone_score DECIMAL(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'voice_analytics' AND column_name = 'filler_words_list') THEN
        ALTER TABLE public.voice_analytics ADD COLUMN filler_words_list TEXT[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'voice_analytics' AND column_name = 'average_pause_duration') THEN
        ALTER TABLE public.voice_analytics ADD COLUMN average_pause_duration DECIMAL(10,2);
    END IF;
END $$;

-- =====================================================
-- CREATE ALL MISSING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    phone_number TEXT,
    date_of_birth DATE,
    education JSONB DEFAULT '[]',
    work_experience JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    resume_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    interview_reminders BOOLEAN DEFAULT true,
    practice_reminders BOOLEAN DEFAULT true,
    achievement_notifications BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'system',
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    audio_quality TEXT DEFAULT 'high',
    video_quality TEXT DEFAULT 'high',
    auto_save BOOLEAN DEFAULT true,
    profile_visibility TEXT DEFAULT 'public',
    show_on_leaderboard BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.question_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES public.question_categories(id) ON DELETE SET NULL,
    icon TEXT,
    color TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.question_followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    followup_question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    trigger_condition TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(parent_question_id, followup_question_id)
);

CREATE TABLE IF NOT EXISTS public.question_generation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_description TEXT,
    company_name TEXT,
    position TEXT,
    experience_level TEXT,
    required_skills TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    generated_questions JSONB DEFAULT '[]',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    question_bank_id UUID REFERENCES public.question_bank(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    sequence_number INTEGER NOT NULL,
    stage TEXT,
    asked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    time_limit_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(interview_id, sequence_number)
);

CREATE TABLE IF NOT EXISTS public.interview_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.interview_questions(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    response_time_seconds INTEGER,
    word_count INTEGER,
    sentiment_score DECIMAL(3,2),
    confidence_score DECIMAL(3,2),
    analysis JSONB DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    sequence_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.interview_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    key_points JSONB DEFAULT '[]',
    highlights JSONB DEFAULT '[]',
    lowlights JSONB DEFAULT '[]',
    total_questions INTEGER,
    total_responses INTEGER,
    average_response_time DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(interview_id)
);

CREATE TABLE IF NOT EXISTS public.video_interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    video_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    resolution TEXT,
    file_size_bytes BIGINT,
    encoding TEXT,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(interview_id)
);

CREATE TABLE IF NOT EXISTS public.video_interview_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_session_id UUID NOT NULL REFERENCES public.video_interview_sessions(id) ON DELETE CASCADE,
    facial_expressions JSONB DEFAULT '[]',
    eye_contact_score DECIMAL(5,2),
    posture_score DECIMAL(5,2),
    sentiment_timeline JSONB DEFAULT '[]',
    overall_sentiment TEXT,
    engagement_score DECIMAL(5,2),
    attentiveness_score DECIMAL(5,2),
    filler_words_detected INTEGER DEFAULT 0,
    pace_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(video_session_id)
);

CREATE TABLE IF NOT EXISTS public.ai_coaching_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interview_id UUID REFERENCES public.interview_sessions(id) ON DELETE SET NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('pre_interview', 'post_interview', 'practice', 'skill_development')),
    topic TEXT NOT NULL,
    messages JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.ai_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interview_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    coaching_session_id UUID REFERENCES public.ai_coaching_sessions(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('strength', 'improvement', 'tip', 'warning', 'encouragement')),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority INTEGER DEFAULT 0 CHECK (priority BETWEEN 0 AND 10),
    is_actionable BOOLEAN DEFAULT false,
    action_taken BOOLEAN DEFAULT false,
    action_taken_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    icon TEXT,
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    xp_reward INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    streak_type TEXT NOT NULL CHECK (streak_type IN ('daily_practice', 'interview_completion', 'question_solved')),
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_data JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, streak_type)
);

CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('global', 'weekly', 'monthly', 'category_specific')),
    category TEXT,
    total_score INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    rank INTEGER,
    previous_rank INTEGER,
    total_interviews INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, leaderboard_type, category, period_start)
);

CREATE TABLE IF NOT EXISTS public.user_question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    answer_text TEXT,
    time_taken_seconds INTEGER,
    score DECIMAL(5,2),
    is_correct BOOLEAN,
    feedback TEXT,
    strengths TEXT[] DEFAULT '{}',
    improvements TEXT[] DEFAULT '{}',
    attempt_number INTEGER DEFAULT 1,
    context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- CREATE ALL INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_question_categories_slug ON public.question_categories(slug);
CREATE INDEX IF NOT EXISTS idx_question_categories_parent ON public.question_categories(parent_category_id);

CREATE INDEX IF NOT EXISTS idx_question_bank_category ON public.question_bank(category_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_type ON public.question_bank(question_type);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON public.question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_tags ON public.question_bank USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_question_generation_queue_user_id ON public.question_generation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_question_generation_queue_status ON public.question_generation_queue(status);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON public.interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_type ON public.interview_sessions(interview_type);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_at ON public.interview_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_interview_questions_interview_id ON public.interview_questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_sequence ON public.interview_questions(interview_id, sequence_number);

CREATE INDEX IF NOT EXISTS idx_interview_responses_interview_id ON public.interview_responses(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_responses_question_id ON public.interview_responses(question_id);

CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id ON public.interview_feedback(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_user_id ON public.interview_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_interview_summaries_interview_id ON public.interview_summaries(interview_id);

CREATE INDEX IF NOT EXISTS idx_voice_analytics_interview_id ON public.voice_analytics(interview_id);

CREATE INDEX IF NOT EXISTS idx_video_interview_sessions_interview_id ON public.video_interview_sessions(interview_id);
CREATE INDEX IF NOT EXISTS idx_video_interview_reports_video_session_id ON public.video_interview_reports(video_session_id);

CREATE INDEX IF NOT EXISTS idx_ai_coaching_sessions_user_id ON public.ai_coaching_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coaching_sessions_interview_id ON public.ai_coaching_sessions(interview_id);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_user_id ON public.ai_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_interview_id ON public.ai_feedback(interview_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON public.user_achievements(unlocked_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_type ON public.user_streaks(streak_type);

CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(leaderboard_type, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard(leaderboard_type, total_score DESC);

CREATE INDEX IF NOT EXISTS idx_user_question_attempts_user_id ON public.user_question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_attempts_question_id ON public.user_question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_user_question_attempts_created_at ON public.user_question_attempts(created_at DESC);

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_question_categories_updated_at ON public.question_categories;
CREATE TRIGGER update_question_categories_updated_at BEFORE UPDATE ON public.question_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_question_bank_updated_at ON public.question_bank;
CREATE TRIGGER update_question_bank_updated_at BEFORE UPDATE ON public.question_bank FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_sessions_updated_at ON public.interview_sessions;
CREATE TRIGGER update_interview_sessions_updated_at BEFORE UPDATE ON public.interview_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_questions_updated_at ON public.interview_questions;
CREATE TRIGGER update_interview_questions_updated_at BEFORE UPDATE ON public.interview_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_feedback_updated_at ON public.interview_feedback;
CREATE TRIGGER update_interview_feedback_updated_at BEFORE UPDATE ON public.interview_feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_interview_summaries_updated_at ON public.interview_summaries;
CREATE TRIGGER update_interview_summaries_updated_at BEFORE UPDATE ON public.interview_summaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_interview_sessions_updated_at ON public.video_interview_sessions;
CREATE TRIGGER update_video_interview_sessions_updated_at BEFORE UPDATE ON public.video_interview_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_coaching_sessions_updated_at ON public.ai_coaching_sessions;
CREATE TRIGGER update_ai_coaching_sessions_updated_at BEFORE UPDATE ON public.ai_coaching_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON public.leaderboard;
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON public.leaderboard FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_interview_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_attempts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User profiles
DROP POLICY IF EXISTS "Users can view their own user profile" ON public.user_profiles;
CREATE POLICY "Users can view their own user profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own user profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own user profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own user profile" ON public.user_profiles;
CREATE POLICY "Users can update their own user profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- User preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Question categories (public)
DROP POLICY IF EXISTS "Question categories are viewable by everyone" ON public.question_categories;
CREATE POLICY "Question categories are viewable by everyone" ON public.question_categories FOR SELECT USING (true);

-- Question bank (public active only)
DROP POLICY IF EXISTS "Active questions are viewable by everyone" ON public.question_bank;
CREATE POLICY "Active questions are viewable by everyone" ON public.question_bank FOR SELECT USING (is_active = true);

-- Question followups (public)
DROP POLICY IF EXISTS "Question followups are viewable by everyone" ON public.question_followups;
CREATE POLICY "Question followups are viewable by everyone" ON public.question_followups FOR SELECT USING (true);

-- Question generation queue
DROP POLICY IF EXISTS "Users can view their own generation queue" ON public.question_generation_queue;
CREATE POLICY "Users can view their own generation queue" ON public.question_generation_queue FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own generation queue" ON public.question_generation_queue;
CREATE POLICY "Users can insert their own generation queue" ON public.question_generation_queue FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Interview sessions
DROP POLICY IF EXISTS "Users can view their own interview sessions" ON public.interview_sessions;
CREATE POLICY "Users can view their own interview sessions" ON public.interview_sessions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own interview sessions" ON public.interview_sessions;
CREATE POLICY "Users can insert their own interview sessions" ON public.interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own interview sessions" ON public.interview_sessions;
CREATE POLICY "Users can update their own interview sessions" ON public.interview_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Interview questions
DROP POLICY IF EXISTS "Users can view questions for their interviews" ON public.interview_questions;
CREATE POLICY "Users can view questions for their interviews" ON public.interview_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE interview_sessions.id = interview_questions.interview_id AND interview_sessions.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can insert questions for their interviews" ON public.interview_questions;
CREATE POLICY "Users can insert questions for their interviews" ON public.interview_questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.interview_sessions WHERE interview_sessions.id = interview_questions.interview_id AND interview_sessions.user_id = auth.uid()));

-- Interview responses
DROP POLICY IF EXISTS "Users can view responses for their interviews" ON public.interview_responses;
CREATE POLICY "Users can view responses for their interviews" ON public.interview_responses FOR SELECT
USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE interview_sessions.id = interview_responses.interview_id AND interview_sessions.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can insert responses for their interviews" ON public.interview_responses;
CREATE POLICY "Users can insert responses for their interviews" ON public.interview_responses FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.interview_sessions WHERE interview_sessions.id = interview_responses.interview_id AND interview_sessions.user_id = auth.uid()));

-- Interview feedback
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.interview_feedback;
CREATE POLICY "Users can view their own feedback" ON public.interview_feedback FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.interview_feedback;
CREATE POLICY "Users can insert their own feedback" ON public.interview_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Interview summaries
DROP POLICY IF EXISTS "Users can view summaries for their interviews" ON public.interview_summaries;
CREATE POLICY "Users can view summaries for their interviews" ON public.interview_summaries FOR SELECT
USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE interview_sessions.id = interview_summaries.interview_id AND interview_sessions.user_id = auth.uid()));

-- Voice analytics
DROP POLICY IF EXISTS "Users can view analytics for their interviews" ON public.voice_analytics;
CREATE POLICY "Users can view analytics for their interviews" ON public.voice_analytics FOR SELECT
USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE interview_sessions.id = voice_analytics.interview_id AND interview_sessions.user_id = auth.uid()));

-- Video sessions
DROP POLICY IF EXISTS "Users can view video sessions for their interviews" ON public.video_interview_sessions;
CREATE POLICY "Users can view video sessions for their interviews" ON public.video_interview_sessions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.interview_sessions WHERE interview_sessions.id = video_interview_sessions.interview_id AND interview_sessions.user_id = auth.uid()));

-- Video reports
DROP POLICY IF EXISTS "Users can view reports for their video sessions" ON public.video_interview_reports;
CREATE POLICY "Users can view reports for their video sessions" ON public.video_interview_reports FOR SELECT
USING (EXISTS (SELECT 1 FROM public.video_interview_sessions vis JOIN public.interview_sessions i ON vis.interview_id = i.id WHERE vis.id = video_interview_reports.video_session_id AND i.user_id = auth.uid()));

-- AI coaching
DROP POLICY IF EXISTS "Users can view their own coaching sessions" ON public.ai_coaching_sessions;
CREATE POLICY "Users can view their own coaching sessions" ON public.ai_coaching_sessions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own coaching sessions" ON public.ai_coaching_sessions;
CREATE POLICY "Users can insert their own coaching sessions" ON public.ai_coaching_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own coaching sessions" ON public.ai_coaching_sessions;
CREATE POLICY "Users can update their own coaching sessions" ON public.ai_coaching_sessions FOR UPDATE USING (auth.uid() = user_id);

-- AI feedback
DROP POLICY IF EXISTS "Users can view their own AI feedback" ON public.ai_feedback;
CREATE POLICY "Users can view their own AI feedback" ON public.ai_feedback FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own AI feedback" ON public.ai_feedback;
CREATE POLICY "Users can insert their own AI feedback" ON public.ai_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User achievements
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

-- User streaks
DROP POLICY IF EXISTS "Users can view their own streaks" ON public.user_streaks;
CREATE POLICY "Users can view their own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own streaks" ON public.user_streaks;
CREATE POLICY "Users can insert their own streaks" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own streaks" ON public.user_streaks;
CREATE POLICY "Users can update their own streaks" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboard (public)
DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON public.leaderboard;
CREATE POLICY "Leaderboard is viewable by everyone" ON public.leaderboard FOR SELECT USING (true);

-- User question attempts
DROP POLICY IF EXISTS "Users can view their own question attempts" ON public.user_question_attempts;
CREATE POLICY "Users can view their own question attempts" ON public.user_question_attempts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own question attempts" ON public.user_question_attempts;
CREATE POLICY "Users can insert their own question attempts" ON public.user_question_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- UPDATE STATISTICS
-- =====================================================

UPDATE public.profiles p
SET
    total_interviews = (SELECT COUNT(*) FROM public.interview_sessions WHERE user_id = p.id),
    completed_interviews = (SELECT COUNT(*) FROM public.interview_sessions WHERE user_id = p.id AND status = 'completed'),
    average_score = (SELECT COALESCE(AVG(overall_score), 0) FROM public.interview_sessions WHERE user_id = p.id AND overall_score IS NOT NULL);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_interview_stats(p_user_id UUID)
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
        COUNT(*)::INTEGER,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER,
        AVG(overall_score)::DECIMAL,
        SUM(duration_minutes)::INTEGER,
        MAX(created_at)
    FROM public.interview_sessions
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_recent_interviews_with_feedback(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    interview_id UUID,
    title TEXT,
    interview_type TEXT,
    status TEXT,
    overall_score DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE,
    feedback_id UUID,
    hiring_recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.title,
        i.interview_type,
        i.status,
        i.overall_score,
        i.created_at,
        f.id,
        f.hiring_recommendation
    FROM public.interview_sessions i
    LEFT JOIN public.interview_feedback f ON i.id = f.interview_id
    WHERE i.user_id = p_user_id
    ORDER BY i.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries after migration:
-- SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT * FROM public.get_user_interview_stats(auth.uid());
