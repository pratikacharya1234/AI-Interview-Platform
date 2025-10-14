-- Interview Sessions Table Schema
-- Stores complete interview data with messages, metrics, and feedback

CREATE TABLE IF NOT EXISTS interview_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration INTEGER NOT NULL DEFAULT 0, -- Duration in seconds
  messages JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of interview messages
  video_enabled BOOLEAN DEFAULT false,
  recording_url TEXT,
  position VARCHAR(255) DEFAULT 'Software Developer',
  company VARCHAR(255) DEFAULT 'Tech Company',
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('active', 'completed', 'cancelled')),
  metrics JSONB DEFAULT '{}'::jsonb, -- Interview performance metrics
  feedback JSONB DEFAULT '{}'::jsonb, -- AI-generated feedback
  feedback_image_url TEXT, -- Generated feedback image (SVG data URL)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_email ON interview_sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_at ON interview_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_interview_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_interview_sessions_updated_at
BEFORE UPDATE ON interview_sessions
FOR EACH ROW
EXECUTE FUNCTION update_interview_sessions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE interview_sessions IS 'Stores complete interview session data including messages, metrics, and AI-generated feedback';
COMMENT ON COLUMN interview_sessions.messages IS 'JSONB array of interview messages with role, content, and timestamp';
COMMENT ON COLUMN interview_sessions.metrics IS 'JSONB object containing interview performance metrics (response time, word count, confidence score, etc.)';
COMMENT ON COLUMN interview_sessions.feedback IS 'JSONB object containing AI-generated feedback (strengths, improvements, recommendations, scores)';
