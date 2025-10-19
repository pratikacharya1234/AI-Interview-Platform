"""
Interview Models
Data models for the interview platform
"""

from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from datetime import datetime

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
class InterviewQuestion:
    id: str
    interview_id: str
    question_text: str
    question_type: str
    order_index: int
    asked_at: datetime

@dataclass
class InterviewResponse:
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
