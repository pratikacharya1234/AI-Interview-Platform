import { Metadata } from 'next'
import QuestionBank from '@/components/questions/QuestionBank'

export const metadata: Metadata = {
  title: 'Question Bank | AI Interview Platform',
  description: 'Browse and practice with our AI-generated interview questions',
}

export default function QuestionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <QuestionBank />
    </div>
  )
}
