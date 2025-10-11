'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useInterview } from '@/hooks/useInterview'
import { QuestionType } from '@/lib/gemini'
import { 
  Play, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Target, 
  BarChart3,
  MessageSquare,
  Lightbulb,
  Award,
  History,
  User,
  Bot
} from 'lucide-react'

interface InterviewStartFormProps {
  onStart: (data: {
    candidateName: string
    position: string
    company: string
    questionTypes: QuestionType[]
    difficulty: 'easy' | 'medium' | 'hard'
    questionCount: number
  }) => void
  isLoading: boolean
}

function InterviewStartForm({ onStart, isLoading }: InterviewStartFormProps) {
  const [formData, setFormData] = useState({
    candidateName: '',
    position: '',
    company: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    questionCount: 3
  })
  
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['technical', 'behavioral'])

  const questionTypeOptions: { type: QuestionType; label: string; description: string; icon: any }[] = [
    { type: 'technical', label: 'Technical', description: 'Technology and skills-based questions', icon: Target },
    { type: 'behavioral', label: 'Behavioral', description: 'Situation-based and soft skills questions', icon: MessageSquare },
    { type: 'system-design', label: 'System Design', description: 'Architecture and scalability questions', icon: BarChart3 },
    { type: 'coding', label: 'Coding', description: 'Programming and algorithm questions', icon: Lightbulb },
    { type: 'general', label: 'General', description: 'Company and role-specific questions', icon: Award }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTypes.length === 0) return

    onStart({
      ...formData,
      questionTypes: selectedTypes
    })
  }

  const toggleQuestionType = (type: QuestionType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  return (
    <Card className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-obsidian dark:text-pearl mb-2">
          AI Interview Assistant
        </h1>
        <p className="text-silver">
          Powered by Google Gemini AI - Practice with realistic interview questions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Your Name"
            value={formData.candidateName}
            onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
            required
            placeholder="Enter your full name"
          />
          <Input
            label="Position"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            required
            placeholder="e.g. Software Engineer"
          />
        </div>

        <Input
          label="Company"
          value={formData.company}
          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
          required
          placeholder="e.g. Google, Microsoft, Startup Inc."
        />

        <div>
          <label className="block text-sm font-medium text-obsidian dark:text-pearl mb-3">
            Question Types
          </label>
          <div className="grid md:grid-cols-2 gap-3">
            {questionTypeOptions.map(({ type, label, description, icon: Icon }) => (
              <div
                key={type}
                onClick={() => toggleQuestionType(type)}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all duration-200
                  ${selectedTypes.includes(type)
                    ? 'border-prism-teal bg-prism-teal/10 shadow-prism-glow'
                    : 'border-silver/20 hover:border-silver/40'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-prism-teal mt-0.5" />
                  <div>
                    <div className="font-medium text-obsidian dark:text-pearl">
                      {label}
                    </div>
                    <div className="text-sm text-silver mt-1">
                      {description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-obsidian dark:text-pearl mb-2">
              Difficulty Level
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                difficulty: e.target.value as 'easy' | 'medium' | 'hard' 
              }))}
              className="w-full p-3 border border-silver/20 rounded-lg bg-background text-obsidian dark:text-pearl"
            >
              <option value="easy">Easy - Entry Level</option>
              <option value="medium">Medium - Mid Level</option>
              <option value="hard">Hard - Senior Level</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-obsidian dark:text-pearl mb-2">
              Number of Questions
            </label>
            <select
              value={formData.questionCount}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                questionCount: parseInt(e.target.value) 
              }))}
              className="w-full p-3 border border-silver/20 rounded-lg bg-background text-obsidian dark:text-pearl"
            >
              <option value={3}>3 Questions (~15 min)</option>
              <option value={5}>5 Questions (~25 min)</option>
              <option value={7}>7 Questions (~35 min)</option>
              <option value={10}>10 Questions (~50 min)</option>
            </select>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={selectedTypes.length === 0 || isLoading}
          className="w-full"
          size="lg"
          icon={<Play className="w-5 h-5" />}
        >
          {isLoading ? 'Generating Questions...' : 'Start Interview'}
        </Button>
      </form>
    </Card>
  )
}

interface QuestionDisplayProps {
  question: any
  questionNumber: number
  totalQuestions: number
  onSubmit: (answer: string) => void
  isLoading: boolean
  responses: any[]
}

interface InterviewHistoryProps {
  responses: any[]
  currentQuestionIndex: number
}

function InterviewHistory({ responses, currentQuestionIndex }: InterviewHistoryProps) {
  if (responses.length === 0) return null

  return (
    <Card className="max-w-4xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-prism-teal" />
          Interview Progress ({responses.length}/{currentQuestionIndex + 1} completed)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {responses.map((response, index) => (
          <div key={response.questionId} className="border-l-4 border-prism-teal pl-4 py-2">
            <div className="flex items-start gap-3 mb-2">
              <Bot className="w-4 h-4 text-prism-teal mt-1" />
              <div className="text-sm font-medium text-obsidian dark:text-pearl">
                Question {index + 1}
              </div>
            </div>
            <div className="ml-7 mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-obsidian dark:text-pearl">{response.question}</p>
            </div>
            
            <div className="flex items-start gap-3 mb-2">
              <User className="w-4 h-4 text-green-600 mt-1" />
              <div className="text-sm font-medium text-obsidian dark:text-pearl">
                Your Answer
              </div>
            </div>
            <div className="ml-7 mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-obsidian dark:text-pearl">{response.userResponse}</p>
            </div>

            <div className="ml-7 flex items-center gap-4 text-xs">
              <Badge variant="secondary">
                Score: {response.score}/10
              </Badge>
              <div className="text-silver">
                {response.strengths?.length > 0 && (
                  <span>✓ {response.strengths.length} strength(s)</span>
                )}
                {response.improvements?.length > 0 && (
                  <span className="ml-2">→ {response.improvements.length} improvement(s)</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function QuestionDisplay({ question, questionNumber, totalQuestions, onSubmit, isLoading, responses }: QuestionDisplayProps) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (answer.trim() && !isLoading) {
      onSubmit(answer.trim())
      setAnswer('')
    }
  }

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-amber-100 text-amber-800', 
    hard: 'bg-red-100 text-red-800'
  }

  const typeIcons: Record<QuestionType, any> = {
    technical: Target,
    behavioral: MessageSquare,
    'system-design': BarChart3,
    coding: Lightbulb,
    general: Award
  }

  const Icon = typeIcons[question.type as QuestionType] || Target

  return (
    <>
      <InterviewHistory responses={responses} currentQuestionIndex={questionNumber - 1} />
      
      <Card className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                Question {questionNumber} of {totalQuestions}
              </Badge>
              <Badge className={difficultyColors[question.difficulty as keyof typeof difficultyColors]}>
                {question.difficulty}
              </Badge>
              {responses.length > 0 && (
                <Badge variant="secondary">
                  {responses.length} completed
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-silver">
              <Clock className="w-4 h-4" />
              <span>{question.expectedDuration} min</span>
            </div>
          </div>

          <Progress 
            value={(questionNumber / totalQuestions) * 100}
            className="mb-6"
            variant="ai-prism"
          />
        </div>

      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <Icon className="w-6 h-6 text-prism-teal mt-1" />
          <div>
            <div className="text-sm text-prism-teal font-medium mb-1">
              {question.category} • {question.type.replace('-', ' ').toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold text-obsidian dark:text-pearl">
              {question.question}
            </h2>
          </div>
        </div>

        {question.followUp && question.followUp.length > 0 && (
          <div className="ml-10 p-4 bg-silver/5 rounded-lg">
            <div className="text-sm font-medium text-obsidian dark:text-pearl mb-2">
              Consider these follow-up points:
            </div>
            <ul className="text-sm text-silver space-y-1">
              {question.followUp.map((followUp: string, index: number) => (
                <li key={index}>• {followUp}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-obsidian dark:text-pearl mb-2">
            Your Answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Take your time to provide a detailed answer..."
            rows={8}
            className="w-full p-4 border border-silver/20 rounded-lg bg-background text-obsidian dark:text-pearl resize-vertical focus:border-prism-teal focus:ring-2 focus:ring-prism-teal/20"
            required
          />
          <div className="text-xs text-silver mt-2">
            Tip: Be specific, provide examples, and explain your thought process.
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!answer.trim() || isLoading}
          size="lg"
          icon={<ArrowRight className="w-5 h-5" />}
        >
          {isLoading ? 'Analyzing Answer...' : 'Submit Answer'}
        </Button>
      </form>
    </Card>
    </>
  )
}

export default function AIInterviewComponent() {
  const interview = useInterview({
    onQuestionComplete: (response) => {
      console.log('Question completed:', response)
    },
    onSessionComplete: (session) => {
      console.log('Interview completed:', session)
    },
    onError: (error) => {
      console.error('Interview error:', error)
    }
  })

  if (interview.error) {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Error</h3>
          <p>{interview.error}</p>
        </div>
        <Button onClick={interview.resetInterview}>
          Try Again
        </Button>
      </Card>
    )
  }

  if (!interview.isSessionActive && !interview.session) {
    return (
      <InterviewStartForm
        onStart={(data) => interview.startInterview(
          data.candidateName,
          data.position,
          data.company,
          data.questionTypes,
          data.difficulty,
          data.questionCount
        )}
        isLoading={interview.isLoading}
      />
    )
  }

  if (interview.currentQuestion && interview.isSessionActive) {
    return (
      <QuestionDisplay
        question={interview.currentQuestion}
        questionNumber={interview.currentQuestionIndex + 1}
        totalQuestions={interview.session?.questions.length || 0}
        onSubmit={interview.submitAnswer}
        isLoading={interview.isLoading}
        responses={interview.session?.responses || []}
      />
    )
  }

  // Interview completed with enhanced features
  if (interview.session && !interview.isSessionActive) {
    return (
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <Card className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">🎉 Interview Completed!</h2>
          <p className="text-gray-600 mb-6">Here&apos;s your comprehensive interview summary</p>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Overview
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {interview.session.overallScore?.toFixed(1) || 'N/A'}/10
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {interview.session.responses.length}
              </div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(((interview.session.endTime?.getTime() || Date.now()) - interview.session.startTime.getTime()) / 60000)}m
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {interview.session.overallPerformance?.level || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Performance Level</div>
            </div>
          </div>
        </Card>

        {/* Summary Image */}
        {interview.session.summaryImage && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🎨 Interview Summary Visualization
            </h3>
            <div className="text-center">
              <img 
                src={interview.session.summaryImage} 
                alt="Interview Summary" 
                className="max-w-md mx-auto rounded-lg shadow-lg"
              />
              <p className="text-sm text-gray-600 mt-2">Generated with Runware AI</p>
            </div>
          </Card>
        )}

        {/* Interview History */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Interview History
          </h3>
          <div className="space-y-4">
            {interview.session.responses.map((response, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-600">Question {index + 1}</span>
                  </div>
                  <p className="text-gray-800 italic">&quot;{response.question}&quot;</p>
                </div>
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-600">Your Answer</span>
                    <Badge variant={response.score >= 7 ? 'success' : response.score >= 5 ? 'secondary' : 'destructive'}>
                      {response.score}/10
                    </Badge>
                  </div>
                  <p className="text-gray-700">{response.userResponse}</p>
                </div>
                {response.feedback && (
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-600">AI Feedback</span>
                    </div>
                    <p className="text-sm text-blue-800">{response.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Overall Feedback */}
        {interview.session.feedback && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Overall Feedback & Recommendations
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-gray-700 whitespace-pre-wrap">
                {interview.session.feedback}
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="text-center">
          <Button onClick={interview.resetInterview} size="lg" className="mr-4">
            Start New Interview
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.print()}
          >
            Download Report
          </Button>
        </div>
      </div>
    )
  }

  return null
}