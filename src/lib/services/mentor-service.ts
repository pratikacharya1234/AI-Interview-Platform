import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface MentorProfile {
  id: string
  user_id: string
  expertise_areas: string[]
  years_experience: number
  current_company: string
  current_role: string
  bio: string
  rating: number
  total_reviews: number
  sessions_conducted: number
  is_available: boolean
  hourly_rate?: number
}

export interface MentorFeedback {
  id: string
  session_id: string
  mentor_id: string
  feedback_text: string
  detailed_analysis: DetailedAnalysis
  actionable_items: ActionableItem[]
  resources_recommended: Resource[]
  follow_up_scheduled: boolean
  rating?: number
  created_at: string
}

export interface DetailedAnalysis {
  technical_assessment: string
  communication_assessment: string
  problem_solving_assessment: string
  areas_of_excellence: string[]
  areas_for_improvement: string[]
  overall_impression: string
}

export interface ActionableItem {
  priority: 'high' | 'medium' | 'low'
  category: string
  action: string
  timeline: string
  resources?: string[]
}

export interface Resource {
  title: string
  type: 'article' | 'video' | 'course' | 'book' | 'practice'
  url: string
  description: string
  estimated_time?: string
}

class MentorService {
  async getMentorProfile(userId: string): Promise<MentorProfile | null> {
    const { data, error } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching mentor profile:', error)
      return null
    }
    return data
  }

  async createMentorProfile(profileData: Partial<MentorProfile>): Promise<MentorProfile> {
    const { data, error } = await supabase
      .from('mentor_profiles')
      .insert([{
        user_id: profileData.user_id,
        expertise_areas: profileData.expertise_areas || [],
        years_experience: profileData.years_experience || 0,
        current_company: profileData.current_company || '',
        current_role: profileData.current_role || '',
        bio: profileData.bio || '',
        rating: 0,
        total_reviews: 0,
        sessions_conducted: 0,
        is_available: true,
        hourly_rate: profileData.hourly_rate
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to create mentor profile: ${error.message}`)
    return data
  }

  async getAvailableMentors(expertiseArea?: string): Promise<MentorProfile[]> {
    let query = supabase
      .from('mentor_profiles')
      .select('*')
      .eq('is_available', true)
      .order('rating', { ascending: false })

    if (expertiseArea) {
      query = query.contains('expertise_areas', [expertiseArea])
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch mentors: ${error.message}`)
    return data || []
  }

  async submitMentorFeedback(
    sessionId: string,
    mentorId: string,
    feedbackData: {
      feedback_text: string
      technical_strengths: string[]
      technical_weaknesses: string[]
      communication_notes: string
      recommendations: string[]
      resources: Resource[]
    }
  ): Promise<MentorFeedback> {
    const detailedAnalysis: DetailedAnalysis = {
      technical_assessment: this.generateTechnicalAssessment(
        feedbackData.technical_strengths,
        feedbackData.technical_weaknesses
      ),
      communication_assessment: feedbackData.communication_notes,
      problem_solving_assessment: this.generateProblemSolvingAssessment(feedbackData),
      areas_of_excellence: feedbackData.technical_strengths,
      areas_for_improvement: feedbackData.technical_weaknesses,
      overall_impression: feedbackData.feedback_text
    }

    const actionableItems = this.generateActionableItems(
      feedbackData.technical_weaknesses,
      feedbackData.recommendations
    )

    const { data, error } = await supabase
      .from('mentor_feedback')
      .insert([{
        session_id: sessionId,
        mentor_id: mentorId,
        feedback_text: feedbackData.feedback_text,
        detailed_analysis: detailedAnalysis,
        actionable_items: actionableItems,
        resources_recommended: feedbackData.resources,
        follow_up_scheduled: false
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to submit feedback: ${error.message}`)

    await this.updateMentorStats(mentorId)

    return data
  }

  private generateTechnicalAssessment(strengths: string[], weaknesses: string[]): string {
    let assessment = 'Technical Assessment:\n\n'
    
    if (strengths.length > 0) {
      assessment += 'Strengths:\n'
      strengths.forEach(s => assessment += `- ${s}\n`)
      assessment += '\n'
    }

    if (weaknesses.length > 0) {
      assessment += 'Areas for Improvement:\n'
      weaknesses.forEach(w => assessment += `- ${w}\n`)
    }

    return assessment
  }

  private generateProblemSolvingAssessment(feedbackData: any): string {
    return 'The candidate demonstrated problem-solving skills through their approach to technical challenges. ' +
           'Focus on structured thinking and breaking down complex problems into manageable components.'
  }

  private generateActionableItems(weaknesses: string[], recommendations: string[]): ActionableItem[] {
    const items: ActionableItem[] = []

    weaknesses.forEach((weakness, index) => {
      items.push({
        priority: index === 0 ? 'high' : 'medium',
        category: 'technical',
        action: `Improve ${weakness}`,
        timeline: '2-4 weeks',
        resources: []
      })
    })

    recommendations.forEach(rec => {
      items.push({
        priority: 'medium',
        category: 'general',
        action: rec,
        timeline: '1-2 weeks'
      })
    })

    return items
  }

  private async updateMentorStats(mentorId: string): Promise<void> {
    const { data: mentor } = await supabase
      .from('mentor_profiles')
      .select('sessions_conducted')
      .eq('id', mentorId)
      .single()

    if (mentor) {
      await supabase
        .from('mentor_profiles')
        .update({ sessions_conducted: mentor.sessions_conducted + 1 })
        .eq('id', mentorId)
    }
  }

  async rateMentor(mentorId: string, rating: number, review?: string): Promise<void> {
    const { data: mentor } = await supabase
      .from('mentor_profiles')
      .select('rating, total_reviews')
      .eq('id', mentorId)
      .single()

    if (!mentor) throw new Error('Mentor not found')

    const newTotalReviews = mentor.total_reviews + 1
    const newRating = ((mentor.rating * mentor.total_reviews) + rating) / newTotalReviews

    await supabase
      .from('mentor_profiles')
      .update({
        rating: parseFloat(newRating.toFixed(2)),
        total_reviews: newTotalReviews
      })
      .eq('id', mentorId)
  }

  async getMentorFeedback(sessionId: string): Promise<MentorFeedback | null> {
    const { data, error } = await supabase
      .from('mentor_feedback')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error) {
      console.error('Error fetching mentor feedback:', error)
      return null
    }
    return data
  }

  async scheduleFollowUp(feedbackId: string, scheduledDate: string): Promise<void> {
    const { error } = await supabase
      .from('mentor_feedback')
      .update({ follow_up_scheduled: true })
      .eq('id', feedbackId)

    if (error) throw new Error(`Failed to schedule follow-up: ${error.message}`)
  }

  generateFeedbackReport(feedback: MentorFeedback): string {
    let report = `# Mentor Feedback Report\n\n`
    report += `## Overall Feedback\n${feedback.feedback_text}\n\n`
    
    const analysis = feedback.detailed_analysis
    report += `## Technical Assessment\n${analysis.technical_assessment}\n\n`
    report += `## Communication Assessment\n${analysis.communication_assessment}\n\n`
    
    if (feedback.actionable_items.length > 0) {
      report += `## Action Items\n`
      feedback.actionable_items.forEach((item, index) => {
        report += `${index + 1}. [${item.priority.toUpperCase()}] ${item.action} (${item.timeline})\n`
      })
      report += `\n`
    }

    if (feedback.resources_recommended.length > 0) {
      report += `## Recommended Resources\n`
      feedback.resources_recommended.forEach((resource, index) => {
        report += `${index + 1}. ${resource.title} (${resource.type})\n`
        report += `   ${resource.description}\n`
        report += `   ${resource.url}\n\n`
      })
    }

    return report
  }

  async getMentorStatistics(mentorId: string): Promise<{
    total_sessions: number
    average_rating: number
    total_reviews: number
    feedback_given: number
    expertise_areas: string[]
  }> {
    const { data: mentor } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('id', mentorId)
      .single()

    if (!mentor) {
      return {
        total_sessions: 0,
        average_rating: 0,
        total_reviews: 0,
        feedback_given: 0,
        expertise_areas: []
      }
    }

    const { count: feedbackCount } = await supabase
      .from('mentor_feedback')
      .select('id', { count: 'exact', head: true })
      .eq('mentor_id', mentorId)

    return {
      total_sessions: mentor.sessions_conducted,
      average_rating: mentor.rating,
      total_reviews: mentor.total_reviews,
      feedback_given: feedbackCount || 0,
      expertise_areas: mentor.expertise_areas
    }
  }

  async requestMentorSession(
    userId: string,
    mentorId: string,
    sessionType: string,
    preferredDate: string
  ): Promise<string> {
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .insert([{
        user_id: userId,
        interview_type: 'mentor-session',
        difficulty: 'medium',
        status: 'scheduled',
        mode: 'text'
      }])
      .select()
      .single()

    if (error) throw new Error(`Failed to request session: ${error.message}`)
    return session.id
  }
}

export const mentorService = new MentorService()
