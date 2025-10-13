'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Square,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Headphones,
  BarChart3 as Waveform,
  Settings,
  RefreshCw
} from 'lucide-react'

interface VoiceMetrics {
  confidence: number
  clarity: number
  pace: number
  volume: number
  fillerWords: number
  pauseFrequency: number
  tonalVariation: number
  articulation: number
}

interface VoiceAnalysis {
  id: string
  sessionName: string
  duration: number
  timestamp: string
  overallScore: number
  metrics: VoiceMetrics
  insights: string[]
  recommendations: string[]
  recordingUrl?: string
}

interface RealTimeMetrics {
  isRecording: boolean
  currentVolume: number
  currentPace: number
  fillerCount: number
  duration: number
}

const mockAnalyses: VoiceAnalysis[] = [
  {
    id: '1',
    sessionName: 'Behavioral Interview Practice',
    duration: 1245, // 20:45
    timestamp: '2024-10-10T15:30:00Z',
    overallScore: 78,
    metrics: {
      confidence: 82,
      clarity: 75,
      pace: 70,
      volume: 85,
      fillerWords: 12,
      pauseFrequency: 68,
      tonalVariation: 73,
      articulation: 80
    },
    insights: [
      'Speaking pace is 15% faster than optimal for interview settings',
      'Excellent volume control and projection throughout session',
      'Reduced filler words by 40% compared to previous sessions',
      'Good tonal variation when expressing enthusiasm'
    ],
    recommendations: [
      'Practice speaking slower during technical explanations',
      'Use strategic pauses to emphasize key points',
      'Continue working on reducing "um" and "uh" occurrences'
    ]
  },
  {
    id: '2',
    sessionName: 'Technical System Design',
    duration: 2100, // 35:00
    timestamp: '2024-10-09T10:15:00Z',
    overallScore: 85,
    metrics: {
      confidence: 88,
      clarity: 90,
      pace: 85,
      volume: 82,
      fillerWords: 8,
      pauseFrequency: 78,
      tonalVariation: 79,
      articulation: 87
    },
    insights: [
      'Excellent clarity when explaining complex technical concepts',
      'Confident delivery with strong technical vocabulary',
      'Good use of pauses for emphasis and clarity',
      'Maintained consistent energy throughout long explanation'
    ],
    recommendations: [
      'Excellent performance - maintain current speaking style',
      'Consider adding more vocal emphasis on key benefits',
      'Continue practicing with complex technical topics'
    ]
  }
]

export default function VoiceAnalysisPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<VoiceAnalysis | null>(null)
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    isRecording: false,
    currentVolume: 0,
    currentPace: 0,
    fillerCount: 0,
    duration: 0
  })

  // Simulate real-time metrics during recording
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRealTimeMetrics(prev => ({
          ...prev,
          currentVolume: 30 + Math.random() * 40,
          currentPace: 140 + Math.random() * 40, // words per minute
          fillerCount: prev.fillerCount + (Math.random() > 0.95 ? 1 : 0),
          duration: prev.duration + 1
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const startRecording = () => {
    setIsRecording(true)
    setRealTimeMetrics({
      isRecording: true,
      currentVolume: 0,
      currentPace: 0,
      fillerCount: 0,
      duration: 0
    })
    // In production, this would start actual voice recording and analysis
    console.log('Starting voice recording and analysis')
  }

  const stopRecording = () => {
    setIsRecording(false)
    setRealTimeMetrics(prev => ({ ...prev, isRecording: false }))
    // In production, this would process the recording and generate analysis
    console.log('Stopping recording and processing analysis')
  }

  const getMetricColor = (value: number, isInverse: boolean = false) => {
    if (isInverse) {
      if (value <= 5) return 'text-green-600'
      if (value <= 10) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (value >= 80) return 'text-green-600'
    if (value >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Headphones className="h-8 w-8 text-purple-600" />
              Voice Analysis
              <Badge className="bg-purple-100 text-purple-800">AI-Powered</Badge>
            </h1>
            <p className="text-muted-foreground">
              Advanced voice analysis to improve your interview communication
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Audio Settings
            </Button>
            <Button 
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "danger" : "primary"}
              className="gap-2"
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Real-time Recording Interface */}
        {isRecording && (
          <Card className="border-2 border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                Live Voice Analysis
              </CardTitle>
              <CardDescription>
                Recording in progress - speak naturally and we&apos;ll analyze your voice patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Volume Level</span>
                    <span className="text-sm">{Math.round(realTimeMetrics.currentVolume)}%</span>
                  </div>
                  <Progress value={realTimeMetrics.currentVolume} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Speaking Pace</span>
                    <span className="text-sm">{Math.round(realTimeMetrics.currentPace)} WPM</span>
                  </div>
                  <Progress value={(realTimeMetrics.currentPace - 100) / 100 * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Filler Words</span>
                    <span className="text-sm">{realTimeMetrics.fillerCount}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Duration</span>
                    <span className="text-sm font-mono">{formatDuration(realTimeMetrics.duration)}</span>
                  </div>
                </div>
              </div>

              {/* Live Waveform Simulation */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-1 h-16 justify-center">
                  {Array.from({ length: 50 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-blue-500 w-1 animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">82</div>
              <p className="text-xs text-muted-foreground">+7 points improved</p>
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
              <div className="text-2xl font-bold">8.5h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">15%</div>
              <p className="text-xs text-muted-foreground">Since last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Analyses */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waveform className="h-5 w-5" />
                  Recent Analyses
                </CardTitle>
                <CardDescription>
                  Your latest voice analysis sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAnalyses.map((analysis) => (
                  <Card 
                    key={analysis.id} 
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      selectedAnalysis?.id === analysis.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{analysis.sessionName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(analysis.duration)} • {formatDate(analysis.timestamp)}
                          </p>
                        </div>
                        <Badge className={getScoreColor(analysis.overallScore)}>
                          Score: {analysis.overallScore}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className={`font-semibold ${getMetricColor(analysis.metrics.confidence)}`}>
                            {analysis.metrics.confidence}%
                          </div>
                          <div className="text-muted-foreground">Confidence</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-semibold ${getMetricColor(analysis.metrics.clarity)}`}>
                            {analysis.metrics.clarity}%
                          </div>
                          <div className="text-muted-foreground">Clarity</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-semibold ${getMetricColor(analysis.metrics.pace)}`}>
                            {analysis.metrics.pace}%
                          </div>
                          <div className="text-muted-foreground">Pace</div>
                        </div>
                        <div className="text-center">
                          <div className={`font-semibold ${getMetricColor(analysis.metrics.fillerWords, true)}`}>
                            {analysis.metrics.fillerWords}
                          </div>
                          <div className="text-muted-foreground">Fillers</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <div>
            {selectedAnalysis ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedAnalysis.sessionName}</CardTitle>
                  <CardDescription>
                    Detailed analysis and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{selectedAnalysis.overallScore}</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                    <Progress value={selectedAnalysis.overallScore} className="mt-2" />
                  </div>

                  {/* Detailed Metrics */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Voice Metrics</h4>
                    {Object.entries(selectedAnalysis.metrics).map(([key, value]) => {
                      const isFillerWords = key === 'fillerWords'
                      const displayValue = isFillerWords ? value : `${value}%`
                      const color = isFillerWords ? getMetricColor(value as number, true) : getMetricColor(value as number)
                      
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={`font-semibold ${color}`}>{displayValue}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* AI Insights */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      AI Insights
                    </h4>
                    <div className="space-y-2">
                      {selectedAnalysis.insights.map((insight, index) => (
                        <p key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {insight}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Recommendations
                    </h4>
                    <div className="space-y-2">
                      {selectedAnalysis.recommendations.map((rec, index) => (
                        <p key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t space-y-2">
                    <Button className="w-full gap-2">
                      <Play className="h-4 w-4" />
                      Replay Audio
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Re-analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center space-y-2">
                    <Headphones className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Select an Analysis</h3>
                    <p className="text-muted-foreground">
                      Click on any analysis to view detailed insights and recommendations
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Voice Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Improvement Tips
            </CardTitle>
            <CardDescription>
              Expert tips to enhance your interview voice presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Optimal Pace</h4>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Speak at 140-160 words per minute for interviews. This allows listeners to follow complex ideas.
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Volume Control</h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    Maintain consistent volume. Project confidence while remaining conversational.
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Waveform className="h-4 w-4 text-purple-600" />
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">Tonal Variation</h4>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-200">
                    Vary your tone to maintain engagement. Use inflection to emphasize key points.
                  </p>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
}