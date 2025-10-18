-- Fix for Foreign Key Constraint Error
-- Error: Key columns "session_id" and "id" are of incompatible types: uuid and character varying

-- First, drop the problematic tables if they exist with wrong types
DROP TABLE IF EXISTS video_interviews CASCADE;
DROP TABLE IF EXISTS interview_feedback CASCADE;
DROP TABLE IF EXISTS practice_history CASCADE;
DROP TABLE IF EXISTS interview_sessions CASCADE;

-- Recreate interview_sessions with correct UUID type
CREATE TABLE interview_sessions (
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

-- Recreate interview_feedback with correct foreign key
CREATE TABLE interview_feedback (
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

-- Recreate video_interviews with correct foreign key
CREATE TABLE video_interviews (
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

-- Recreate practice_history with correct foreign key
CREATE TABLE practice_history (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_practice_history_user ON practice_history(user_id);

-- Enable RLS
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own sessions" ON interview_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON interview_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON interview_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback" ON interview_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own video interviews" ON video_interviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own practice history" ON practice_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own practice history" ON practice_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON interview_sessions TO authenticated;
GRANT ALL ON interview_feedback TO authenticated;
GRANT ALL ON video_interviews TO authenticated;
GRANT ALL ON practice_history TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Foreign key constraint issue fixed successfully!';
    RAISE NOTICE 'All tables recreated with correct UUID types.';
END $$;
