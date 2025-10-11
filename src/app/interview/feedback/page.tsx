'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import FeedbackClient from './feedback-client'
import { Loader2 } from 'lucide-react'

function FeedbackPageContent() {
  const searchParams = useSearchParams()
  const interviewId = searchParams.get('id')

  if (!interviewId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Interview Not Found</h1>
          <p className="text-gray-600">Please provide a valid interview ID to view feedback.</p>
        </div>
      </div>
    )
  }

  return <FeedbackClient interviewId={interviewId} />
}

export default function InterviewFeedbackPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading feedback...</p>
          </div>
        </div>
      </div>
    }>
      <FeedbackPageContent />
    </Suspense>
  )
}