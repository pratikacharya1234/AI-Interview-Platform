import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Mock categories for development/testing
const mockCategories = [
  {
    id: 'javascript',
    name: 'JavaScript',
    slug: 'javascript',
    icon: 'code',
    color: 'yellow',
    question_count: 25,
    is_active: true
  },
  {
    id: 'data-structures',
    name: 'Data Structures',
    slug: 'data-structures',
    icon: 'database',
    color: 'blue',
    question_count: 30,
    is_active: true
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    slug: 'algorithms',
    icon: 'cpu',
    color: 'red',
    question_count: 35,
    is_active: true
  },
  {
    id: 'system-design',
    name: 'System Design',
    slug: 'system-design',
    icon: 'layout',
    color: 'purple',
    question_count: 20,
    is_active: true
  },
  {
    id: 'behavioral',
    name: 'Behavioral',
    slug: 'behavioral',
    icon: 'users',
    color: 'green',
    question_count: 40,
    is_active: true
  },
  {
    id: 'react',
    name: 'React',
    slug: 'react',
    icon: 'component',
    color: 'blue',
    question_count: 28,
    is_active: true
  }
]

export async function GET(request: NextRequest) {
  try {
    // Try to use Supabase if available
    try {
      const cookieStore = await cookies()
      const supabase = await createClient(cookieStore)
      
      const { data: categories, error } = await supabase
        .from('question_categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })
      
      if (error) {
        throw error
      }
      
      return NextResponse.json({
        success: true,
        categories: categories || []
      })
    } catch (dbError) {
      // If database is not available, use mock data
      console.log('Using mock categories due to database error:', dbError)
      
      return NextResponse.json({
        success: true,
        categories: mockCategories
      })
    }
  } catch (error) {
    console.error('Error in categories API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
