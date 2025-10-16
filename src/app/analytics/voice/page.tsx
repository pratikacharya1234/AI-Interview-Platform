'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Mic, TrendingUp, MessageSquare, Volume2, Loader2 } from 'lucide-react'

interface VoiceAnalytics {
  analyses: any[]
  summary: {
    average_confidence: number
    average_clarity: number
    total_filler_words: number
    average_speech_pace: number
    dominant_emotion: string
    overall_improvement: string
  }
}

export default function VoiceAnalysisPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const [analytics, setAnalytics] = useState<VoiceAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      fetchAnalytics()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/voice-analysis?sessionId=${sessionId}&action=analytics`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching voice analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getEmotionBadge = (emotion: string) => {
    const colors: Record<string, string> = {
      confident: 'bg-green-500',
      enthusiastic: 'bg-blue-500',
      calm: 'bg-purple-500',
      nervous: 'bg-yellow-500',
      uncertain: 'bg-orange-500'
    }
    return <Badge className={colors[emotion] || 'bg-gray-500'}>{emotion}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!sessionId || !analytics) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mic className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Voice Analysis Available</h3>
            <p className="text-muted-foreground text-center">
              Complete a voice interview to see your voice analysis
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Mic className="h-8 w-8 text-primary" />
          Voice Analysis
        </h1>
        <p className="text-muted-foreground">
          Detailed analysis of your voice, tone, and speech patterns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${getScoreColor(analytics.summary.average_confidence)}`}>
              {analytics.summary.average_confidence}%
            </div>
            <Progress value={analytics.summary.average_confidence} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Clarity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${getScoreColor(analytics.summary.average_clarity)}`}>
              {analytics.summary.average_clarity}%
            </div>
            <Progress value={analytics.summary.average_clarity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Speech Pace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {analytics.summary.average_speech_pace}
            </div>
            <p className="text-xs text-muted-foreground mt-1">words/min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Filler Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {analytics.summary.total_filler_words}
            </div>
            <p className="text-xs text-muted-foreground mt-1">total count</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Dominant Emotion</CardTitle>
            <CardDescription>Primary emotional tone detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              {getEmotionBadge(analytics.summary.dominant_emotion)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Improvement
            </CardTitle>
            <CardDescription>Performance trend</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-4 text-muted-foreground">
              {analytics.summary.overall_improvement}
            </p>
          </CardContent>
        </Card>
      </div>

      {analytics.analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Response Analysis</CardTitle>
            <CardDescription>
              Detailed breakdown of each response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.analyses.map((analysis, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Response {index + 1}</h4>
                    <Badge>Confidence: {analysis.confidence_score}%</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Clarity</p>
                      <p className="font-semibold">{analysis.clarity_score}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Speech Pace</p>
                      <p className="font-semibold">{analysis.speech_pace} wpm</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
