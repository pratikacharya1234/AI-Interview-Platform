'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Target,
  Brain,
  Lightbulb,
  Award,
  Clock,
  BarChart3,
  Zap,
  Play,
  RefreshCw
} from 'lucide-react'

interface FeedbackSession {
  id: string
  sessionName: string
  date: string
  duration: number
  overallScore: number
  categories: {
    technical: number
    communication: number
    problemSolving: number
    cultural: number
  }
  aiInsights: string[]
  improvements: string[]
  strengths: string[]
  nextSteps: string[]
}

const feedbackSessions: FeedbackSession[] = [
  {
    id: '1',
    sessionName: 'Senior Software Engineer - Google',
    date: '2024-10-10T15:30:00Z',
    duration: 1800,
    overallScore: 82,
    categories: {
      technical: 88,
      communication: 75,
      problemSolving: 90,
      cultural: 76
    },
    aiInsights: [
      'Excellent problem-solving approach with clear algorithmic thinking',
      'Communication style is direct but could benefit from more structured explanations',
      'Strong technical depth but missed opportunity to discuss trade-offs',
      'Cultural responses show good self-awareness but need more specific examples'
    ],
    improvements: [
      'Use the STAR method more consistently in behavioral responses',
      'Explain thought process step-by-step during technical problems',
      'Ask clarifying questions before diving into solutions',
      'Discuss system design trade-offs and scalability considerations'
    ],
    strengths: [
      'Strong algorithmic problem-solving skills',
      'Quick to identify optimal solutions',
      'Good code organization and naming conventions',
      'Confident delivery under pressure'
    ],
    nextSteps: [
      'Practice explaining complex algorithms to non-technical audience',
      'Work on structured communication frameworks',
      'Prepare more quantified impact stories',
      'Study system design patterns for large-scale applications'
    ]
  },
  {
    id: '2',
    sessionName: 'Product Manager - Meta',
    date: '2024-10-08T10:15:00Z',
    duration: 2700,
    overallScore: 76,
    categories: {
      technical: 70,
      communication: 85,
      problemSolving: 78,
      cultural: 72
    },
    aiInsights: [
      'Strong communication skills with clear articulation',
      'Good understanding of product principles but lacks data-driven approach',
      'Collaborative mindset aligns well with team-focused culture',
      'Could improve on technical depth for cross-functional discussions'
    ],
    improvements: [
      'Include more specific metrics and data in product discussions',
      'Demonstrate deeper technical understanding of implementation challenges',
      'Practice framework-based problem solving (e.g., RICE, ICE)',
      'Prepare examples showing impact on key business metrics'
    ],
    strengths: [
      'Excellent communication and presentation skills',
      'Strong user empathy and customer focus',
      'Good strategic thinking and prioritization',
      'Collaborative approach to cross-functional work'
    ],
    nextSteps: [
      'Study product analytics and A/B testing methodologies',
      'Learn more about technical implementation constraints',
      'Practice product sense questions with data-driven reasoning',
      'Prepare stories demonstrating measurable business impact'
    ]
  }
]

export default function SmartFeedbackPage() {
  const [selectedSession, setSelectedSession] = useState<FeedbackSession>(feedbackSessions[0])
  const [activeTab, setActiveTab] = useState('insights')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const hrs = Math.floor(mins / 60)
    const remainingMins = mins % 60
    
    if (hrs > 0) {
      return `${hrs}h ${remainingMins}m`
    }
    return `${mins}m`
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Brain className="h-4 w-4" />
      case 'communication': return <Star className="h-4 w-4" />
      case 'problemSolving': return <Target className="h-4 w-4" />
      case 'cultural': return <Award className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  return <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Star className="h-8 w-8 text-blue-600" />
              Smart Feedback
              <Badge className="bg-blue-100 text-blue-800">AI-Enhanced</Badge>
            </h1>
            <p className="text-muted-foreground">
              Intelligent analysis and personalized feedback for continuous improvement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Generate Report
            </Button>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(selectedSession.overallScore)}`}>
                {selectedSession.overallScore}
              </div>
              <p className="text-xs text-muted-foreground">Out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+12%</div>
              <p className="text-xs text-muted-foreground">Since last session</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Top Strength
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">90</div>
              <p className="text-xs text-muted-foreground">Problem Solving</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Focus Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">75</div>
              <p className="text-xs text-muted-foreground">Communication</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Sessions
              </CardTitle>
              <CardDescription>
                Your latest interview feedback sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {feedbackSessions.map((session) => (
                <Card 
                  key={session.id}
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    selectedSession.id === session.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{session.sessionName}</h4>
                      <Badge className={`${getScoreColor(session.overallScore)} bg-transparent border`}>
                        {session.overallScore}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(session.date)} • {formatDuration(session.duration)}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Technical:</span>
                        <span className={`font-semibold ${getScoreColor(session.categories.technical)}`}>
                          {session.categories.technical}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Communication:</span>
                        <span className={`font-semibold ${getScoreColor(session.categories.communication)}`}>
                          {session.categories.communication}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{selectedSession.sessionName}</CardTitle>
                <CardDescription>
                  {formatDate(selectedSession.date)} • {formatDuration(selectedSession.duration)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Category Scores */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold">Performance Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedSession.categories).map(([category, score]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 capitalize">
                            {getCategoryIcon(category)}
                            {category === 'problemSolving' ? 'Problem Solving' : category}
                          </span>
                          <span className={`font-semibold ${getScoreColor(score)}`}>
                            {score}%
                          </span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabs for detailed feedback */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="insights">AI Insights</TabsTrigger>
                    <TabsTrigger value="improvements">Areas to Improve</TabsTrigger>
                    <TabsTrigger value="strengths">Strengths</TabsTrigger>
                    <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
                  </TabsList>

                  <TabsContent value="insights" className="space-y-3 mt-4">
                    <div className="space-y-3">
                      {selectedSession.aiInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-900 dark:text-blue-100">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="improvements" className="space-y-3 mt-4">
                    <div className="space-y-3">
                      {selectedSession.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-orange-900 dark:text-orange-100">{improvement}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="strengths" className="space-y-3 mt-4">
                    <div className="space-y-3">
                      {selectedSession.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-green-900 dark:text-green-100">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="next-steps" className="space-y-3 mt-4">
                    <div className="space-y-3">
                      {selectedSession.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <Target className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-purple-900 dark:text-purple-100">{step}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Personalized Action Plan
            </CardTitle>
            <CardDescription>
              AI-generated recommendations based on your performance patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Immediate Focus</h4>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Practice structured communication using the STAR method for behavioral questions
                  </p>
                  <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                    Start Practice
                  </Button>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Leverage Strength</h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    Your problem-solving skills are excellent. Use this confidence in technical interviews
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 border-green-600 text-green-600 hover:bg-green-50">
                    View Examples
                  </Button>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">Long-term Goal</h4>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-200">
                    Develop system design thinking for senior-level technical discussions
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 border-purple-600 text-purple-600 hover:bg-purple-50">
                    Create Plan
                  </Button>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
}