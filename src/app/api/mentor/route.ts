import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { mentorService } from '@/lib/services/mentor-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const expertiseArea = searchParams.get('expertise')
    const sessionId = searchParams.get('sessionId')

    if (action === 'available') {
      const mentors = await mentorService.getAvailableMentors(expertiseArea || undefined)
      return NextResponse.json(mentors)
    }

    if (action === 'profile') {
      const profile = await mentorService.getMentorProfile(user.id)
      return NextResponse.json(profile)
    }

    if (action === 'feedback' && sessionId) {
      const feedback = await mentorService.getMentorFeedback(sessionId)
      return NextResponse.json(feedback)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in mentor API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch mentor data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'create_profile') {
      const profile = await mentorService.createMentorProfile({
        user_id: user.id,
        ...body.profile_data
      })
      return NextResponse.json(profile, { status: 201 })
    }

    if (action === 'submit_feedback') {
      const { session_id, mentor_id, feedback_data } = body
      const feedback = await mentorService.submitMentorFeedback(
        session_id,
        mentor_id,
        feedback_data
      )
      return NextResponse.json(feedback, { status: 201 })
    }

    if (action === 'rate_mentor') {
      const { mentor_id, rating, review } = body
      await mentorService.rateMentor(mentor_id, rating, review)
      return NextResponse.json({ success: true })
    }

    if (action === 'request_session') {
      const { mentor_id, session_type, preferred_date } = body
      const sessionId = await mentorService.requestMentorSession(
        user.id,
        mentor_id,
        session_type,
        preferred_date
      )
      return NextResponse.json({ session_id: sessionId }, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in mentor POST:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
