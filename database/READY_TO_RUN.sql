-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    interview_type VARCHAR(50) NOT NULL DEFAULT 'voice',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    metadata JSONB DEFAULT '{}',
    questions JSONB DEFAULT '[]',
    
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    overall_score DECIMAL(5,2),
    feedback_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- ✅ FIXED: References auth.users (Supabase's auth table)
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Interview Responses Table
CREATE TABLE IF NOT EXISTS interview_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interview_id UUID NOT NULL,
    
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    confidence DECIMAL(3,2),
    stage VARCHAR(50),
    analysis JSONB,
    sequence_number INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_interview FOREIGN KEY (interview_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- Interview Feedback Table
CREATE TABLE IF NOT EXISTS interview_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interview_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_interview_feedback FOREIGN KEY (interview_id) REFERENCES interview_sessions(id) ON DELETE CASCADE,
    -- ✅ FIXED: References auth.users
    CONSTRAINT fk_user_feedback FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Voice Analytics Table
CREATE TABLE IF NOT EXISTS voice_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interview_id UUID NOT NULL,
    
    clarity_score DECIMAL(5,2),
    pace_score DECIMAL(5,2),
    volume_score DECIMAL(5,2),
    filler_words_count INTEGER,
    pause_frequency DECIMAL(5,2),
    tonal_variation DECIMAL(5,2),
    articulation_score DECIMAL(5,2),
    
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_interview_analytics FOREIGN KEY (interview_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_at ON interview_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_responses_interview_id ON interview_responses(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id ON interview_feedback(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_user_id ON interview_feedback(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers (drop first if they exist)
DROP TRIGGER IF EXISTS update_interview_sessions_updated_at ON interview_sessions;
DROP TRIGGER IF EXISTS update_interview_feedback_updated_at ON interview_feedback;

CREATE TRIGGER update_interview_sessions_updated_at 
    BEFORE UPDATE ON interview_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_feedback_updated_at 
    BEFORE UPDATE ON interview_feedback 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own interview sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can create their own interview sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can update their own interview sessions" ON interview_sessions;

-- RLS Policies for interview_sessions
CREATE POLICY "Users can view their own interview sessions" 
    ON interview_sessions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview sessions" 
    ON interview_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions" 
    ON interview_sessions FOR UPDATE 
    USING (auth.uid() = user_id);

-- Drop existing policies for interview_responses
DROP POLICY IF EXISTS "Users can view responses for their interviews" ON interview_responses;
DROP POLICY IF EXISTS "Users can create responses for their interviews" ON interview_responses;

-- RLS Policies for interview_responses
CREATE POLICY "Users can view responses for their interviews" 
    ON interview_responses FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM interview_sessions 
            WHERE interview_sessions.id = interview_responses.interview_id 
            AND interview_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create responses for their interviews" 
    ON interview_responses FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM interview_sessions 
            WHERE interview_sessions.id = interview_responses.interview_id 
            AND interview_sessions.user_id = auth.uid()
        )
    );

-- Drop existing policies for interview_feedback
DROP POLICY IF EXISTS "Users can view their own feedback" ON interview_feedback;
DROP POLICY IF EXISTS "Users can create their own feedback" ON interview_feedback;

-- RLS Policies for interview_feedback
CREATE POLICY "Users can view their own feedback" 
    ON interview_feedback FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback" 
    ON interview_feedback FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Drop existing policies for voice_analytics
DROP POLICY IF EXISTS "Users can view analytics for their interviews" ON voice_analytics;

-- RLS Policies for voice_analytics
CREATE POLICY "Users can view analytics for their interviews" 
    ON voice_analytics FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM interview_sessions 
            WHERE interview_sessions.id = voice_analytics.interview_id 
            AND interview_sessions.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON interview_sessions TO authenticated;
GRANT ALL ON interview_responses TO authenticated;
GRANT ALL ON interview_feedback TO authenticated;
GRANT ALL ON voice_analytics TO authenticated;

-- Helper function: Get user interview statistics
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

-- Helper function: Get recent interviews with feedback
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