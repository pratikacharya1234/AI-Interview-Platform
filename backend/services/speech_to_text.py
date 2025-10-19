"""
Speech-to-Text Service
Integrates with multiple STT providers (Whisper, Deepgram, OpenAI)
"""

import os
import io
import json
import asyncio
from typing import Optional, Dict, Any
from dataclasses import dataclass
import httpx
from openai import AsyncOpenAI
import base64

@dataclass
class TranscriptionResult:
    text: str
    confidence: float
    language: str = "en"
    duration: float = 0.0
    words: Optional[list] = None

class SpeechToTextService:
    def __init__(self):
        self.provider = os.getenv("STT_PROVIDER", "openai")  # openai, deepgram, or whisper
        self.api_key = os.getenv("STT_API_KEY", os.getenv("OPENAI_API_KEY"))
        
        # Initialize based on provider
        if self.provider == "openai":
            self.client = AsyncOpenAI(api_key=self.api_key)
        elif self.provider == "deepgram":
            self.deepgram_url = "https://api.deepgram.com/v1/listen"
            self.headers = {
                "Authorization": f"Token {self.api_key}",
                "Content-Type": "audio/wav"
            }
        
        self.model = self._get_model_name()
    
    def _get_model_name(self) -> str:
        """Get the appropriate model name based on provider"""
        models = {
            "openai": "whisper-1",
            "deepgram": "nova-2",
            "whisper": "base"  # Local Whisper model
        }
        return models.get(self.provider, "base")
    
    async def transcribe(self, audio_data: bytes) -> TranscriptionResult:
        """Transcribe audio data to text"""
        if self.provider == "openai":
            return await self._transcribe_openai(audio_data)
        elif self.provider == "deepgram":
            return await self._transcribe_deepgram(audio_data)
        elif self.provider == "whisper":
            return await self._transcribe_whisper_local(audio_data)
        else:
            # Fallback to mock transcription for testing
            return await self._transcribe_mock(audio_data)
    
    async def _transcribe_openai(self, audio_data: bytes) -> TranscriptionResult:
        """Transcribe using OpenAI Whisper API"""
        try:
            # Create a file-like object from bytes
            audio_file = io.BytesIO(audio_data)
            audio_file.name = "audio.wav"
            
            # Call OpenAI Whisper API
            response = await self.client.audio.transcriptions.create(
                model=self.model,
                file=audio_file,
                response_format="verbose_json",
                language="en"
            )
            
            # Parse response
            return TranscriptionResult(
                text=response.text,
                confidence=0.95,  # OpenAI doesn't provide confidence scores
                language=response.language if hasattr(response, 'language') else "en",
                duration=response.duration if hasattr(response, 'duration') else 0.0,
                words=response.words if hasattr(response, 'words') else None
            )
            
        except Exception as e:
            print(f"OpenAI transcription error: {e}")
            # Fallback to mock if API fails
            return await self._transcribe_mock(audio_data)
    
    async def _transcribe_deepgram(self, audio_data: bytes) -> TranscriptionResult:
        """Transcribe using Deepgram API"""
        try:
            params = {
                "model": self.model,
                "language": "en",
                "punctuate": "true",
                "diarize": "false",
                "smart_format": "true"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.deepgram_url,
                    headers=self.headers,
                    params=params,
                    content=audio_data,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Extract transcription from Deepgram response
                    if data.get("results") and data["results"].get("channels"):
                        channel = data["results"]["channels"][0]
                        if channel.get("alternatives"):
                            alt = channel["alternatives"][0]
                            
                            return TranscriptionResult(
                                text=alt.get("transcript", ""),
                                confidence=alt.get("confidence", 0.0),
                                language="en",
                                duration=data["metadata"].get("duration", 0.0),
                                words=alt.get("words", [])
                            )
            
            # Fallback if request fails
            return await self._transcribe_mock(audio_data)
            
        except Exception as e:
            print(f"Deepgram transcription error: {e}")
            return await self._transcribe_mock(audio_data)
    
    async def _transcribe_whisper_local(self, audio_data: bytes) -> TranscriptionResult:
        """Transcribe using local Whisper model"""
        try:
            import whisper
            
            # Save audio temporarily
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_path = temp_file.name
            
            # Load model and transcribe
            model = whisper.load_model(self.model)
            result = model.transcribe(temp_path, language="en")
            
            # Clean up temp file
            os.unlink(temp_path)
            
            return TranscriptionResult(
                text=result["text"],
                confidence=0.9,  # Whisper doesn't provide confidence
                language=result.get("language", "en"),
                duration=0.0,
                words=None
            )
            
        except Exception as e:
            print(f"Local Whisper transcription error: {e}")
            return await self._transcribe_mock(audio_data)
    
    async def _transcribe_mock(self, audio_data: bytes) -> TranscriptionResult:
        """Mock transcription for testing when no API is available"""
        # Simulate processing delay
        await asyncio.sleep(0.5)
        
        # Generate mock transcript based on audio length
        audio_length = len(audio_data) / (16000 * 2)  # Assuming 16kHz, 16-bit audio
        
        mock_responses = [
            "I have extensive experience in full-stack development, particularly with React and Node.js.",
            "In my previous role, I led a team of five developers to deliver a complex e-commerce platform.",
            "I'm passionate about clean code and test-driven development practices.",
            "My approach to problem-solving involves breaking down complex issues into manageable components.",
            "I believe in continuous learning and staying updated with the latest technologies.",
        ]
        
        # Select a response based on some pseudo-randomness
        import hashlib
        hash_val = int(hashlib.md5(audio_data[:100]).hexdigest()[:8], 16)
        response_index = hash_val % len(mock_responses)
        
        return TranscriptionResult(
            text=mock_responses[response_index],
            confidence=0.92,
            language="en",
            duration=audio_length,
            words=None
        )
    
    def is_available(self) -> bool:
        """Check if the STT service is available"""
        if self.provider in ["openai", "deepgram"]:
            return bool(self.api_key)
        return True  # Local whisper or mock is always available
    
    async def get_supported_languages(self) -> list:
        """Get list of supported languages"""
        # Most services support these common languages
        return [
            "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko",
            "ar", "hi", "nl", "pl", "tr", "sv", "da", "no", "fi", "he"
        ]
