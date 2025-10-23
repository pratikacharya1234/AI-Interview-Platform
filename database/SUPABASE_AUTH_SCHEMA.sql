-- ✅ SUPABASE AUTH INTEGRATION SCHEMA
-- Run this AFTER running COMPLETE_SCHEMA.sql
-- This adds auto-profile creation when users sign in with GitHub

-- ============================================
-- UPDATE PROFILES TABLE FOR SUPABASE AUTH
-- ============================================

-- Drop existing profiles table if needed and recreate with proper structure
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    
    -- GitHub metadata
    github_username TEXT,
    github_id TEXT,
    
    -- User preferences
    experience_level TEXT DEFAULT 'mid',
    target_role TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    
    -- Statistics
    total_interviews INTEGER DEFAULT 0,
    completed_interviews INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    
    -- Gamification
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar_url,
    github_username,
    github_id
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'provider_id'
  );
  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- UPDATE EXISTING TABLES TO USE UUID
-- ============================================

-- Update interview_sessions to use UUID for user_id
ALTER TABLE interview_sessions 
  DROP CONSTRAINT IF EXISTS fk_session_user,
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ADD CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update interview_feedback to use UUID for user_id
ALTER TABLE interview_feedback 
  DROP CONSTRAINT IF EXISTS fk_feedback_user,
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ADD CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update practice_attempts to use UUID for user_id
ALTER TABLE practice_attempts 
  DROP CONSTRAINT IF EXISTS fk_practice_user,
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ADD CONSTRAINT fk_practice_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update achievements to use UUID for user_id
ALTER TABLE achievements 
  DROP CONSTRAINT IF EXISTS fk_achievement_user,
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ADD CONSTRAINT fk_achievement_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update user_progress to use UUID for user_id
ALTER TABLE user_progress 
  DROP CONSTRAINT IF EXISTS fk_progress_user,
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ADD CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update leaderboard to use UUID for user_id
ALTER TABLE leaderboard 
  DROP CONSTRAINT IF EXISTS fk_leaderboard_user,
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ADD CONSTRAINT fk_leaderboard_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update streaks to use UUID for user_id
ALTER TABLE streaks 
  DROP CONSTRAINT IF EXISTS fk_streak_user,
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ADD CONSTRAINT fk_streak_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ============================================
-- RLS POLICIES FOR PROFILES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Allow users to view all profiles (for leaderboard, etc.)
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow system to insert profiles (via trigger)
CREATE POLICY "System can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;

-- ============================================
-- HELPER FUNCTION: GET CURRENT USER PROFILE
-- ============================================

CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  total_interviews INTEGER,
  completed_interviews INTEGER,
  average_score DECIMAL,
  total_xp INTEGER,
  level INTEGER,
  streak_days INTEGER
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.name,
    p.avatar_url,
    p.github_username,
    p.total_interviews,
    p.completed_interviews,
    p.average_score,
    p.total_xp,
    p.level,
    p.streak_days
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_github_username ON profiles(github_username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ✅ SUCCESS! Supabase Auth integration complete!
-- Users will now auto-create profiles when they sign in with GitHub
-- All user_id fields now properly reference auth.users
