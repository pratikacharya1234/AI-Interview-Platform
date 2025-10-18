import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { questionGenerator } from '@/lib/services/question-generator'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
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
    
    // Add to generation queue
    const { data: queueItem, error: queueError } = await supabase
      .from('question_generation_queue')
      .insert([{
        category_id: category,
        topic: specificTopic,
        difficulty_level: difficulty,
        question_type: questionType,
        count,
        custom_prompt: customPrompt,
        temperature: temperature || 0.7,
        requested_by: user.id,
        status: 'processing'
      }])
      .select()
      .single()
    
    if (queueError) {
      console.error('Queue error:', queueError)
      return NextResponse.json(
        { error: 'Failed to queue generation request' },
        { status: 500 }
      )
    }
    
    try {
      // Generate questions
      const questions = await questionGenerator.generateQuestions({
        category,
        subcategory,
        difficulty,
        questionType,
        count,
        experienceLevel,
        specificTopic,
        customPrompt,
        temperature
      })
      
      // Update queue status
      await supabase
        .from('question_generation_queue')
        .update({
          status: 'completed',
          generated_count: questions.length,
          completed_at: new Date().toISOString()
        })
        .eq('id', queueItem.id)
      
      return NextResponse.json({
        success: true,
        questions,
        count: questions.length,
        queueId: queueItem.id
      })
    } catch (genError: any) {
      // Update queue with error
      await supabase
        .from('question_generation_queue')
        .update({
          status: 'failed',
          error_message: genError.message
        })
        .eq('id', queueItem.id)
      
      throw genError
    }
  } catch (error: any) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
