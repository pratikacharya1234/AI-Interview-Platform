import { requireAuth } from '@/lib/auth/supabase-auth'
import { NextRequest, NextResponse } from 'next/server'
import { personaService } from '@/lib/services/persona-service'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    if (!user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const personaId = searchParams.get('id')
    const companyType = searchParams.get('companyType')
    const difficulty = searchParams.get('difficulty')

    if (personaId) {
      const persona = await personaService.getPersonaById(personaId)
      return NextResponse.json(persona)
    }

    if (companyType) {
      const personas = await personaService.getPersonasByCompanyType(companyType)
      return NextResponse.json(personas)
    }

    if (difficulty) {
      const personas = await personaService.getPersonasByDifficulty(difficulty)
      return NextResponse.json(personas)
    }

    const personas = await personaService.getAllPersonas()
    return NextResponse.json(personas)
  } catch (error: any) {
    console.error('Error fetching personas:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch personas' },
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
    const { interview_type, difficulty, company_name } = body

    const persona = await personaService.selectOptimalPersona(
      interview_type,
      difficulty,
      company_name
    )

    return NextResponse.json(persona)
  } catch (error: any) {
    console.error('Error selecting persona:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to select persona' },
      { status: 500 }
    )
  }
}
