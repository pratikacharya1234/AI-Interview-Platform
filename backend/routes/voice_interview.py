"""
Voice Interview Routes for FastAPI Backend
Handles real-time voice interview processing
"""

import os
import json
import base64
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import tempfile

from services.audio_processor import AudioProcessor
from services.speech_to_text import SpeechToTextService
from services.ai_interviewer import AIInterviewerService
from services.database import DatabaseService

router = APIRouter(prefix="/voice-interview", tags=["voice-interview"])

# Initialize services
audio_processor = AudioProcessor()
stt_service = SpeechToTextService()
ai_service = AIInterviewerService()
db_service = DatabaseService()

# Request/Response models
class StartInterviewRequest(BaseModel):
    user_id: str
    user_name: str
    company: str
    position: str
    experience: str

class ProcessTextRequest(BaseModel):
    session_id: str
    transcript: str
    stage: str

class CompleteInterviewRequest(BaseModel):
    session_id: str
    responses: List[Dict[str, Any]]

class TTSRequest(BaseModel):
    text: str
    voice: str = "rachel"

@router.post("/start")
async def start_interview(request: StartInterviewRequest):
    """Initialize a new voice interview session"""
    try:
        # Create session ID
        session_id = f"voice_{datetime.now().timestamp()}_{os.urandom(4).hex()}"
        
        # Create system prompt
        system_prompt = f"""You are an AI interviewer conducting a professional voice-based job interview. 
        The candidate's name is {request.user_name}, applying for {request.position} at {request.company}, 
        with {request.experience} experience. Ask one question at a time, adapting to the user's previous 
        answer and experience level. Keep tone natural and professional. Follow the stages introduction, 
        technical, scenario, and closing. Generate contextually relevant follow-up questions. 
        Return structured JSON output containing the next question, short analysis of the last response, 
        and stage label."""
        
        # Store session in database
        session_data = {
            "id": session_id,
            "user_id": request.user_id,
            "company": request.company,
            "position": request.position,
            "experience": request.experience,
            "status": "active",
            "stage": "introduction",
            "started_at": datetime.now().isoformat(),
            "metadata": {
                "user_name": request.user_name,
                "system_prompt": system_prompt
            }
        }
        
        await db_service.create_interview(session_data)
        
        # Generate first question
        first_question = generate_first_question(
            request.user_name,
            request.position,
            request.company,
            request.experience
        )
        
        return {
            "session": session_data,
            "first_question": first_question
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-audio")
async def process_audio(
    audio: UploadFile = File(...),
    session_id: str = Form(...)
):
    """Process audio chunk and return transcript with AI response"""
    try:
        # Save audio temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_file:
            content = await audio.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        # Convert audio to WAV
        wav_path = await audio_processor.convert_to_wav(tmp_path)
        
        # Transcribe audio
        transcript = await stt_service.transcribe(wav_path)
        
        # Clean up temp files
        os.unlink(tmp_path)
        os.unlink(wav_path)
        
        if not transcript:
            raise HTTPException(status_code=400, detail="Failed to transcribe audio")
        
        # Process transcript
        return await process_transcript_response(session_id, transcript)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-text")
async def process_text(request: ProcessTextRequest):
    """Process text transcript directly"""
    try:
        return await process_transcript_response(
            request.session_id,
            request.transcript
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_transcript_response(session_id: str, transcript: str):
    """Process transcript and generate AI response"""
    
    # Get session data
    session = await db_service.get_interview(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get previous responses
    previous_responses = await db_service.get_responses(session_id)
    
    # Determine stage and progress
    response_count = len(previous_responses) + 1
    stage, progress = determine_stage_progress(response_count)
    
    # Generate AI response
    ai_response = await ai_service.generate_interview_response(
        session["metadata"]["system_prompt"],
        transcript,
        previous_responses,
        stage,
        session["experience"]
    )
    
    # Save response to database
    response_data = {
        "interview_id": session_id,
        "question": ai_response.get("current_question", ""),
        "answer": transcript,
        "analysis": ai_response.get("analysis", {}),
        "timestamp": datetime.now().isoformat(),
        "stage": stage
    }
    
    response_id = await db_service.save_response(response_data)
    
    # Update session
    await db_service.update_interview(session_id, {
        "stage": stage,
        "metadata": {
            **session.get("metadata", {}),
            "progress": progress,
            "question_count": response_count
        }
    })
    
    return {
        "response_id": response_id,
        "transcript": transcript,
        "analysis": ai_response.get("analysis", {}),
        "next_question": ai_response.get("next_question", ""),
        "stage": stage,
        "progress": progress
    }

@router.post("/complete")
async def complete_interview(request: CompleteInterviewRequest):
    """Complete interview and generate feedback"""
    try:
        # Get session data
        session = await db_service.get_interview(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get all responses
        responses = await db_service.get_responses(request.session_id)
        
        # Generate comprehensive feedback
        feedback = await ai_service.generate_feedback(
            session,
            responses or request.responses
        )
        
        # Update interview with feedback
        await db_service.update_interview(request.session_id, {
            "status": "completed",
            "ended_at": datetime.now().isoformat(),
            "feedback_summary": feedback
        })
        
        return {
            "feedback": feedback,
            "session_id": request.session_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech"""
    try:
        # Use TTS service (ElevenLabs, Google TTS, etc.)
        audio_data = await generate_speech(request.text, request.voice)
        
        if audio_data:
            return {
                "audio": base64.b64encode(audio_data).decode(),
                "format": "mp3"
            }
        else:
            raise HTTPException(status_code=503, detail="TTS service unavailable")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_first_question(name: str, position: str, company: str, experience: str) -> str:
    """Generate the first interview question based on context"""
    
    questions = {
        "entry": f"Hello {name}! Welcome to your interview for the {position} position at {company}. "
                f"I'm excited to learn about your background and aspirations. To start, could you tell me "
                f"what attracted you to this role and {company}?",
        
        "mid": f"Good to meet you, {name}. Thank you for your interest in the {position} role at {company}. "
               f"With your experience level, I'm curious to hear about your career journey. Could you walk me "
               f"through your relevant experience and what brings you to this opportunity?",
        
        "senior": f"Welcome {name}. I appreciate you taking the time to discuss the {position} position at {company}. "
                 f"Given your senior-level experience, I'd like to start by understanding your leadership philosophy "
                 f"and how you've applied it in your recent roles.",
        
        "lead": f"Hello {name}, thank you for considering the {position} role at {company}. As someone with extensive "
               f"experience, I'm interested in your strategic vision. Could you share how you've driven organizational "
               f"change and innovation in your previous positions?"
    }
    
    return questions.get(experience, questions["entry"])

def determine_stage_progress(response_count: int) -> tuple[str, float]:
    """Determine interview stage and progress based on response count"""
    
    if response_count <= 2:
        return "introduction", response_count * 12.5
    elif response_count <= 5:
        return "technical", 25 + ((response_count - 2) * 12.5)
    elif response_count <= 7:
        return "scenario", 62.5 + ((response_count - 5) * 12.5)
    elif response_count <= 8:
        return "closing", 87.5 + ((response_count - 7) * 12.5)
    else:
        return "completed", 100

async def generate_speech(text: str, voice: str) -> Optional[bytes]:
    """Generate speech from text using TTS service"""
    
    # Try ElevenLabs
    if os.getenv("ELEVENLABS_API_KEY"):
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
                    headers={"xi-api-key": os.getenv("ELEVENLABS_API_KEY")},
                    json={
                        "text": text,
                        "model_id": "eleven_monolingual_v1",
                        "voice_settings": {
                            "stability": 0.5,
                            "similarity_boost": 0.75
                        }
                    }
                )
                if response.status_code == 200:
                    return response.content
        except Exception as e:
            print(f"ElevenLabs TTS error: {e}")
    
    # Try Google TTS
    if os.getenv("GOOGLE_CLOUD_API_KEY"):
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"https://texttospeech.googleapis.com/v1/text:synthesize",
                    params={"key": os.getenv("GOOGLE_CLOUD_API_KEY")},
                    json={
                        "input": {"text": text},
                        "voice": {
                            "languageCode": "en-US",
                            "name": "en-US-Neural2-F",
                            "ssmlGender": "FEMALE"
                        },
                        "audioConfig": {
                            "audioEncoding": "MP3",
                            "speakingRate": 1.0
                        }
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return base64.b64decode(data["audioContent"])
        except Exception as e:
            print(f"Google TTS error: {e}")
    
    return None
