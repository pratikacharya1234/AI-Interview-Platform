"""
Database Service
Handles all database operations with Supabase
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from supabase import create_client, Client
from dataclasses import dataclass, asdict
import asyncio

@dataclass
class Interview:
    id: str
    session_id: str
    candidate_name: str
    candidate_email: str
    position: str
    interview_type: str
    difficulty: str
    status: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None

@dataclass
class Question:
    id: str
    interview_id: str
    question_text: str
    question_type: str
    order_index: int
    asked_at: datetime

@dataclass
class Response:
    id: str
    interview_id: str
    question_id: str
    transcript: str
    ai_feedback: Dict[str, Any]
    audio_path: Optional[str]
    responded_at: datetime

@dataclass
class FeedbackSummary:
    id: str
    interview_id: str
    overall_score: float
    technical_skills: float
    communication_skills: float
    problem_solving: float
    cultural_fit: float
    strengths: List[str]
    weaknesses: List[str]
    recommendation: str
    recommendation_reasoning: str
    suggested_next_steps: List[str]
    created_at: datetime

class DatabaseService:
    def __init__(self):
        self.supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        
        if self.supabase_url and self.supabase_key:
            self.client: Client = create_client(self.supabase_url, self.supabase_key)
        else:
            self.client = None
            print("Warning: Supabase credentials not found. Database operations will be mocked.")
        
        # Initialize tables if they don't exist
        asyncio.create_task(self._initialize_tables())
    
    async def _initialize_tables(self):
        """Initialize database tables if they don't exist"""
        if not self.client:
            return
        
        # Tables are created via SQL migrations in production
        # This is just for reference of the schema
        """
        CREATE TABLE IF NOT EXISTS interviews (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            session_id VARCHAR(255) UNIQUE NOT NULL,
            candidate_name VARCHAR(255) NOT NULL,
            candidate_email VARCHAR(255) NOT NULL,
            position VARCHAR(255) NOT NULL,
            interview_type VARCHAR(50) NOT NULL,
            difficulty VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'active',
            started_at TIMESTAMP DEFAULT NOW(),
            ended_at TIMESTAMP,
            duration_seconds INTEGER,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS questions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
            question_text TEXT NOT NULL,
            question_type VARCHAR(50) NOT NULL,
            order_index INTEGER NOT NULL,
            asked_at TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS responses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
            question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
            transcript TEXT NOT NULL,
            ai_feedback JSONB NOT NULL,
            audio_path TEXT,
            responded_at TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS feedback_summary (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
            overall_score DECIMAL(5,2),
            technical_skills DECIMAL(5,2),
            communication_skills DECIMAL(5,2),
            problem_solving DECIMAL(5,2),
            cultural_fit DECIMAL(5,2),
            strengths TEXT[],
            weaknesses TEXT[],
            recommendation VARCHAR(50),
            recommendation_reasoning TEXT,
            suggested_next_steps TEXT[],
            created_at TIMESTAMP DEFAULT NOW()
        );
        """
    
    async def create_interview(
        self,
        session_id: str,
        candidate_name: str,
        candidate_email: str,
        position: str,
        interview_type: str,
        difficulty: str
    ) -> Interview:
        """Create a new interview record"""
        if self.client:
            try:
                data = {
                    "session_id": session_id,
                    "candidate_name": candidate_name,
                    "candidate_email": candidate_email,
                    "position": position,
                    "interview_type": interview_type,
                    "difficulty": difficulty,
                    "status": "active",
                    "started_at": datetime.now().isoformat()
                }
                
                response = self.client.table("interviews").insert(data).execute()
                
                if response.data:
                    record = response.data[0]
                    return Interview(
                        id=record["id"],
                        session_id=record["session_id"],
                        candidate_name=record["candidate_name"],
                        candidate_email=record["candidate_email"],
                        position=record["position"],
                        interview_type=record["interview_type"],
                        difficulty=record["difficulty"],
                        status=record["status"],
                        started_at=datetime.fromisoformat(record["started_at"])
                    )
            except Exception as e:
                print(f"Database error creating interview: {e}")
        
        # Return mock data if database is not available
        return Interview(
            id="mock-interview-id",
            session_id=session_id,
            candidate_name=candidate_name,
            candidate_email=candidate_email,
            position=position,
            interview_type=interview_type,
            difficulty=difficulty,
            status="active",
            started_at=datetime.now()
        )
    
    async def add_question(
        self,
        interview_id: str,
        question_text: str,
        question_type: str,
        order_index: int = 0
    ) -> Question:
        """Add a question to an interview"""
        if self.client:
            try:
                # Get the current question count for order_index
                count_response = self.client.table("questions")\
                    .select("id", count="exact")\
                    .eq("interview_id", interview_id)\
                    .execute()
                
                order_index = count_response.count if count_response.count else 0
                
                data = {
                    "interview_id": interview_id,
                    "question_text": question_text,
                    "question_type": question_type,
                    "order_index": order_index,
                    "asked_at": datetime.now().isoformat()
                }
                
                response = self.client.table("questions").insert(data).execute()
                
                if response.data:
                    record = response.data[0]
                    return Question(
                        id=record["id"],
                        interview_id=record["interview_id"],
                        question_text=record["question_text"],
                        question_type=record["question_type"],
                        order_index=record["order_index"],
                        asked_at=datetime.fromisoformat(record["asked_at"])
                    )
            except Exception as e:
                print(f"Database error adding question: {e}")
        
        # Return mock data
        return Question(
            id="mock-question-id",
            interview_id=interview_id,
            question_text=question_text,
            question_type=question_type,
            order_index=order_index,
            asked_at=datetime.now()
        )
    
    async def add_response(
        self,
        interview_id: str,
        question_id: Optional[str],
        transcript: str,
        ai_feedback: Dict[str, Any],
        audio_path: Optional[str] = None
    ) -> Response:
        """Add a response to a question"""
        if self.client:
            try:
                data = {
                    "interview_id": interview_id,
                    "question_id": question_id,
                    "transcript": transcript,
                    "ai_feedback": json.dumps(ai_feedback),
                    "audio_path": audio_path,
                    "responded_at": datetime.now().isoformat()
                }
                
                response = self.client.table("responses").insert(data).execute()
                
                if response.data:
                    record = response.data[0]
                    return Response(
                        id=record["id"],
                        interview_id=record["interview_id"],
                        question_id=record["question_id"],
                        transcript=record["transcript"],
                        ai_feedback=json.loads(record["ai_feedback"]),
                        audio_path=record.get("audio_path"),
                        responded_at=datetime.fromisoformat(record["responded_at"])
                    )
            except Exception as e:
                print(f"Database error adding response: {e}")
        
        # Return mock data
        return Response(
            id="mock-response-id",
            interview_id=interview_id,
            question_id=question_id or "mock-question-id",
            transcript=transcript,
            ai_feedback=ai_feedback,
            audio_path=audio_path,
            responded_at=datetime.now()
        )
    
    async def add_feedback_summary(
        self,
        interview_id: str,
        summary: Dict[str, Any]
    ) -> FeedbackSummary:
        """Add feedback summary for an interview"""
        if self.client:
            try:
                data = {
                    "interview_id": interview_id,
                    "overall_score": summary.get("overall_performance", 0),
                    "technical_skills": summary.get("technical_skills", 0),
                    "communication_skills": summary.get("communication_skills", 0),
                    "problem_solving": summary.get("problem_solving", 0),
                    "cultural_fit": summary.get("cultural_fit", 0),
                    "strengths": summary.get("strengths", []),
                    "weaknesses": summary.get("weaknesses", []),
                    "recommendation": summary.get("recommendation", "maybe"),
                    "recommendation_reasoning": summary.get("recommendation_reasoning", ""),
                    "suggested_next_steps": summary.get("suggested_next_steps", [])
                }
                
                response = self.client.table("feedback_summary").insert(data).execute()
                
                if response.data:
                    record = response.data[0]
                    return FeedbackSummary(
                        id=record["id"],
                        interview_id=record["interview_id"],
                        overall_score=record["overall_score"],
                        technical_skills=record["technical_skills"],
                        communication_skills=record["communication_skills"],
                        problem_solving=record["problem_solving"],
                        cultural_fit=record["cultural_fit"],
                        strengths=record["strengths"],
                        weaknesses=record["weaknesses"],
                        recommendation=record["recommendation"],
                        recommendation_reasoning=record["recommendation_reasoning"],
                        suggested_next_steps=record["suggested_next_steps"],
                        created_at=datetime.now()
                    )
            except Exception as e:
                print(f"Database error adding feedback summary: {e}")
        
        # Return mock data
        return FeedbackSummary(
            id="mock-summary-id",
            interview_id=interview_id,
            overall_score=summary.get("overall_performance", 70),
            technical_skills=summary.get("technical_skills", 70),
            communication_skills=summary.get("communication_skills", 75),
            problem_solving=summary.get("problem_solving", 65),
            cultural_fit=summary.get("cultural_fit", 70),
            strengths=summary.get("strengths", ["Good communication"]),
            weaknesses=summary.get("weaknesses", ["Needs improvement"]),
            recommendation=summary.get("recommendation", "maybe"),
            recommendation_reasoning=summary.get("recommendation_reasoning", "Candidate shows potential"),
            suggested_next_steps=summary.get("suggested_next_steps", ["Technical assessment"]),
            created_at=datetime.now()
        )
    
    async def update_interview_status(self, interview_id: str, status: str):
        """Update interview status"""
        if self.client:
            try:
                data = {
                    "status": status,
                    "updated_at": datetime.now().isoformat()
                }
                
                if status == "completed":
                    data["ended_at"] = datetime.now().isoformat()
                
                self.client.table("interviews")\
                    .update(data)\
                    .eq("id", interview_id)\
                    .execute()
            except Exception as e:
                print(f"Database error updating interview status: {e}")
    
    async def get_interview(self, interview_id: str) -> Optional[Dict]:
        """Get interview by ID"""
        if self.client:
            try:
                response = self.client.table("interviews")\
                    .select("*")\
                    .eq("id", interview_id)\
                    .single()\
                    .execute()
                
                if response.data:
                    return response.data
            except Exception as e:
                print(f"Database error getting interview: {e}")
        
        # Return mock data
        return {
            "id": interview_id,
            "session_id": "mock-session",
            "candidate_name": "Test Candidate",
            "candidate_email": "test@example.com",
            "position": "Software Engineer",
            "interview_type": "technical",
            "difficulty": "medium",
            "status": "completed",
            "started_at": datetime.now().isoformat(),
            "ended_at": datetime.now().isoformat()
        }
    
    async def get_interview_by_session(self, session_id: str) -> Optional[Interview]:
        """Get interview by session ID"""
        if self.client:
            try:
                response = self.client.table("interviews")\
                    .select("*")\
                    .eq("session_id", session_id)\
                    .single()\
                    .execute()
                
                if response.data:
                    record = response.data
                    return Interview(
                        id=record["id"],
                        session_id=record["session_id"],
                        candidate_name=record["candidate_name"],
                        candidate_email=record["candidate_email"],
                        position=record["position"],
                        interview_type=record["interview_type"],
                        difficulty=record["difficulty"],
                        status=record["status"],
                        started_at=datetime.fromisoformat(record["started_at"]),
                        ended_at=datetime.fromisoformat(record["ended_at"]) if record.get("ended_at") else None
                    )
            except Exception as e:
                print(f"Database error getting interview by session: {e}")
        
        # Return mock data
        return Interview(
            id="mock-interview-id",
            session_id=session_id,
            candidate_name="Test Candidate",
            candidate_email="test@example.com",
            position="Software Engineer",
            interview_type="technical",
            difficulty="medium",
            status="active",
            started_at=datetime.now()
        )
    
    async def get_interview_questions(self, interview_id: str) -> List[Dict]:
        """Get all questions for an interview"""
        if self.client:
            try:
                response = self.client.table("questions")\
                    .select("*")\
                    .eq("interview_id", interview_id)\
                    .order("order_index")\
                    .execute()
                
                if response.data:
                    return response.data
            except Exception as e:
                print(f"Database error getting questions: {e}")
        
        # Return mock data
        return [
            {
                "id": "q1",
                "interview_id": interview_id,
                "question_text": "Tell me about yourself",
                "question_type": "behavioral",
                "order_index": 0,
                "asked_at": datetime.now().isoformat()
            }
        ]
    
    async def get_interview_responses(self, interview_id: str) -> List[Dict]:
        """Get all responses for an interview"""
        if self.client:
            try:
                response = self.client.table("responses")\
                    .select("*")\
                    .eq("interview_id", interview_id)\
                    .order("responded_at")\
                    .execute()
                
                if response.data:
                    return response.data
            except Exception as e:
                print(f"Database error getting responses: {e}")
        
        # Return mock data
        return [
            {
                "id": "r1",
                "interview_id": interview_id,
                "question_id": "q1",
                "transcript": "I am a software engineer with 5 years of experience...",
                "ai_feedback": {
                    "overall_score": 75,
                    "strengths": ["Clear communication"],
                    "areas_for_improvement": ["More specific examples"]
                },
                "responded_at": datetime.now().isoformat()
            }
        ]
    
    async def get_feedback_summary(self, interview_id: str) -> Optional[Dict]:
        """Get feedback summary for an interview"""
        if self.client:
            try:
                response = self.client.table("feedback_summary")\
                    .select("*")\
                    .eq("interview_id", interview_id)\
                    .single()\
                    .execute()
                
                if response.data:
                    return response.data
            except Exception as e:
                print(f"Database error getting feedback summary: {e}")
        
        # Return mock data
        return {
            "id": "summary1",
            "interview_id": interview_id,
            "overall_score": 75,
            "technical_skills": 70,
            "communication_skills": 80,
            "problem_solving": 70,
            "cultural_fit": 75,
            "strengths": ["Good communication", "Relevant experience"],
            "weaknesses": ["Needs more technical depth"],
            "recommendation": "yes",
            "recommendation_reasoning": "Strong candidate with good potential",
            "suggested_next_steps": ["Technical assessment", "Team interview"]
        }
    
    async def health_check(self) -> bool:
        """Check database connection health"""
        if self.client:
            try:
                # Try a simple query
                response = self.client.table("interviews").select("id").limit(1).execute()
                return True
            except:
                return False
        return False  # No client means unhealthy
