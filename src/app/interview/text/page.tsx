'use client'

import AIInterviewComponent from '@/components/AIInterviewComponent'
import { PageHeader } from '@/components/navigation/breadcrumbs'

export default function TextInterviewPage() {
  return (
    <>
      <PageHeader 
        title="Text-Based AI Interview"
        description="Practice interview questions with our AI interviewer. Type your responses and receive detailed feedback to improve your skills."
      />
      <AIInterviewComponent />
    </>
  )
}