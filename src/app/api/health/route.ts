import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    
    // Check Supabase connection
    const { data: healthCheck, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    const supabaseStatus = !error ? 'connected' : 'disconnected'
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        supabase: supabaseStatus,
        authentication: user ? 'authenticated' : 'anonymous',
        database: !error ? 'connected' : error.message
      },
      user: user ? {
        id: user.id,
        email: user.email
      } : null
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        api: 'operational',
        supabase: 'error',
        authentication: 'error',
        database: 'error'
      }
    }, { status: 500 })
  }
}
