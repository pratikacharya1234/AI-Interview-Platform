import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface LearningPath {
  id: string
  user_id: string
  title: string
  description: string
  target_role: string
  target_company: string
  difficulty_level: string
  estimated_duration_days: number
  current_progress: number
  status: string
  modules: any[]
  milestones: any[]
}

export interface SkillAssessment {
  id: string
  user_id: string
  skill_category: string
  skill_name: string
  current_level: number
  target_level: number
  proficiency_score: number
  last_assessed: string
  assessment_history: any[]
  practice_recommendations: string[]
}

class AdaptiveLearningService {
  async generatePersonalizedPath(
    userId: string,
    targetRole: string,
    targetCompany?: string
  ): Promise<LearningPath> {
    const weakAreas = await this.identifyWeakAreas(userId)
    const modules = this.generateModules(targetRole, weakAreas)
    const milestones = this.generateMilestones(targetRole)

    const { data: path, error } = await supabase
      .from('learning_paths')
      .insert([{
        user_id: userId,
        title: `Path to ${targetRole}${targetCompany ? ` at ${targetCompany}` : ''}`,
        description: `Personalized learning path based on your performance`,
        target_role: targetRole,
        target_company: targetCompany || '',
        difficulty_level: 'intermediate',
        estimated_duration_days: 90,
        current_progress: 0,
        status: 'active',
        modules: modules,
        milestones: milestones
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create learning path: ${error.message}`)
    return path
  }

  private async identifyWeakAreas(userId: string): Promise<string[]> {
    const { data: sessions } = await supabase
      .from('interview_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .limit(10)

    if (!sessions || sessions.length === 0) return []

    const sessionIds = sessions.map(s => s.id)

    const { data: evaluations } = await supabase
      .from('interview_evaluations')
      .select('weaknesses')
      .in('session_id', sessionIds)

    if (!evaluations) return []

    const weaknessMap: Record<string, number> = {}
    evaluations.forEach(evaluation => {
      const weaknesses = evaluation.weaknesses || []
      weaknesses.forEach((weakness: string) => {
        weaknessMap[weakness] = (weaknessMap[weakness] || 0) + 1
      })
    })

    return Object.entries(weaknessMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([weakness]) => weakness)
  }

  private generateModules(targetRole: string, weakAreas: string[]): any[] {
    const modules = [
      {
        title: 'Data Structures Mastery',
        type: 'technical',
        duration_days: 14,
        topics: ['arrays', 'trees', 'graphs', 'hash-tables']
      },
      {
        title: 'Algorithm Patterns',
        type: 'technical',
        duration_days: 21,
        topics: ['two-pointers', 'sliding-window', 'dynamic-programming']
      },
      {
        title: 'System Design',
        type: 'design',
        duration_days: 30,
        topics: ['scalability', 'databases', 'caching']
      }
    ]

    weakAreas.forEach(area => {
      modules.push({
        title: `Improve ${area}`,
        type: 'improvement',
        duration_days: 7,
        topics: [area]
      })
    })

    return modules
  }

  private generateMilestones(targetRole: string): any[] {
    return [
      { title: 'Complete Foundation Modules', target_days: 30, is_completed: false },
      { title: 'Pass 5 Mock Interviews', target_days: 60, is_completed: false },
      { title: 'Ready for Real Interviews', target_days: 90, is_completed: false }
    ]
  }

  async assessSkill(userId: string, skillName: string, score: number): Promise<SkillAssessment> {
    const { data, error } = await supabase
      .from('skill_assessments')
      .upsert({
        user_id: userId,
        skill_category: 'technical',
        skill_name: skillName,
        proficiency_score: score,
        current_level: Math.floor(score / 10),
        target_level: 10,
        last_assessed: new Date().toISOString(),
        assessment_history: [{ date: new Date().toISOString(), score }],
        practice_recommendations: this.generateRecommendations(score)
      }, {
        onConflict: 'user_id,skill_category,skill_name'
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to assess skill: ${error.message}`)
    return data
  }

  private generateRecommendations(score: number): string[] {
    if (score < 40) {
      return [
        'Start with fundamentals',
        'Practice basic problems daily',
        'Review core concepts'
      ]
    } else if (score < 70) {
      return [
        'Focus on medium difficulty problems',
        'Learn common patterns',
        'Practice time management'
      ]
    } else {
      return [
        'Tackle hard problems',
        'Optimize solutions',
        'Teach others to reinforce knowledge'
      ]
    }
  }

  async getUserSkills(userId: string): Promise<SkillAssessment[]> {
    const { data, error } = await supabase
      .from('skill_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('proficiency_score', { ascending: false })

    if (error) throw new Error(`Failed to fetch skills: ${error.message}`)
    return data || []
  }

  async getLearningPaths(userId: string): Promise<LearningPath[]> {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch learning paths: ${error.message}`)
    return data || []
  }

  async updatePathProgress(pathId: string, progress: number): Promise<void> {
    const { error } = await supabase
      .from('learning_paths')
      .update({ current_progress: progress })
      .eq('id', pathId)

    if (error) throw new Error(`Failed to update progress: ${error.message}`)
  }
}

export const adaptiveLearningService = new AdaptiveLearningService()
