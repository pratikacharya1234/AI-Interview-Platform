import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      category,
      subcategory,
      difficulty = 'medium',
      questionType = 'open_ended',
      count = 5,
      experienceLevel,
      specificTopic,
      customPrompt,
      temperature
    } = body
    
    // Validate required fields
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }
    
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required to generate questions' },
        { status: 401 }
      )
    }
    
    // Add to generation queue
    const { data: queueItem, error: queueError } = await supabase
      .from('question_generation_queue')
      .insert([{
        category_id: category,
        topic: specificTopic,
        difficulty_level: difficulty,
        question_type: questionType,
        count,
        experience_level: experienceLevel,
        custom_prompt: customPrompt,
        temperature,
        status: 'pending',
        user_id: user.id
      }])
      .select()
      .single()
    
    if (queueError) {
      console.error('Error adding to queue:', queueError)
      return NextResponse.json(
        { error: 'Failed to queue generation' },
        { status: 500 }
      )
    }
    
    // In a real implementation, this would trigger an async job
    // For now, return success and the queue item
    return NextResponse.json({
      success: true,
      message: 'Questions generation queued successfully',
      queueId: queueItem.id
    })
  } catch (error) {
    console.error('Error in question generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
