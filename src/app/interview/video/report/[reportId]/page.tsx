'use client'

/**
 * Video Interview Report Page
 * Displays comprehensive feedback after video interview
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Award,
  Target,
  Lightbulb,
  BarChart3,
  Clock,
  MessageSquare,
  Loader2,
  Download,
  Share2
} from 'lucide-react'

interface Report {
  id: string
  session_id: string
  avg_technical_score?: number
  avg_clarity_score?: number
  avg_confidence_score?: number
  avg_behavioral_score?: number
  overall_score?: number
  strengths?: string[]
  weaknesses?: string[]
  key_highlights?: string[]
  immediate_improvements?: string[]
  practice_areas?: string[]
  total_speaking_time_seconds?: number
  avg_speech_pace?: number
  total_filler_words?: number
  questions_answered?: number
  report_json: any
  percentile_rank?: number
}

export default function VideoInterviewReportPage({ params }: { params: { reportId: string } }) {
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [params.reportId])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/video-interview/report/${params.reportId}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data.report)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground'
    if (score >= 8) return 'text-green-500'
    if (score >= 6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBadge = (score?: number) => {
    if (!score) return 'N/A'
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Needs Work'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The interview report you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.push('/interview')}>
              Back to Interviews
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Interview Report</h1>
            <p className="text-muted-foreground">
              {report.report_json?.session_summary?.job_title || 'Video Interview'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Overall Performance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">
                    {report.overall_score?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="text-2xl opacity-75">/10</span>
                </div>
                <p className="text-sm mt-2 opacity-90">
                  {getScoreBadge(report.overall_score)}
                </p>
              </div>
              <div className="text-right">
                <Award className="h-16 w-16 opacity-75 mb-2" />
                {report.percentile_rank && (
                  <p className="text-sm">
                    Top {100 - report.percentile_rank}% of candidates
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Score Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Technical Skills</span>
                <span className={`font-bold ${getScoreColor(report.avg_technical_score)}`}>
                  {report.avg_technical_score?.toFixed(1) || 'N/A'}/10
                </span>
              </div>
              <Progress value={(report.avg_technical_score || 0) * 10} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Communication Clarity</span>
                <span className={`font-bold ${getScoreColor(report.avg_clarity_score)}`}>
                  {report.avg_clarity_score?.toFixed(1) || 'N/A'}/10
                </span>
              </div>
              <Progress value={(report.avg_clarity_score || 0) * 10} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Confidence & Delivery</span>
                <span className={`font-bold ${getScoreColor(report.avg_confidence_score)}`}>
                  {report.avg_confidence_score?.toFixed(1) || 'N/A'}/10
                </span>
              </div>
              <Progress value={(report.avg_confidence_score || 0) * 10} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Behavioral Responses</span>
                <span className={`font-bold ${getScoreColor(report.avg_behavioral_score)}`}>
                  {report.avg_behavioral_score?.toFixed(1) || 'N/A'}/10
                </span>
              </div>
              <Progress value={(report.avg_behavioral_score || 0) * 10} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Strengths and Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.strengths && report.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {report.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No strengths identified yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Target className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.weaknesses && report.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {report.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingDown className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Great job! Keep up the good work.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Personalized Recommendations
            </CardTitle>
            <CardDescription>
              Action items to improve your interview performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report.report_json?.recommendations && report.report_json.recommendations.length > 0 ? (
              <div className="space-y-3">
                {report.report_json.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific recommendations at this time.</p>
            )}
          </CardContent>
        </Card>

        {/* Interview Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Interview Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {report.total_speaking_time_seconds 
                    ? Math.round(report.total_speaking_time_seconds / 60) 
                    : 0}m
                </p>
                <p className="text-xs text-muted-foreground">Speaking Time</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{report.questions_answered || 0}</p>
                <p className="text-xs text-muted-foreground">Questions Answered</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {report.avg_speech_pace ? Math.round(report.avg_speech_pace) : 0}
                </p>
                <p className="text-xs text-muted-foreground">Words/Min</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <AlertCircle className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{report.total_filler_words || 0}</p>
                <p className="text-xs text-muted-foreground">Filler Words</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={() => router.push('/interview/video')} className="flex-1">
            Start New Interview
          </Button>
          <Button variant="outline" onClick={() => router.push('/interview/history')} className="flex-1">
            View History
          </Button>
        </div>
      </div>
    </div>
  )
}
