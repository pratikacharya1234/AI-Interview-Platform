import { Metadata } from 'next'
import QuestionDetail from './question-detail'

export const metadata: Metadata = {
  title: 'Question | AI Interview Platform',
  description: 'Solve interview questions and improve your skills',
}

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <QuestionDetail questionId={id} />
}
