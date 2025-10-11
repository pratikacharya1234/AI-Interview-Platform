import { Metadata } from 'next'
import PerformanceClient from './performance-client'

export const metadata: Metadata = {
  title: 'Interview Performance | AI Interview Platform',
  description: 'Analyze your interview performance with detailed metrics, skill breakdown, and improvement recommendations.',
  keywords: 'interview performance, analytics, skill assessment, improvement tracking',
}

export default function InterviewPerformancePage() {
  return <PerformanceClient />
}