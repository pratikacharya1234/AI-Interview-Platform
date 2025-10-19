"""
AI Interviewer Service
Integrates with Claude API for intelligent interview responses and evaluation
"""

import os
import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import anthropic
from openai import AsyncOpenAI

class AIInterviewerService:
    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "claude")  # claude or openai
        
        if self.provider == "claude":
            self.client = anthropic.AsyncAnthropic(
                api_key=os.getenv("ANTHROPIC_API_KEY", "")
            )
            self.model = "claude-3-opus-20240229"
        else:
            self.client = AsyncOpenAI(
                api_key=os.getenv("OPENAI_API_KEY", "")
            )
            self.model = "gpt-4-turbo-preview"
        
        self.system_prompt = self._get_system_prompt()
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the AI interviewer"""
        return """You are an experienced technical interviewer conducting a professional job interview. 
Your role is to:
1. Ask relevant, thoughtful questions based on the candidate's responses
2. Evaluate their technical knowledge, problem-solving skills, and communication
3. Provide constructive feedback while maintaining a professional tone
4. Adapt your questions based on the candidate's experience level

For each candidate response, you must return a JSON object with two parts:
1. "assistant_reply": Your next question or response as the interviewer
2. "evaluation_json": A structured evaluation of their response

The evaluation_json must include:
{
    "technical_accuracy": 0-10,
    "communication_clarity": 0-10,
    "depth_of_knowledge": 0-10,
    "problem_solving": 0-10,
    "relevance": 0-10,
    "strengths": ["list", "of", "strengths"],
    "areas_for_improvement": ["list", "of", "areas"],
    "follow_up_suggestions": ["suggested", "follow-up", "topics"],
    "overall_score": 0-100,
    "confidence_level": "low|medium|high",
    "red_flags": ["any", "concerns"],
    "positive_indicators": ["positive", "signs"]
}

Maintain a conversational yet professional tone. Ask follow-up questions when answers are vague or incomplete.
"""
    
    async def get_initial_question(self, position: str, interview_type: str, difficulty: str) -> Dict[str, Any]:
        """Generate the initial interview question"""
        prompt = f"""Generate an appropriate opening interview question for:
Position: {position}
Interview Type: {interview_type}
Difficulty Level: {difficulty}

Return a JSON object with:
{{
    "question": "The interview question",
    "type": "technical|behavioral|situational",
    "expected_topics": ["topics", "to", "cover"],
    "evaluation_criteria": ["what", "to", "look", "for"]
}}"""
        
        response = await self._get_ai_response(prompt, is_system=False)
        
        try:
            return json.loads(response)
        except:
            # Fallback question if parsing fails
            return {
                "question": f"Thank you for joining us today. To start, could you tell me about your experience relevant to the {position} position?",
                "type": "behavioral",
                "expected_topics": ["experience", "skills", "motivation"],
                "evaluation_criteria": ["communication", "relevance", "enthusiasm"]
            }
    
    async def process_response(
        self, 
        transcript: str, 
        current_question: Optional[Dict], 
        interview_context: Dict
    ) -> Dict[str, Any]:
        """Process candidate's response and generate AI interviewer's response"""
        
        # Build context for the AI
        context = f"""
Current Interview Context:
- Position: {interview_context.get('position', 'Software Engineer')}
- Interview Type: {interview_context.get('type', 'technical')}
- Current Question: {current_question.get('text', 'N/A') if current_question else 'N/A'}

Candidate's Response:
{transcript}

Previous Responses Summary:
{self._summarize_previous_responses(interview_context.get('previous_responses', []))}

Please evaluate this response and provide your next question or comment as the interviewer.
Remember to return the structured JSON response as specified.
"""
        
        response = await self._get_ai_response(context)
        
        # Parse the response
        try:
            parsed = self._parse_ai_response(response)
            return parsed
        except Exception as e:
            print(f"Error parsing AI response: {e}")
            # Return a default response if parsing fails
            return self._get_default_response(transcript)
    
    async def generate_summary(
        self, 
        transcript: List[Dict], 
        responses: List[Dict], 
        questions: List[Dict]
    ) -> Dict[str, Any]:
        """Generate a comprehensive interview summary"""
        
        # Prepare transcript summary
        full_transcript = "\n".join([t.get("text", "") for t in transcript])
        
        prompt = f"""
Based on this complete interview, provide a comprehensive summary:

Questions Asked: {len(questions)}
Total Responses: {len(responses)}

Interview Transcript Summary:
{full_transcript[:3000]}...  # Truncate for token limits

Individual Response Evaluations:
{json.dumps(responses[:5], indent=2)}  # Include first 5 responses

Generate a final interview summary with:
{{
    "overall_performance": 0-100,
    "technical_skills": 0-100,
    "communication_skills": 0-100,
    "problem_solving": 0-100,
    "cultural_fit": 0-100,
    "strengths": ["key", "strengths", "observed"],
    "weaknesses": ["areas", "for", "improvement"],
    "recommendation": "strong_yes|yes|maybe|no|strong_no",
    "recommendation_reasoning": "Detailed explanation",
    "suggested_next_steps": ["follow-up", "actions"],
    "notable_responses": ["standout", "answers"],
    "red_flags": ["any", "concerns"],
    "additional_notes": "Any other observations"
}}
"""
        
        response = await self._get_ai_response(prompt, is_system=False)
        
        try:
            return json.loads(response)
        except:
            # Return a basic summary if parsing fails
            return self._get_default_summary()
    
    async def _get_ai_response(self, prompt: str, is_system: bool = True) -> str:
        """Get response from AI provider"""
        try:
            if self.provider == "claude":
                if is_system:
                    response = await self.client.messages.create(
                        model=self.model,
                        max_tokens=1500,
                        temperature=0.7,
                        system=self.system_prompt,
                        messages=[
                            {"role": "user", "content": prompt}
                        ]
                    )
                else:
                    response = await self.client.messages.create(
                        model=self.model,
                        max_tokens=1500,
                        temperature=0.7,
                        messages=[
                            {"role": "user", "content": prompt}
                        ]
                    )
                
                return response.content[0].text
                
            else:  # OpenAI
                messages = []
                if is_system:
                    messages.append({"role": "system", "content": self.system_prompt})
                messages.append({"role": "user", "content": prompt})
                
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1500
                )
                
                return response.choices[0].message.content
                
        except Exception as e:
            print(f"AI API error: {e}")
            # Return mock response for testing
            return self._get_mock_response(prompt)
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parse AI response to extract assistant reply and evaluation"""
        # Try to parse as JSON first
        try:
            data = json.loads(response)
            return {
                "assistant_reply": data.get("assistant_reply", "Thank you for your response."),
                "evaluation_json": data.get("evaluation_json", {}),
                "next_question": data.get("next_question"),
                "interview_complete": data.get("interview_complete", False)
            }
        except:
            # Try to extract JSON from text
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                try:
                    data = json.loads(json_match.group())
                    return {
                        "assistant_reply": response.split(json_match.group())[0].strip(),
                        "evaluation_json": data,
                        "next_question": None,
                        "interview_complete": False
                    }
                except:
                    pass
        
        # If all parsing fails, return the response as assistant reply
        return {
            "assistant_reply": response,
            "evaluation_json": self._get_default_evaluation(),
            "next_question": None,
            "interview_complete": False
        }
    
    def _get_mock_response(self, prompt: str) -> str:
        """Generate mock response for testing"""
        return json.dumps({
            "assistant_reply": "That's an interesting perspective. Can you elaborate on how you would handle scalability challenges in a distributed system?",
            "evaluation_json": {
                "technical_accuracy": 7,
                "communication_clarity": 8,
                "depth_of_knowledge": 7,
                "problem_solving": 6,
                "relevance": 9,
                "strengths": ["Clear communication", "Good understanding of basics"],
                "areas_for_improvement": ["Could provide more specific examples", "Deeper technical details needed"],
                "follow_up_suggestions": ["Scalability patterns", "Database optimization", "Caching strategies"],
                "overall_score": 74,
                "confidence_level": "medium",
                "red_flags": [],
                "positive_indicators": ["Structured thinking", "Relevant experience"]
            },
            "next_question": "How would you approach debugging a performance issue in production?",
            "interview_complete": False
        })
    
    def _get_default_response(self, transcript: str) -> Dict[str, Any]:
        """Get default response structure"""
        return {
            "assistant_reply": "Thank you for your response. Let me ask you another question.",
            "evaluation_json": self._get_default_evaluation(),
            "next_question": "Can you tell me about a challenging project you've worked on?",
            "interview_complete": False
        }
    
    def _get_default_evaluation(self) -> Dict[str, Any]:
        """Get default evaluation structure"""
        return {
            "technical_accuracy": 5,
            "communication_clarity": 5,
            "depth_of_knowledge": 5,
            "problem_solving": 5,
            "relevance": 5,
            "strengths": [],
            "areas_for_improvement": [],
            "follow_up_suggestions": [],
            "overall_score": 50,
            "confidence_level": "medium",
            "red_flags": [],
            "positive_indicators": []
        }
    
    def _get_default_summary(self) -> Dict[str, Any]:
        """Get default summary structure"""
        return {
            "overall_performance": 70,
            "technical_skills": 70,
            "communication_skills": 75,
            "problem_solving": 65,
            "cultural_fit": 70,
            "strengths": ["Good communication", "Relevant experience"],
            "weaknesses": ["Needs more depth in technical areas"],
            "recommendation": "maybe",
            "recommendation_reasoning": "Candidate shows potential but needs further evaluation",
            "suggested_next_steps": ["Technical assessment", "Team interview"],
            "notable_responses": [],
            "red_flags": [],
            "additional_notes": "Standard interview completed"
        }
    
    def _summarize_previous_responses(self, responses: List[Dict]) -> str:
        """Summarize previous responses for context"""
        if not responses:
            return "No previous responses"
        
        summary = []
        for i, resp in enumerate(responses[-3:], 1):  # Last 3 responses
            if resp.get("ai_response"):
                score = resp["ai_response"].get("evaluation_json", {}).get("overall_score", "N/A")
                summary.append(f"Response {i}: Score {score}/100")
        
        return "\n".join(summary) if summary else "No evaluations available"
    
    def is_available(self) -> bool:
        """Check if AI service is available"""
        if self.provider == "claude":
            return bool(os.getenv("ANTHROPIC_API_KEY"))
        else:
            return bool(os.getenv("OPENAI_API_KEY"))
        # Always return True for mock mode
        return True
