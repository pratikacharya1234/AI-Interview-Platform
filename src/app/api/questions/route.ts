import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    
    // Build query
    let query = supabase
      .from('question_bank')
      .select(`
        *,
        question_categories (
          id,
          name,
          slug,
          icon,
          color
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }
    
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty_level', difficulty)
    }
    
    if (type && type !== 'all') {
      query = query.eq('question_type', type)
    }
    
    if (search) {
      query = query.or(`question_text.ilike.%${search}%,tags.cs.{${search}}`)
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    
    const { data: questions, error, count } = await query
    
    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }
    
    // Get user's attempted questions if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    let attemptedQuestions = new Set()
    
    if (user) {
      const { data: attempts } = await supabase
        .from('user_question_attempts')
        .select('question_id')
        .eq('user_id', user.id)
      
      if (attempts) {
        attemptedQuestions = new Set(attempts.map(a => a.question_id))
      }
    }
    
    // Add attempted status to questions
    const questionsWithStatus = questions?.map(q => ({
      ...q,
      is_attempted: attemptedQuestions.has(q.id)
    })) || []
    
    return NextResponse.json({
      success: true,
      questions: questionsWithStatus,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in questions API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

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
    
    const question = await request.json()
    
    // Validate required fields
    if (!question.question_text || !question.category_id) {
      return NextResponse.json(
        { error: 'Question text and category are required' },
        { status: 400 }
      )
    }
    
    // Add question to database
    const { data, error } = await supabase
      .from('question_bank')
      .insert([{
        ...question,
        generated_by: 'manual',
        is_active: true,
        is_reviewed: false
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding question:', error)
      return NextResponse.json(
        { error: 'Failed to add question' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      question: data
    })
  } catch (error) {
    console.error('Error in POST questions:', error)
    return NextResponse.json(
      { error: 'Failed to add question' },
      { status: 500 }
    )
  }
}
