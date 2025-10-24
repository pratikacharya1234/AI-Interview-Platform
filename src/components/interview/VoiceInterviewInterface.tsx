'use client'

/**
 * Voice Interview Interface Component
 *
 * Main interface for conducting voice-based interviews
 * Integrates recording, playback, and real-time feedback
 */

import React, { useState, useEffect } from 'react'
import { VoiceRecorder } from './VoiceRecorder'
import { AudioPlayer } from './AudioPlayer'
import { Loader2, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { blobToBase64 } from '@/lib/utils/audioUtils'

interface Question {
  id: string
  number: number
  text: string
  audioUrl: string
}

interface Analysis {
  score: number
  relevance: number
  clarity: number
  confidence: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

export interface VoiceInterviewInterfaceProps {
  sessionId: string
  role: string
  position: string
  difficulty: string
  onComplete: (sessionId: string) => void
  onError: (error: string) => void
}

export function VoiceInterviewInterface({
  sessionId,
  role,
  position,
  difficulty,
  onComplete,
  onError,
}: VoiceInterviewInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questionHistory, setQuestionHistory] = useState<
    Array<{ question: Question; answered: boolean }>
  >([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null)
  const [progress, setProgress] = useState({ completed: 0, total: 8 })
  const [showTranscript, setShowTranscript] = useState(true)

  // Load first question on mount
  useEffect(() => {
    if (currentQuestion === null && questionHistory.length === 0) {
      // First question should already be loaded when session was created
      // If not, we can fetch it here
    }
  }, [])

  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    if (!currentQuestion) return

    try {
      setIsProcessing(true)
      setCurrentAnalysis(null)

      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob)

      // Send to API for processing
      const response = await fetch('/api/interview/voice/process-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          audioData: base64Audio,
          mimeType: audioBlob.type,
          duration,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to process answer')
      }

      const data = await response.json()

      // Update question history
      setQuestionHistory(prev => [
        ...prev,
        { question: currentQuestion, answered: true },
      ])

      // Show analysis
      setCurrentAnalysis(data.analysis)
      setProgress(data.progress)

      // Wait a bit to show feedback
      setTimeout(() => {
        if (data.continue && data.nextQuestion) {
          // Load next question
          setCurrentQuestion(data.nextQuestion)
          setCurrentAnalysis(null)
        } else {
          // Interview complete
          completeInterview()
        }
      }, 3000)
    } catch (error: any) {
      console.error('Error processing answer:', error)
      onError(error.message || 'Failed to process your answer')
    } finally {
      setIsProcessing(false)
    }
  }

  const completeInterview = async () => {
    try {
      setIsLoadingQuestion(true)

      const response = await fetch('/api/interview/voice/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete interview')
      }

      const data = await response.json()
      onComplete(sessionId)
    } catch (error: any) {
      console.error('Error completing interview:', error)
      onError(error.message || 'Failed to complete interview')
    } finally {
      setIsLoadingQuestion(false)
    }
  }

  const skipQuestion = () => {
    if (currentQuestion) {
      setQuestionHistory(prev => [
        ...prev,
        { question: currentQuestion, answered: false },
      ])
      // In a real implementation, we'd generate the next question
      setCurrentQuestion(null)
    }
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading interview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="voice-interview-interface max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Question {currentQuestion.number} of {progress.total}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round((progress.completed / progress.total) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${Math.round((progress.completed / progress.total) * 100)}%` }}
          />
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-start gap-3 mb-4">
          <MessageSquare className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Interview Question
            </h3>
            {showTranscript && (
              <p className="text-lg text-gray-900 dark:text-white mb-4">
                {currentQuestion.text}
              </p>
            )}
            <AudioPlayer
              audioUrl={currentQuestion.audioUrl}
              autoPlay={true}
              className="bg-white/50 dark:bg-gray-800/50"
            />
          </div>
        </div>
      </div>

      {/* Feedback from previous answer */}
      {currentAnalysis && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Quick Feedback</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <ScoreCard label="Overall" score={currentAnalysis.score} />
            <ScoreCard label="Relevance" score={currentAnalysis.relevance} />
            <ScoreCard label="Clarity" score={currentAnalysis.clarity} />
            <ScoreCard label="Confidence" score={currentAnalysis.confidence} />
          </div>
          <p className="text-gray-700 dark:text-gray-300">{currentAnalysis.feedback}</p>
        </div>
      )}

      {/* Recording Interface */}
      {!isProcessing && !isLoadingQuestion && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={180} // 3 minutes max per answer
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Take your time to formulate your answer. Speak clearly and confidently.
            </p>
            <button
              onClick={skipQuestion}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip Question
            </button>
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Analyzing your answer...
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Our AI is evaluating your response and preparing the next question
            </p>
          </div>
        </div>
      )}

      {/* Interview Transcript Sidebar (collapsed) */}
      {questionHistory.length > 0 && (
        <details className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white">
            Interview History ({questionHistory.length} questions)
          </summary>
          <div className="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
            {questionHistory.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                {item.answered ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Q{item.question.number}: {item.question.text}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {item.answered ? 'Answered' : 'Skipped'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

// Helper component for score display
function ScoreCard({ label, score }: { label: string; score: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-100 dark:bg-red-900/20'
  }

  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getColor(score)}`}>
        <span className="text-2xl font-bold">{score}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{label}</p>
    </div>
  )
}
