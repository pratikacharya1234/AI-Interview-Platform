import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
// import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Mic,
  MicOff,
  Volume2,
  Pause,
  Play,
  SkipForward,
  Loader2,
  Activity,
  Clock,
  MessageSquare,
  TrendingUp,
  Brain,
  Target,
  Zap
} from 'lucide-react'
import { InterviewSession, Question, AudioState, InterviewMetrics, Response } from '../types'

interface InterviewViewProps {
  session: InterviewSession | null
  currentQuestion: Question | null
  responses: Response[]
  audioState: AudioState
  metrics: InterviewMetrics
  onStartRecording: () => void
  onStopRecording: () => void
  onPauseInterview: () => void
  onSkipQuestion: () => void
}

export default function InterviewView({
  session,
  currentQuestion,
  responses,
  audioState,
  metrics,
  onStartRecording,
  onStopRecording,
  onPauseInterview,
  onSkipQuestion
}: InterviewViewProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStageColor = (stage: string) => {
    const colors = {
      intro: 'bg-blue-500',
      warmup: 'bg-green-500',
      core: 'bg-purple-500',
      deep: 'bg-orange-500',
      closing: 'bg-slate-500'
    }
    return colors[stage as keyof typeof colors] || 'bg-slate-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Metrics */}
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Interview Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span className="font-medium">{Math.round(metrics.overallProgress)}%</span>
                  </div>
                  <Progress value={metrics.overallProgress} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">Questions</span>
                    </div>
                    <span className="text-sm font-medium">
                      {session?.answeredQuestions}/{session?.totalQuestions}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">Avg Time</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatTime(Math.round(metrics.averageResponseTime))}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">Quality</span>
                    </div>
                    <span className="text-sm font-medium">
                      {metrics.responseQuality.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Confidence
                    </span>
                    <span>{metrics.confidenceLevel.toFixed(1)}</span>
                  </div>
                  <Progress value={metrics.confidenceLevel * 10} className="h-1.5" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Relevance
                    </span>
                    <span>{metrics.engagementScore.toFixed(1)}</span>
                  </div>
                  <Progress value={metrics.engagementScore * 10} className="h-1.5" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Keywords
                    </span>
                    <span>{metrics.keywordsMatched}</span>
                  </div>
                  <Progress value={Math.min(100, metrics.keywordsMatched * 5)} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Interview Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Company</span>
                  <span className="font-medium">{session?.config.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Position</span>
                  <span className="font-medium">{session?.config.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Type</span>
                  <span className="font-medium capitalize">{session?.config.interviewType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-medium">{session?.config.duration} min</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="col-span-6 space-y-4">
            {/* Stage Indicator */}
            <div className="flex items-center justify-center gap-2">
              {['intro', 'warmup', 'core', 'deep', 'closing'].map((stage, index) => (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center">
                    <div className={`h-2 w-2 rounded-full ${
                      session?.currentStage === stage ? getStageColor(stage) : 'bg-slate-300'
                    }`} />
                    <span className="text-xs mt-1 capitalize">{stage}</span>
                  </div>
                  {index < 4 && <div className="h-0.5 w-8 bg-slate-300" />}
                </React.Fragment>
              ))}
            </div>
            
            {/* Current Question */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Current Question
                  </CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {currentQuestion?.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                  <p className="text-lg leading-relaxed">
                    {currentQuestion?.text || 'Preparing next question...'}
                  </p>
                </div>
                {audioState.isSpeaking && (
                  <div className="flex items-center gap-2 mt-4 text-blue-600">
                    <Volume2 className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">AI is speaking...</span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Recording Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Your Response</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Transcript Display */}
                <div className="min-h-[120px] bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  {audioState.currentTranscript || audioState.interimTranscript ? (
                    <div>
                      <p className="text-base">
                        {audioState.currentTranscript}
                        <span className="text-slate-400">{audioState.interimTranscript}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-8">
                      {audioState.isRecording 
                        ? 'Listening... Speak clearly into your microphone'
                        : 'Click the microphone button to start recording'}
                    </p>
                  )}
                </div>
                
                {/* Audio Level */}
                {audioState.isRecording && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Audio Level</span>
                      <span className="text-xs text-slate-500 ml-auto">
                        {formatTime(audioState.recordingTime)}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                        style={{ width: `${audioState.audioLevel}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    variant={audioState.isRecording ? "danger" : "primary"}
                    onClick={audioState.isRecording ? onStopRecording : onStartRecording}
                    disabled={audioState.isProcessing || audioState.isSpeaking}
                    className="h-16 w-16 rounded-full"
                  >
                    {audioState.isProcessing ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : audioState.isRecording ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onPauseInterview}
                    className="h-12 w-12 rounded-full"
                  >
                    <Pause className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onSkipQuestion}
                    className="h-12 w-12 rounded-full"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>
                
                {audioState.isRecording && (
                  <div className="flex justify-center">
                    <Badge variant="destructive" className="animate-pulse">
                      Recording in progress
                    </Badge>
                  </div>
                )}
                
                {audioState.isProcessing && (
                  <div className="flex justify-center">
                    <Badge variant="secondary">
                      Processing your response...
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Sidebar - Response History */}
          <div className="col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Response History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] overflow-y-auto">
                  <div className="space-y-3">
                    {responses.map((response, index) => (
                      <div key={response.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            Q{index + 1}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {formatTime(response.duration)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {response.transcript}
                        </p>
                        {response.analysis && (
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Score: {response.analysis.score}/10
                            </Badge>
                            <Badge 
                              variant={response.analysis.sentiment === 'positive' ? 'default' : 'outline'}
                              className="text-xs"
                            >
                              {response.analysis.sentiment}
                            </Badge>
                          </div>
                        )}
                        {index < responses.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
