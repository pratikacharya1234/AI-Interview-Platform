import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { metricsService } from '@/lib/services/ai-features-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const metrics = await metricsService.getMetrics(session.user.email)
    return NextResponse.json(metrics)
  } catch (error: any) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await metricsService.updateMetrics(session.user.email)
    const updatedMetrics = await metricsService.getMetrics(session.user.email)
    
    return NextResponse.json(updatedMetrics)
  } catch (error: any) {
    console.error('Error updating metrics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update metrics' },
      { status: 500 }
    )
  }
}
