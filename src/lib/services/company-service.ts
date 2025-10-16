import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface CompanyProfile {
  id: string
  company_name: string
  industry: string
  size: string
  logo_url?: string
  description: string
  tech_stack: string[]
  interview_process: InterviewProcess
  common_questions: string[]
  culture_values: string[]
  difficulty_rating: number
  success_tips: string[]
  is_active: boolean
}

export interface InterviewProcess {
  rounds: InterviewRound[]
  total_duration_days: number
  preparation_tips: string[]
}

export interface InterviewRound {
  name: string
  type: string
  duration_minutes: number
  focus_areas: string[]
  difficulty: string
}

class CompanyService {
  async getAllCompanies(): Promise<CompanyProfile[]> {
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('is_active', true)
      .order('company_name')

    if (error) throw new Error(`Failed to fetch companies: ${error.message}`)
    return data || []
  }

  async getCompanyByName(companyName: string): Promise<CompanyProfile | null> {
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('company_name', companyName)
      .single()

    if (error) {
      console.error('Error fetching company:', error)
      return null
    }
    return data
  }

  async getCompaniesByIndustry(industry: string): Promise<CompanyProfile[]> {
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('industry', industry)
      .eq('is_active', true)

    if (error) throw new Error(`Failed to fetch companies: ${error.message}`)
    return data || []
  }

  async getCompanyQuestions(companyName: string, category?: string): Promise<any[]> {
    let query = supabase
      .from('question_bank')
      .select('*')
      .eq('company_specific', companyName)
      .eq('is_active', true)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch questions: ${error.message}`)
    return data || []
  }

  generateCompanySpecificPrompt(
    company: CompanyProfile,
    interviewType: string,
    userProfile: Record<string, any>
  ): string {
    return `You are conducting a ${interviewType} interview for ${company.company_name}.

COMPANY CONTEXT:
- Industry: ${company.industry}
- Size: ${company.size}
- Tech Stack: ${company.tech_stack.join(', ')}
- Culture Values: ${company.culture_values.join(', ')}
- Difficulty Rating: ${company.difficulty_rating}/10

CANDIDATE PROFILE:
- Skill Level: ${userProfile.skill_level || 'intermediate'}
- Experience: ${userProfile.experience_years || 'Not specified'}
${userProfile.github_data?.languages ? `- Languages: ${userProfile.github_data.languages.join(', ')}` : ''}

INTERVIEW FOCUS:
Generate questions that:
1. Align with ${company.company_name}'s tech stack and values
2. Match the company's interview difficulty (${company.difficulty_rating}/10)
3. Test skills relevant to ${company.industry} industry
4. Reflect ${company.company_name}'s culture and work style

Common question themes at ${company.company_name}:
${company.common_questions.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join('\n')}

Generate ${interviewType} questions appropriate for ${company.company_name}.`
  }

  async getCompanyInterviewStats(companyName: string): Promise<{
    total_interviews: number
    average_score: number
    pass_rate: number
    common_challenges: string[]
    success_factors: string[]
  }> {
    const { data: sessions } = await supabase
      .from('interview_sessions')
      .select('id, interview_evaluations(overall_score, pass_likelihood)')
      .eq('company_name', companyName)
      .eq('status', 'completed')

    if (!sessions || sessions.length === 0) {
      return {
        total_interviews: 0,
        average_score: 0,
        pass_rate: 0,
        common_challenges: [],
        success_factors: []
      }
    }

    const scores = sessions
      .map(s => (s as any).interview_evaluations?.overall_score)
      .filter(Boolean)

    const passLikelihoods = sessions
      .map(s => (s as any).interview_evaluations?.pass_likelihood)
      .filter(Boolean)

    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const passRate = (passLikelihoods.filter((p: number) => p >= 70).length / passLikelihoods.length) * 100

    return {
      total_interviews: sessions.length,
      average_score: Math.round(avgScore),
      pass_rate: Math.round(passRate),
      common_challenges: this.getCommonChallenges(companyName),
      success_factors: this.getSuccessFactors(companyName)
    }
  }

  private getCommonChallenges(companyName: string): string[] {
    const challengeMap: Record<string, string[]> = {
      'Google': [
        'Complex algorithm optimization',
        'System design at scale',
        'Behavioral questions using Googleyness'
      ],
      'Amazon': [
        'Leadership principles alignment',
        'Scalability scenarios',
        'Customer obsession examples'
      ],
      'Meta': [
        'Fast-paced problem solving',
        'Product thinking',
        'Cross-functional collaboration'
      ],
      'Microsoft': [
        'Technical depth',
        'Growth mindset demonstration',
        'Collaborative problem solving'
      ]
    }

    return challengeMap[companyName] || [
      'Technical problem solving',
      'Communication clarity',
      'Cultural fit assessment'
    ]
  }

  private getSuccessFactors(companyName: string): string[] {
    const factorMap: Record<string, string[]> = {
      'Google': [
        'Clear communication of thought process',
        'Optimal solutions with analysis',
        'Collaborative approach'
      ],
      'Amazon': [
        'Strong leadership principle stories',
        'Data-driven decision making',
        'Customer-centric thinking'
      ],
      'Meta': [
        'Quick problem solving',
        'Product sense',
        'Impact-focused mindset'
      ]
    }

    return factorMap[companyName] || [
      'Technical competence',
      'Clear communication',
      'Cultural alignment'
    ]
  }

  async createCompanySimulation(
    userId: string,
    companyName: string,
    position: string,
    difficulty: string
  ): Promise<string> {
    const company = await this.getCompanyByName(companyName)
    if (!company) throw new Error('Company not found')

    const persona = await this.selectCompanyPersona(company)
    
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .insert([{
        user_id: userId,
        persona_id: persona,
        company_name: companyName,
        position: position,
        interview_type: 'company-specific',
        difficulty: difficulty,
        status: 'scheduled',
        mode: 'text'
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create simulation: ${error.message}`)
    return session.id
  }

  private async selectCompanyPersona(company: CompanyProfile): Promise<string> {
    const { data: personas } = await supabase
      .from('interviewer_personas')
      .select('id')
      .or(`company_type.eq.${company.size},company_type.eq.${company.industry}`)
      .eq('is_active', true)
      .limit(1)

    if (personas && personas.length > 0) {
      return personas[0].id
    }

    const { data: fallback } = await supabase
      .from('interviewer_personas')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single()

    return fallback?.id || ''
  }

  getCompanyLogo(companyName: string): string {
    const logoMap: Record<string, string> = {
      'Google': 'https://logo.clearbit.com/google.com',
      'Amazon': 'https://logo.clearbit.com/amazon.com',
      'Meta': 'https://logo.clearbit.com/meta.com',
      'Microsoft': 'https://logo.clearbit.com/microsoft.com',
      'Apple': 'https://logo.clearbit.com/apple.com',
      'Netflix': 'https://logo.clearbit.com/netflix.com',
      'Stripe': 'https://logo.clearbit.com/stripe.com'
    }

    return logoMap[companyName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=14B8A6&color=fff`
  }

  getDifficultyColor(rating: number): string {
    if (rating <= 3) return '#10B981'
    if (rating <= 6) return '#F59E0B'
    return '#EF4444'
  }

  getDifficultyLabel(rating: number): string {
    if (rating <= 3) return 'Moderate'
    if (rating <= 6) return 'Challenging'
    return 'Very Difficult'
  }
}

export const companyService = new CompanyService()
