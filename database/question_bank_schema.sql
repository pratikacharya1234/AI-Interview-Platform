-- Question Bank Database Schema
-- Stores AI-generated interview questions with categories, difficulty levels, and sample answers

-- ============================================================================
-- QUESTION CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS question_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- Icon name for UI
  color VARCHAR(20), -- Color code for UI
  parent_id UUID REFERENCES question_categories(id),
  question_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON question_categories(slug);
CREATE INDEX idx_categories_parent ON question_categories(parent_id);

-- Insert default categories
INSERT INTO question_categories (name, slug, description, icon, color) VALUES
  ('Technical', 'technical', 'Programming and technical questions', 'Code', '#3B82F6'),
  ('Behavioral', 'behavioral', 'Behavioral and situational questions', 'Users', '#10B981'),
  ('System Design', 'system-design', 'System architecture and design questions', 'Layout', '#8B5CF6'),
  ('Data Structures', 'data-structures', 'Data structures and algorithms', 'Database', '#F59E0B'),
  ('Web Development', 'web-development', 'Frontend and backend web development', 'Globe', '#EC4899'),
  ('Database', 'database', 'Database design and SQL questions', 'Server', '#14B8A6'),
  ('Cloud & DevOps', 'cloud-devops', 'Cloud services and DevOps practices', 'Cloud', '#6366F1'),
  ('Machine Learning', 'machine-learning', 'ML and AI concepts', 'Brain', '#F97316'),
  ('Mobile Development', 'mobile-development', 'iOS and Android development', 'Smartphone', '#06B6D4'),
  ('Security', 'security', 'Cybersecurity and application security', 'Shield', '#EF4444');

-- ============================================================================
-- QUESTION BANK
-- ============================================================================

CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Question content
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'open_ended', 'coding', 'system_design'
  category_id UUID REFERENCES question_categories(id),
  subcategory VARCHAR(100),
  
  -- Difficulty and metadata
  difficulty_level VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard', 'expert'
  experience_level VARCHAR(50), -- 'entry', 'junior', 'mid', 'senior', 'lead', 'principal'
  estimated_time_minutes INTEGER DEFAULT 5,
  
  -- Answer information
  sample_answer TEXT,
  answer_guidelines TEXT,
  evaluation_criteria JSONB,
  key_points TEXT[],
  common_mistakes TEXT[],
  
  -- Additional content
  hints TEXT[],
  follow_up_questions TEXT[],
  related_topics TEXT[],
  resources JSONB, -- Links to documentation, tutorials, etc.
  code_snippet TEXT,
  code_language VARCHAR(50),
  
  -- Tags and search
  tags TEXT[],
  keywords TEXT[],
  
  -- Statistics
  times_asked INTEGER DEFAULT 0,
  average_score DECIMAL(3,2),
  success_rate DECIMAL(3,2),
  
  -- AI generation metadata
  generated_by VARCHAR(50) DEFAULT 'gemini', -- 'gemini', 'gpt-4', 'claude', 'manual'
  generation_prompt TEXT,
  generation_model VARCHAR(100),
  generation_temperature DECIMAL(2,1),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questions_category ON question_bank(category_id);
CREATE INDEX idx_questions_difficulty ON question_bank(difficulty_level);
CREATE INDEX idx_questions_type ON question_bank(question_type);
CREATE INDEX idx_questions_tags ON question_bank USING GIN(tags);
CREATE INDEX idx_questions_keywords ON question_bank USING GIN(keywords);
CREATE INDEX idx_questions_active ON question_bank(is_active);

-- ============================================================================
-- USER QUESTION ATTEMPTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES question_bank(id),
  session_id UUID REFERENCES interview_sessions(id),
  
  -- Response details
  user_answer TEXT,
  answer_time_seconds INTEGER,
  
  -- Evaluation
  score DECIMAL(3,2), -- 0-10 scale
  is_correct BOOLEAN,
  feedback TEXT,
  strengths TEXT[],
  improvements TEXT[],
  
  -- Metadata
  attempt_number INTEGER DEFAULT 1,
  is_bookmarked BOOLEAN DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attempts_user ON user_question_attempts(user_id);
CREATE INDEX idx_attempts_question ON user_question_attempts(question_id);
CREATE INDEX idx_attempts_session ON user_question_attempts(session_id);
CREATE INDEX idx_attempts_created ON user_question_attempts(created_at DESC);

-- ============================================================================
-- QUESTION COLLECTIONS (User-created lists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS question_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  
  -- Statistics
  question_count INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(3,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collections_user ON question_collections(user_id);
CREATE INDEX idx_collections_public ON question_collections(is_public);

-- ============================================================================
-- COLLECTION QUESTIONS (Many-to-many relationship)
-- ============================================================================

CREATE TABLE IF NOT EXISTS collection_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES question_collections(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(collection_id, question_id)
);

CREATE INDEX idx_collection_questions_collection ON collection_questions(collection_id);
CREATE INDEX idx_collection_questions_question ON collection_questions(question_id);

-- ============================================================================
-- QUESTION RATINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS question_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  relevance_rating INTEGER CHECK (relevance_rating >= 1 AND relevance_rating <= 5),
  
  comment TEXT,
  is_helpful BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(question_id, user_id)
);

CREATE INDEX idx_ratings_question ON question_ratings(question_id);
CREATE INDEX idx_ratings_user ON question_ratings(user_id);

-- ============================================================================
-- QUESTION GENERATION QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS question_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request details
  category_id UUID REFERENCES question_categories(id),
  topic VARCHAR(200),
  difficulty_level VARCHAR(20),
  question_type VARCHAR(50),
  count INTEGER DEFAULT 1,
  
  -- Generation parameters
  custom_prompt TEXT,
  temperature DECIMAL(2,1) DEFAULT 0.7,
  model VARCHAR(100) DEFAULT 'gemini-pro',
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  generated_count INTEGER DEFAULT 0,
  
  -- User info
  requested_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_generation_queue_status ON question_generation_queue(status);
CREATE INDEX idx_generation_queue_created ON question_generation_queue(created_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update question count in categories
CREATE OR REPLACE FUNCTION update_category_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE question_categories 
    SET question_count = question_count + 1 
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE question_categories 
    SET question_count = question_count - 1 
    WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_count
AFTER INSERT OR DELETE ON question_bank
FOR EACH ROW EXECUTE FUNCTION update_category_question_count();

-- Function to update collection question count
CREATE OR REPLACE FUNCTION update_collection_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE question_collections 
    SET question_count = question_count + 1 
    WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE question_collections 
    SET question_count = question_count - 1 
    WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collection_count
AFTER INSERT OR DELETE ON collection_questions
FOR EACH ROW EXECUTE FUNCTION update_collection_question_count();
