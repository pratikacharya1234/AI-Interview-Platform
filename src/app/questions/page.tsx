import { Metadata } from 'next'
import QuestionsList from './questions-list'

export const metadata: Metadata = {
  title: 'Question Bank | AI Interview Platform',
  description: 'Browse and practice with our comprehensive question bank',
}

export default function QuestionsPage() {
  return <QuestionsList />
}
