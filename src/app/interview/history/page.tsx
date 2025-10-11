import { Metadata } from 'next'
import InterviewHistoryClient from './history-client'

export const metadata: Metadata = {
  title: 'Interview History | AI Interview Platform',
  description: 'View your past interview sessions and performance history',
}

export default function InterviewHistoryPage() {
  return <InterviewHistoryClient />
}