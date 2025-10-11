-- Voice Interview Database Schema
-- This migration adds support for voice interview data including audio storage

-- Create voice_interviews table
CREATE TABLE IF NOT EXISTS voice_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  candidate_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_types TEXT[] NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 5,
  questions_completed INTEGER NOT NULL DEFAULT 0,
  overall_score DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voice_interview_questions table
CREATE TABLE IF NOT EXISTS voice_interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES voice_interviews(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  follow_up_points TEXT[],
  expected_duration INTEGER DEFAULT 300, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voice_interview_responses table
CREATE TABLE IF NOT EXISTS voice_interview_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES voice_interviews(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES voice_interview_questions(id) ON DELETE CASCADE,
  transcript TEXT NOT NULL,
  audio_url TEXT, -- URL to stored audio file
  audio_duration INTEGER, -- duration in seconds
  response_time INTEGER, -- time taken to respond in seconds
  word_count INTEGER,
  confidence_score DECIMAL(3,2) DEFAULT 0, -- speech recognition confidence
  ai_score DECIMAL(5,2) DEFAULT 0,
  ai_feedback TEXT,
  strengths TEXT[],
  improvements TEXT[],
  keywords_mentioned TEXT[],
  sentiment_score DECIMAL(3,2), -- -1 to 1
  fluency_score DECIMAL(3,2), -- 0 to 1
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzed_at TIMESTAMP WITH TIME ZONE
);

-- Create voice_interview_analytics table for detailed metrics
CREATE TABLE IF NOT EXISTS voice_interview_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES voice_interviews(id) ON DELETE CASCADE,
  response_id UUID REFERENCES voice_interview_responses(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- 'speech_rate', 'pause_frequency', 'volume_consistency', etc.
  metric_value DECIMAL(10,4) NOT NULL,
  metric_unit VARCHAR(20), -- 'wpm', 'seconds', 'db', 'percentage', etc.
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voice_interviews_user_id ON voice_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_interviews_session_id ON voice_interviews(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_interviews_status ON voice_interviews(status);
CREATE INDEX IF NOT EXISTS idx_voice_interviews_created_at ON voice_interviews(created_at);

CREATE INDEX IF NOT EXISTS idx_voice_interview_questions_interview_id ON voice_interview_questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_voice_interview_questions_order ON voice_interview_questions(interview_id, question_order);

CREATE INDEX IF NOT EXISTS idx_voice_interview_responses_interview_id ON voice_interview_responses(interview_id);
CREATE INDEX IF NOT EXISTS idx_voice_interview_responses_question_id ON voice_interview_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_voice_interview_responses_submitted_at ON voice_interview_responses(submitted_at);

CREATE INDEX IF NOT EXISTS idx_voice_interview_analytics_interview_id ON voice_interview_analytics(interview_id);
CREATE INDEX IF NOT EXISTS idx_voice_interview_analytics_response_id ON voice_interview_analytics(response_id);
CREATE INDEX IF NOT EXISTS idx_voice_interview_analytics_metric_type ON voice_interview_analytics(metric_type);

-- Enable Row Level Security (RLS)
ALTER TABLE voice_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_interview_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can only access their own interviews
CREATE POLICY "Users can view own voice interviews" ON voice_interviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own voice interviews" ON voice_interviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own voice interviews" ON voice_interviews FOR UPDATE USING (auth.uid() = user_id);

-- Questions are accessible to interview owner
CREATE POLICY "Users can view own voice interview questions" ON voice_interview_questions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM voice_interviews WHERE id = interview_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own voice interview questions" ON voice_interview_questions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM voice_interviews WHERE id = interview_id AND user_id = auth.uid()));

-- Responses are accessible to interview owner
CREATE POLICY "Users can view own voice interview responses" ON voice_interview_responses FOR SELECT 
  USING (EXISTS (SELECT 1 FROM voice_interviews WHERE id = interview_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own voice interview responses" ON voice_interview_responses FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM voice_interviews WHERE id = interview_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own voice interview responses" ON voice_interview_responses FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM voice_interviews WHERE id = interview_id AND user_id = auth.uid()));

-- Analytics are accessible to interview owner
CREATE POLICY "Users can view own voice interview analytics" ON voice_interview_analytics FOR SELECT 
  USING (EXISTS (SELECT 1 FROM voice_interviews WHERE id = interview_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own voice interview analytics" ON voice_interview_analytics FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM voice_interviews WHERE id = interview_id AND user_id = auth.uid()));

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_voice_interview_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS voice_interview_updated_at ON voice_interviews;
CREATE TRIGGER voice_interview_updated_at 
  BEFORE UPDATE ON voice_interviews 
  FOR EACH ROW EXECUTE FUNCTION update_voice_interview_timestamp();

-- Create storage bucket for audio files (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('interview-audio', 'interview-audio', false) 
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy for storage bucket
CREATE POLICY "Users can upload their own audio files" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'interview-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own audio files" ON storage.objects FOR SELECT 
  USING (bucket_id = 'interview-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own audio files" ON storage.objects FOR UPDATE 
  USING (bucket_id = 'interview-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio files" ON storage.objects FOR DELETE 
  USING (bucket_id = 'interview-audio' AND auth.uid()::text = (storage.foldername(name))[1]);