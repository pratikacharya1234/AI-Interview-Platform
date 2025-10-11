'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  User,
  Camera,
  Loader2,
  ArrowRight,
  BarChart3,
  BookOpen
} from 'lucide-react'

interface InterviewData {
  id: string
  startTime: string
  endTime?: string
  duration: number
  messages: any[]
  videoEnabled: boolean
  feedback?: any
  metrics?: any
  createdAt?: string
}

interface FeedbackClientProps {
  interviewId: string
}

export default function FeedbackClient({ interviewId }: FeedbackClientProps) {
  const [interview, setInterview] = useState<InterviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (interviewId) {
      fetchInterviewData()
    }
  }, [interviewId])

  const fetchInterviewData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/interview/save?id=${interviewId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch interview: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setInterview(data.interview)
      } else {
        throw new Error(data.error || 'Interview not found')
      }
    } catch (error) {
      console.error('Error fetching interview:', error)
      setError(error instanceof Error ? error.message : 'Failed to load interview feedback')
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
      month: 'long',
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

  const getScoreBadgeVariant = (score: number) => {
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
            <p className="text-gray-600">Loading your interview feedback...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Link href="/interview/history">
            <Button variant="outline">
              Back to History
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Interview Not Found</h1>
          <p className="text-gray-600 mb-6">The requested interview could not be found.</p>
          <Link href="/interview/history">
            <Button variant="outline">
              Back to History
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
          <p className="text-gray-600">
            AI-powered analysis of your interview performance
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/interview/history">
            <Button variant="outline">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to History
            </Button>
          </Link>
          <Link href="/interview">
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              New Interview
            </Button>
          </Link>
        </div>
      </div>

      {/* Interview Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Interview Overview
          </CardTitle>
          <CardDescription>
            Completed on {interview.createdAt ? formatDate(interview.createdAt) : formatDate(interview.startTime)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatDuration(interview.duration)}</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{interview.messages.length}</div>
              <div className="text-sm text-gray-600">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {interview.metrics?.completionRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {interview.videoEnabled ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-gray-600">Video Enabled</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Scores */}
      {interview.feedback?.scores && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(interview.feedback.scores).map(([category, score]: [string, any]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-medium">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge variant={getScoreBadgeVariant(score)}>
                      {score}/100
                    </Badge>
                  </div>
                  <Progress value={score} className="h-3" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className={`text-6xl font-bold mb-4 ${getScoreColor(interview.feedback.scores.overall)}`}>
                  {interview.feedback.scores.overall}
                </div>
                <div className="text-lg text-gray-600 mb-4">Overall Score</div>
                <Badge 
                  variant={getScoreBadgeVariant(interview.feedback.scores.overall)} 
                  className="text-lg px-4 py-2"
                >
                  {interview.feedback.scores.overall >= 85 ? 'Excellent' :
                   interview.feedback.scores.overall >= 70 ? 'Good' :
                   interview.feedback.scores.overall >= 60 ? 'Fair' : 'Needs Improvement'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Feedback */}
      {interview.feedback && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {interview.feedback.strengths?.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <TrendingUp className="w-5 h-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {interview.feedback.improvements?.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overall Feedback */}
      {interview.feedback?.overall && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              AI Feedback Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {interview.feedback.overall}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {interview.feedback?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <BookOpen className="w-5 h-5" />
              Recommendations for Next Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {interview.feedback.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
