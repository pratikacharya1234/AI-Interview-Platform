import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface InterviewerPersona {
  id: string
  name: string
  role: string
  company_type: string
  avatar_url?: string
  description: string
  personality_traits: string[]
  interview_style: string
  difficulty_preference: string
  focus_areas: string[]
  question_patterns: Record<string, any>
  evaluation_criteria: Record<string, any>
  is_active: boolean
}

export interface PersonaQuestionContext {
  persona: InterviewerPersona
  user_profile: {
    skill_level: string
    github_data?: Record<string, any>
    resume_data?: Record<string, any>
    recent_performance?: Record<string, any>
  }
  interview_type: string
  difficulty: string
  company_name?: string
}

class PersonaService {
  async getAllPersonas(): Promise<InterviewerPersona[]> {
    const { data, error } = await supabase
      .from('interviewer_personas')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw new Error(`Failed to fetch personas: ${error.message}`)
    return data || []
  }

  async getPersonaById(personaId: string): Promise<InterviewerPersona | null> {
    const { data, error } = await supabase
      .from('interviewer_personas')
      .select('*')
      .eq('id', personaId)
      .single()

    if (error) {
      console.error('Error fetching persona:', error)
      return null
    }
    return data
  }

  async getPersonasByCompanyType(companyType: string): Promise<InterviewerPersona[]> {
    const { data, error } = await supabase
      .from('interviewer_personas')
      .select('*')
      .eq('company_type', companyType)
      .eq('is_active', true)

    if (error) throw new Error(`Failed to fetch personas: ${error.message}`)
    return data || []
  }

  async getPersonasByDifficulty(difficulty: string): Promise<InterviewerPersona[]> {
    const { data, error } = await supabase
      .from('interviewer_personas')
      .select('*')
      .eq('difficulty_preference', difficulty)
      .eq('is_active', true)

    if (error) throw new Error(`Failed to fetch personas: ${error.message}`)
    return data || []
  }

  async selectOptimalPersona(
    interviewType: string,
    difficulty: string,
    companyName?: string
  ): Promise<InterviewerPersona> {
    let query = supabase
      .from('interviewer_personas')
      .select('*')
      .eq('is_active', true)

    if (companyName) {
      const { data: companyData } = await supabase
        .from('company_profiles')
        .select('industry, size')
        .eq('company_name', companyName)
        .single()

      if (companyData) {
        query = query.or(`company_type.eq.${companyData.size},company_type.eq.${companyData.industry}`)
      }
    }

    if (difficulty) {
      query = query.eq('difficulty_preference', difficulty)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      const { data: fallback } = await supabase
        .from('interviewer_personas')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      return fallback!
    }

    const randomIndex = Math.floor(Math.random() * data.length)
    return data[randomIndex]
  }

  generatePersonaPrompt(context: PersonaQuestionContext): string {
    const { persona, user_profile, interview_type, difficulty, company_name } = context

    const basePrompt = `You are ${persona.name}, a ${persona.role} at ${persona.company_type || 'a leading tech company'}.

PERSONALITY & STYLE:
${persona.description}
Personality Traits: ${persona.personality_traits.join(', ')}
Interview Style: ${persona.interview_style}

CANDIDATE PROFILE:
- Skill Level: ${user_profile.skill_level}
${user_profile.github_data?.languages ? `- Primary Languages: ${user_profile.github_data.languages.join(', ')}` : ''}
${user_profile.github_data?.total_repos ? `- GitHub Repos: ${user_profile.github_data.total_repos}` : ''}
${user_profile.resume_data?.experience_years ? `- Years of Experience: ${user_profile.resume_data.experience_years}` : ''}

INTERVIEW CONTEXT:
- Type: ${interview_type}
- Difficulty: ${difficulty}
${company_name ? `- Target Company: ${company_name}` : ''}
- Focus Areas: ${persona.focus_areas.join(', ')}

INSTRUCTIONS:
1. Ask questions that match your personality and interview style
2. Adjust difficulty based on candidate responses
3. Provide feedback in character
4. Focus on areas relevant to ${company_name || 'the role'}
5. Use ${persona.interview_style} approach throughout

Generate questions and evaluate responses as ${persona.name} would in a real interview.`

    return basePrompt
  }

  generateEvaluationPrompt(
    persona: InterviewerPersona,
    question: string,
    response: string,
    context: Record<string, any>
  ): string {
    return `As ${persona.name}, ${persona.role} at ${persona.company_type}, evaluate this candidate's response.

QUESTION: ${question}

CANDIDATE RESPONSE: ${response}

EVALUATION CRITERIA (based on ${persona.interview_style}):
${JSON.stringify(persona.evaluation_criteria, null, 2)}

Provide evaluation in this JSON format:
{
  "score": 0-100,
  "technical_accuracy": 0-100,
  "communication_clarity": 0-100,
  "depth_of_knowledge": 0-100,
  "problem_solving_approach": 0-100,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "feedback": "Detailed feedback as ${persona.name} would give",
  "follow_up_question": "A natural follow-up question",
  "improvement_suggestions": ["suggestion1", "suggestion2"]
}

Be ${persona.personality_traits[0]} and ${persona.personality_traits[1]} in your evaluation.`
  }

  async getPersonaStatistics(personaId: string): Promise<Record<string, any>> {
    const { data: sessions } = await supabase
      .from('interview_sessions')
      .select('id, status, duration_seconds, interview_evaluations(overall_score)')
      .eq('persona_id', personaId)

    if (!sessions) return {}

    const completed = sessions.filter(s => s.status === 'completed')
    const scores = completed
      .map(s => (s as any).interview_evaluations?.overall_score)
      .filter(Boolean)

    return {
      total_interviews: sessions.length,
      completed_interviews: completed.length,
      average_score: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      average_duration: completed.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / completed.length || 0,
      completion_rate: (completed.length / sessions.length) * 100 || 0
    }
  }

  async createCustomPersona(personaData: Partial<InterviewerPersona>): Promise<InterviewerPersona> {
    const { data, error } = await supabase
      .from('interviewer_personas')
      .insert([{
        name: personaData.name,
        role: personaData.role,
        company_type: personaData.company_type,
        description: personaData.description,
        personality_traits: personaData.personality_traits || [],
        interview_style: personaData.interview_style,
        difficulty_preference: personaData.difficulty_preference,
        focus_areas: personaData.focus_areas || [],
        question_patterns: personaData.question_patterns || {},
        evaluation_criteria: personaData.evaluation_criteria || {},
        is_active: true
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create persona: ${error.message}`)
    return data
  }

  async updatePersona(personaId: string, updates: Partial<InterviewerPersona>): Promise<InterviewerPersona> {
    const { data, error } = await supabase
      .from('interviewer_personas')
      .update(updates)
      .eq('id', personaId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update persona: ${error.message}`)
    return data
  }

  async deactivatePersona(personaId: string): Promise<void> {
    const { error } = await supabase
      .from('interviewer_personas')
      .update({ is_active: false })
      .eq('id', personaId)

    if (error) throw new Error(`Failed to deactivate persona: ${error.message}`)
  }

  getPersonaAvatar(persona: InterviewerPersona): string {
    if (persona.avatar_url) return persona.avatar_url

    const avatarMap: Record<string, string> = {
      'Alex Chen': 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexChen',
      'Sarah Martinez': 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahMartinez',
      'James Wilson': 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesWilson',
      'Dr. Emily Zhang': 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmilyZhang',
      'Marcus Johnson': 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusJohnson',
      'Priya Sharma': 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharma',
      'David Kim': 'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidKim'
    }

    return avatarMap[persona.name] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}`
  }

  getPersonaColor(persona: InterviewerPersona): string {
    const colorMap: Record<string, string> = {
      'Google': '#4285F4',
      'Startup': '#10B981',
      'Enterprise': '#6366F1',
      'FAANG': '#F59E0B',
      'Mid-size Tech': '#8B5CF6',
      'Product Company': '#EC4899',
      'Cloud Company': '#06B6D4'
    }

    return colorMap[persona.company_type] || '#14B8A6'
  }
}

export const personaService = new PersonaService()
