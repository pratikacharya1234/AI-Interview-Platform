"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { InterviewSession, InterviewSummary } from "@/types/interview"

interface InterviewSummaryViewProps {
  session: InterviewSession
  summary: InterviewSummary
}

export function InterviewSummaryView({ session, summary }: InterviewSummaryViewProps) {
  const router = useRouter()
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }
  
  const getRecommendationVariant = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_yes': return 'default'
      case 'yes': return 'secondary'
      case 'maybe': return 'outline'
      default: return 'destructive'
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-xl font-bold">Interview Complete</h1>
          <div className="w-24" />
        </div>
      </header>
      
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Interview Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(summary.overall_performance)}`}>
                {summary.overall_performance}%
              </div>
              <p className="text-muted-foreground mt-2">Overall Performance</p>
            </div>
            
            {/* Skills Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getScoreColor(summary.technical_skills)}`}>
                  {summary.technical_skills}%
                </div>
                <p className="text-sm text-muted-foreground">Technical</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getScoreColor(summary.communication_skills)}`}>
                  {summary.communication_skills}%
                </div>
                <p className="text-sm text-muted-foreground">Communication</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getScoreColor(summary.problem_solving)}`}>
                  {summary.problem_solving}%
                </div>
                <p className="text-sm text-muted-foreground">Problem Solving</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-semibold ${getScoreColor(summary.cultural_fit)}`}>
                  {summary.cultural_fit}%
                </div>
                <p className="text-sm text-muted-foreground">Cultural Fit</p>
              </div>
            </div>
            
            {/* Recommendation */}
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">Recommendation</h3>
              <Badge 
                className="mb-2" 
                variant={getRecommendationVariant(summary.recommendation) as any}
              >
                {summary.recommendation.replace('_', ' ').toUpperCase()}
              </Badge>
              <p className="text-sm text-muted-foreground">{summary.recommendation_reasoning}</p>
            </div>
            
            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-green-600">Strengths</h3>
                <ul className="space-y-1">
                  {summary.strengths.map((strength, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-yellow-600">Areas for Improvement</h3>
                <ul className="space-y-1">
                  {summary.weaknesses.map((weakness, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Next Steps */}
            <div>
              <h3 className="font-semibold mb-2">Suggested Next Steps</h3>
              <ul className="space-y-1">
                {summary.suggested_next_steps.map((step, i) => (
                  <li key={i} className="text-sm">• {step}</li>
                ))}
              </ul>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={() => router.push(`/api/report/${session.interview_id}`)} className="flex-1">
                View Full Report
              </Button>
              <Button variant="outline" onClick={() => router.push('/interview')} className="flex-1">
                Start New Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
