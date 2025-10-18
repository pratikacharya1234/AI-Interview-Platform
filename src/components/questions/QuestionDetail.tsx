'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Clock, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  BookOpen,
  Code,
  MessageSquare,
  ChevronRight,
  Copy,
  Bookmark,
  Share2,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

interface QuestionDetailProps {
  question: {
    id: string
    question_text: string
    question_type: string
    difficulty_level: string
    estimated_time_minutes: number
    points?: number
    description?: string
    sample_answer?: string
    hints?: string[]
    solution_approach?: string
    code_template?: string
    test_cases?: any[]
    evaluation_criteria?: any
    tags?: string[]
    skills_tested?: string[]
    times_asked?: number
    times_answered?: number
    average_score?: number
    success_rate?: number
    is_attempted?: boolean
    question_categories?: {
      name: string
      color?: string
      icon?: string
    }
  }
  onClose: () => void
}

export default function QuestionDetail({ question, onClose }: QuestionDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  const [showHints, setShowHints] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<any>(null)
  const [userAnswer, setUserAnswer] = useState('')

  const handleSubmitAnswer = async () => {
    setIsSubmitting(true)
    try {
      // Submit answer to API for evaluation
      const response = await fetch('/api/questions/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          answer: userAnswer
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFeedback(data.feedback)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show toast notification
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>Question Details</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Question Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">
              {question.question_categories?.name || 'General'}
            </Badge>
            <Badge className={`
              ${question.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' : ''}
              ${question.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${question.difficulty_level === 'hard' ? 'bg-red-100 text-red-800' : ''}
              ${question.difficulty_level === 'expert' ? 'bg-purple-100 text-purple-800' : ''}
            `}>
              {question.difficulty_level}
            </Badge>
            <Badge variant="secondary">
              {question.question_type.replace('_', ' ')}
            </Badge>
            {question.is_attempted && (
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Attempted
              </Badge>
            )}
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {question.question_text}
          </h2>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{question.estimated_time_minutes} minutes</span>
            </div>
          </div>
        </div>

        {/* Code Template if available */}
        {question.code_template && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Code Template</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(question.code_template!)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">{question.code_template}</code>
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Answer Section */}
        <Tabs defaultValue="answer" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="answer">Your Answer</TabsTrigger>
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="answer" className="space-y-4">
            <Textarea
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={8}
              className="w-full"
            />
            
            {feedback && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <CardHeader>
                  <CardTitle className="text-sm">AI Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{feedback.message}</p>
                  {feedback.score && (
                    <div className="mt-2">
                      <Badge>Score: {feedback.score}/10</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowHints(!showHints)}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Show Hints
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="hints" className="space-y-4">
            {question.hints && question.hints.length > 0 ? (
              <div className="space-y-3">
                {question.hints.map((hint, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{hint}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hints available for this question.</p>
            )}
          </TabsContent>

          <TabsContent value="solution" className="space-y-4">
            {question.sample_answer ? (
              <div className="space-y-4">
                {question.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {question.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {question.code_template && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Code Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{question.code_template}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            {question.test_cases && question.test_cases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Test Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {question.test_cases.map((testCase: any, index: number) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        <p className="text-sm font-medium">Test Case {index + 1}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Input: {JSON.stringify(testCase.input)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Expected: {JSON.stringify(testCase.expected)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {question.evaluation_criteria && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Evaluation Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {typeof question.evaluation_criteria === 'string' 
                      ? question.evaluation_criteria 
                      : JSON.stringify(question.evaluation_criteria, null, 2)}
                  </div>
                </CardContent>
              </Card>
            )}
              </div>
            ) : (
              <p className="text-gray-500">No solution available yet.</p>
            )}
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            {question.skills_tested && question.skills_tested.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Skills Tested</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {question.skills_tested.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {question.tags && question.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Related Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {question.tags && question.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button 
            className="flex-1"
            onClick={() => {
              router.push(`/practice?questionId=${question.id}`)
              onClose()
            }}
          >
            Practice This Question
          </Button>
        </div>
      </div>
    </>
  )
}
