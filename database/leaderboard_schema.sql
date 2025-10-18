-- Leaderboard and Streak System Database Schema
-- AI Interview Pro Platform

-- User scores table for tracking performance metrics
CREATE TABLE IF NOT EXISTS user_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ai_accuracy_score DECIMAL(5,2) DEFAULT 0.00 CHECK (ai_accuracy_score >= 0 AND ai_accuracy_score <= 100),
    communication_score DECIMAL(5,2) DEFAULT 0.00 CHECK (communication_score >= 0 AND communication_score <= 100),
    completion_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (completion_rate >= 0 AND completion_rate <= 100),
    performance_score DECIMAL(6,2) GENERATED ALWAYS AS (
        (0.6 * ai_accuracy_score) + (0.3 * communication_score) + (0.1 * completion_rate)
    ) STORED,
    total_interviews INT DEFAULT 0,
    successful_interviews INT DEFAULT 0,
    last_activity_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    country_code VARCHAR(2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User streaks table for tracking daily activity
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
    streak_count INT DEFAULT 1 CHECK (streak_count >= 0),
    longest_streak INT DEFAULT 1 CHECK (longest_streak >= 0),
    total_sessions INT DEFAULT 0,
    streak_frozen BOOLEAN DEFAULT FALSE,
    freeze_used_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Leaderboard cache table for fast reads
CREATE TABLE IF NOT EXISTS leaderboard_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    global_rank INT NOT NULL,
    previous_rank INT,
    rank_change INT GENERATED ALWAYS AS (
        CASE 
            WHEN previous_rank IS NULL THEN 0
            ELSE previous_rank - global_rank
        END
    ) STORED,
    performance_score DECIMAL(6,2) NOT NULL,
    adjusted_score DECIMAL(6,2) NOT NULL,
    streak_bonus DECIMAL(3,2) DEFAULT 0.00,
    streak_count INT DEFAULT 0,
    country_code VARCHAR(2),
    country_name VARCHAR(100),
    badge_level VARCHAR(20),
    last_activity_timestamp TIMESTAMP WITH TIME ZONE,
    cache_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cache_date)
);

-- Daily session logs for streak tracking
CREATE TABLE IF NOT EXISTS session_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_count INT DEFAULT 1,
    total_duration_minutes INT DEFAULT 0,
    ai_accuracy_score DECIMAL(5,2),
    communication_score DECIMAL(5,2),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_date)
);

-- Achievements and badges table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    achievement_description TEXT,
    earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    streak_milestone INT,
    rank_milestone INT,
    UNIQUE(user_id, achievement_type)
);

-- Leaderboard history for tracking rank changes over time
CREATE TABLE IF NOT EXISTS leaderboard_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rank_date DATE NOT NULL,
    global_rank INT NOT NULL,
    performance_score DECIMAL(6,2) NOT NULL,
    adjusted_score DECIMAL(6,2) NOT NULL,
    streak_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, rank_date)
);

-- Create indexes for performance
CREATE INDEX idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX idx_user_scores_performance ON user_scores(performance_score DESC, last_activity_timestamp DESC);
CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_user_streaks_active_date ON user_streaks(last_active_date);
CREATE INDEX idx_leaderboard_cache_rank ON leaderboard_cache(global_rank, cache_date);
CREATE INDEX idx_leaderboard_cache_user ON leaderboard_cache(user_id, cache_date);
CREATE INDEX idx_leaderboard_cache_score ON leaderboard_cache(adjusted_score DESC);
CREATE INDEX idx_session_logs_user_date ON session_logs(user_id, session_date);
CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_leaderboard_history_user_date ON leaderboard_history(user_id, rank_date);

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_date DATE;
    current_streak INT;
    days_diff INT;
BEGIN
    -- Get the user's current streak info
    SELECT last_active_date, streak_count 
    INTO last_date, current_streak
    FROM user_streaks 
    WHERE user_id = NEW.user_id;
    
    IF NOT FOUND THEN
        -- First time user, create new streak
        INSERT INTO user_streaks (user_id, last_active_date, streak_count, total_sessions)
        VALUES (NEW.user_id, NEW.session_date, 1, 1);
    ELSE
        -- Calculate days difference
        days_diff := NEW.session_date - last_date;
        
        IF days_diff = 0 THEN
            -- Same day, just increment session count
            UPDATE user_streaks 
            SET total_sessions = total_sessions + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF days_diff = 1 THEN
            -- Consecutive day, increment streak
            UPDATE user_streaks 
            SET streak_count = streak_count + 1,
                last_active_date = NEW.session_date,
                total_sessions = total_sessions + 1,
                longest_streak = GREATEST(longest_streak, streak_count + 1),
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF days_diff > 1 THEN
            -- Streak broken, reset to 1
            UPDATE user_streaks 
            SET streak_count = 1,
                last_active_date = NEW.session_date,
                total_sessions = total_sessions + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating streaks on new sessions
CREATE TRIGGER trigger_update_streak
AFTER INSERT OR UPDATE ON session_logs
FOR EACH ROW
EXECUTE FUNCTION update_user_streak();

-- Function to calculate adjusted score with streak bonus
CREATE OR REPLACE FUNCTION calculate_adjusted_score(
    p_performance_score DECIMAL,
    p_streak_days INT
) RETURNS DECIMAL AS $$
DECLARE
    streak_bonus DECIMAL;
    adjusted_score DECIMAL;
BEGIN
    -- Calculate streak bonus (max 50% bonus at 10+ days)
    streak_bonus := LEAST(p_streak_days * 0.05, 0.5);
    
    -- Calculate adjusted score
    adjusted_score := p_performance_score * (1 + streak_bonus);
    
    RETURN ROUND(adjusted_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboard cache
CREATE OR REPLACE FUNCTION update_leaderboard_cache()
RETURNS void AS $$
BEGIN
    -- Store previous ranks
    UPDATE leaderboard_cache 
    SET previous_rank = global_rank
    WHERE cache_date = CURRENT_DATE - INTERVAL '1 day';
    
    -- Delete old cache
    DELETE FROM leaderboard_cache 
    WHERE cache_date < CURRENT_DATE;
    
    -- Insert new rankings
    INSERT INTO leaderboard_cache (
        user_id,
        username,
        avatar_url,
        global_rank,
        previous_rank,
        performance_score,
        adjusted_score,
        streak_bonus,
        streak_count,
        country_code,
        country_name,
        badge_level,
        last_activity_timestamp,
        cache_date
    )
    SELECT 
        us.user_id,
        COALESCE(p.username, 'Anonymous'),
        p.avatar_url,
        ROW_NUMBER() OVER (ORDER BY 
            calculate_adjusted_score(us.performance_score, COALESCE(ust.streak_count, 0)) DESC,
            us.last_activity_timestamp DESC
        ) as global_rank,
        lc.global_rank as previous_rank,
        us.performance_score,
        calculate_adjusted_score(us.performance_score, COALESCE(ust.streak_count, 0)),
        LEAST(COALESCE(ust.streak_count, 0) * 0.05, 0.5),
        COALESCE(ust.streak_count, 0),
        us.country_code,
        c.country_name,
        CASE 
            WHEN us.performance_score >= 90 THEN 'diamond'
            WHEN us.performance_score >= 80 THEN 'platinum'
            WHEN us.performance_score >= 70 THEN 'gold'
            WHEN us.performance_score >= 60 THEN 'silver'
            ELSE 'bronze'
        END as badge_level,
        us.last_activity_timestamp,
        CURRENT_DATE
    FROM user_scores us
    LEFT JOIN user_streaks ust ON us.user_id = ust.user_id
    LEFT JOIN profiles p ON us.user_id = p.id
    LEFT JOIN countries c ON us.country_code = c.code
    LEFT JOIN leaderboard_cache lc ON us.user_id = lc.user_id 
        AND lc.cache_date = CURRENT_DATE - INTERVAL '1 day'
    WHERE us.total_interviews > 0;
    
    -- Update leaderboard history
    INSERT INTO leaderboard_history (user_id, rank_date, global_rank, performance_score, adjusted_score, streak_count)
    SELECT user_id, cache_date, global_rank, performance_score, adjusted_score, streak_count
    FROM leaderboard_cache
    WHERE cache_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own scores
CREATE POLICY "Users can view own scores" ON user_scores
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view all leaderboard data
CREATE POLICY "Public leaderboard view" ON leaderboard_cache
    FOR SELECT USING (true);

-- Users can view their own streaks
CREATE POLICY "Users can view own streaks" ON user_streaks
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own session logs
CREATE POLICY "Users can view own sessions" ON session_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own achievements
CREATE POLICY "Users can view own achievements" ON achievements
    FOR SELECT USING (auth.uid() = user_id);

-- Public can view top achievements
CREATE POLICY "Public achievement showcase" ON achievements
    FOR SELECT USING (achievement_type IN ('top_rank', 'longest_streak'));
