"""
AI Interview Pro - Ranking and Streak Calculation Engine
Handles daily leaderboard updates and streak calculations
"""

import os
import asyncio
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional, Tuple
from decimal import Decimal
import logging
from dataclasses import dataclass
import asyncpg
from supabase import create_client, Client
import numpy as np
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# FastAPI app
app = FastAPI(title="AI Interview Pro Ranking Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@dataclass
class UserScore:
    """User score data model"""
    user_id: str
    ai_accuracy_score: float
    communication_score: float
    completion_rate: float
    performance_score: float
    streak_count: int
    last_activity: datetime
    country_code: Optional[str] = None

@dataclass
class RankingResult:
    """Ranking calculation result"""
    user_id: str
    global_rank: int
    performance_score: float
    adjusted_score: float
    streak_bonus: float
    rank_change: int
    badge_level: str

class RankingEngine:
    """Main ranking calculation engine"""
    
    def __init__(self):
        self.db_pool = None
        self.scheduler = AsyncIOScheduler()
        
    async def init_db(self):
        """Initialize database connection pool"""
        self.db_pool = await asyncpg.create_pool(DATABASE_URL)
        
    async def close_db(self):
        """Close database connection pool"""
        if self.db_pool:
            await self.db_pool.close()
    
    def calculate_performance_score(
        self, 
        ai_accuracy: float, 
        communication: float, 
        completion_rate: float
    ) -> float:
        """
        Calculate performance score using weighted formula
        Formula: (0.6 * ai_accuracy) + (0.3 * communication) + (0.1 * completion_rate)
        """
        return round((0.6 * ai_accuracy) + (0.3 * communication) + (0.1 * completion_rate), 2)
    
    def calculate_streak_bonus(self, streak_days: int) -> float:
        """
        Calculate streak bonus multiplier
        Formula: min(streak_days * 0.05, 0.5)
        Max bonus is 50% at 10+ days
        """
        return min(streak_days * 0.05, 0.5)
    
    def calculate_adjusted_score(self, performance_score: float, streak_days: int) -> float:
        """
        Calculate adjusted score with streak bonus
        Formula: performance_score * (1 + streak_bonus)
        """
        streak_bonus = self.calculate_streak_bonus(streak_days)
        return round(performance_score * (1 + streak_bonus), 2)
    
    def determine_badge_level(self, score: float) -> str:
        """Determine badge level based on performance score"""
        if score >= 90:
            return "diamond"
        elif score >= 80:
            return "platinum"
        elif score >= 70:
            return "gold"
        elif score >= 60:
            return "silver"
        else:
            return "bronze"
    
    async def update_user_streak(self, user_id: str, session_date: date) -> Dict:
        """Update user streak based on session activity"""
        async with self.db_pool.acquire() as conn:
            # Get current streak info
            streak_info = await conn.fetchrow(
                """
                SELECT last_active_date, streak_count, longest_streak, total_sessions
                FROM user_streaks
                WHERE user_id = $1
                """,
                user_id
            )
            
            if not streak_info:
                # First session, create new streak
                await conn.execute(
                    """
                    INSERT INTO user_streaks (user_id, last_active_date, streak_count, total_sessions)
                    VALUES ($1, $2, 1, 1)
                    """,
                    user_id, session_date
                )
                return {"streak_count": 1, "status": "new"}
            
            last_active = streak_info['last_active_date']
            current_streak = streak_info['streak_count']
            longest_streak = streak_info['longest_streak']
            
            # Calculate days difference
            days_diff = (session_date - last_active).days
            
            if days_diff == 0:
                # Same day, just increment session count
                await conn.execute(
                    """
                    UPDATE user_streaks 
                    SET total_sessions = total_sessions + 1,
                        updated_at = NOW()
                    WHERE user_id = $1
                    """,
                    user_id
                )
                return {"streak_count": current_streak, "status": "maintained"}
            
            elif days_diff == 1:
                # Consecutive day, increment streak
                new_streak = current_streak + 1
                new_longest = max(longest_streak, new_streak)
                
                await conn.execute(
                    """
                    UPDATE user_streaks 
                    SET streak_count = $2,
                        last_active_date = $3,
                        total_sessions = total_sessions + 1,
                        longest_streak = $4,
                        updated_at = NOW()
                    WHERE user_id = $1
                    """,
                    user_id, new_streak, session_date, new_longest
                )
                
                # Check for streak achievements
                await self.check_streak_achievements(user_id, new_streak)
                
                return {"streak_count": new_streak, "status": "increased"}
            
            else:
                # Streak broken, reset to 1
                await conn.execute(
                    """
                    UPDATE user_streaks 
                    SET streak_count = 1,
                        last_active_date = $2,
                        total_sessions = total_sessions + 1,
                        updated_at = NOW()
                    WHERE user_id = $1
                    """,
                    user_id, session_date
                )
                return {"streak_count": 1, "status": "reset"}
    
    async def check_streak_achievements(self, user_id: str, streak_count: int):
        """Check and award streak achievements"""
        milestones = [3, 7, 14, 30, 60, 100]
        
        if streak_count in milestones:
            async with self.db_pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO achievements (
                        user_id, 
                        achievement_type, 
                        achievement_name, 
                        achievement_description,
                        streak_milestone
                    )
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (user_id, achievement_type) DO NOTHING
                    """,
                    user_id,
                    f"streak_{streak_count}",
                    f"{streak_count} Day Streak",
                    f"Maintained a {streak_count} day practice streak",
                    streak_count
                )
    
    async def calculate_global_rankings(self) -> List[RankingResult]:
        """Calculate global rankings for all users"""
        async with self.db_pool.acquire() as conn:
            # Get all user scores with streaks
            users = await conn.fetch(
                """
                SELECT 
                    us.user_id,
                    us.ai_accuracy_score,
                    us.communication_score,
                    us.completion_rate,
                    us.performance_score,
                    us.last_activity_timestamp,
                    us.country_code,
                    COALESCE(ust.streak_count, 0) as streak_count,
                    lc.global_rank as previous_rank
                FROM user_scores us
                LEFT JOIN user_streaks ust ON us.user_id = ust.user_id
                LEFT JOIN leaderboard_cache lc ON us.user_id = lc.user_id 
                    AND lc.cache_date = CURRENT_DATE - INTERVAL '1 day'
                WHERE us.total_interviews > 0
                ORDER BY us.performance_score DESC, us.last_activity_timestamp DESC
                """
            )
            
            rankings = []
            
            # Calculate adjusted scores and sort
            scored_users = []
            for user in users:
                adjusted_score = self.calculate_adjusted_score(
                    user['performance_score'],
                    user['streak_count']
                )
                scored_users.append({
                    **user,
                    'adjusted_score': adjusted_score,
                    'streak_bonus': self.calculate_streak_bonus(user['streak_count'])
                })
            
            # Sort by adjusted score, then by last activity (tie-breaker)
            scored_users.sort(
                key=lambda x: (x['adjusted_score'], x['last_activity_timestamp']),
                reverse=True
            )
            
            # Assign ranks
            for rank, user in enumerate(scored_users, 1):
                prev_rank = user['previous_rank'] or rank
                rank_change = prev_rank - rank
                
                ranking = RankingResult(
                    user_id=user['user_id'],
                    global_rank=rank,
                    performance_score=user['performance_score'],
                    adjusted_score=user['adjusted_score'],
                    streak_bonus=user['streak_bonus'],
                    rank_change=rank_change,
                    badge_level=self.determine_badge_level(user['performance_score'])
                )
                rankings.append(ranking)
            
            return rankings
    
    async def update_leaderboard_cache(self):
        """Update the leaderboard cache with latest rankings"""
        try:
            logger.info("Starting leaderboard cache update...")
            
            # Calculate rankings
            rankings = await self.calculate_global_rankings()
            
            async with self.db_pool.acquire() as conn:
                # Clear old cache
                await conn.execute(
                    "DELETE FROM leaderboard_cache WHERE cache_date < CURRENT_DATE"
                )
                
                # Insert new rankings
                for ranking in rankings:
                    await conn.execute(
                        """
                        INSERT INTO leaderboard_cache (
                            user_id,
                            username,
                            global_rank,
                            previous_rank,
                            performance_score,
                            adjusted_score,
                            streak_bonus,
                            streak_count,
                            badge_level,
                            last_activity_timestamp,
                            cache_date
                        )
                        SELECT 
                            $1,
                            COALESCE(p.username, 'Anonymous'),
                            $2,
                            $3,
                            $4,
                            $5,
                            $6,
                            ust.streak_count,
                            $7,
                            us.last_activity_timestamp,
                            CURRENT_DATE
                        FROM user_scores us
                        LEFT JOIN profiles p ON us.user_id = p.id
                        LEFT JOIN user_streaks ust ON us.user_id = ust.user_id
                        WHERE us.user_id = $1
                        ON CONFLICT (user_id, cache_date) 
                        DO UPDATE SET
                            global_rank = EXCLUDED.global_rank,
                            previous_rank = EXCLUDED.previous_rank,
                            performance_score = EXCLUDED.performance_score,
                            adjusted_score = EXCLUDED.adjusted_score,
                            streak_bonus = EXCLUDED.streak_bonus,
                            badge_level = EXCLUDED.badge_level,
                            updated_at = NOW()
                        """,
                        ranking.user_id,
                        ranking.global_rank,
                        ranking.global_rank + ranking.rank_change,
                        ranking.performance_score,
                        ranking.adjusted_score,
                        ranking.streak_bonus,
                        ranking.badge_level
                    )
                
                # Update history
                await conn.execute(
                    """
                    INSERT INTO leaderboard_history (
                        user_id, rank_date, global_rank, 
                        performance_score, adjusted_score, streak_count
                    )
                    SELECT 
                        user_id, cache_date, global_rank,
                        performance_score, adjusted_score, streak_count
                    FROM leaderboard_cache
                    WHERE cache_date = CURRENT_DATE
                    ON CONFLICT (user_id, rank_date) DO NOTHING
                    """
                )
                
            logger.info(f"Leaderboard cache updated with {len(rankings)} users")
            return {"status": "success", "users_ranked": len(rankings)}
            
        except Exception as e:
            logger.error(f"Error updating leaderboard cache: {e}")
            raise

# Initialize engine
engine = RankingEngine()

# API Endpoints
class SessionData(BaseModel):
    user_id: str
    ai_accuracy_score: float
    communication_score: float
    completed: bool

@app.on_event("startup")
async def startup_event():
    """Initialize database and scheduler on startup"""
    await engine.init_db()
    
    # Schedule daily ranking update at midnight UTC
    engine.scheduler.add_job(
        engine.update_leaderboard_cache,
        'cron',
        hour=0,
        minute=0,
        timezone='UTC'
    )
    engine.scheduler.start()
    logger.info("Ranking engine started with scheduled jobs")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    engine.scheduler.shutdown()
    await engine.close_db()

@app.post("/api/ranking/session")
async def record_session(session: SessionData, background_tasks: BackgroundTasks):
    """Record a new session and update streaks"""
    try:
        # Update streak in background
        background_tasks.add_task(
            engine.update_user_streak,
            session.user_id,
            date.today()
        )
        
        # Calculate and update performance score
        performance_score = engine.calculate_performance_score(
            session.ai_accuracy_score,
            session.communication_score,
            100.0 if session.completed else 0.0
        )
        
        return {
            "status": "success",
            "performance_score": performance_score
        }
    except Exception as e:
        logger.error(f"Error recording session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ranking/update")
async def trigger_ranking_update(background_tasks: BackgroundTasks):
    """Manually trigger ranking update"""
    try:
        background_tasks.add_task(engine.update_leaderboard_cache)
        return {"status": "triggered", "message": "Ranking update started"}
    except Exception as e:
        logger.error(f"Error triggering update: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ranking/stats/{user_id}")
async def get_user_stats(user_id: str):
    """Get user ranking statistics"""
    try:
        async with engine.db_pool.acquire() as conn:
            stats = await conn.fetchrow(
                """
                SELECT 
                    lc.global_rank,
                    lc.previous_rank,
                    lc.rank_change,
                    lc.performance_score,
                    lc.adjusted_score,
                    lc.streak_bonus,
                    lc.streak_count,
                    lc.badge_level,
                    ust.longest_streak,
                    ust.total_sessions
                FROM leaderboard_cache lc
                LEFT JOIN user_streaks ust ON lc.user_id = ust.user_id
                WHERE lc.user_id = $1 AND lc.cache_date = CURRENT_DATE
                """,
                user_id
            )
            
            if not stats:
                raise HTTPException(status_code=404, detail="User stats not found")
            
            return dict(stats)
    except Exception as e:
        logger.error(f"Error fetching user stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
