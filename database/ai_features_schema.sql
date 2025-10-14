-- AI Features Database Schema
-- Extended schema for AI Coach, Voice Analysis, Smart Feedback, and Personalized Prep

-- ============================================================================
-- AI COACHING SESSIONS
-- ============================================================================

CREATE TABLE ai_coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  duration INTEGER NOT NULL DEFAULT 0, -- Duration in minutes
  completed_steps INTEGER DEFAULT 0,
  total_steps INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
  ai_insights JSONB DEFAULT '[]'::jsonb, -- Array of insights
  recommended_actions JSONB DEFAULT '[]'::jsonb, -- Array of recommendations
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_coaching_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES ai_coaching_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'ai')),
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'suggestion', 'feedback')),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VOICE ANALYSIS
-- ============================================================================

CREATE TABLE voice_analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  session_name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- Duration in seconds
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  recording_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE voice_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES voice_analysis_sessions(id) ON DELETE CASCADE,
  confidence INTEGER DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  clarity INTEGER DEFAULT 0 CHECK (clarity >= 0 AND clarity <= 100),
  pace INTEGER DEFAULT 0 CHECK (pace >= 0 AND pace <= 100),
  volume INTEGER DEFAULT 0 CHECK (volume >= 0 AND volume <= 100),
  filler_words INTEGER DEFAULT 0,
  pause_frequency INTEGER DEFAULT 0 CHECK (pause_frequency >= 0 AND pause_frequency <= 100),
  tonal_variation INTEGER DEFAULT 0 CHECK (tonal_variation >= 0 AND tonal_variation <= 100),
  articulation INTEGER DEFAULT 0 CHECK (articulation >= 0 AND articulation <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE voice_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES voice_analysis_sessions(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('insight', 'recommendation')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SMART FEEDBACK
-- ============================================================================

CREATE TABLE feedback_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  session_name VARCHAR(255) NOT NULL,
  interview_date TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- Duration in seconds
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES feedback_sessions(id) ON DELETE CASCADE,
  technical INTEGER DEFAULT 0 CHECK (technical >= 0 AND technical <= 100),
  communication INTEGER DEFAULT 0 CHECK (communication >= 0 AND communication <= 100),
  problem_solving INTEGER DEFAULT 0 CHECK (problem_solving >= 0 AND problem_solving <= 100),
  cultural INTEGER DEFAULT 0 CHECK (cultural >= 0 AND cultural <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES feedback_sessions(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('ai_insight', 'improvement', 'strength', 'next_step')),
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERSONALIZED PREP PLANS
-- ============================================================================

CREATE TABLE prep_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  target_role VARCHAR(255) NOT NULL,
  target_company VARCHAR(255),
  interview_date TIMESTAMP,
  days_remaining INTEGER,
  overall_progress INTEGER DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prep_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES prep_plans(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'behavioral', 'system_design', 'company_specific')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tasks_total INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(plan_id, category)
);

CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES prep_plans(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  estimated_time INTEGER NOT NULL, -- In minutes
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  description TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prep_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES prep_plans(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'milestone')),
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prep_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES prep_plans(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('strength', 'weakness', 'recommendation')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AI FEATURES METRICS (Aggregated)
-- ============================================================================

CREATE TABLE ai_features_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  coaching_sessions_completed INTEGER DEFAULT 0,
  voice_sessions_completed INTEGER DEFAULT 0,
  feedback_sessions_completed INTEGER DEFAULT 0,
  prep_plans_active INTEGER DEFAULT 0,
  average_score INTEGER DEFAULT 0,
  improvement_rate INTEGER DEFAULT 0,
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- AI Coaching Indexes
CREATE INDEX idx_coaching_sessions_user_email ON ai_coaching_sessions(user_email);
CREATE INDEX idx_coaching_sessions_status ON ai_coaching_sessions(status);
CREATE INDEX idx_coaching_sessions_created_at ON ai_coaching_sessions(created_at DESC);
CREATE INDEX idx_coaching_messages_session_id ON ai_coaching_messages(session_id);

-- Voice Analysis Indexes
CREATE INDEX idx_voice_sessions_user_email ON voice_analysis_sessions(user_email);
CREATE INDEX idx_voice_sessions_created_at ON voice_analysis_sessions(created_at DESC);
CREATE INDEX idx_voice_metrics_session_id ON voice_metrics(session_id);

-- Feedback Indexes
CREATE INDEX idx_feedback_sessions_user_email ON feedback_sessions(user_email);
CREATE INDEX idx_feedback_sessions_created_at ON feedback_sessions(created_at DESC);
CREATE INDEX idx_feedback_items_session_id ON feedback_items(session_id);

-- Prep Plan Indexes
CREATE INDEX idx_prep_plans_user_email ON prep_plans(user_email);
CREATE INDEX idx_prep_plans_status ON prep_plans(status);
CREATE INDEX idx_prep_plans_interview_date ON prep_plans(interview_date);
CREATE INDEX idx_study_sessions_plan_id ON study_sessions(plan_id);
CREATE INDEX idx_prep_goals_plan_id ON prep_goals(plan_id);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- User AI Features Summary
CREATE VIEW user_ai_features_summary AS
SELECT 
  u.id AS user_id,
  u.email,
  COALESCE(m.coaching_sessions_completed, 0) AS coaching_sessions,
  COALESCE(m.voice_sessions_completed, 0) AS voice_sessions,
  COALESCE(m.feedback_sessions_completed, 0) AS feedback_sessions,
  COALESCE(m.prep_plans_active, 0) AS active_prep_plans,
  COALESCE(m.average_score, 0) AS average_score,
  COALESCE(m.improvement_rate, 0) AS improvement_rate,
  m.last_activity
FROM users u
LEFT JOIN ai_features_metrics m ON u.email = m.user_email;

-- Recent Coaching Sessions
CREATE VIEW recent_coaching_sessions AS
SELECT 
  s.id,
  s.user_email,
  s.topic,
  s.difficulty,
  s.status,
  s.completed_steps,
  s.total_steps,
  ROUND((s.completed_steps::DECIMAL / NULLIF(s.total_steps, 0)) * 100) AS progress_percentage,
  s.last_activity,
  s.created_at
FROM ai_coaching_sessions s
ORDER BY s.created_at DESC;

-- Voice Analysis Summary
CREATE VIEW voice_analysis_summary AS
SELECT 
  v.id,
  v.user_email,
  v.session_name,
  v.duration,
  v.overall_score,
  m.confidence,
  m.clarity,
  m.pace,
  m.filler_words,
  v.created_at
FROM voice_analysis_sessions v
LEFT JOIN voice_metrics m ON v.id = m.session_id
ORDER BY v.created_at DESC;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update AI Features Metrics
CREATE OR REPLACE FUNCTION update_ai_features_metrics(user_email_param TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_features_metrics (user_email, coaching_sessions_completed, voice_sessions_completed, feedback_sessions_completed, prep_plans_active, last_activity)
  VALUES (
    user_email_param,
    (SELECT COUNT(*) FROM ai_coaching_sessions WHERE user_email = user_email_param AND status = 'completed'),
    (SELECT COUNT(*) FROM voice_analysis_sessions WHERE user_email = user_email_param),
    (SELECT COUNT(*) FROM feedback_sessions WHERE user_email = user_email_param),
    (SELECT COUNT(*) FROM prep_plans WHERE user_email = user_email_param AND status = 'active'),
    NOW()
  )
  ON CONFLICT (user_email) 
  DO UPDATE SET
    coaching_sessions_completed = (SELECT COUNT(*) FROM ai_coaching_sessions WHERE user_email = user_email_param AND status = 'completed'),
    voice_sessions_completed = (SELECT COUNT(*) FROM voice_analysis_sessions WHERE user_email = user_email_param),
    feedback_sessions_completed = (SELECT COUNT(*) FROM feedback_sessions WHERE user_email = user_email_param),
    prep_plans_active = (SELECT COUNT(*) FROM prep_plans WHERE user_email = user_email_param AND status = 'active'),
    last_activity = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Calculate Days Remaining for Prep Plan
CREATE OR REPLACE FUNCTION calculate_days_remaining()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interview_date IS NOT NULL THEN
    NEW.days_remaining := GREATEST(0, EXTRACT(DAY FROM (NEW.interview_date - NOW())));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prep_plan_days_remaining
BEFORE INSERT OR UPDATE ON prep_plans
FOR EACH ROW
EXECUTE FUNCTION calculate_days_remaining();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coaching_sessions_updated_at BEFORE UPDATE ON ai_coaching_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voice_sessions_updated_at BEFORE UPDATE ON voice_analysis_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_sessions_updated_at BEFORE UPDATE ON feedback_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prep_plans_updated_at BEFORE UPDATE ON prep_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_sessions_updated_at BEFORE UPDATE ON study_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
