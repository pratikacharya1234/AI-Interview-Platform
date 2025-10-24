import { requireAuth } from '@/lib/auth/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prepService } from '@/lib/services/ai-features-service'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')
    const action = searchParams.get('action')

    if (action === 'study_sessions' && planId) {
      const sessions = await prepService.getStudySessions(planId)
      return NextResponse.json(sessions)
    }

    // Get active prep plan
    const plan = await prepService.getActivePlan(user.email)
    return NextResponse.json(plan)
  } catch (error: any) {
    console.error('Error fetching prep plan:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prep plan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    if (!user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'create_plan') {
      const newPlan = await prepService.createPlan({
        ...data,
        user_email: user.email
      })
      return NextResponse.json(newPlan, { status: 201 })
    }

    if (action === 'update_study_session') {
      const { sessionId, completed } = data
      await prepService.updateStudySession(sessionId, completed)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in prep API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
