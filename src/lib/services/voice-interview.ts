// Mock Voice Interview Service for NextAuth migration
import type { 
  VoiceInterview, 
  VoiceInterviewQuestion, 
  VoiceInterviewResponse,
  VoiceInterviewAnalytic,
  VoiceInterviewStartRequest,
  VoiceResponseSubmission,
  SpeechAnalytics,
  VoiceInterviewSummary
} from '@/lib/types/voice-interview'

export class VoiceInterviewService {
  
  // Start a new voice interview (mock implementation)
  static async startInterview(userId: string, request: VoiceInterviewStartRequest): Promise<VoiceInterview> {
    const sessionId = `voice_interview_${Date.now()}_${Math.random()}`
    
    // Mock voice interview object
    return {
      id: sessionId,
      user_id: userId,
      session_id: sessionId,
      candidate_name: request.candidateName,
      position: request.position,
      company: request.company || '',
      difficulty: request.difficulty,
      question_types: request.questionTypes,
      total_questions: request.questionCount,
      questions_completed: 0,
      overall_score: 0,
      status: 'active',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // Get user interviews (mock implementation)
  static async getUserInterviews(userId: string, limit: number = 10): Promise<VoiceInterview[]> {
    // Return mock interviews
    return [
      {
        id: '1',
        user_id: userId,
        session_id: 'mock_session_1',
        candidate_name: 'Sample Interview',
        position: 'Software Engineer',
        company: 'Tech Corp',
        difficulty: 'medium',
        question_types: ['technical'],
        total_questions: 5,
        questions_completed: 5,
        overall_score: 85,
        status: 'completed',
        started_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  }

  // Add questions to an interview (mock implementation)
  static async addQuestions(interviewId: string, questions: any[]): Promise<VoiceInterviewQuestion[]> {
    return []
  }

  // Submit response (mock implementation)
  static async submitResponse(interviewId: string, response: VoiceResponseSubmission): Promise<VoiceInterviewResponse> {
    return {
      id: 'mock_response',
      interview_id: interviewId,
      question_id: response.questionId,
      transcript: response.transcript,
      confidence_score: response.confidenceScore || 0.8,
      ai_score: 85,
      submitted_at: new Date().toISOString()
    }
  }

  // Complete interview (mock implementation)  
  static async completeInterview(interviewId: string): Promise<VoiceInterviewSummary> {
    const mockInterview: VoiceInterview = {
      id: interviewId,
      user_id: 'mock_user',
      session_id: 'mock_session',
      candidate_name: 'Mock Candidate',
      position: 'Software Engineer',
      company: 'Mock Company',
      difficulty: 'medium',
      question_types: ['technical'],
      total_questions: 5,
      questions_completed: 5,
      overall_score: 85,
      status: 'completed',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return {
      interview: mockInterview,
      questions: [],
      responses: [],
      analytics: [],
      overallMetrics: {
        totalDuration: 1800,
        averageScore: 85,
        strongAreas: ['Clear communication', 'Technical knowledge'],
        improvementAreas: ['Problem-solving speed'],
        recommendedActions: ['Practice more algorithmic problems']
      }
    }
  }

  // Get interview analytics (mock implementation)
  static async getInterviewAnalytics(interviewId: string): Promise<VoiceInterviewAnalytic[]> {
    return []
  }
}