"""
AI Video Interview Platform - Backend API
Production-ready implementation with real-time audio processing
"""

import os
import json
import asyncio
import uuid
import tempfile
import wave
import io
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn
from dotenv import load_dotenv

# Import custom modules
from services.audio_processor import AudioProcessor
from services.speech_to_text import SpeechToTextService
from services.ai_interviewer import AIInterviewerService
from services.database import DatabaseService
from models.interview import Interview, InterviewQuestion, InterviewResponse, FeedbackSummary
from routes import voice_interview

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Video Interview Platform",
    description="Real-time video interview platform with AI interviewer",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
audio_processor = AudioProcessor()
stt_service = SpeechToTextService()
ai_interviewer = AIInterviewerService()
db_service = DatabaseService()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.interview_sessions: Dict[str, Dict] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.interview_sessions[session_id] = {
            "start_time": datetime.now(),
            "transcript": [],
            "questions": [],
            "responses": [],
            "current_question_index": 0,
            "audio_chunks": [],
            "status": "active"
        }

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.interview_sessions:
            self.interview_sessions[session_id]["status"] = "completed"

    async def send_message(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            await connection.send_json(message)

manager = ConnectionManager()

# Pydantic models for request/response
class AudioChunk(BaseModel):
    session_id: str
    chunk_data: str  # Base64 encoded audio
    timestamp: float
    chunk_index: int

class InterviewStart(BaseModel):
    candidate_name: str
    candidate_email: str
    position: str
    interview_type: str = "technical"
    difficulty: str = "medium"

class InterviewEnd(BaseModel):
    session_id: str
    reason: str = "completed"

class TranscriptResponse(BaseModel):
    text: str
    timestamp: float
    confidence: float

class AIResponse(BaseModel):
    assistant_reply: str
    evaluation_json: Dict[str, Any]
    next_question: Optional[str] = None
    interview_complete: bool = False

# API Endpoints

@app.get("/")
async def root():
    return {"message": "AI Video Interview Platform API", "status": "operational"}

@app.post("/api/interview/start")
async def start_interview(interview_data: InterviewStart):
    """Initialize a new interview session"""
    try:
        session_id = str(uuid.uuid4())
        
        # Create interview record in database
        interview = await db_service.create_interview(
            session_id=session_id,
            candidate_name=interview_data.candidate_name,
            candidate_email=interview_data.candidate_email,
            position=interview_data.position,
            interview_type=interview_data.interview_type,
            difficulty=interview_data.difficulty
        )
        
        # Get initial question from AI
        initial_question = await ai_interviewer.get_initial_question(
            position=interview_data.position,
            interview_type=interview_data.interview_type,
            difficulty=interview_data.difficulty
        )
        
        # Store question in database
        await db_service.add_question(
            interview_id=interview.id,
            question_text=initial_question["question"],
            question_type=initial_question["type"]
        )
        
        return {
            "session_id": session_id,
            "interview_id": interview.id,
            "initial_question": initial_question,
            "status": "started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/upload_audio")
async def upload_audio_chunk(audio_chunk: AudioChunk):
    """Process audio chunk and return transcript"""
    try:
        session = manager.interview_sessions.get(audio_chunk.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Decode base64 audio data
        audio_data = audio_processor.decode_base64_audio(audio_chunk.chunk_data)
        
        # Convert to WAV format (mono, 16kHz)
        wav_data = await audio_processor.convert_to_wav(audio_data)
        
        # Save audio chunk temporarily
        temp_path = await audio_processor.save_temp_audio(
            wav_data, 
            session_id=audio_chunk.session_id,
            chunk_index=audio_chunk.chunk_index
        )
        
        # Transcribe audio
        transcript = await stt_service.transcribe(wav_data)
        
        # Add to session transcript
        session["transcript"].append({
            "text": transcript.text,
            "timestamp": audio_chunk.timestamp,
            "confidence": transcript.confidence
        })
        
        # Send transcript back via WebSocket if connected
        await manager.send_message(audio_chunk.session_id, {
            "type": "transcript",
            "data": {
                "text": transcript.text,
                "timestamp": audio_chunk.timestamp,
                "confidence": transcript.confidence
            }
        })
        
        # Process with AI if we have enough transcript
        if len(session["transcript"]) >= 3:  # Process every 3 chunks (~6 seconds)
            await process_ai_response(audio_chunk.session_id)
        
        return {"status": "processed", "transcript": transcript.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_ai_response(session_id: str):
    """Process accumulated transcript with AI interviewer"""
    session = manager.interview_sessions.get(session_id)
    if not session:
        return
    
    # Get recent transcript
    recent_transcript = " ".join([t["text"] for t in session["transcript"][-5:]])
    
    if not recent_transcript.strip():
        return
    
    # Get interview context from database
    interview = await db_service.get_interview_by_session(session_id)
    current_question = session["questions"][-1] if session["questions"] else None
    
    # Get AI response
    ai_response = await ai_interviewer.process_response(
        transcript=recent_transcript,
        current_question=current_question,
        interview_context={
            "position": interview.position,
            "type": interview.interview_type,
            "previous_responses": session["responses"]
        }
    )
    
    # Store response in database
    await db_service.add_response(
        interview_id=interview.id,
        question_id=current_question["id"] if current_question else None,
        transcript=recent_transcript,
        ai_feedback=ai_response.evaluation_json
    )
    
    # Send AI response via WebSocket
    await manager.send_message(session_id, {
        "type": "ai_response",
        "data": {
            "assistant_reply": ai_response.assistant_reply,
            "evaluation": ai_response.evaluation_json,
            "next_question": ai_response.next_question,
            "interview_complete": ai_response.interview_complete
        }
    })
    
    # Add to session responses
    session["responses"].append({
        "transcript": recent_transcript,
        "ai_response": ai_response.dict(),
        "timestamp": datetime.now().isoformat()
    })
    
    # If there's a next question, add it
    if ai_response.next_question and not ai_response.interview_complete:
        session["questions"].append({
            "id": str(uuid.uuid4()),
            "text": ai_response.next_question,
            "timestamp": datetime.now().isoformat()
        })
        await db_service.add_question(
            interview_id=interview.id,
            question_text=ai_response.next_question,
            question_type="follow_up"
        )

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time communication"""
    await manager.connect(websocket, session_id)
    
    try:
        # Send initial connection confirmation
        await manager.send_message(session_id, {
            "type": "connection",
            "data": {"status": "connected", "session_id": session_id}
        })
        
        while True:
            # Receive data from client
            data = await websocket.receive_json()
            
            if data["type"] == "audio_chunk":
                # Process audio chunk
                audio_chunk = AudioChunk(
                    session_id=session_id,
                    chunk_data=data["data"]["chunk"],
                    timestamp=data["data"]["timestamp"],
                    chunk_index=data["data"]["index"]
                )
                await upload_audio_chunk(audio_chunk)
                
            elif data["type"] == "end_interview":
                # End interview
                await end_interview_session(session_id)
                break
                
            elif data["type"] == "ping":
                # Keep connection alive
                await manager.send_message(session_id, {"type": "pong"})
                
    except WebSocketDisconnect:
        manager.disconnect(session_id)
        await end_interview_session(session_id)

@app.post("/api/interview/end")
async def end_interview(end_data: InterviewEnd):
    """End an interview session and generate summary"""
    try:
        return await end_interview_session(end_data.session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def end_interview_session(session_id: str):
    """Helper function to end interview and generate summary"""
    session = manager.interview_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get interview from database
    interview = await db_service.get_interview_by_session(session_id)
    
    # Generate final summary
    summary = await ai_interviewer.generate_summary(
        transcript=session["transcript"],
        responses=session["responses"],
        questions=session["questions"]
    )
    
    # Store summary in database
    await db_service.add_feedback_summary(
        interview_id=interview.id,
        summary=summary
    )
    
    # Update interview status
    await db_service.update_interview_status(interview.id, "completed")
    
    # Clean up session
    manager.disconnect(session_id)
    
    return {
        "status": "completed",
        "interview_id": interview.id,
        "summary": summary,
        "duration": (datetime.now() - session["start_time"]).total_seconds()
    }

@app.get("/api/report/{interview_id}")
async def get_interview_report(interview_id: str):
    """Get complete interview report"""
    try:
        # Get interview data
        interview = await db_service.get_interview(interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Get all questions and responses
        questions = await db_service.get_interview_questions(interview_id)
        responses = await db_service.get_interview_responses(interview_id)
        summary = await db_service.get_feedback_summary(interview_id)
        
        return {
            "interview": interview,
            "questions": questions,
            "responses": responses,
            "summary": summary,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "database": await db_service.health_check(),
            "stt": stt_service.is_available(),
            "ai": ai_interviewer.is_available()
        }
    }

# Include voice interview routes
app.include_router(voice_interview.router)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
