'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Eye,
  AlertCircle,
  Loader2,
  Trophy,
  Target,
  Users,
  BarChart3
} from 'lucide-react'

interface InterviewSession {
  id: string
  startTime: string
  endTime?: string
  duration: number
  messages: any[]
  videoEnabled: boolean
  recordingUrl?: string
  feedback?: any
  metrics?: any
  createdAt?: string
  updatedAt?: string
}

export default function HistoryClient() {
  const [interviews, setInterviews] = useState<InterviewSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/interview/save')
      if (!response.ok) {
        throw new Error(`Failed to fetch interviews: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setInterviews(data.interviews || [])
      } else {
        throw new Error(data.error || 'Failed to load interviews')
      }
    } catch (error) {
      console.error('Error fetching interviews:', error)
      setError(error instanceof Error ? error.message : 'Failed to load interview history')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreVariant = (score: number) => {
    if (score >= 85) return 'default'
    if (score >= 70) return 'secondary'
    if (score >= 60) return 'outline'
    return 'destructive'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your interview history...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Interview History</h1>
          <p className="text-gray-600">
            Track your progress and review past interview performances
          </p>
        </div>
        <Link href="/interview">
          <Button>
            <MessageSquare className="w-4 h-4 mr-2" />
            New Interview
          </Button>
        </Link>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {interviews.length === 0 && !error ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              No Interviews Yet
            </CardTitle>
            <CardDescription>
              You haven&apos;t completed any interviews yet. Start your first interview to see your history here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link href="/interview">
                <Button>Start First Interview</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {interviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Interview Session
                    </CardTitle>
                    <CardDescription>
                      {interview.createdAt ? formatDate(interview.createdAt) : formatDate(interview.startTime)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {interview.feedback?.scores?.overall && (
                      <Badge variant={getScoreVariant(interview.feedback.scores.overall)}>
                        <Trophy className="w-3 h-3 mr-1" />
                        {interview.feedback.scores.overall}/100
                      </Badge>
                    )}
                    <Link href={`/interview/feedback?id=${interview.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Interview Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Duration: {formatDuration(interview.duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Messages: {interview.messages.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Completion: {interview.metrics?.completionRate || 0}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Video: {interview.videoEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {/* Performance Scores */}
                {interview.feedback?.scores && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Performance Scores
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {Object.entries(interview.feedback.scores).map(([category, score]: [string, any]) => (
                        category !== 'overall' && (
                          <div key={category} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className={getScoreColor(score)}>{score}/100</span>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Feedback Preview */}
                {interview.feedback?.overall && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      <strong>Overall Feedback:</strong> {interview.feedback.overall}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
