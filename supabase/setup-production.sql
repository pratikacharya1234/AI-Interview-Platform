-- Production Setup Script for AI Interview Platform
-- Run this in your Supabase SQL editor to set up all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  company TEXT,
  position TEXT,
  experience_level TEXT,
  skills TEXT[],
  github_username TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT,
  position TEXT,
  experience TEXT,
  type TEXT, -- audio, video, text
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, active, completed
  stage TEXT DEFAULT 'intro',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB,
  feedback_summary JSONB
);

-- Responses table
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id TEXT REFERENCES public.interviews(id) ON DELETE CASCADE,
  question TEXT,
  answer TEXT,
  analysis JSONB,
  stage TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Practice Questions table
CREATE TABLE IF NOT EXISTS public.practice_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  time_estimate INTEGER, -- in minutes
  popularity INTEGER DEFAULT 0,
  success_rate INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Practice Attempts table
CREATE TABLE IF NOT EXISTS public.practice_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.practice_questions(id) ON DELETE CASCADE,
  score INTEGER,
  time_taken INTEGER, -- in seconds
  completed BOOLEAN DEFAULT false,
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Interview History table
CREATE TABLE IF NOT EXISTS public.interview_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_id TEXT,
  type TEXT,
  company TEXT,
  position TEXT,
  score INTEGER,
  duration INTEGER, -- in minutes
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User Settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  interview_reminders BOOLEAN DEFAULT true,
  practice_reminders BOOLEAN DEFAULT true,
  audio_quality TEXT DEFAULT 'high',
  video_quality TEXT DEFAULT 'high',
  auto_save BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT,
  event_data JSONB,
  session_id TEXT,
  page_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON public.interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON public.interviews(status);
CREATE INDEX IF NOT EXISTS idx_responses_interview_id ON public.responses(interview_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_id ON public.practice_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_question_id ON public.practice_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_interview_history_user_id ON public.interview_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Interviews: Users can only see and manage their own interviews
CREATE POLICY "Users can view own interviews" ON public.interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interviews" ON public.interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews" ON public.interviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Responses: Users can only see responses for their interviews
CREATE POLICY "Users can view own responses" ON public.responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.interviews 
      WHERE interviews.id = responses.interview_id 
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create responses for own interviews" ON public.responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.interviews 
      WHERE interviews.id = responses.interview_id 
      AND interviews.user_id = auth.uid()
    )
  );

-- Practice Questions: Everyone can read
CREATE POLICY "Practice questions are public" ON public.practice_questions
  FOR SELECT USING (true);

-- Practice Attempts: Users can only see their own attempts
CREATE POLICY "Users can view own practice attempts" ON public.practice_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own practice attempts" ON public.practice_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice attempts" ON public.practice_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Interview History: Users can only see their own history
CREATE POLICY "Users can view own interview history" ON public.interview_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interview history" ON public.interview_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Settings: Users can only manage their own settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Analytics: Users can only see their own analytics
CREATE POLICY "Users can view own analytics" ON public.analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics" ON public.analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions and Triggers

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_practice_questions_updated_at
  BEFORE UPDATE ON public.practice_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.user_settings (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample practice questions (only if table is empty)
INSERT INTO public.practice_questions (title, description, difficulty, category, time_estimate, popularity, success_rate, tags)
SELECT * FROM (VALUES
  ('Two Sum Problem', 'Given an array of integers, return indices of two numbers that add up to a target.', 'easy', 'Arrays', 15, 95, 87, ARRAY['Hash Table', 'Array']),
  ('Tell Me About Yourself', 'Common behavioral question requiring a structured personal introduction.', 'medium', 'Behavioral', 5, 98, 73, ARRAY['Self Introduction', 'Personal Branding']),
  ('Design URL Shortener', 'Design a web service that shortens URLs with scalability considerations.', 'hard', 'System Design', 45, 89, 56, ARRAY['Distributed Systems', 'Database Design']),
  ('Binary Tree Traversal', 'Implement different methods to traverse a binary tree.', 'medium', 'Trees', 25, 91, 72, ARRAY['Binary Tree', 'Recursion', 'DFS']),
  ('Handling Conflict', 'Describe a time when you had a disagreement with a colleague.', 'medium', 'Behavioral', 8, 86, 69, ARRAY['Conflict Resolution', 'Communication']),
  ('Maximum Subarray Sum', 'Find the contiguous subarray with the largest sum.', 'medium', 'Dynamic Programming', 20, 88, 64, ARRAY['Dynamic Programming', 'Array'])
) AS t(title, description, difficulty, category, time_estimate, popularity, success_rate, tags)
WHERE NOT EXISTS (SELECT 1 FROM public.practice_questions LIMIT 1);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
