import { requireAuth } from '@/lib/auth/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'
import { adaptiveLearningService } from '@/lib/services/adaptive-learning-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

        const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'paths') {
      const paths = await adaptiveLearningService.getLearningPaths(user.id)
      return NextResponse.json(paths)
    }

    if (action === 'skills') {
      const skills = await adaptiveLearningService.getUserSkills(user.id)
      return NextResponse.json(skills)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in learning path API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch learning data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

        const body = await request.json()
    const { action, target_role, target_company, skill_name, score, path_id, progress } = body

    if (action === 'generate_path') {
      const path = await adaptiveLearningService.generatePersonalizedPath(
        user.id,
        target_role,
        target_company
      )
      return NextResponse.json(path, { status: 201 })
    }

    if (action === 'assess_skill') {
      const assessment = await adaptiveLearningService.assessSkill(user.id, skill_name, score)
      return NextResponse.json(assessment)
    }

    if (action === 'update_progress') {
      await adaptiveLearningService.updatePathProgress(path_id, progress)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in learning path POST:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
