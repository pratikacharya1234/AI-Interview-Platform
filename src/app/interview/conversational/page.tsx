'use client'

import VideoInterviewRealtime from '@/components/VideoInterviewRealtime'

export default function ConversationalInterviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Video Interview</h1>
        <p className="text-muted-foreground">
          Experience a face-to-face interview with our advanced AI interviewer. The AI listens to your responses in real-time and asks intelligent follow-up questions.
        </p>
      </div>
      <VideoInterviewRealtime />
    </div>
  )
}