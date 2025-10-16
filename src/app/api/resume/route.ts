import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { resumeService } from '@/lib/services/resume-service'
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

    const resumeData = await resumeService.getResumeData(user.id)
    return NextResponse.json(resumeData)
  } catch (error: any) {
    console.error('Error fetching resume:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch resume' },
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
    const { resume_text, action } = body

    if (action === 'parse') {
      const parsedData = await resumeService.parseResume(resume_text)
      await resumeService.saveResumeData(user.id, parsedData)
      return NextResponse.json(parsedData, { status: 201 })
    }

    if (action === 'generate_questions') {
      const resumeData = await resumeService.getResumeData(user.id)
      if (!resumeData) {
        return NextResponse.json({ error: 'No resume data found' }, { status: 404 })
      }
      const questions = resumeService.generateInterviewQuestionsFromResume(resumeData)
      return NextResponse.json({ questions })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error processing resume:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process resume' },
      { status: 500 }
    )
  }
}
