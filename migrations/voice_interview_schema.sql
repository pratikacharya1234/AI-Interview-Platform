/**
 * Voice Interview Schema Migration
 *
 * Run this in Supabase SQL Editor to add voice interview support
 */

-- ============================================================================
-- 1. Update interview_sessions table for voice interviews
-- ============================================================================

ALTER TABLE interview_sessions
ADD COLUMN IF NOT EXISTS interview_type VARCHAR(20) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS voice_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_response_time INTEGER, -- seconds
ADD COLUMN IF NOT EXISTS feedback_summary TEXT;

-- Add index for interview type
CREATE INDEX IF NOT EXISTS idx_interview_sessions_type
ON interview_sessions(interview_type);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_voice
ON interview_sessions(voice_enabled);

-- Update existing sessions to mark as 'text' type
UPDATE interview_sessions
SET interview_type = 'text', voice_enabled = false
WHERE interview_type IS NULL;

-- ============================================================================
-- 2. Update interview_qa table for audio support
-- ============================================================================

ALTER TABLE interview_qa
ADD COLUMN IF NOT EXISTS question_audio_url TEXT,
ADD COLUMN IF NOT EXISTS answer_audio_url TEXT,
ADD COLUMN IF NOT EXISTS answer_duration INTEGER, -- seconds
ADD COLUMN IF NOT EXISTS clarity_score INTEGER CHECK (clarity_score >= 0 AND clarity_score <= 100),
ADD COLUMN IF NOT EXISTS confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
ADD COLUMN IF NOT EXISTS relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100);

-- Add indexes for audio URLs
CREATE INDEX IF NOT EXISTS idx_interview_qa_question_audio
ON interview_qa(question_audio_url)
WHERE question_audio_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_interview_qa_answer_audio
ON interview_qa(answer_audio_url)
WHERE answer_audio_url IS NOT NULL;

-- ============================================================================
-- 3. Create audio_cache table
-- ============================================================================

CREATE TABLE IF NOT EXISTS audio_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  text TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  mime_type VARCHAR(50) DEFAULT 'audio/mpeg',
  file_size INTEGER, -- bytes
  duration INTEGER, -- seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accessed_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audio_cache
CREATE INDEX IF NOT EXISTS idx_audio_cache_key
ON audio_cache(cache_key);

CREATE INDEX IF NOT EXISTS idx_audio_cache_accessed
ON audio_cache(last_accessed_at DESC);

-- Trigger to update accessed count and timestamp
CREATE OR REPLACE FUNCTION update_audio_cache_access()
RETURNS TRIGGER AS $$
BEGIN
  NEW.accessed_count = OLD.accessed_count + 1;
  NEW.last_accessed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audio_cache_access
BEFORE UPDATE ON audio_cache
FOR EACH ROW
WHEN (OLD.audio_url = NEW.audio_url AND OLD.accessed_count = NEW.accessed_count)
EXECUTE FUNCTION update_audio_cache_access();

-- ============================================================================
-- 4. Create/Update performance_metrics table
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance_metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_session
ON performance_metrics(session_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_user
ON performance_metrics(user_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_type
ON performance_metrics(metric_type);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_created
ON performance_metrics(created_at DESC);

-- ============================================================================
-- 5. RLS Policies for audio_cache
-- ============================================================================

ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read cached audio (it's public content)
CREATE POLICY "Audio cache is publicly readable"
  ON audio_cache FOR SELECT
  USING (true);

-- Only service role can insert/update audio cache
CREATE POLICY "Service role can manage audio cache"
  ON audio_cache FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- 6. RLS Policies for performance_metrics
-- ============================================================================

ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Users can read their own metrics
CREATE POLICY "Users can read own performance metrics"
  ON performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update metrics
CREATE POLICY "Service role can manage performance metrics"
  ON performance_metrics FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated users can insert their own metrics
CREATE POLICY "Users can insert own performance metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. Create Supabase Storage bucket for audio files
-- ============================================================================

-- Insert bucket (will skip if already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-files',
  'audio-files',
  true,
  10485760, -- 10MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. Storage policies for audio-files bucket
-- ============================================================================

-- Anyone can read audio files (public bucket)
CREATE POLICY "Anyone can read audio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-files');

-- Authenticated users can upload their own audio files
CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio-files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM interview_sessions WHERE user_id = auth.uid()
    )
  );

-- Users can update their own audio files
CREATE POLICY "Users can update own audio files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'audio-files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM interview_sessions WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own audio files
CREATE POLICY "Users can delete own audio files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'audio-files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM interview_sessions WHERE user_id = auth.uid()
    )
  );

-- Service role can do anything
CREATE POLICY "Service role can manage all audio files"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'audio-files' AND
    auth.role() = 'service_role'
  );

-- ============================================================================
-- 9. Helper functions
-- ============================================================================

-- Function to get user's voice interview statistics
CREATE OR REPLACE FUNCTION get_user_voice_interview_stats(user_uuid UUID)
RETURNS TABLE (
  total_interviews BIGINT,
  completed_interviews BIGINT,
  average_score NUMERIC,
  total_duration_minutes NUMERIC,
  total_questions BIGINT,
  average_response_time NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_interviews,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_interviews,
    ROUND(AVG(overall_score) FILTER (WHERE status = 'completed'), 2) as average_score,
    SUM(duration_minutes) FILTER (WHERE status = 'completed') as total_duration_minutes,
    SUM(total_questions) FILTER (WHERE status = 'completed') as total_questions,
    ROUND(AVG(average_response_time) FILTER (WHERE status = 'completed'), 2) as average_response_time
  FROM interview_sessions
  WHERE user_id = user_uuid AND interview_type = 'voice';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old audio cache (older than 30 days with low access)
CREATE OR REPLACE FUNCTION cleanup_old_audio_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM audio_cache
    WHERE
      last_accessed_at < NOW() - INTERVAL '30 days'
      AND accessed_count < 5
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. Update triggers for updated_at columns
-- ============================================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to audio_cache
DROP TRIGGER IF EXISTS update_audio_cache_updated_at ON audio_cache;
CREATE TRIGGER update_audio_cache_updated_at
  BEFORE UPDATE ON audio_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to performance_metrics
DROP TRIGGER IF EXISTS update_performance_metrics_updated_at ON performance_metrics;
CREATE TRIGGER update_performance_metrics_updated_at
  BEFORE UPDATE ON performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. Grant permissions
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON interview_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON interview_qa TO authenticated;
GRANT SELECT ON audio_cache TO authenticated;
GRANT SELECT, INSERT ON performance_metrics TO authenticated;

-- Grant full access to service role
GRANT ALL ON interview_sessions TO service_role;
GRANT ALL ON interview_qa TO service_role;
GRANT ALL ON audio_cache TO service_role;
GRANT ALL ON performance_metrics TO service_role;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Voice interview schema migration completed successfully!';
  RAISE NOTICE 'Tables updated: interview_sessions, interview_qa';
  RAISE NOTICE 'Tables created: audio_cache, performance_metrics';
  RAISE NOTICE 'Storage bucket created: audio-files';
  RAISE NOTICE 'RLS policies applied to all tables';
END $$;
