import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Mock data for development/testing
const mockQuestions = [
  {
    id: '1',
    question_text: 'Explain the difference between let, const, and var in JavaScript',
    question_type: 'open_ended',
    category_id: 'javascript',
    difficulty_level: 'easy',
    estimated_time_minutes: 5,
    sample_answer: 'var has function scope and is hoisted, let has block scope and is not hoisted, const has block scope and cannot be reassigned.',
    tags: ['javascript', 'fundamentals', 'variables'],
    is_attempted: false,
    times_asked: 150,
    average_score: 75,
    question_categories: {
      id: 'javascript',
      name: 'JavaScript',
      slug: 'javascript',
      icon: 'code',
      color: 'yellow'
    }
  },
  {
    id: '2',
    question_text: 'Write a function to reverse a linked list',
    question_type: 'coding',
    category_id: 'data-structures',
    difficulty_level: 'medium',
    estimated_time_minutes: 15,
    sample_answer: 'Iterate through the list and reverse pointers...',
    tags: ['data-structures', 'linked-list', 'algorithms'],
    is_attempted: true,
    times_asked: 200,
    average_score: 65,
    question_categories: {
      id: 'data-structures',
      name: 'Data Structures',
      slug: 'data-structures',
      icon: 'database',
      color: 'blue'
    }
  },
  {
    id: '3',
    question_text: 'Design a URL shortening service like bit.ly',
    question_type: 'system_design',
    category_id: 'system-design',
    difficulty_level: 'hard',
    estimated_time_minutes: 30,
    sample_answer: 'Use a database to store mappings, implement a hashing algorithm...',
    tags: ['system-design', 'scalability', 'databases'],
    is_attempted: false,
    times_asked: 120,
    average_score: 70,
    question_categories: {
      id: 'system-design',
      name: 'System Design',
      slug: 'system-design',
      icon: 'layout',
      color: 'purple'
    }
  },
  {
    id: '4',
    question_text: 'Tell me about a time you had to work with a difficult team member',
    question_type: 'behavioral',
    category_id: 'behavioral',
    difficulty_level: 'medium',
    estimated_time_minutes: 10,
    sample_answer: 'Use STAR method: Situation, Task, Action, Result...',
    tags: ['behavioral', 'teamwork', 'conflict-resolution'],
    is_attempted: true,
    times_asked: 180,
    average_score: 80,
    question_categories: {
      id: 'behavioral',
      name: 'Behavioral',
      slug: 'behavioral',
      icon: 'users',
      color: 'green'
    }
  },
  {
    id: '5',
    question_text: 'Implement a binary search algorithm',
    question_type: 'coding',
    category_id: 'algorithms',
    difficulty_level: 'easy',
    estimated_time_minutes: 10,
    sample_answer: 'Divide and conquer approach, compare with middle element...',
    tags: ['algorithms', 'searching', 'binary-search'],
    is_attempted: false,
    times_asked: 250,
    average_score: 85,
    question_categories: {
      id: 'algorithms',
      name: 'Algorithms',
      slug: 'algorithms',
      icon: 'cpu',
      color: 'red'
    }
  },
  {
    id: '6',
    question_text: 'Explain the concept of closures in JavaScript',
    question_type: 'open_ended',
    category_id: 'javascript',
    difficulty_level: 'medium',
    estimated_time_minutes: 8,
    sample_answer: 'A closure is a function that has access to outer function variables...',
    tags: ['javascript', 'closures', 'scope'],
    is_attempted: true,
    times_asked: 175,
    average_score: 72,
    question_categories: {
      id: 'javascript',
      name: 'JavaScript',
      slug: 'javascript',
      icon: 'code',
      color: 'yellow'
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    
    // Try to use Supabase if available
    try {
      const cookieStore = await cookies()
      const supabase = await createClient(cookieStore)
    
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
        throw error
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
    } catch (dbError) {
      // If database is not available, use mock data
      console.log('Using mock data due to database error:', dbError)
      
      // Filter mock data based on parameters
      let filteredQuestions = [...mockQuestions]
      
      if (category && category !== 'all') {
        filteredQuestions = filteredQuestions.filter(q => q.category_id === category)
      }
      
      if (difficulty && difficulty !== 'all') {
        filteredQuestions = filteredQuestions.filter(q => q.difficulty_level === difficulty)
      }
      
      if (type && type !== 'all') {
        filteredQuestions = filteredQuestions.filter(q => q.question_type === type)
      }
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredQuestions = filteredQuestions.filter(q => 
          q.question_text.toLowerCase().includes(searchLower) ||
          q.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }
      
      // Apply pagination
      const start = (page - 1) * limit
      const paginatedQuestions = filteredQuestions.slice(start, start + limit)
      
      return NextResponse.json({
        success: true,
        questions: paginatedQuestions,
        pagination: {
          page,
          limit,
          total: filteredQuestions.length,
          totalPages: Math.ceil(filteredQuestions.length / limit)
        }
      })
    }
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
