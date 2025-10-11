from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON, Integer, ForeignKey, Float, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.core.database import Base


class InterviewType(str, enum.Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    SYSTEM_DESIGN = "system_design"
    CODING = "coding"
    LEADERSHIP = "leadership"


class InterviewStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"


class DifficultyLevel(str, enum.Enum):
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    PRINCIPAL = "principal"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    # GitHub Integration
    github_username = Column(String, nullable=True, index=True)
    github_id = Column(String, nullable=True, unique=True)
    github_access_token = Column(Text, nullable=True)
    github_profile_data = Column(JSON, nullable=True)
    
    # Profile Information
    experience_level = Column(Enum(DifficultyLevel), nullable=True)
    skills = Column(JSON, nullable=True)  # Array of skills
    target_companies = Column(JSON, nullable=True)  # Array of company names
    preferred_roles = Column(JSON, nullable=True)  # Array of role types
    
    # Settings
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    notifications_enabled = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    performance_metrics = relationship("PerformanceMetric", back_populates="user", cascade="all, delete-orphan")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Interview Configuration
    title = Column(String, nullable=False)
    interview_type = Column(Enum(InterviewType), nullable=False)
    difficulty_level = Column(Enum(DifficultyLevel), nullable=False)
    target_role = Column(String, nullable=True)
    company_focus = Column(String, nullable=True)
    
    # Status and Timing
    status = Column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    # AI Configuration
    ai_model_version = Column(String, default="gpt-4-1106-preview")
    system_prompt = Column(Text, nullable=True)
    context_data = Column(JSON, nullable=True)  # Additional context for AI
    
    # Results
    overall_score = Column(Float, nullable=True)  # 0-100
    detailed_feedback = Column(JSON, nullable=True)
    improvement_areas = Column(JSON, nullable=True)
    strengths = Column(JSON, nullable=True)
    
    # Technical Analysis (for coding interviews)
    code_quality_score = Column(Float, nullable=True)
    problem_solving_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    
    # Recording and Transcription
    recording_url = Column(String, nullable=True)
    transcript = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan")
    responses = relationship("InterviewResponse", back_populates="interview", cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id"), nullable=False)
    
    # Question Data
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)  # "behavioral", "technical", "coding", etc.
    difficulty = Column(Enum(DifficultyLevel), nullable=False)
    expected_duration_minutes = Column(Integer, default=5)
    
    # Question Metadata
    topics = Column(JSON, nullable=True)  # Array of topics/skills tested
    follow_up_questions = Column(JSON, nullable=True)
    evaluation_criteria = Column(JSON, nullable=True)
    
    # AI Generation Context
    generated_by_ai = Column(Boolean, default=True)
    generation_prompt = Column(Text, nullable=True)
    
    # Order and Timing
    sequence_number = Column(Integer, nullable=False)
    asked_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    interview = relationship("Interview", back_populates="questions")
    responses = relationship("InterviewResponse", back_populates="question", cascade="all, delete-orphan")


class InterviewResponse(Base):
    __tablename__ = "interview_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("interview_questions.id"), nullable=False)
    
    # Response Data
    response_text = Column(Text, nullable=True)
    response_audio_url = Column(String, nullable=True)
    response_duration_seconds = Column(Integer, nullable=True)
    
    # Code Responses (for coding questions)
    code_solution = Column(Text, nullable=True)
    programming_language = Column(String, nullable=True)
    test_cases_passed = Column(Integer, nullable=True)
    total_test_cases = Column(Integer, nullable=True)
    
    # AI Analysis
    ai_score = Column(Float, nullable=True)  # 0-100
    ai_feedback = Column(JSON, nullable=True)
    key_points_covered = Column(JSON, nullable=True)
    missed_opportunities = Column(JSON, nullable=True)
    
    # Behavioral Analysis
    confidence_level = Column(Float, nullable=True)  # 0-1
    clarity_score = Column(Float, nullable=True)  # 0-1
    relevance_score = Column(Float, nullable=True)  # 0-1
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    interview = relationship("Interview", back_populates="responses")
    question = relationship("InterviewQuestion", back_populates="responses")


class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Time Period
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    
    # Performance Scores
    overall_improvement_rate = Column(Float, nullable=True)  # Percentage improvement
    average_interview_score = Column(Float, nullable=True)
    technical_skills_score = Column(Float, nullable=True)
    communication_skills_score = Column(Float, nullable=True)
    problem_solving_score = Column(Float, nullable=True)
    
    # Statistics
    total_interviews = Column(Integer, default=0)
    completed_interviews = Column(Integer, default=0)
    average_preparation_time = Column(Integer, nullable=True)  # minutes
    
    # Skill Breakdown
    skill_scores = Column(JSON, nullable=True)  # Dict of skill -> score
    weak_areas = Column(JSON, nullable=True)  # Array of areas needing improvement
    strong_areas = Column(JSON, nullable=True)  # Array of strengths
    
    # Goals and Recommendations
    recommended_focus_areas = Column(JSON, nullable=True)
    achievement_milestones = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="performance_metrics")


class QuestionBank(Base):
    __tablename__ = "question_bank"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Question Content
    question_text = Column(Text, nullable=False)
    question_type = Column(Enum(InterviewType), nullable=False)
    difficulty = Column(Enum(DifficultyLevel), nullable=False)
    
    # Categorization
    skills_tested = Column(JSON, nullable=False)  # Array of skills
    topics = Column(JSON, nullable=False)  # Array of topics
    industry_focus = Column(JSON, nullable=True)  # Array of industries
    
    # Usage Statistics
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, nullable=True)  # Based on user performance
    average_response_time = Column(Integer, nullable=True)  # seconds
    
    # Question Metadata
    source = Column(String, nullable=True)  # "ai_generated", "curated", "community"
    follow_up_questions = Column(JSON, nullable=True)
    evaluation_rubric = Column(JSON, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    quality_score = Column(Float, nullable=True)  # Internal quality rating
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AIAnalysisLog(Base):
    __tablename__ = "ai_analysis_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id"), nullable=False)
    
    # AI Processing Details
    model_version = Column(String, nullable=False)
    processing_type = Column(String, nullable=False)  # "question_generation", "response_analysis", etc.
    input_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    
    # Results
    analysis_result = Column(JSON, nullable=True)
    confidence_score = Column(Float, nullable=True)
    
    # Debugging
    prompt_used = Column(Text, nullable=True)
    raw_response = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())