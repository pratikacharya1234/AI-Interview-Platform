from typing import List, Dict, Any, Optional, Tuple
from openai import AsyncOpenAI
from app.core.config import settings
from app.models.database import InterviewType, DifficultyLevel
import json
import asyncio


class AIInterviewEngine:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
    
    async def generate_interview_questions(
        self, 
        interview_type: InterviewType,
        difficulty: DifficultyLevel,
        target_role: str,
        skills: List[str],
        github_profile: Optional[Dict[str, Any]] = None,
        num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        """Generate contextual interview questions based on user profile."""
        
        # Build context from GitHub profile
        github_context = ""
        if github_profile:
            github_context = f"""
            GitHub Profile Analysis:
            - Username: {github_profile.get('login', 'N/A')}
            - Repositories: {github_profile.get('public_repos', 0)}
            - Top Languages: {', '.join(github_profile.get('languages', [])[:3])}
            - Recent Projects: {', '.join([repo.get('name', '') for repo in github_profile.get('recent_repos', [])[:2]])}
            - Contribution Activity: {github_profile.get('contributions_summary', 'N/A')}
            """
        
        system_prompt = self._get_question_generation_prompt(
            interview_type, difficulty, target_role, skills, github_context
        )
        
        user_prompt = f"""
        Generate {num_questions} interview questions for a {difficulty.value} level {target_role} position.
        
        Requirements:
        - Questions should be realistic and commonly asked by top tech companies
        - Difficulty appropriate for {difficulty.value} level candidates
        - Cover key skills: {', '.join(skills)}
        - Include follow-up questions and evaluation criteria
        
        Return as JSON array with this structure:
        [
            {{
                "question_text": "Main interview question",
                "question_type": "{interview_type.value}",
                "difficulty": "{difficulty.value}",
                "topics": ["topic1", "topic2"],
                "expected_duration_minutes": 10,
                "follow_up_questions": ["Follow-up 1", "Follow-up 2"],
                "evaluation_criteria": [
                    {{"criterion": "Technical Accuracy", "weight": 0.4}},
                    {{"criterion": "Problem Solving", "weight": 0.3}},
                    {{"criterion": "Communication", "weight": 0.3}}
                ]
            }}
        ]
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )
            
            questions_json = response.choices[0].message.content
            questions = json.loads(questions_json)
            
            # Add sequence numbers
            for i, question in enumerate(questions):
                question["sequence_number"] = i + 1
                question["generated_by_ai"] = True
            
            return questions
        
        except Exception as e:
            # Fallback to predefined questions if AI generation fails
            return self._get_fallback_questions(interview_type, difficulty, num_questions)
    
    async def analyze_response(
        self,
        question: str,
        response: str,
        question_type: str,
        evaluation_criteria: List[Dict[str, Any]],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze candidate response and provide detailed feedback."""
        
        system_prompt = f"""
        You are an expert technical interviewer analyzing candidate responses.
        
        Your role is to:
        1. Evaluate the response against the given criteria
        2. Provide constructive, specific feedback
        3. Identify strengths and areas for improvement
        4. Score each evaluation criterion objectively
        
        Focus on:
        - Technical accuracy and depth of knowledge
        - Problem-solving approach and methodology
        - Communication clarity and structure
        - Completeness of the answer
        - Real-world applicability
        
        Be fair but thorough in your assessment.
        """
        
        criteria_text = "\n".join([
            f"- {criterion['criterion']}: {criterion.get('description', 'No description')} (Weight: {criterion['weight']})"
            for criterion in evaluation_criteria
        ])
        
        user_prompt = f"""
        Analyze this interview response:
        
        Question: {question}
        Question Type: {question_type}
        
        Candidate Response: {response}
        
        Evaluation Criteria:
        {criteria_text}
        
        Additional Context: {json.dumps(context) if context else "None"}
        
        Provide analysis in this JSON format:
        {{
            "overall_score": 85,
            "criterion_scores": {{
                "Technical Accuracy": 90,
                "Problem Solving": 85,
                "Communication": 80
            }},
            "strengths": [
                "Clear explanation of core concepts",
                "Good use of examples"
            ],
            "areas_for_improvement": [
                "Could elaborate on edge cases",
                "Consider scalability implications"
            ],
            "detailed_feedback": "The candidate demonstrated solid understanding...",
            "key_points_covered": [
                "Point 1",
                "Point 2"
            ],
            "missed_opportunities": [
                "Could have mentioned X",
                "Opportunity to discuss Y"
            ],
            "confidence_assessment": 0.8,
            "clarity_score": 0.85,
            "relevance_score": 0.9,
            "follow_up_suggestions": [
                "Ask about handling at scale",
                "Discuss alternative approaches"
            ]
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,  # Lower temperature for more consistent analysis
                max_tokens=2000
            )
            
            analysis_json = response.choices[0].message.content
            analysis = json.loads(analysis_json)
            
            return analysis
        
        except Exception as e:
            # Return basic analysis if AI fails
            return self._get_fallback_analysis(response)
    
    async def generate_interview_summary(
        self,
        interview_data: Dict[str, Any],
        responses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate comprehensive interview summary and recommendations."""
        
        system_prompt = """
        You are a senior technical interviewer creating a comprehensive interview summary.
        
        Analyze the overall performance across all questions and provide:
        1. Overall assessment and score
        2. Key strengths demonstrated
        3. Areas needing improvement
        4. Specific recommendations for skill development
        5. Readiness assessment for the target role
        
        Be professional, constructive, and actionable in your feedback.
        """
        
        # Prepare interview context
        questions_and_responses = []
        for response in responses:
            questions_and_responses.append({
                "question": response.get("question_text", ""),
                "response": response.get("response_text", ""),
                "score": response.get("ai_score", 0)
            })
        
        user_prompt = f"""
        Interview Summary Analysis:
        
        Position: {interview_data.get('target_role', 'Software Engineer')}
        Level: {interview_data.get('difficulty_level', 'mid')}
        Type: {interview_data.get('interview_type', 'technical')}
        Duration: {interview_data.get('duration_minutes', 60)} minutes
        
        Questions and Responses:
        {json.dumps(questions_and_responses, indent=2)}
        
        Provide comprehensive summary in this JSON format:
        {{
            "overall_score": 78,
            "performance_level": "Strong with areas for growth",
            "key_strengths": [
                "Excellent problem-solving methodology",
                "Clear communication style"
            ],
            "improvement_areas": [
                "System design scalability concepts",
                "Advanced algorithmic optimization"
            ],
            "skill_breakdown": {{
                "technical_knowledge": 85,
                "problem_solving": 80,
                "communication": 90,
                "coding_ability": 75
            }},
            "readiness_assessment": {{
                "current_level": "Mid-level",
                "target_level": "Senior",
                "gap_analysis": "Strong foundation, needs experience with large-scale systems"
            }},
            "recommendations": [
                "Practice system design problems focusing on scalability",
                "Study advanced data structures and algorithms",
                "Work on a large-scale distributed system project"
            ],
            "next_steps": [
                "Schedule follow-up behavioral interview",
                "Complete take-home coding challenge",
                "Prepare for system design deep dive"
            ],
            "interviewer_notes": "Candidate shows promise but needs more experience with enterprise-level challenges"
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=2500
            )
            
            summary_json = response.choices[0].message.content
            summary = json.loads(summary_json)
            
            return summary
        
        except Exception as e:
            return self._get_fallback_summary()
    
    async def generate_personalized_study_plan(
        self,
        user_profile: Dict[str, Any],
        performance_history: List[Dict[str, Any]],
        target_role: str,
        target_companies: List[str]
    ) -> Dict[str, Any]:
        """Create personalized study plan based on performance analysis."""
        
        system_prompt = """
        You are a technical career coach creating personalized study plans for software engineers.
        
        Analyze the candidate's profile, interview performance, and career goals to create:
        1. Structured learning roadmap
        2. Specific skill development priorities
        3. Practice recommendations
        4. Timeline with milestones
        5. Resource suggestions
        
        Make the plan actionable, realistic, and tailored to their current level and goals.
        """
        
        user_prompt = f"""
        Create study plan for:
        
        Profile:
        - Current Level: {user_profile.get('experience_level', 'mid')}
        - Skills: {user_profile.get('skills', [])}
        - Target Role: {target_role}
        - Target Companies: {target_companies}
        
        Recent Performance:
        {json.dumps(performance_history[-3:], indent=2)}
        
        Provide study plan in this JSON format:
        {{
            "study_plan_duration_weeks": 12,
            "priority_areas": [
                {{
                    "area": "System Design",
                    "current_level": "Beginner",
                    "target_level": "Intermediate",
                    "urgency": "High"
                }}
            ],
            "weekly_schedule": {{
                "week_1": {{
                    "focus": "Data Structures Review",
                    "goals": ["Master arrays and linked lists", "Practice 10 problems"],
                    "resources": ["LeetCode Arrays track", "System Design Primer"],
                    "time_commitment_hours": 15
                }}
            }},
            "milestones": [
                {{
                    "week": 4,
                    "milestone": "Complete behavioral interview prep",
                    "success_criteria": "Confident in STAR format responses"
                }}
            ],
            "practice_interviews": [
                {{
                    "week": 2,
                    "type": "technical",
                    "focus": "Data structures and algorithms"
                }}
            ],
            "recommended_resources": [
                {{
                    "type": "book",
                    "title": "Cracking the Coding Interview",
                    "priority": "high"
                }}
            ],
            "company_specific_prep": {{
                "Google": ["Focus on algorithms", "System design at scale"],
                "Amazon": ["Leadership principles", "Behavioral examples"]
            }}
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.4,
                max_tokens=3000
            )
            
            plan_json = response.choices[0].message.content
            plan = json.loads(plan_json)
            
            return plan
        
        except Exception as e:
            return self._get_fallback_study_plan()
    
    def _get_question_generation_prompt(
        self, 
        interview_type: InterviewType,
        difficulty: DifficultyLevel,
        target_role: str,
        skills: List[str],
        github_context: str
    ) -> str:
        """Get system prompt for question generation."""
        
        base_prompt = f"""
        You are an expert technical interviewer at a top tech company creating interview questions.
        
        Context:
        - Interview Type: {interview_type.value}
        - Difficulty Level: {difficulty.value}
        - Target Role: {target_role}
        - Key Skills to Assess: {', '.join(skills)}
        
        {github_context}
        
        Guidelines for {interview_type.value} interviews:
        """
        
        if interview_type == InterviewType.TECHNICAL:
            return base_prompt + """
            - Focus on problem-solving, system design, and technical depth
            - Include coding challenges appropriate for the seniority level
            - Test understanding of data structures, algorithms, and system architecture
            - Questions should have clear evaluation criteria
            """
        elif interview_type == InterviewType.BEHAVIORAL:
            return base_prompt + """
            - Focus on leadership, teamwork, and conflict resolution
            - Use STAR method framework
            - Include situational judgment questions
            - Test cultural fit and growth mindset
            """
        elif interview_type == InterviewType.SYSTEM_DESIGN:
            return base_prompt + """
            - Focus on scalability, reliability, and architecture decisions
            - Start with high-level design then dive into components
            - Include trade-off discussions
            - Test understanding of distributed systems concepts
            """
        else:
            return base_prompt + "Create comprehensive interview questions that test both technical and soft skills."
    
    def _get_fallback_questions(
        self, 
        interview_type: InterviewType, 
        difficulty: DifficultyLevel, 
        num_questions: int
    ) -> List[Dict[str, Any]]:
        """Provide fallback questions if AI generation fails."""
        
        fallback_questions = {
            InterviewType.TECHNICAL: [
                {
                    "question_text": "Explain the difference between stack and heap memory allocation.",
                    "question_type": "technical",
                    "difficulty": difficulty.value,
                    "topics": ["memory_management", "data_structures"],
                    "expected_duration_minutes": 8,
                    "sequence_number": 1,
                    "generated_by_ai": False
                }
            ]
        }
        
        questions = fallback_questions.get(interview_type, [])
        return questions[:num_questions]
    
    def _get_fallback_analysis(self, response: str) -> Dict[str, Any]:
        """Provide basic analysis if AI analysis fails."""
        return {
            "overall_score": 70,
            "criterion_scores": {},
            "strengths": ["Provided a response"],
            "areas_for_improvement": ["Could provide more detail"],
            "detailed_feedback": "Basic analysis - AI service unavailable",
            "confidence_assessment": 0.6,
            "clarity_score": 0.6,
            "relevance_score": 0.6
        }
    
    def _get_fallback_summary(self) -> Dict[str, Any]:
        """Provide basic summary if AI generation fails."""
        return {
            "overall_score": 70,
            "performance_level": "Standard performance",
            "key_strengths": ["Completed interview"],
            "improvement_areas": ["Continue practicing"],
            "recommendations": ["Keep learning and practicing"]
        }
    
    def _get_fallback_study_plan(self) -> Dict[str, Any]:
        """Provide basic study plan if AI generation fails."""
        return {
            "study_plan_duration_weeks": 8,
            "priority_areas": [{"area": "General preparation", "urgency": "Medium"}],
            "recommendations": ["Continue practicing interview questions"]
        }