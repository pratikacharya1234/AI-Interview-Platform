'use client'

import { useRouter } from 'next/navigation'
import VideoInterview from '@/components/VideoInterview'
import { PageHeader } from '@/components/navigation/breadcrumbs'

export default function ConversationalInterviewPage() {
  const router = useRouter()

  const handleInterviewComplete = (interviewData: any) => {
    console.log('Interview completed:', interviewData)
    router.push(`/interview/feedback?id=${interviewData.id}`)
  }

  return (
    <>
      <PageHeader 
        title="AI Video Interview"
        description="Experience a face-to-face interview with our advanced AI interviewer. Your camera and microphone create a realistic interview environment with real-time feedback."
      />
      <VideoInterview onComplete={handleInterviewComplete} />
    </>
  )
}