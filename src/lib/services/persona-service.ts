import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Initialize Supabase client only if credentials are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

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

// Default personas for when database is not available
const DEFAULT_PERSONAS: InterviewerPersona[] = [
  {
    id: 'persona-1',
    name: 'Sarah Chen',
    role: 'Senior Engineering Manager',
    company_type: 'Tech Giant',
    avatar_url: '/avatars/sarah.jpg',
    description: 'Experienced engineering manager from a FAANG company with 15+ years in the industry',
    personality_traits: ['Direct', 'Technical', 'Detail-oriented', 'Analytical'],
    interview_style: 'Structured behavioral with technical depth',
    difficulty_preference: 'medium',
    focus_areas: ['System Design', 'Leadership', 'Problem Solving', 'Team Collaboration'],
    question_patterns: {
      behavioral: 0.4,
      technical: 0.4,
      situational: 0.2
    },
    evaluation_criteria: {
      technical_skills: 0.35,
      problem_solving: 0.25,
      communication: 0.20,
      cultural_fit: 0.20
    },
    is_active: true
  },
  {
    id: 'persona-2',
    name: 'Michael Rodriguez',
    role: 'Technical Lead',
    company_type: 'Startup',
    avatar_url: '/avatars/michael.jpg',
    description: 'Fast-paced startup technical lead focused on practical skills and adaptability',
    personality_traits: ['Energetic', 'Pragmatic', 'Fast-paced', 'Results-oriented'],
    interview_style: 'Conversational with hands-on coding',
    difficulty_preference: 'hard',
    focus_areas: ['Coding Skills', 'Architecture', 'Startup Mindset', 'Rapid Development'],
    question_patterns: {
      coding: 0.5,
      system_design: 0.3,
      behavioral: 0.2
    },
    evaluation_criteria: {
      coding_ability: 0.40,
      adaptability: 0.25,
      initiative: 0.20,
      technical_knowledge: 0.15
    },
    is_active: true
  },
  {
    id: 'persona-3',
    name: 'Emily Watson',
    role: 'HR Director',
    company_type: 'Enterprise',
    avatar_url: '/avatars/emily.jpg',
    description: 'Seasoned HR professional focusing on cultural fit and soft skills',
    personality_traits: ['Empathetic', 'Observant', 'Friendly', 'Professional'],
    interview_style: 'Behavioral and situational questions',
    difficulty_preference: 'easy',
    focus_areas: ['Cultural Fit', 'Communication', 'Teamwork', 'Career Goals'],
    question_patterns: {
      behavioral: 0.7,
      situational: 0.2,
      motivational: 0.1
    },
    evaluation_criteria: {
      communication: 0.35,
      cultural_fit: 0.30,
      motivation: 0.20,
      professionalism: 0.15
    },
    is_active: true
  }
]

class PersonaService {
  async getAllPersonas(): Promise<InterviewerPersona[]> {
    // If Supabase is not configured, return default personas
    if (!supabase) {
      return DEFAULT_PERSONAS
    }

    try {
      const { data, error } = await supabase
        .from('interviewer_personas')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Failed to fetch personas from database:', error)
        return DEFAULT_PERSONAS
      }
      
      return data || DEFAULT_PERSONAS
    } catch (error) {
      console.error('Error fetching personas:', error)
      return DEFAULT_PERSONAS
    }
  }

  async getPersonaById(personaId: string): Promise<InterviewerPersona | null> {
    // If Supabase is not configured, search in default personas
    if (!supabase) {
      return DEFAULT_PERSONAS.find(p => p.id === personaId) || null
    }

    try {
      const { data, error } = await supabase
        .from('interviewer_personas')
        .select('*')
        .eq('id', personaId)
        .single()

      if (error) {
        console.error('Error fetching persona:', error)
        return DEFAULT_PERSONAS.find(p => p.id === personaId) || null
      }
      return data
    } catch (error) {
      console.error('Error fetching persona:', error)
      return DEFAULT_PERSONAS.find(p => p.id === personaId) || null
    }
  }

  async getPersonasByCompanyType(companyType: string): Promise<InterviewerPersona[]> {
    if (!supabase) {
      return DEFAULT_PERSONAS.filter(p => p.company_type === companyType)
    }

    try {
      const { data, error } = await supabase
        .from('interviewer_personas')
        .select('*')
        .eq('company_type', companyType)
        .eq('is_active', true)

      if (error) {
        console.error(`Failed to fetch personas: ${error.message}`)
        return DEFAULT_PERSONAS.filter(p => p.company_type === companyType)
      }
      return data || []
    } catch (error) {
      console.error('Error fetching personas by company type:', error)
      return DEFAULT_PERSONAS.filter(p => p.company_type === companyType)
    }
  }

  async getPersonasByDifficulty(difficulty: string): Promise<InterviewerPersona[]> {
    if (!supabase) {
      return DEFAULT_PERSONAS.filter(p => p.difficulty_preference === difficulty)
    }

    try {
      const { data, error } = await supabase
        .from('interviewer_personas')
        .select('*')
        .eq('difficulty_preference', difficulty)
        .eq('is_active', true)

      if (error) {
        console.error(`Failed to fetch personas: ${error.message}`)
        return DEFAULT_PERSONAS.filter(p => p.difficulty_preference === difficulty)
      }
      return data || []
    } catch (error) {
      console.error('Error fetching personas by difficulty:', error)
      return DEFAULT_PERSONAS.filter(p => p.difficulty_preference === difficulty)
    }
  }

  async selectOptimalPersona(
    interviewType: string,
    difficulty: string,
    companyName?: string
  ): Promise<InterviewerPersona> {
    // If Supabase is not configured, select from default personas
    if (!supabase) {
      let candidates = [...DEFAULT_PERSONAS]
      
      // Filter by difficulty if specified
      if (difficulty) {
        const filtered = candidates.filter(p => p.difficulty_preference === difficulty)
        if (filtered.length > 0) candidates = filtered
      }
      
      // Select random persona from candidates
      const randomIndex = Math.floor(Math.random() * candidates.length)
      return candidates[randomIndex] || DEFAULT_PERSONAS[0]
    }

    try {
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
        // Fallback to default personas
        let candidates = [...DEFAULT_PERSONAS]
        if (difficulty) {
          const filtered = candidates.filter(p => p.difficulty_preference === difficulty)
          if (filtered.length > 0) candidates = filtered
        }
        const randomIndex = Math.floor(Math.random() * candidates.length)
        return candidates[randomIndex] || DEFAULT_PERSONAS[0]
      }

      const randomIndex = Math.floor(Math.random() * data.length)
      return data[randomIndex]
    } catch (error) {
      console.error('Error selecting optimal persona:', error)
      return DEFAULT_PERSONAS[0]
    }
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
    if (!supabase) {
      // Return mock statistics for default personas
      return {
        total_interviews: 0,
        completed_interviews: 0,
        average_score: 0,
        average_duration: 0,
        completion_rate: 0
      }
    }

    try {
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
    } catch (error) {
      console.error('Error fetching persona statistics:', error)
      return {
        total_interviews: 0,
        completed_interviews: 0,
        average_score: 0,
        average_duration: 0,
        completion_rate: 0
      }
    }
  }

  async createCustomPersona(personaData: Partial<InterviewerPersona>): Promise<InterviewerPersona> {
    if (!supabase) {
      // Create a new persona locally (won't persist)
      const newPersona: InterviewerPersona = {
        id: `persona-custom-${Date.now()}`,
        name: personaData.name || 'Custom Persona',
        role: personaData.role || 'Interviewer',
        company_type: personaData.company_type || 'Tech Company',
        description: personaData.description || 'Custom interviewer persona',
        personality_traits: personaData.personality_traits || [],
        interview_style: personaData.interview_style || 'Conversational',
        difficulty_preference: personaData.difficulty_preference || 'medium',
        focus_areas: personaData.focus_areas || [],
        question_patterns: personaData.question_patterns || {},
        evaluation_criteria: personaData.evaluation_criteria || {},
        is_active: true
      }
      DEFAULT_PERSONAS.push(newPersona)
      return newPersona
    }

    try {
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
    } catch (error) {
      console.error('Error creating custom persona:', error)
      throw error
    }
  }

  async updatePersona(personaId: string, updates: Partial<InterviewerPersona>): Promise<InterviewerPersona> {
    if (!supabase) {
      // Update local persona
      const persona = DEFAULT_PERSONAS.find(p => p.id === personaId)
      if (persona) {
        Object.assign(persona, updates)
        return persona
      }
      throw new Error('Persona not found')
    }

    try {
      const { data, error } = await supabase
        .from('interviewer_personas')
        .update(updates)
        .eq('id', personaId)
        .select()
        .single()

      if (error) throw new Error(`Failed to update persona: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error updating persona:', error)
      throw error
    }
  }

  async deactivatePersona(personaId: string): Promise<void> {
    if (!supabase) {
      // Remove from local personas
      const index = DEFAULT_PERSONAS.findIndex(p => p.id === personaId)
      if (index > -1) {
        DEFAULT_PERSONAS[index].is_active = false
      }
      return
    }

    try {
      const { error } = await supabase
        .from('interviewer_personas')
        .update({ is_active: false })
        .eq('id', personaId)

      if (error) throw new Error(`Failed to deactivate persona: ${error.message}`)
    } catch (error) {
      console.error('Error deactivating persona:', error)
      throw error
    }
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
