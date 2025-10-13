'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  MessageSquare,
  Target,
  TrendingUp,
  Star,
  Play,
  Pause,
  RotateCcw,
  Send,
  Lightbulb,
  CheckCircle,
  Clock,
  Zap,
  BookOpen,
  Award,
  AlertTriangle
} from 'lucide-react'

interface CoachingSession {
  id: string
  topic: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: number
  completedSteps: number
  totalSteps: number
  status: 'not-started' | 'in-progress' | 'completed'
  aiInsights: string[]
  recommendedActions: string[]
  lastActivity: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
  type: 'text' | 'suggestion' | 'feedback'
}

const coachingSessions: CoachingSession[] = [
  {
    id: 'behavioral-stories',
    topic: 'Crafting Compelling Behavioral Stories',
    difficulty: 'Intermediate',
    duration: 45,
    completedSteps: 3,
    totalSteps: 6,
    status: 'in-progress',
    aiInsights: [
      'Your stories lack specific metrics - add quantifiable achievements',
      'Consider using the STAR method more consistently',
      'Focus on leadership examples that show growth'
    ],
    recommendedActions: [
      'Practice 3 more leadership stories',
      'Add specific numbers to impact statements',
      'Work on concise story structure'
    ],
    lastActivity: '2024-10-10T14:30:00Z'
  },
  {
    id: 'technical-communication',
    topic: 'Explaining Technical Concepts Simply',
    difficulty: 'Advanced',
    duration: 60,
    completedSteps: 0,
    totalSteps: 8,
    status: 'not-started',
    aiInsights: [],
    recommendedActions: [
      'Start with system design fundamentals',
      'Practice explaining algorithms to non-technical audience',
      'Work on whiteboarding skills'
    ],
    lastActivity: ''
  },
  {
    id: 'salary-negotiation',
    topic: 'Confident Salary Negotiation',
    difficulty: 'Beginner',
    duration: 30,
    completedSteps: 5,
    totalSteps: 5,
    status: 'completed',
    aiInsights: [
      'Strong preparation with market research',
      'Good use of value-based arguments',
      'Confident delivery improved significantly'
    ],
    recommendedActions: [],
    lastActivity: '2024-10-08T16:45:00Z'
  }
]

const chatHistory: ChatMessage[] = [
  {
    id: '1',
    role: 'ai',
    content: 'Hello! I\'m your AI Interview Coach. I\'ve analyzed your recent practice sessions and noticed you excel at technical problem-solving but could strengthen your behavioral responses. What would you like to work on today?',
    timestamp: '2024-10-11T09:00:00Z',
    type: 'text'
  },
  {
    id: '2',
    role: 'user',
    content: 'I want to improve my leadership stories for behavioral questions.',
    timestamp: '2024-10-11T09:01:00Z',
    type: 'text'
  },
  {
    id: '3',
    role: 'ai',
    content: 'Excellent choice! Based on your profile, I recommend focusing on the STAR method. Let\'s start with a situation where you led a challenging project. Can you tell me about a time when you had to lead a team through a difficult technical challenge?',
    timestamp: '2024-10-11T09:01:30Z',
    type: 'suggestion'
  },
  {
    id: '4',
    role: 'user',
    content: 'Last year, I led a team to migrate our legacy system to microservices. It was challenging because the team was resistant to change.',
    timestamp: '2024-10-11T09:02:00Z',
    type: 'text'
  },
  {
    id: '5',
    role: 'ai',
    content: 'Good start! I can see you have a solid situation. Now let\'s strengthen your story with specific details:\n\n1. What was the timeline and scope?\n2. How many team members were involved?\n3. What specific resistance did you encounter?\n4. What metrics improved after the migration?\n\nThese details will make your story much more compelling.',
    timestamp: '2024-10-11T09:02:30Z',
    type: 'feedback'
  }
]

export default function AICoachPage() {
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory)
  const [isTyping, setIsTyping] = useState(false)

  const currentSession = activeSession ? coachingSessions.find(s => s.id === activeSession) : null

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'not-started': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const startSession = (sessionId: string) => {
    setActiveSession(sessionId)
    // In production, this would initialize the AI coaching session
    console.log('Starting session:', sessionId)
  }

  const sendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: generateAIResponse(chatInput),
        timestamp: new Date().toISOString(),
        type: 'feedback'
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): string => {
    // Simple AI response simulation
    const responses = [
      "That's a great example! Let's dive deeper into the specific actions you took. Can you elaborate on your decision-making process?",
      "I notice you mentioned the outcome but not the specific steps. Walk me through your approach step by step.",
      "Excellent! Now let's work on making this story more impactful. What quantifiable results did you achieve?",
      "Good progress! Here's a tip: Try to include more emotion and challenge in your story to make it more engaging.",
      "That shows strong leadership! Now let's practice delivering this story in under 2 minutes while hitting all key points."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              AI Interview Coach
              <Badge className="bg-blue-100 text-blue-800">Beta</Badge>
            </h1>
            <p className="text-muted-foreground">
              Personalized AI coaching to improve your interview performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Coaching Guide
            </Button>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Start New Session
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Sessions Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+3 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Improvement Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">85%</div>
              <p className="text-xs text-muted-foreground">+15% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Practice Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4" />
                Strengths Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Key areas identified</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coaching Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Coaching Sessions
              </CardTitle>
              <CardDescription>
                Personalized sessions based on your performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coachingSessions.map((session) => (
                <Card key={session.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{session.topic}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(session.difficulty)}>
                            {session.difficulty}
                          </Badge>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status.replace('-', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration} min
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={session.status === 'completed' ? "outline" : "primary"}
                        onClick={() => startSession(session.id)}
                      >
                        {session.status === 'completed' ? 'Review' : 
                         session.status === 'in-progress' ? 'Continue' : 'Start'}
                      </Button>
                    </div>

                    {session.status !== 'not-started' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{session.completedSteps}/{session.totalSteps} steps</span>
                        </div>
                        <Progress 
                          value={(session.completedSteps / session.totalSteps) * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}

                    {session.aiInsights.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          AI Insights
                        </h5>
                        <div className="space-y-1">
                          {session.aiInsights.slice(0, 2).map((insight, index) => (
                            <p key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                              <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                              {insight}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Last activity: {formatDate(session.lastActivity)}
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* AI Chat Interface */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Coaching Chat
              </CardTitle>
              <CardDescription>
                Get real-time feedback and guidance from your AI coach
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.type === 'feedback'
                          ? 'bg-green-50 text-green-900 border border-green-200'
                          : message.type === 'suggestion'
                          ? 'bg-blue-50 text-blue-900 border border-blue-200'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDate(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Ask your AI coach anything..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!chatInput.trim()} className="gap-2">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatInput("Help me improve my behavioral stories")}
                  className="text-xs"
                >
                  Improve Stories
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatInput("What are my biggest weaknesses?")}
                  className="text-xs"
                >
                  Find Weaknesses
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatInput("Give me practice questions")}
                  className="text-xs"
                >
                  Practice Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Personalized Recommendations
            </CardTitle>
            <CardDescription>
              Based on your recent performance and goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Focus Area</h4>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Work on quantifying achievements in your behavioral stories. Add specific metrics and numbers.
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Strength</h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    Your technical problem-solving skills are excellent. Use this confidence in coding interviews.
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100">Next Session</h4>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-200">
                    Continue your &quot;Behavioral Stories&quot; session. 3 more steps to complete.
                  </p>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}