import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Initialize Supabase client only if credentials are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

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

// Default companies for when database is not available
const DEFAULT_COMPANIES: CompanyProfile[] = [
  {
    id: 'company-1',
    company_name: 'Google',
    industry: 'Technology',
    size: 'Large (10,000+ employees)',
    logo_url: '/logos/google.png',
    description: 'Leading technology company specializing in search, cloud computing, and AI',
    tech_stack: ['Python', 'Java', 'C++', 'Go', 'JavaScript', 'Kubernetes', 'TensorFlow'],
    interview_process: {
      rounds: [
        { name: 'Phone Screen', type: 'Technical', duration_minutes: 45, focus_areas: ['Coding', 'Algorithms'], difficulty: 'medium' },
        { name: 'Technical Interview 1', type: 'Technical', duration_minutes: 60, focus_areas: ['Data Structures', 'System Design'], difficulty: 'hard' },
        { name: 'Technical Interview 2', type: 'Technical', duration_minutes: 60, focus_areas: ['Coding', 'Problem Solving'], difficulty: 'hard' },
        { name: 'Behavioral', type: 'Behavioral', duration_minutes: 45, focus_areas: ['Leadership', 'Teamwork'], difficulty: 'medium' }
      ],
      total_duration_days: 30,
      preparation_tips: ['Practice LeetCode problems', 'Study system design', 'Review STAR method for behavioral questions']
    },
    common_questions: [
      'Design a distributed cache system',
      'Implement LRU cache',
      'Tell me about a time you led a difficult project'
    ],
    culture_values: ['Innovation', 'User Focus', 'Technical Excellence', 'Collaboration'],
    difficulty_rating: 4.5,
    success_tips: ['Focus on scalability in system design', 'Show problem-solving process', 'Demonstrate impact in previous roles'],
    is_active: true
  },
  {
    id: 'company-2',
    company_name: 'Microsoft',
    industry: 'Technology',
    size: 'Large (10,000+ employees)',
    logo_url: '/logos/microsoft.png',
    description: 'Global technology leader in software, cloud services, and productivity tools',
    tech_stack: ['C#', '.NET', 'Azure', 'TypeScript', 'Python', 'React'],
    interview_process: {
      rounds: [
        { name: 'Recruiter Call', type: 'Screening', duration_minutes: 30, focus_areas: ['Background', 'Motivation'], difficulty: 'easy' },
        { name: 'Technical Phone', type: 'Technical', duration_minutes: 60, focus_areas: ['Coding', 'Problem Solving'], difficulty: 'medium' },
        { name: 'Onsite Loop', type: 'Mixed', duration_minutes: 240, focus_areas: ['Coding', 'System Design', 'Behavioral'], difficulty: 'hard' }
      ],
      total_duration_days: 21,
      preparation_tips: ['Understand Azure services', 'Practice coding on whiteboard', 'Prepare growth mindset examples']
    },
    common_questions: [
      'Design a URL shortener',
      'Reverse a linked list',
      'How do you handle failure?'
    ],
    culture_values: ['Growth Mindset', 'Customer Obsession', 'Diversity & Inclusion', 'Making a Difference'],
    difficulty_rating: 4.0,
    success_tips: ['Emphasize learning and growth', 'Show customer focus', 'Demonstrate inclusive leadership'],
    is_active: true
  },
  {
    id: 'company-3',
    company_name: 'Startup Inc',
    industry: 'Technology',
    size: 'Small (1-50 employees)',
    logo_url: '/logos/startup.png',
    description: 'Fast-growing startup disrupting the fintech industry',
    tech_stack: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS'],
    interview_process: {
      rounds: [
        { name: 'Culture Fit', type: 'Behavioral', duration_minutes: 30, focus_areas: ['Motivation', 'Adaptability'], difficulty: 'easy' },
        { name: 'Technical Challenge', type: 'Take-home', duration_minutes: 240, focus_areas: ['Full-stack Development'], difficulty: 'medium' },
        { name: 'Team Interview', type: 'Mixed', duration_minutes: 90, focus_areas: ['Technical Discussion', 'Collaboration'], difficulty: 'medium' }
      ],
      total_duration_days: 7,
      preparation_tips: ['Show enthusiasm for the product', 'Demonstrate ability to wear multiple hats', 'Prepare practical coding examples']
    },
    common_questions: [
      'Build a REST API for a payment system',
      'How do you prioritize in a fast-paced environment?',
      'What attracts you to startups?'
    ],
    culture_values: ['Agility', 'Ownership', 'Innovation', 'Customer Success'],
    difficulty_rating: 3.0,
    success_tips: ['Show entrepreneurial spirit', 'Demonstrate quick learning ability', 'Be ready to discuss trade-offs'],
    is_active: true
  }
]

class CompanyService {
  async getAllCompanies(): Promise<CompanyProfile[]> {
    if (!supabase) {
      return DEFAULT_COMPANIES
    }

    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('is_active', true)
        .order('company_name')

      if (error) {
        console.error('Failed to fetch companies from database:', error)
        return DEFAULT_COMPANIES
      }
      return data || DEFAULT_COMPANIES
    } catch (error) {
      console.error('Error fetching companies:', error)
      return DEFAULT_COMPANIES
    }
  }

  async getCompanyByName(companyName: string): Promise<CompanyProfile | null> {
    if (!supabase) {
      return DEFAULT_COMPANIES.find(c => c.company_name.toLowerCase() === companyName.toLowerCase()) || null
    }

    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('company_name', companyName)
        .single()

      if (error) {
        console.error('Error fetching company:', error)
        return DEFAULT_COMPANIES.find(c => c.company_name.toLowerCase() === companyName.toLowerCase()) || null
      }
      return data
    } catch (error) {
      console.error('Error fetching company:', error)
      return DEFAULT_COMPANIES.find(c => c.company_name.toLowerCase() === companyName.toLowerCase()) || null
    }
  }

  async getCompaniesByIndustry(industry: string): Promise<CompanyProfile[]> {
    if (!supabase) {
      return DEFAULT_COMPANIES.filter(c => c.industry.toLowerCase() === industry.toLowerCase())
    }

    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('industry', industry)
        .eq('is_active', true)

      if (error) {
        console.error(`Failed to fetch companies: ${error.message}`)
        return DEFAULT_COMPANIES.filter(c => c.industry.toLowerCase() === industry.toLowerCase())
      }
      return data || []
    } catch (error) {
      console.error('Error fetching companies by industry:', error)
      return DEFAULT_COMPANIES.filter(c => c.industry.toLowerCase() === industry.toLowerCase())
    }
  }

  async getCompanyQuestions(companyName: string, category?: string): Promise<any[]> {
    if (!supabase) {
      // Return default questions for the company
      const company = DEFAULT_COMPANIES.find(c => c.company_name.toLowerCase() === companyName.toLowerCase())
      if (!company) return []
      
      return company.common_questions.map((q, idx) => ({
        id: `q-${idx}`,
        question: q,
        category: category || 'general',
        company_specific: companyName,
        difficulty: 'medium',
        is_active: true
      }))
    }

    try {
      let query = supabase
        .from('question_bank')
        .select('*')
        .eq('company_specific', companyName)
        .eq('is_active', true)

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error(`Failed to fetch questions: ${error.message}`)
        const company = DEFAULT_COMPANIES.find(c => c.company_name.toLowerCase() === companyName.toLowerCase())
        if (!company) return []
        
        return company.common_questions.map((q, idx) => ({
          id: `q-${idx}`,
          question: q,
          category: category || 'general',
          company_specific: companyName,
          difficulty: 'medium',
          is_active: true
        }))
      }
      return data || []
    } catch (error) {
      console.error('Error fetching company questions:', error)
      return []
    }
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
    if (!supabase) {
      // Return mock stats for default companies
      const company = DEFAULT_COMPANIES.find(c => c.company_name.toLowerCase() === companyName.toLowerCase())
      if (!company) {
        return {
          total_interviews: 0,
          average_score: 0,
          pass_rate: 0,
          common_challenges: [],
          success_factors: []
        }
      }
      
      return {
        total_interviews: Math.floor(Math.random() * 100) + 50,
        average_score: 70 + Math.floor(Math.random() * 20),
        pass_rate: 60 + Math.floor(Math.random() * 30),
        common_challenges: this.getCommonChallenges(companyName),
        success_factors: this.getSuccessFactors(companyName)
      }
    }

    try {
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
          common_challenges: this.getCommonChallenges(companyName),
          success_factors: this.getSuccessFactors(companyName)
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
    } catch (error) {
      console.error('Error fetching company stats:', error)
      return {
        total_interviews: 0,
        average_score: 0,
        pass_rate: 0,
        common_challenges: this.getCommonChallenges(companyName),
        success_factors: this.getSuccessFactors(companyName)
      }
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
    
    if (!supabase) {
      // Return a mock session ID
      return `simulation-${Date.now()}-${companyName.toLowerCase().replace(/\s+/g, '-')}`
    }

    try {
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
    } catch (error) {
      console.error('Error creating company simulation:', error)
      // Return a mock session ID as fallback
      return `simulation-${Date.now()}-${companyName.toLowerCase().replace(/\s+/g, '-')}`
    }
  }

  private async selectCompanyPersona(company: CompanyProfile): Promise<string> {
    if (!supabase) {
      // Return a default persona ID
      return 'persona-1'
    }

    try {
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

      return fallback?.id || 'persona-1'
    } catch (error) {
      console.error('Error selecting company persona:', error)
      return 'persona-1'
    }
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
