-- Add table for storing comprehensive interview summaries with AI-generated content

CREATE TABLE interview_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_data JSONB NOT NULL,
  image_url TEXT,
  image_prompt TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_interview_summaries_interview_id ON interview_summaries(interview_id);
CREATE INDEX idx_interview_summaries_user_id ON interview_summaries(user_id);
CREATE INDEX idx_interview_summaries_generated_at ON interview_summaries(generated_at);

-- Add RLS policies
ALTER TABLE interview_summaries ENABLE ROW LEVEL SECURITY;

-- Users can only access their own interview summaries
CREATE POLICY "Users can view their own interview summaries" ON interview_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview summaries" ON interview_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview summaries" ON interview_summaries
  FOR UPDATE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER interview_summaries_updated_at
  BEFORE UPDATE ON interview_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();