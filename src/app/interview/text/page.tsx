'use client'

import AIInterviewComponent from '@/components/AIInterviewComponent'

export default function TextInterviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Text-Based AI Interview</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Practice interview questions with our AI interviewer. Type your responses and receive detailed feedback to improve your skills.
        </p>
      </div>
      <AIInterviewComponent />
    </div>
  )
}