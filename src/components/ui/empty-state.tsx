'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Waves, Mic, Target, BookOpen, BarChart3, Clock } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  icon?: any
  showStartInterview?: boolean
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel = "Get Started", 
  actionHref = "/interview",
  icon: Icon = Waves,
  showStartInterview = true 
}: EmptyStateProps) {
  return (
    <Card className="max-w-2xl mx-auto text-center py-12">
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-prism-teal/10 rounded-full flex items-center justify-center">
            <Icon className="w-10 h-10 text-prism-teal" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-obsidian dark:text-pearl">
            {title}
          </h2>
          <p className="text-silver max-w-md mx-auto">
            {description}
          </p>
        </div>

        {showStartInterview && (
          <div className="space-y-4">
            <Link href={actionHref}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-prism-teal to-lavender-mist hover:shadow-prism-glow"
                icon={<Mic className="w-5 h-5" />}
              >
                {actionLabel}
              </Button>
            </Link>
            
            <div className="flex justify-center gap-6 text-sm text-silver">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Real-Time Feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Skill Assessment</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function InterviewEmptyState() {
  return (
    <EmptyState
      title="Start Your First Voice Interview"
      description="Practice with our AI interviewer using natural speech conversations. Get instant feedback and improve your interview skills."
      actionLabel="Start Voice Interview"
      actionHref="/interview"
      icon={Waves}
    />
  )
}

export function AnalyticsEmptyState() {
  return (
    <EmptyState
      title="No Analytics Data Yet"
      description="Complete your first voice interview to see detailed performance analytics, skill assessments, and improvement recommendations."
      actionLabel="Take First Interview"
      actionHref="/interview"
      icon={BarChart3}
    />
  )
}

export function HistoryEmptyState() {
  return (
    <EmptyState
      title="No Interview History"
      description="Your completed interviews will appear here. Start practicing to build your interview history and track your progress."
      actionLabel="Start First Interview"
      actionHref="/interview"
      icon={Clock}
    />
  )
}