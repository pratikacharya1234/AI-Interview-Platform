'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Star, MessageSquare } from 'lucide-react'

export default function MentorFeedbackPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Star className="h-8 w-8 text-primary" />
          Mentor Feedback
        </h1>
        <p className="text-muted-foreground">
          Detailed feedback and recommendations from your mentors
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Feedback Yet</h3>
          <p className="text-muted-foreground text-center">
            Complete a mentor session to receive personalized feedback
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
