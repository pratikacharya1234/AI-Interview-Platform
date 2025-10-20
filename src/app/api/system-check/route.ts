import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    status: 'checking',
    services: {},
    database: {},
    apis: {},
    features: {}
  }

  try {
    // 1. Check Authentication
    const session = await getServerSession(authOptions)
    results.services.authentication = {
      status: session ? 'connected' : 'not authenticated',
      user: session?.user?.email || null
    }

    // 2. Check Supabase Connection
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    results.services.supabase = {
      url: supabaseUrl ? 'configured' : 'missing',
      key: supabaseKey ? 'configured' : 'missing',
      status: 'unknown'
    }

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // Test database tables
      const tables = [
        'interview_sessions',
        'video_interview_sessions',
        'video_interview_reports',
        'users',
        'achievements',
        'user_achievements',
        'learning_paths',
        'user_progress'
      ]

      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          results.database[table] = {
            exists: !error,
            count: count || 0,
            error: error?.message || null
          }
        } catch (err: any) {
          results.database[table] = {
            exists: false,
            error: err.message
          }
        }
      }
      
      results.services.supabase.status = 'connected'
    }

    // 3. Check AI Services
    // Gemini AI
    const geminiKey = process.env.GEMINI_API_KEY
    results.apis.gemini = {
      configured: !!geminiKey,
      status: 'unknown'
    }
    
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
        const result = await model.generateContent('Test connection')
        results.apis.gemini.status = result ? 'working' : 'error'
      } catch (err: any) {
        results.apis.gemini.status = 'error'
        results.apis.gemini.error = err.message
      }
    }

    // Vapi AI (Voice Interviews)
    results.apis.vapi = {
      configured: !!(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN && process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID),
      status: 'client-side only - check browser console'
    }

    // 4. Check Features
    results.features = {
      textInterview: {
        status: results.apis.gemini.configured ? 'available' : 'limited',
        dependencies: ['gemini']
      },
      voiceInterview: {
        status: 'available',
        note: 'Uses Web Speech API (client-side)'
      },
      videoInterview: {
        status: results.apis.gemini.configured || results.apis.claude.configured ? 'available' : 'limited',
        dependencies: ['gemini or claude', 'web speech api']
      },
      feedback: {
        status: results.apis.gemini.configured ? 'available' : 'limited',
        dependencies: ['gemini', 'database']
      },
      analytics: {
        status: results.services.supabase.status === 'connected' ? 'available' : 'limited',
        dependencies: ['database']
      },
      gamification: {
        status: results.services.supabase.status === 'connected' ? 'available' : 'limited',
        dependencies: ['database']
      }
    }

    // 5. Overall Status
    const criticalServices = [
      results.services.supabase.status === 'connected',
      results.apis.gemini.configured
    ]
    
    results.status = criticalServices.every(s => s) ? 'healthy' : 
                     criticalServices.some(s => s) ? 'degraded' : 'critical'

    // 6. Recommendations
    results.recommendations = []
    
    if (!results.services.supabase.url || !results.services.supabase.key) {
      results.recommendations.push('Configure Supabase credentials in environment variables')
    }
    
    if (!results.apis.gemini.configured) {
      results.recommendations.push('Add GEMINI_API_KEY for AI-powered features')
    }
    
    if (!results.apis.elevenlabs.configured) {
      results.recommendations.push('Add ELEVENLABS_API_KEY for text-to-speech features')
    }

    // Check for missing tables
    const missingTables = Object.entries(results.database)
      .filter(([_, info]: [string, any]) => !info.exists)
      .map(([table]) => table)
    
    if (missingTables.length > 0) {
      results.recommendations.push(`Create missing database tables: ${missingTables.join(', ')}`)
    }

    return NextResponse.json(results)

  } catch (error: any) {
    results.status = 'error'
    results.error = error.message
    return NextResponse.json(results, { status: 500 })
  }
}
