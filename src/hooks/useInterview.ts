'use client'

import { useState, useCallback } from 'react'
import { InterviewQuestion, InterviewResponse, InterviewSession, QuestionType } from '@/lib/gemini'

interface UseInterviewOptions {
  onQuestionComplete?: (response: InterviewResponse) => void
  onSessionComplete?: (session: InterviewSession) => void
  onError?: (error: string) => void
}

interface InterviewState {
  session: InterviewSession | null
  currentQuestionIndex: number
  isLoading: boolean
  error: string | null
  isSessionActive: boolean
}

export function useInterview(options: UseInterviewOptions = {}) {
  const [state, setState] = useState<InterviewState>({
    session: null,
    currentQuestionIndex: 0,
    isLoading: false,
    error: null,
    isSessionActive: false
  })

  // Start new interview session
  const startInterview = useCallback(async (
    candidateName: string,
    position: string,
    company: string,
    questionTypes: QuestionType[],
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    questionCount: number = 5
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/interview/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position,
          company,
          questionTypes,
          difficulty,
          count: questionCount
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions')
      }

      const newSession: InterviewSession = {
        sessionId: `interview_${Date.now()}`,
        candidateName,
        position,
        company,
        questions: data.questions,
        responses: [],
        overallScore: 0,
        startTime: new Date(),
        feedback: ''
      }

      setState(prev => ({
        ...prev,
        session: newSession,
        currentQuestionIndex: 0,
        isLoading: false,
        isSessionActive: true
      }))

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start interview'
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }))
      options.onError?.(errorMessage)
    }
  }, [options])

  // Submit answer to current question
  const submitAnswer = useCallback(async (answer: string) => {
    if (!state.session || state.currentQuestionIndex >= state.session.questions.length) {
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const currentQuestion = state.session.questions[state.currentQuestionIndex]
      
      const response = await fetch('/api/interview/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          userResponse: answer,
          context: {
            position: state.session.position,
            company: state.session.company
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze response')
      }

      const analysisResult: InterviewResponse = data.analysis

      // Update session with new response
      const updatedSession = {
        ...state.session,
        responses: [...state.session.responses, analysisResult]
      }

      // Calculate updated overall score
      const totalScore = updatedSession.responses.reduce((sum, r) => sum + r.score, 0)
      updatedSession.overallScore = totalScore / updatedSession.responses.length

      setState(prev => ({
        ...prev,
        session: updatedSession,
        isLoading: false
      }))

      options.onQuestionComplete?.(analysisResult)

      // Always move to next question first
      const nextIndex = state.currentQuestionIndex + 1
      
      setState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex
      }))

      // Complete interview only if we've answered all questions
      if (nextIndex >= state.session.questions.length) {
        await completeInterview(updatedSession)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer'
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }))
      options.onError?.(errorMessage)
    }
  }, [state.session, state.currentQuestionIndex, options])

  // Move to next question
  const nextQuestion = useCallback(() => {
    if (!state.session || state.currentQuestionIndex >= state.session.questions.length - 1) {
      return
    }

    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }))
  }, [state.session, state.currentQuestionIndex])

  // Complete interview session with enhanced features
  const completeInterview = useCallback(async (sessionToComplete?: InterviewSession) => {
    const finalSession = sessionToComplete || state.session
    if (!finalSession) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      console.log('🎯 HACKATHON: Completing interview with enhanced features...')
      
      // 1. Generate feedback
      const feedbackResponse = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: finalSession })
      })

      const feedbackData = await feedbackResponse.json()

      if (!feedbackResponse.ok) {
        throw new Error(feedbackData.error || 'Failed to generate feedback')
      }

      // 2. Generate summary image using Runware
      const avgScore = finalSession.responses.reduce((sum, r) => sum + r.score, 0) / finalSession.responses.length
      const scoreLevel = avgScore >= 8 ? 'excellent' : avgScore >= 6 ? 'good' : avgScore >= 4 ? 'average' : 'needs improvement'
      
      const imagePrompt = `Professional interview summary visualization showing ${scoreLevel} performance for ${finalSession.position} position at ${finalSession.company}. Clean, modern infographic style with charts and success indicators. Corporate colors, professional layout.`
      
      let summaryImageUrl = null
      try {
        const imageResponse = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt })
        })
        
        const imageData = await imageResponse.json()
        if (imageData.success && imageData.imageUrl) {
          summaryImageUrl = imageData.imageUrl
          console.log('🎨 HACKATHON: Summary image generated!')
        }
      } catch (error) {
        console.log('Image generation failed, continuing without image')
      }

      // 3. Create enhanced completed session
      const completedSession = {
        ...finalSession,
        endTime: new Date(),
        feedback: feedbackData.feedback,
        summaryImage: summaryImageUrl,
        overallPerformance: {
          averageScore: avgScore,
          level: scoreLevel,
          questionsAnswered: finalSession.responses.length,
          totalQuestions: finalSession.questions.length,
          completionRate: (finalSession.responses.length / finalSession.questions.length) * 100
        }
      }

      setState(prev => ({
        ...prev,
        session: completedSession,
        isLoading: false,
        isSessionActive: false
      }))

      options.onSessionComplete?.(completedSession)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete interview'
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }))
      options.onError?.(errorMessage)
    }
  }, [state.session, options])

  // Reset interview session
  const resetInterview = useCallback(() => {
    setState({
      session: null,
      currentQuestionIndex: 0,
      isLoading: false,
      error: null,
      isSessionActive: false
    })
  }, [])

  // Get current question
  const getCurrentQuestion = useCallback((): InterviewQuestion | null => {
    if (!state.session || state.currentQuestionIndex >= state.session.questions.length) {
      return null
    }
    return state.session.questions[state.currentQuestionIndex]
  }, [state.session, state.currentQuestionIndex])

  // Get progress information
  const getProgress = useCallback(() => {
    if (!state.session) return { current: 0, total: 0, percentage: 0 }
    
    return {
      current: state.currentQuestionIndex + 1,
      total: state.session.questions.length,
      percentage: Math.round(((state.currentQuestionIndex + 1) / state.session.questions.length) * 100)
    }
  }, [state.session, state.currentQuestionIndex])

  return {
    // State
    session: state.session,
    currentQuestion: getCurrentQuestion(),
    currentQuestionIndex: state.currentQuestionIndex,
    isLoading: state.isLoading,
    error: state.error,
    isSessionActive: state.isSessionActive,
    progress: getProgress(),

    // Actions
    startInterview,
    submitAnswer,
    nextQuestion,
    completeInterview,
    resetInterview,

    // Derived state
    isLastQuestion: state.session ? state.currentQuestionIndex >= state.session.questions.length - 1 : false,
    hasResponses: state.session ? state.session.responses.length > 0 : false,
    canProceed: state.session ? state.session.responses.length > state.currentQuestionIndex : false
  }
}