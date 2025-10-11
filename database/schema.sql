-- Interview Database Schema
-- This schema defines the structure for storing video interview data

-- Users table (if not using NextAuth tables)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview sessions table
CREATE TABLE interview_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER NOT NULL DEFAULT 0, -- Duration in seconds
  video_enabled BOOLEAN DEFAULT true,
  recording_url TEXT,
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview messages table (for storing conversation)
CREATE TABLE interview_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id VARCHAR(255) REFERENCES interview_sessions(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'interviewer' or 'candidate'
  text TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  duration INTEGER, -- Message duration in seconds
  audio_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview metrics table
CREATE TABLE interview_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id VARCHAR(255) UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
  total_questions INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  average_response_length INTEGER DEFAULT 0,
  average_response_time INTEGER DEFAULT 0, -- In seconds
  confidence_score INTEGER DEFAULT 0, -- 0-100 scale
  completion_rate INTEGER DEFAULT 0, -- Percentage
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview feedback table
CREATE TABLE interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id VARCHAR(255) UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
  overall_feedback TEXT,
  strengths JSONB, -- Array of strengths
  improvements JSONB, -- Array of improvement areas
  recommendations JSONB, -- Array of recommendations
  scores JSONB, -- JSON object with different score categories
  ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_interview_sessions_user_email ON interview_sessions(user_email);
CREATE INDEX idx_interview_sessions_created_at ON interview_sessions(created_at DESC);
CREATE INDEX idx_interview_messages_interview_id ON interview_messages(interview_id);
CREATE INDEX idx_interview_messages_timestamp ON interview_messages(timestamp);

-- Sample data insertion queries
-- INSERT INTO users (email, name) VALUES ('test@example.com', 'Test User');
-- 
-- INSERT INTO interview_sessions (id, user_email, start_time, duration, video_enabled) 
-- VALUES ('interview-123', 'test@example.com', NOW(), 1800, true);
-- 
-- INSERT INTO interview_messages (interview_id, type, text, timestamp) 
-- VALUES ('interview-123', 'interviewer', 'Hello! Please introduce yourself.', NOW());
-- 
-- INSERT INTO interview_messages (interview_id, type, text, timestamp) 
-- VALUES ('interview-123', 'candidate', 'Hi, I am John Doe, a software engineer...', NOW());

-- Views for common queries
CREATE VIEW interview_summary AS
SELECT 
  s.id,
  s.user_email,
  s.start_time,
  s.end_time,
  s.duration,
  s.video_enabled,
  s.status,
  m.total_questions,
  m.total_responses,
  m.confidence_score,
  m.completion_rate,
  f.scores
FROM interview_sessions s
LEFT JOIN interview_metrics m ON s.id = m.interview_id
LEFT JOIN interview_feedback f ON s.id = f.interview_id;

-- Get recent interviews for a user
CREATE OR REPLACE FUNCTION get_user_interviews(user_email_param TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  interview_id VARCHAR,
  start_time TIMESTAMP,
  duration INTEGER,
  confidence_score INTEGER,
  completion_rate INTEGER,
  total_questions INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.start_time,
    s.duration,
    COALESCE(m.confidence_score, 0),
    COALESCE(m.completion_rate, 0),
    COALESCE(m.total_questions, 0)
  FROM interview_sessions s
  LEFT JOIN interview_metrics m ON s.id = m.interview_id
  WHERE s.user_email = user_email_param
    AND s.status = 'completed'
  ORDER BY s.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;