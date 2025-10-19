'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Play, FileText, Video, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface InterviewData {
  id: string
  type: string
  title: string
  description: string
  status: string
  created_at: string
}

export default function InterviewPage() {
  const params = useParams()
  const router = useRouter()
  const [interview, setInterview] = useState<InterviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInterviewData()
  }, [params.id])

  const fetchInterviewData = async () => {
    try {
      setLoading(true)
      
      // Fetch from Supabase
      const supabase = (await import('@/lib/supabase/client')).createClient()
      
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }
      
      // Try to fetch existing interview
      const { data: interviewData, error: fetchError } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (fetchError || !interviewData) {
        // Create a new interview if not found
        const newInterview: InterviewData = {
          id: params.id as string,
          type: 'audio',
          title: 'Interview Session',
          description: 'AI-powered interview practice session',
          status: 'pending',
          created_at: new Date().toISOString()
        }
        
        // Save to database
        const { data: savedInterview } = await supabase
          .from('interviews')
          .insert({
            id: newInterview.id,
            user_id: user.id,
            type: newInterview.type,
            title: newInterview.title,
            description: newInterview.description,
            status: newInterview.status,
            created_at: newInterview.created_at
          })
          .select()
          .single()
        
        setInterview(savedInterview || newInterview)
      } else {
        setInterview({
          id: interviewData.id,
          type: interviewData.type || 'audio',
          title: interviewData.title || interviewData.position || 'Interview Session',
          description: interviewData.description || 'AI-powered interview practice',
          status: interviewData.status,
          created_at: interviewData.created_at || interviewData.started_at
        })
      }
    } catch (err) {
      setError('Failed to load interview data')
      console.error('Error fetching interview:', err)
    } finally {
      setLoading(false)
    }
  }

  const startInterview = () => {
    if (!interview) return
    
    // Redirect based on interview type
    if (interview.type === 'video') {
      router.push(`/interview/video?id=${interview.id}`)
    } else if (interview.type === 'text') {
      router.push(`/interview/text?id=${interview.id}`)
    } else if (interview.type === 'audio') {
      router.push(`/interview/audio?id=${interview.id}`)
    } else {
      // Default to text interview for unknown types
      router.push(`/interview/text?id=${interview.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error || !interview) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500 mb-4">{error || 'Interview not found'}</p>
            <Button onClick={() => router.push('/interview')}>
              Back to Interviews
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getIcon = () => {
    switch (interview.type) {
      case 'video':
        return <Video className="w-6 h-6" />
      case 'text':
        return <FileText className="w-6 h-6" />
      default:
        return <MessageSquare className="w-6 h-6" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getIcon()}
            {interview.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {interview.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium capitalize">{interview.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{interview.status}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={startInterview}
              size="lg"
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Interview
            </Button>
            
            <Link href="/interview/history">
              <Button variant="outline" size="lg">
                View History
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
