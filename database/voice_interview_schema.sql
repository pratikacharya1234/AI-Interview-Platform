-- Voice Interview Database Schema for Supabase
-- Three main tables: users, interviews, responses

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (profile information)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Interviews table (session-level metadata)
CREATE TABLE IF NOT EXISTS interviews (
    id VARCHAR(255) PRIMARY KEY, -- Using custom ID format: voice_timestamp_random
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    experience VARCHAR(50) NOT NULL, -- entry, mid, senior, lead
    status VARCHAR(50) DEFAULT 'active', -- active, completed, abandoned
    stage VARCHAR(50) DEFAULT 'introduction', -- introduction, technical, scenario, closing, feedback
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    feedback_summary JSONB, -- Stores comprehensive feedback
    metadata JSONB DEFAULT '{}'::jsonb, -- Stores system_prompt, user_name, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_started_at ON interviews(started_at DESC);

-- Responses table (each Q&A pair with analysis)
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id VARCHAR(255) REFERENCES interviews(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    analysis JSONB NOT NULL, -- Stores AI analysis of the response
    timestamp TIMESTAMP DEFAULT NOW(),
    stage VARCHAR(50) NOT NULL, -- introduction, technical, scenario, closing
    audio_url TEXT, -- Optional: URL to stored audio file
    confidence_score DECIMAL(3,2), -- Optional: STT confidence score
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for responses
CREATE INDEX idx_responses_interview_id ON responses(interview_id);
CREATE INDEX idx_responses_timestamp ON responses(timestamp);
CREATE INDEX idx_responses_stage ON responses(stage);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample feedback_summary structure (stored in JSONB)
-- {
--   "overall_score": 7.5,
--   "communication_clarity": 8,
--   "confidence": 7,
--   "technical_understanding": 7,
--   "problem_solving": 8,
--   "strengths": ["Clear communication", "Good technical knowledge"],
--   "improvements": ["Provide more specific examples"],
--   "summary": "The candidate demonstrated...",
--   "recommendation": "yes",
--   "interview_duration": 25,
--   "total_questions": 8
-- }

-- Sample analysis structure for responses (stored in JSONB)
-- {
--   "summary": "The candidate provided a comprehensive answer...",
--   "strengths": ["Technical accuracy", "Clear explanation"],
--   "areas_to_probe": ["Specific implementation details"],
--   "score": 7.5,
--   "relevance": "high",
--   "confidence_level": "medium"
-- }

-- View for interview summaries with user info
CREATE OR REPLACE VIEW interview_summaries AS
SELECT 
    i.id,
    i.user_id,
    u.name as user_name,
    u.email as user_email,
    i.company,
    i.position,
    i.experience,
    i.status,
    i.stage,
    i.started_at,
    i.ended_at,
    i.feedback_summary,
    i.metadata,
    EXTRACT(EPOCH FROM (COALESCE(i.ended_at, NOW()) - i.started_at))/60 as duration_minutes,
    COUNT(r.id) as total_responses
FROM interviews i
JOIN users u ON i.user_id = u.id
LEFT JOIN responses r ON i.id = r.interview_id
GROUP BY i.id, u.id, u.name, u.email;

-- View for recent interviews
CREATE OR REPLACE VIEW recent_interviews AS
SELECT 
    i.*,
    u.name as user_name,
    u.email as user_email,
    COUNT(r.id) as response_count,
    MAX(r.timestamp) as last_response_at
FROM interviews i
JOIN users u ON i.user_id = u.id
LEFT JOIN responses r ON i.id = r.interview_id
WHERE i.started_at > NOW() - INTERVAL '30 days'
GROUP BY i.id, u.id, u.name, u.email
ORDER BY i.started_at DESC;

-- Function to calculate interview statistics
CREATE OR REPLACE FUNCTION get_interview_stats(p_interview_id VARCHAR)
RETURNS TABLE (
    total_questions INTEGER,
    avg_response_length INTEGER,
    total_duration_minutes INTEGER,
    stages_completed INTEGER,
    overall_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(r.id)::INTEGER as total_questions,
        AVG(LENGTH(r.answer))::INTEGER as avg_response_length,
        EXTRACT(EPOCH FROM (MAX(i.ended_at) - MIN(i.started_at)))/60::INTEGER as total_duration_minutes,
        COUNT(DISTINCT r.stage)::INTEGER as stages_completed,
        (i.feedback_summary->>'overall_score')::DECIMAL as overall_score
    FROM interviews i
    LEFT JOIN responses r ON i.id = r.interview_id
    WHERE i.id = p_interview_id
    GROUP BY i.id, i.feedback_summary;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can only see their own interviews
CREATE POLICY interviews_select_own ON interviews
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY interviews_insert_own ON interviews
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY interviews_update_own ON interviews
    FOR UPDATE USING (user_id = auth.uid());

-- Policy: Users can only see responses from their interviews
CREATE POLICY responses_select_own ON responses
    FOR SELECT USING (
        interview_id IN (
            SELECT id FROM interviews WHERE user_id = auth.uid()
        )
    );

CREATE POLICY responses_insert_own ON responses
    FOR INSERT WITH CHECK (
        interview_id IN (
            SELECT id FROM interviews WHERE user_id = auth.uid()
        )
    );

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
