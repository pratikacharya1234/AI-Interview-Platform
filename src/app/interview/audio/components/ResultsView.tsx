import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Trophy,
  TrendingUp,
  Target,
  Brain,
  MessageSquare,
  Users,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Star,
  Award,
  BarChart3,
  FileText,
  ArrowRight
} from 'lucide-react'
import { InterviewSession, Response, InterviewFeedback, InterviewMetrics } from '../types'

interface ResultsViewProps {
  session: InterviewSession | null
  responses: Response[]
  feedback: InterviewFeedback | null
  metrics: InterviewMetrics
  onRestartInterview: () => void
}

export default function ResultsView({
  session,
  responses,
  feedback,
  metrics,
  onRestartInterview
}: ResultsViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excellent'
    if (score >= 7) return 'Good'
    if (score >= 5) return 'Average'
    return 'Needs Improvement'
  }

  const downloadReport = () => {
    const report = {
      session,
      responses,
      feedback,
      metrics,
      generatedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-report-${session?.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here&apos;s your comprehensive performance analysis
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className={`text-6xl font-bold ${getScoreColor(feedback?.overallScore || 0)}`}>
                {feedback?.overallScore || 0}/10
              </div>
              <Badge className="mt-2" variant="outline">
                {getScoreLabel(feedback?.overallScore || 0)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Brain className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-2xl font-semibold">{feedback?.technicalScore || 0}/10</div>
                <p className="text-sm text-slate-600">Technical Skills</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <MessageSquare className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-2xl font-semibold">{feedback?.communicationScore || 0}/10</div>
                <p className="text-sm text-slate-600">Communication</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
                <div className="text-2xl font-semibold">{feedback?.problemSolvingScore || 0}/10</div>
                <p className="text-sm text-slate-600">Problem Solving</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
                <div className="text-2xl font-semibold">{feedback?.cultureFitScore || 0}/10</div>
                <p className="text-sm text-slate-600">Culture Fit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Interview Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Questions Answered</span>
                <span className="font-medium">{session?.answeredQuestions}/{session?.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Average Response Time</span>
                <span className="font-medium">{Math.round(metrics.averageResponseTime)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Keywords Matched</span>
                <span className="font-medium">{metrics.keywordsMatched}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Confidence Level</span>
                <span className="font-medium">{metrics.confidenceLevel.toFixed(1)}/10</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback?.strengths.slice(0, 4).map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback?.areasForImprovement.slice(0, 4).map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {feedback?.detailedAnalysis || 'Your interview performance shows a solid foundation with room for growth in specific areas.'}
            </p>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback?.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {feedback?.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Response Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Response Summary</CardTitle>
            <CardDescription>Review your answers and their analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {responses.slice(0, 5).map((response, index) => (
                <div key={response.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Question {index + 1}</Badge>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        Score: {response.analysis?.score}/10
                      </Badge>
                      <Badge 
                        variant={response.analysis?.sentiment === 'positive' ? 'default' : 'outline'}
                      >
                        {response.analysis?.sentiment}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {response.transcript}
                  </p>
                  {index < responses.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={downloadReport}
          >
            <Download className="h-5 w-5 mr-2" />
            Download Report
          </Button>
          
          <Button
            size="lg"
            onClick={onRestartInterview}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Start New Interview
          </Button>
        </div>
      </div>
    </div>
  )
}
