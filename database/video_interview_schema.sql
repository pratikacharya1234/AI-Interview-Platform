-- Video Interview Platform Database Schema
-- Complete schema for real-time AI video interviews with STT, LLM, TTS

-- ============================================================================
-- VIDEO INTERVIEW SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES interviewer_personas(id),
  
  -- Session metadata
  job_title VARCHAR(255) NOT NULL,
  interview_type VARCHAR(50) NOT NULL, -- 'technical', 'behavioral', 'system-design'
  difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
  
  -- Timing
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled'
  
  -- WebRTC/Media
  video_enabled BOOLEAN DEFAULT true,
  audio_enabled BOOLEAN DEFAULT true,
  recording_url TEXT,
  
  -- Summary
  total_questions INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  summary_text TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_sessions_user ON video_interview_sessions(user_id);
CREATE INDEX idx_video_sessions_status ON video_interview_sessions(status);
CREATE INDEX idx_video_sessions_created ON video_interview_sessions(created_at DESC);

-- ============================================================================
-- VIDEO INTERVIEW TRANSCRIPTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_interview_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES video_interview_sessions(id) ON DELETE CASCADE,
  
  -- Speaker info
  speaker VARCHAR(10) NOT NULL, -- 'user' or 'ai'
  speaker_name VARCHAR(100),
  
  -- Content
  text TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  
  -- Audio metadata
  audio_url TEXT,
  audio_duration_ms INTEGER,
  
  -- Voice metrics (for user responses)
  speech_pace DECIMAL(5,2), -- words per minute
  pause_count INTEGER,
  filler_word_count INTEGER,
  volume_level DECIMAL(5,2),
  
  -- Timing
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sequence_number INTEGER NOT NULL,
  
  -- Processing
  confidence_score DECIMAL(5,2), -- STT confidence
  processed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transcripts_session ON video_interview_transcripts(session_id, sequence_number);
CREATE INDEX idx_transcripts_speaker ON video_interview_transcripts(session_id, speaker);
CREATE INDEX idx_transcripts_timestamp ON video_interview_transcripts(timestamp);

-- ============================================================================
-- REAL-TIME FEEDBACK & EVALUATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES video_interview_sessions(id) ON DELETE CASCADE,
  transcript_id UUID REFERENCES video_interview_transcripts(id),
  
  -- Evaluation metrics (0-10 scale)
  technical_score DECIMAL(3,1),
  clarity_score DECIMAL(3,1),
  confidence_score DECIMAL(3,1),
  behavioral_score DECIMAL(3,1),
  
  -- Detailed analysis
  technical_feedback TEXT,
  clarity_feedback TEXT,
  confidence_feedback TEXT,
  behavioral_feedback TEXT,
  
  -- STAR method analysis (for behavioral)
  has_situation BOOLEAN,
  has_task BOOLEAN,
  has_action BOOLEAN,
  has_result BOOLEAN,
  
  -- Voice analysis
  speech_quality_score DECIMAL(3,1),
  filler_words_detected TEXT[], -- array of detected filler words
  pause_analysis JSONB,
  
  -- Overall
  overall_score DECIMAL(3,1),
  feedback_summary TEXT,
  improvement_suggestions TEXT[],
  
  -- Metadata
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evaluator_model VARCHAR(50), -- 'gpt-4', 'claude-3', etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feedback_session ON video_interview_feedback(session_id);
CREATE INDEX idx_feedback_transcript ON video_interview_feedback(transcript_id);

-- ============================================================================
-- FINAL SESSION REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_interview_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE REFERENCES video_interview_sessions(id) ON DELETE CASCADE,
  
  -- Aggregate scores
  avg_technical_score DECIMAL(3,1),
  avg_clarity_score DECIMAL(3,1),
  avg_confidence_score DECIMAL(3,1),
  avg_behavioral_score DECIMAL(3,1),
  overall_score DECIMAL(3,1),
  
  -- Performance breakdown
  strengths TEXT[],
  weaknesses TEXT[],
  key_highlights TEXT[],
  
  -- Recommendations
  immediate_improvements TEXT[],
  practice_areas TEXT[],
  resources_recommended JSONB,
  
  -- Detailed metrics
  total_speaking_time_seconds INTEGER,
  avg_response_time_seconds DECIMAL(5,2),
  total_filler_words INTEGER,
  avg_speech_pace DECIMAL(5,2),
  
  -- Question performance
  questions_answered INTEGER,
  questions_skipped INTEGER,
  best_answer_id UUID REFERENCES video_interview_transcripts(id),
  worst_answer_id UUID REFERENCES video_interview_transcripts(id),
  
  -- Full report JSON
  report_json JSONB NOT NULL,
  
  -- Comparison with peers
  percentile_rank INTEGER, -- 0-100
  compared_to_count INTEGER,
  
  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generator_model VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reports_session ON video_interview_reports(session_id);
CREATE INDEX idx_reports_overall_score ON video_interview_reports(overall_score DESC);

-- ============================================================================
-- REAL-TIME METRICS (for live dashboard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_interview_live_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES video_interview_sessions(id) ON DELETE CASCADE,
  
  -- Current state
  current_question_number INTEGER,
  current_response_start TIMESTAMP WITH TIME ZONE,
  
  -- Rolling averages (updated in real-time)
  rolling_technical_avg DECIMAL(3,1),
  rolling_clarity_avg DECIMAL(3,1),
  rolling_confidence_avg DECIMAL(3,1),
  rolling_behavioral_avg DECIMAL(3,1),
  
  -- Session progress
  questions_completed INTEGER DEFAULT 0,
  estimated_time_remaining INTEGER, -- seconds
  
  -- Real-time voice metrics
  current_speech_pace DECIMAL(5,2),
  current_volume DECIMAL(5,2),
  silence_duration_ms INTEGER,
  
  -- Engagement metrics
  eye_contact_score DECIMAL(3,1),
  posture_score DECIMAL(3,1),
  
  -- Last update
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_live_metrics_session ON video_interview_live_metrics(session_id);

-- ============================================================================
-- AI INTERVIEWER QUESTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES video_interview_sessions(id) ON DELETE CASCADE,
  
  -- Question content
  question_text TEXT NOT NULL,
  question_type VARCHAR(50), -- 'technical', 'behavioral', 'follow-up', 'clarification'
  difficulty VARCHAR(20),
  
  -- Context
  previous_answer_id UUID REFERENCES video_interview_transcripts(id),
  is_follow_up BOOLEAN DEFAULT false,
  
  -- AI generation
  generated_by_model VARCHAR(50),
  generation_prompt TEXT,
  
  -- Timing
  asked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE,
  response_time_seconds INTEGER,
  
  -- Evaluation
  answer_quality_score DECIMAL(3,1),
  
  -- Sequence
  sequence_number INTEGER NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questions_session ON video_interview_questions(session_id, sequence_number);

-- ============================================================================
-- WEBSOCKET CONNECTIONS (for tracking active sessions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_interview_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES video_interview_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Connection info
  socket_id VARCHAR(255) NOT NULL UNIQUE,
  client_ip VARCHAR(45),
  user_agent TEXT,
  
  -- Status
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  -- Metrics
  bytes_sent BIGINT DEFAULT 0,
  bytes_received BIGINT DEFAULT 0,
  latency_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_connections_session ON video_interview_connections(session_id);
CREATE INDEX idx_connections_socket ON video_interview_connections(socket_id);
CREATE INDEX idx_connections_active ON video_interview_connections(is_active);

-- ============================================================================
-- AUDIO CHUNKS (for processing and storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_interview_audio_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES video_interview_sessions(id) ON DELETE CASCADE,
  transcript_id UUID REFERENCES video_interview_transcripts(id),
  
  -- Audio data
  audio_blob_url TEXT,
  audio_format VARCHAR(20), -- 'webm', 'wav', 'mp3'
  duration_ms INTEGER,
  size_bytes INTEGER,
  
  -- Processing
  processed BOOLEAN DEFAULT false,
  transcribed BOOLEAN DEFAULT false,
  transcription_text TEXT,
  
  -- Metadata
  chunk_sequence INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audio_chunks_session ON video_interview_audio_chunks(session_id, chunk_sequence);
CREATE INDEX idx_audio_chunks_processed ON video_interview_audio_chunks(processed);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update session duration
CREATE OR REPLACE FUNCTION update_video_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_session_duration
  BEFORE UPDATE ON video_interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_video_session_duration();

-- Function to update live metrics timestamp
CREATE OR REPLACE FUNCTION update_live_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_live_metrics
  BEFORE UPDATE ON video_interview_live_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_live_metrics_timestamp();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- View for session summary
CREATE OR REPLACE VIEW video_interview_session_summary AS
SELECT 
  s.id,
  s.user_id,
  u.email as user_email,
  s.persona_id,
  p.name as persona_name,
  s.job_title,
  s.interview_type,
  s.difficulty,
  s.start_time,
  s.end_time,
  s.duration_seconds,
  s.status,
  s.total_questions,
  s.total_responses,
  r.overall_score,
  r.avg_technical_score,
  r.avg_clarity_score,
  r.avg_confidence_score,
  r.avg_behavioral_score
FROM video_interview_sessions s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN interviewer_personas p ON s.persona_id = p.id
LEFT JOIN video_interview_reports r ON s.id = r.session_id;

-- View for user performance trends
CREATE OR REPLACE VIEW user_video_interview_trends AS
SELECT 
  user_id,
  COUNT(*) as total_interviews,
  AVG(overall_score) as avg_overall_score,
  AVG(avg_technical_score) as avg_technical,
  AVG(avg_clarity_score) as avg_clarity,
  AVG(avg_confidence_score) as avg_confidence,
  AVG(avg_behavioral_score) as avg_behavioral,
  MAX(overall_score) as best_score,
  MIN(overall_score) as worst_score
FROM video_interview_reports r
JOIN video_interview_sessions s ON r.session_id = s.id
GROUP BY user_id;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Note: Actual user data will be created through the application
-- This schema is production-ready and requires no sample data

COMMENT ON TABLE video_interview_sessions IS 'Stores video interview session metadata and status';
COMMENT ON TABLE video_interview_transcripts IS 'Real-time transcripts from STT with voice metrics';
COMMENT ON TABLE video_interview_feedback IS 'Per-response evaluation and feedback from LLM';
COMMENT ON TABLE video_interview_reports IS 'Final comprehensive reports generated at session end';
COMMENT ON TABLE video_interview_live_metrics IS 'Real-time metrics for live dashboard updates';
COMMENT ON TABLE video_interview_questions IS 'AI-generated questions asked during interview';
COMMENT ON TABLE video_interview_connections IS 'WebSocket connection tracking';
COMMENT ON TABLE video_interview_audio_chunks IS 'Audio chunk storage and processing status';
