import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Mock question generation for development
function generateMockQuestions(params: any) {
  const { count = 5, category, difficulty = 'medium', questionType = 'open_ended' } = params
  
  const mockQuestions = []
  const templates = [
    'Explain the concept of {topic} in {category}',
    'How would you implement {topic} in a production environment?',
    'What are the best practices for {topic}?',
    'Compare and contrast {topic} with alternatives',
    'Describe a scenario where {topic} would be useful',
    'What are the trade-offs when using {topic}?',
    'How does {topic} work under the hood?',
    'What are common pitfalls with {topic}?'
  ]
  
  const topics = {
    javascript: ['closures', 'promises', 'async/await', 'prototypes', 'event loop'],
    'data-structures': ['binary trees', 'hash tables', 'graphs', 'heaps', 'tries'],
    algorithms: ['sorting', 'searching', 'dynamic programming', 'recursion', 'greedy algorithms'],
    'system-design': ['load balancing', 'caching', 'databases', 'microservices', 'message queues'],
    behavioral: ['teamwork', 'conflict resolution', 'leadership', 'problem-solving', 'communication']
  }
  
  const categoryTopics = topics[category as keyof typeof topics] || topics.javascript
  
  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)]
    const topic = categoryTopics[Math.floor(Math.random() * categoryTopics.length)]
    
    mockQuestions.push({
      id: `generated-${Date.now()}-${i}`,
      question_text: template.replace(/{topic}/g, topic).replace(/{category}/g, category),
      question_type: questionType,
      category_id: category,
      difficulty_level: difficulty,
      estimated_time_minutes: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15,
      sample_answer: `This is a sample answer for ${topic}...`,
      tags: [category, topic, difficulty],
      is_attempted: false,
      times_asked: 0,
      average_score: 0
    })
  }
  
  return mockQuestions
}

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
    
    // Try to use Supabase if available
    try {
      const cookieStore = await cookies()
      const supabase = await createClient(cookieStore)
      
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (!authError && user) {
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
        
        if (!queueError && queueItem) {
          // In a real implementation, this would trigger an async job
          // For now, we'll generate mock questions
          const questions = generateMockQuestions({ count, category, difficulty, questionType })
          
          // Save generated questions to database
          const { data: savedQuestions, error: saveError } = await supabase
            .from('question_bank')
            .insert(questions.map(q => ({
              ...q,
              generated_by: 'ai',
              is_active: true,
              is_reviewed: false
            })))
            .select()
          
          if (!saveError) {
            // Update queue status
            await supabase
              .from('question_generation_queue')
              .update({ status: 'completed' })
              .eq('id', queueItem.id)
            
            return NextResponse.json({
              success: true,
              count: savedQuestions?.length || 0,
              questions: savedQuestions
            })
          }
        }
      }
    } catch (dbError) {
      console.log('Database not available, using mock generation:', dbError)
    }
    
    // Fallback to mock generation
    const questions = generateMockQuestions({ count, category, difficulty, questionType })
    
    return NextResponse.json({
      success: true,
      count: questions.length,
      questions
    })
  } catch (error) {
    console.error('Error in question generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
