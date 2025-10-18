"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Award,
  Download,
  Share2
} from "lucide-react"

interface InterviewSummaryProps {
  messages: Array<{
    role: string
    content: string
    timestamp: Date
  }>
  interviewType: 'video' | 'audio'
  duration: number
}

export function InterviewSummary({ messages, interviewType, duration }: InterviewSummaryProps) {
  const questionsAsked = messages.filter(m => m.role === 'assistant').length
  const userResponses = messages.filter(m => m.role === 'user').length - 1 // Exclude initial prompt
  
  // Calculate average response time (mock data for now)
  const avgResponseTime = Math.floor(duration / Math.max(userResponses, 1))
  
  // Mock performance metrics
  const performanceMetrics = {
    clarity: 85,
    confidence: 78,
    relevance: 92,
    overall: 85
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const downloadTranscript = () => {
    const transcript = messages.map(m => 
      `${m.role === 'user' ? 'You' : 'Interviewer'}: ${m.content}`
    ).join('\n\n')
    
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-transcript-${new Date().toISOString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Interview Summary
            <Badge variant="outline" className="ml-2">
              {interviewType === 'video' ? 'Video' : 'Audio'} Interview
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</p>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{questionsAsked}</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{avgResponseTime}s</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{performanceMetrics.overall}%</p>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold">Performance Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(performanceMetrics).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize text-sm">{key}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${getPerformanceColor(value)}`}>
                      {value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className="space-y-3">
            <h4 className="font-semibold">Key Insights</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Strong technical knowledge demonstrated throughout the interview</li>
              <li>• Clear communication and well-structured responses</li>
              <li>• Good examples provided for behavioral questions</li>
              <li>• Consider providing more specific metrics in your examples</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={downloadTranscript} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Transcript
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
