import { requireAuth } from '@/lib/auth/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'
import { companyService } from '@/lib/services/company-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const userId = user.id
    if (!user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyName = searchParams.get('name')
    const industry = searchParams.get('industry')
    const action = searchParams.get('action')

    if (companyName && action === 'stats') {
      const stats = await companyService.getCompanyInterviewStats(companyName)
      return NextResponse.json(stats)
    }

    if (companyName && action === 'questions') {
      const category = searchParams.get('category')
      const questions = await companyService.getCompanyQuestions(companyName, category || undefined)
      return NextResponse.json(questions)
    }

    if (companyName) {
      const company = await companyService.getCompanyByName(companyName)
      return NextResponse.json(company)
    }

    if (industry) {
      const companies = await companyService.getCompaniesByIndustry(industry)
      return NextResponse.json(companies)
    }

    const companies = await companyService.getAllCompanies()
    return NextResponse.json(companies)
  } catch (error: any) {
    console.error('Error in company API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch company data' },
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
    const { company_name, position, difficulty } = body

    const sessionId = await companyService.createCompanySimulation(
      user.id,
      company_name,
      position,
      difficulty
    )

    return NextResponse.json({ session_id: sessionId }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating company simulation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create simulation' },
      { status: 500 }
    )
  }
}
