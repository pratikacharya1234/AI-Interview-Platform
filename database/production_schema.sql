-- AI Interview Platform - Production Database Schema
-- Comprehensive schema for multi-persona interviews, gamification, adaptive learning, and analytics

-- ============================================================================
-- CORE USER MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  github_username VARCHAR(255),
  github_data JSONB DEFAULT '{}',
  resume_data JSONB DEFAULT '{}',
  skill_level VARCHAR(50) DEFAULT 'beginner',
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INTERVIEWER PERSONAS
-- ============================================================================

CREATE TABLE IF NOT EXISTS interviewer_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  company_type VARCHAR(100),
  avatar_url TEXT,
  description TEXT,
  personality_traits JSONB DEFAULT '[]',
  interview_style VARCHAR(100),
  difficulty_preference VARCHAR(50),
  focus_areas JSONB DEFAULT '[]',
  question_patterns JSONB DEFAULT '{}',
  evaluation_criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate interviewer personas
INSERT INTO interviewer_personas (name, role, company_type, description, personality_traits, interview_style, difficulty_preference, focus_areas) VALUES
('Alex Chen', 'Senior Software Engineer', 'Google', 'Focuses on algorithms, data structures, and system design. Expects clear communication and optimal solutions.', '["analytical", "detail-oriented", "patient"]', 'technical-deep-dive', 'hard', '["algorithms", "data-structures", "complexity-analysis", "system-design"]'),
('Sarah Martinez', 'CTO', 'Startup', 'Values practical problem-solving, adaptability, and full-stack knowledge. Looks for entrepreneurial mindset.', '["pragmatic", "fast-paced", "innovative"]', 'practical-problem-solving', 'medium', '["full-stack", "mvp-thinking", "scalability", "tech-decisions"]'),
('James Wilson', 'HR Director', 'Enterprise', 'Evaluates soft skills, cultural fit, and behavioral competencies using STAR method.', '["empathetic", "thorough", "people-focused"]', 'behavioral-star', 'easy', '["communication", "teamwork", "conflict-resolution", "leadership"]'),
('Dr. Emily Zhang', 'Tech Lead', 'FAANG', 'System design expert focusing on scalability, architecture patterns, and trade-offs.', '["strategic", "experienced", "challenging"]', 'system-design', 'hard', '["architecture", "scalability", "distributed-systems", "trade-offs"]'),
('Marcus Johnson', 'Engineering Manager', 'Mid-size Tech', 'Balanced approach covering coding, system design, and team collaboration.', '["balanced", "supportive", "comprehensive"]', 'mixed-approach', 'medium', '["coding", "design", "collaboration", "mentoring"]'),
('Priya Sharma', 'Frontend Architect', 'Product Company', 'Specializes in frontend technologies, UI/UX, and modern web development.', '["creative", "user-focused", "modern"]', 'frontend-specialist', 'medium', '["react", "typescript", "performance", "accessibility"]'),
('David Kim', 'Backend Architect', 'Cloud Company', 'Deep focus on backend systems, databases, APIs, and cloud infrastructure.', '["technical", "thorough", "infrastructure-focused"]', 'backend-specialist', 'hard', '["databases", "apis", "cloud", "microservices"]');

-- ============================================================================
-- INTERVIEW SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES interviewer_personas(id),
  company_name VARCHAR(255),
  position VARCHAR(255),
  interview_type VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  mode VARCHAR(50) DEFAULT 'text',
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_seconds INTEGER DEFAULT 0,
  recording_url TEXT,
  transcript JSONB DEFAULT '[]',
  questions JSONB DEFAULT '[]',
  responses JSONB DEFAULT '[]',
  current_question_index INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VOICE ANALYSIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS voice_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  response_index INTEGER NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  tone_analysis JSONB DEFAULT '{}',
  confidence_score INTEGER DEFAULT 0,
  speech_pace INTEGER,
  filler_words_count INTEGER DEFAULT 0,
  clarity_score INTEGER DEFAULT 0,
  emotion_detected VARCHAR(100),
  volume_consistency INTEGER DEFAULT 0,
  pronunciation_score INTEGER DEFAULT 0,
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INTERVIEW EVALUATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS interview_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
  overall_score INTEGER DEFAULT 0,
  technical_score INTEGER DEFAULT 0,
  communication_score INTEGER DEFAULT 0,
  problem_solving_score INTEGER DEFAULT 0,
  cultural_fit_score INTEGER DEFAULT 0,
  detailed_feedback JSONB DEFAULT '{}',
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  improvement_areas JSONB DEFAULT '[]',
  next_steps JSONB DEFAULT '[]',
  pass_likelihood INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ADAPTIVE LEARNING SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_role VARCHAR(255),
  target_company VARCHAR(255),
  difficulty_level VARCHAR(50),
  estimated_duration_days INTEGER,
  current_progress INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  modules JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  module_type VARCHAR(100),
  content JSONB DEFAULT '{}',
  resources JSONB DEFAULT '[]',
  practice_questions JSONB DEFAULT '[]',
  order_index INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMP,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_category VARCHAR(255) NOT NULL,
  skill_name VARCHAR(255) NOT NULL,
  current_level INTEGER DEFAULT 0,
  target_level INTEGER DEFAULT 100,
  proficiency_score INTEGER DEFAULT 0,
  last_assessed TIMESTAMP,
  assessment_history JSONB DEFAULT '[]',
  practice_recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, skill_category, skill_name)
);

-- ============================================================================
-- GAMIFICATION SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  icon_name VARCHAR(100),
  xp_reward INTEGER DEFAULT 0,
  rarity VARCHAR(50) DEFAULT 'common',
  criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate achievements
INSERT INTO achievements (name, description, category, icon_name, xp_reward, rarity, criteria) VALUES
('First Interview', 'Complete your first interview session', 'milestone', 'trophy', 100, 'common', '{"interviews_completed": 1}'),
('Interview Streak', 'Complete interviews for 7 consecutive days', 'consistency', 'flame', 500, 'rare', '{"streak_days": 7}'),
('Perfect Score', 'Achieve a perfect score in any interview', 'performance', 'star', 1000, 'epic', '{"perfect_scores": 1}'),
('Algorithm Master', 'Solve 50 algorithm questions correctly', 'technical', 'code', 750, 'rare', '{"algorithm_questions": 50}'),
('System Design Pro', 'Complete 10 system design interviews', 'technical', 'layers', 800, 'rare', '{"system_design_interviews": 10}'),
('Communication Expert', 'Achieve 90+ communication score in 5 interviews', 'soft-skills', 'message-circle', 600, 'rare', '{"high_communication_scores": 5}'),
('Fast Learner', 'Improve score by 20+ points in same interview type', 'growth', 'trending-up', 400, 'uncommon', '{"score_improvement": 20}'),
('Night Owl', 'Complete 10 interviews between 10 PM and 6 AM', 'special', 'moon', 300, 'uncommon', '{"night_interviews": 10}'),
('Early Bird', 'Complete 10 interviews between 5 AM and 9 AM', 'special', 'sunrise', 300, 'uncommon', '{"morning_interviews": 10}'),
('FAANG Ready', 'Pass 5 hard-level FAANG-style interviews', 'milestone', 'briefcase', 2000, 'legendary', '{"faang_interviews_passed": 5}'),
('Mentor', 'Provide feedback on 10 peer interviews', 'community', 'users', 500, 'rare', '{"feedback_given": 10}'),
('Consistent Performer', 'Maintain 80+ average score over 20 interviews', 'performance', 'award', 1500, 'epic', '{"consistent_high_scores": 20}');

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  time_period VARCHAR(50) NOT NULL,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category, time_period)
);

-- ============================================================================
-- COMPANY-SPECIFIC INTERVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) UNIQUE NOT NULL,
  industry VARCHAR(100),
  size VARCHAR(50),
  logo_url TEXT,
  description TEXT,
  tech_stack JSONB DEFAULT '[]',
  interview_process JSONB DEFAULT '{}',
  common_questions JSONB DEFAULT '[]',
  culture_values JSONB DEFAULT '[]',
  difficulty_rating INTEGER DEFAULT 5,
  success_tips JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate major companies
INSERT INTO company_profiles (company_name, industry, size, description, tech_stack, difficulty_rating, culture_values) VALUES
('Google', 'Technology', 'Large', 'Leading search and cloud technology company', '["Go", "Python", "Java", "C++", "Kubernetes"]', 9, '["Innovation", "User Focus", "Collaboration"]'),
('Amazon', 'E-commerce/Cloud', 'Large', 'E-commerce and cloud computing leader', '["Java", "Python", "AWS", "DynamoDB", "Lambda"]', 9, '["Customer Obsession", "Ownership", "Bias for Action"]'),
('Meta', 'Social Media', 'Large', 'Social technology company', '["React", "Python", "Hack", "GraphQL", "PyTorch"]', 9, '["Move Fast", "Be Bold", "Build Social Value"]'),
('Microsoft', 'Technology', 'Large', 'Software and cloud services company', '["C#", ".NET", "Azure", "TypeScript", "Python"]', 8, '["Growth Mindset", "Customer Focus", "Diversity"]'),
('Apple', 'Technology', 'Large', 'Consumer electronics and software', '["Swift", "Objective-C", "C++", "Metal", "Core ML"]', 9, '["Innovation", "Excellence", "Privacy"]'),
('Netflix', 'Streaming', 'Large', 'Streaming entertainment service', '["Java", "Python", "Node.js", "React", "AWS"]', 8, '["Freedom & Responsibility", "Context not Control"]'),
('Stripe', 'Fintech', 'Medium', 'Payment processing platform', '["Ruby", "Go", "React", "TypeScript", "Kubernetes"]', 8, '["User First", "Move with Urgency", "Think Rigorously"]');

-- ============================================================================
-- MENTOR FEEDBACK SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expertise_areas JSONB DEFAULT '[]',
  years_experience INTEGER,
  current_company VARCHAR(255),
  current_role VARCHAR(255),
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  sessions_conducted INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mentor_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES mentor_profiles(id),
  feedback_text TEXT,
  detailed_analysis JSONB DEFAULT '{}',
  actionable_items JSONB DEFAULT '[]',
  resources_recommended JSONB DEFAULT '[]',
  follow_up_scheduled BOOLEAN DEFAULT false,
  rating INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ANALYTICS AND METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  interviews_completed INTEGER DEFAULT 0,
  average_score INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  accuracy_rate INTEGER DEFAULT 0,
  improvement_rate DECIMAL(5,2) DEFAULT 0.00,
  weak_areas JSONB DEFAULT '[]',
  strong_areas JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, metric_date)
);

CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(255) NOT NULL,
  subcategory VARCHAR(255),
  difficulty VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  expected_answer TEXT,
  evaluation_rubric JSONB DEFAULT '{}',
  tags JSONB DEFAULT '[]',
  company_specific VARCHAR(255),
  persona_preference UUID REFERENCES interviewer_personas(id),
  usage_count INTEGER DEFAULT 0,
  success_rate INTEGER DEFAULT 0,
  average_time_seconds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_github ON users(github_username);
CREATE INDEX idx_users_level ON users(current_level);

CREATE INDEX idx_sessions_user ON interview_sessions(user_id);
CREATE INDEX idx_sessions_persona ON interview_sessions(persona_id);
CREATE INDEX idx_sessions_status ON interview_sessions(status);
CREATE INDEX idx_sessions_created ON interview_sessions(created_at DESC);

CREATE INDEX idx_voice_session ON voice_analysis(session_id);
CREATE INDEX idx_evaluation_session ON interview_evaluations(session_id);

CREATE INDEX idx_learning_user ON learning_paths(user_id);
CREATE INDEX idx_learning_status ON learning_paths(status);

CREATE INDEX idx_skills_user ON skill_assessments(user_id);
CREATE INDEX idx_skills_category ON skill_assessments(skill_category);

CREATE INDEX idx_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_leaderboard_category ON leaderboard(category, time_period);

CREATE INDEX idx_company_name ON company_profiles(company_name);
CREATE INDEX idx_mentor_available ON mentor_profiles(is_available);

CREATE INDEX idx_metrics_user_date ON performance_metrics(user_id, metric_date DESC);
CREATE INDEX idx_questions_category ON question_bank(category, difficulty);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.total_xp,
  u.current_level,
  u.streak_days,
  COUNT(DISTINCT s.id) as total_interviews,
  AVG(e.overall_score) as average_score,
  COUNT(DISTINCT ua.achievement_id) as achievements_earned,
  MAX(s.created_at) as last_interview_date
FROM users u
LEFT JOIN interview_sessions s ON u.id = s.user_id
LEFT JOIN interview_evaluations e ON s.id = e.session_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id;

CREATE OR REPLACE VIEW interview_summary AS
SELECT 
  s.id,
  s.user_id,
  u.email,
  u.name,
  p.name as interviewer_name,
  p.role as interviewer_role,
  s.company_name,
  s.interview_type,
  s.difficulty,
  s.status,
  s.duration_seconds,
  e.overall_score,
  e.technical_score,
  e.communication_score,
  s.xp_earned,
  s.created_at
FROM interview_sessions s
JOIN users u ON s.user_id = u.id
LEFT JOIN interviewer_personas p ON s.persona_id = p.id
LEFT JOIN interview_evaluations e ON s.id = e.session_id;

-- ============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Calculate XP for level
CREATE OR REPLACE FUNCTION calculate_xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (level * level * 100) + (level * 50);
END;
$$ LANGUAGE plpgsql;

-- Update user level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level INTEGER;
  required_xp INTEGER;
BEGIN
  new_level := NEW.current_level;
  required_xp := calculate_xp_for_level(new_level + 1);
  
  WHILE NEW.total_xp >= required_xp LOOP
    new_level := new_level + 1;
    required_xp := calculate_xp_for_level(new_level + 1);
  END LOOP;
  
  NEW.current_level := new_level;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
BEFORE UPDATE OF total_xp ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_level();

-- Update streak days
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_active_date IS NULL OR NEW.last_active_date < CURRENT_DATE THEN
    IF NEW.last_active_date = CURRENT_DATE - INTERVAL '1 day' THEN
      NEW.streak_days := NEW.streak_days + 1;
    ELSIF NEW.last_active_date < CURRENT_DATE - INTERVAL '1 day' THEN
      NEW.streak_days := 1;
    END IF;
    NEW.last_active_date := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_streak
BEFORE INSERT OR UPDATE ON interview_sessions
FOR EACH ROW
EXECUTE FUNCTION update_user_streak();

-- Check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS TABLE(achievement_id UUID, achievement_name VARCHAR) AS $$
DECLARE
  interview_count INTEGER;
  perfect_scores INTEGER;
  streak INTEGER;
BEGIN
  SELECT COUNT(*) INTO interview_count
  FROM interview_sessions
  WHERE user_id = p_user_id AND status = 'completed';
  
  SELECT COUNT(*) INTO perfect_scores
  FROM interview_evaluations e
  JOIN interview_sessions s ON e.session_id = s.id
  WHERE s.user_id = p_user_id AND e.overall_score = 100;
  
  SELECT streak_days INTO streak
  FROM users
  WHERE id = p_user_id;
  
  -- Award First Interview achievement
  IF interview_count >= 1 AND NOT EXISTS (
    SELECT 1 FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = p_user_id AND a.name = 'First Interview'
  ) THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT p_user_id, id FROM achievements WHERE name = 'First Interview'
    RETURNING user_achievements.achievement_id, (SELECT name FROM achievements WHERE id = user_achievements.achievement_id);
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Get personalized learning path
CREATE OR REPLACE FUNCTION generate_learning_path(
  p_user_id UUID,
  p_target_role VARCHAR,
  p_target_company VARCHAR
)
RETURNS UUID AS $$
DECLARE
  path_id UUID;
  weak_skills JSONB;
BEGIN
  -- Analyze user's weak areas
  SELECT jsonb_agg(DISTINCT skill_category)
  INTO weak_skills
  FROM skill_assessments
  WHERE user_id = p_user_id AND proficiency_score < 60;
  
  -- Create learning path
  INSERT INTO learning_paths (
    user_id,
    title,
    description,
    target_role,
    target_company,
    difficulty_level,
    estimated_duration_days
  ) VALUES (
    p_user_id,
    'Path to ' || p_target_role || ' at ' || p_target_company,
    'Personalized learning path based on your current skills and target role',
    p_target_role,
    p_target_company,
    'intermediate',
    90
  ) RETURNING id INTO path_id;
  
  RETURN path_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_sessions_updated
BEFORE UPDATE ON interview_sessions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_learning_paths_updated
BEFORE UPDATE ON learning_paths
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
