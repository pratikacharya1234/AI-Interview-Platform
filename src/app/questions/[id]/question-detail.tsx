'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { questionService, Question } from '@/lib/api/questions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Code, FileText, AlertCircle } from 'lucide-react'

interface QuestionDetailProps {
  questionId: string
}

export default function QuestionDetail({ questionId }: QuestionDetailProps) {
  const router = useRouter()
  const { user } = useSupabase()
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuestion()
  }, [questionId])

  const loadQuestion = async () => {
    try {
      setLoading(true)
      const data = await questionService.getQuestionById(questionId, user?.id)
      setQuestion(data)
    } catch (err) {
      setError('Failed to load question')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error || 'Question not found'}</p>
            <Button className="mt-4" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Questions
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{question.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>{question.description}</p>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Difficulty: <span className="font-medium">{question.difficulty}</span>
            </p>
            <p className="text-sm text-gray-600">
              Points: <span className="font-medium">{question.points}</span>
            </p>
            <p className="text-sm text-gray-600">
              Type: <span className="font-medium">{question.type}</span>
            </p>
          </div>

          <div className="mt-6">
            <Button onClick={() => router.push(`/questions/${questionId}/attempt`)}>
              {question.type === 'coding' ? <Code className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
              Start Attempt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
