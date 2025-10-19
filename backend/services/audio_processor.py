"""
Audio Processing Service
Handles audio chunk processing, format conversion, and temporary storage
"""

import os
import base64
import tempfile
import wave
import io
import asyncio
from pathlib import Path
from typing import Optional, Tuple
import numpy as np
from pydub import AudioSegment
import ffmpeg
import aiofiles

class AudioProcessor:
    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "interview_audio"
        self.temp_dir.mkdir(exist_ok=True)
        self.target_sample_rate = 16000  # 16kHz for speech recognition
        self.target_channels = 1  # Mono
        
    def decode_base64_audio(self, base64_data: str) -> bytes:
        """Decode base64 encoded audio data"""
        # Remove data URL prefix if present
        if "," in base64_data:
            base64_data = base64_data.split(",")[1]
        return base64.b64decode(base64_data)
    
    async def convert_to_wav(self, audio_data: bytes, input_format: str = "webm") -> bytes:
        """
        Convert audio data to WAV format (mono, 16kHz)
        Uses ffmpeg for robust format conversion
        """
        # Create temporary input file
        with tempfile.NamedTemporaryFile(suffix=f".{input_format}", delete=False) as temp_input:
            temp_input.write(audio_data)
            temp_input_path = temp_input.name
        
        # Create temporary output file
        temp_output_path = tempfile.mktemp(suffix=".wav")
        
        try:
            # Use ffmpeg to convert to WAV
            stream = ffmpeg.input(temp_input_path)
            stream = ffmpeg.output(
                stream,
                temp_output_path,
                acodec='pcm_s16le',
                ac=self.target_channels,
                ar=self.target_sample_rate,
                loglevel='error'
            )
            ffmpeg.run(stream, overwrite_output=True)
            
            # Read the converted WAV file
            async with aiofiles.open(temp_output_path, 'rb') as f:
                wav_data = await f.read()
            
            return wav_data
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_input_path):
                os.unlink(temp_input_path)
            if os.path.exists(temp_output_path):
                os.unlink(temp_output_path)
    
    async def save_temp_audio(self, audio_data: bytes, session_id: str, chunk_index: int) -> str:
        """Save audio chunk temporarily for processing"""
        session_dir = self.temp_dir / session_id
        session_dir.mkdir(exist_ok=True)
        
        file_path = session_dir / f"chunk_{chunk_index:04d}.wav"
        
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(audio_data)
        
        return str(file_path)
    
    async def merge_audio_chunks(self, session_id: str) -> bytes:
        """Merge all audio chunks for a session into a single file"""
        session_dir = self.temp_dir / session_id
        
        if not session_dir.exists():
            raise ValueError(f"No audio chunks found for session {session_id}")
        
        # Get all chunk files sorted by index
        chunk_files = sorted(session_dir.glob("chunk_*.wav"))
        
        if not chunk_files:
            raise ValueError(f"No audio chunks found for session {session_id}")
        
        # Load and concatenate audio segments
        combined = AudioSegment.empty()
        for chunk_file in chunk_files:
            segment = AudioSegment.from_wav(str(chunk_file))
            combined += segment
        
        # Export to bytes
        output_buffer = io.BytesIO()
        combined.export(output_buffer, format="wav")
        return output_buffer.getvalue()
    
    def cleanup_session(self, session_id: str):
        """Clean up temporary audio files for a session"""
        session_dir = self.temp_dir / session_id
        
        if session_dir.exists():
            for file in session_dir.iterdir():
                file.unlink()
            session_dir.rmdir()
    
    def get_audio_duration(self, audio_data: bytes) -> float:
        """Get duration of audio in seconds"""
        audio_segment = AudioSegment.from_wav(io.BytesIO(audio_data))
        return len(audio_segment) / 1000.0  # Convert milliseconds to seconds
    
    def normalize_audio(self, audio_data: bytes) -> bytes:
        """Normalize audio volume"""
        audio_segment = AudioSegment.from_wav(io.BytesIO(audio_data))
        
        # Normalize to target dBFS
        target_dBFS = -20.0
        change_in_dBFS = target_dBFS - audio_segment.dBFS
        normalized = audio_segment.apply_gain(change_in_dBFS)
        
        # Export to bytes
        output_buffer = io.BytesIO()
        normalized.export(output_buffer, format="wav")
        return output_buffer.getvalue()
    
    async def validate_audio_format(self, audio_data: bytes) -> Tuple[bool, str]:
        """Validate audio format and return status with message"""
        try:
            # Try to load as audio
            audio_segment = AudioSegment.from_wav(io.BytesIO(audio_data))
            
            # Check duration (should be between 0.5 and 10 seconds for a chunk)
            duration = len(audio_segment) / 1000.0
            if duration < 0.5:
                return False, "Audio chunk too short (< 0.5 seconds)"
            if duration > 10:
                return False, "Audio chunk too long (> 10 seconds)"
            
            # Check if audio has content (not silence)
            if audio_segment.dBFS < -60:
                return False, "Audio appears to be silent"
            
            return True, "Valid audio format"
            
        except Exception as e:
            return False, f"Invalid audio format: {str(e)}"
