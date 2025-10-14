'use client'

import VideoInterviewNew from '@/components/VideoInterviewNew'

export default function ConversationalInterviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Video Interview</h1>
        <p className="text-muted-foreground">
          Experience a true conversational interview. The AI speaks first, then waits for you to respond. The AI listens to your actual words and responds accordingly - no pre-made questions!
        </p>
      </div>
      <VideoInterviewNew />
    </div>
  )
}