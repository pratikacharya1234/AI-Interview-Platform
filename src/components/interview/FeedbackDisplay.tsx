'use client'

/**
 * Feedback Display Component
 *
 * Displays comprehensive interview feedback with visualizations
 */

import React from 'react'
import { TrendingUp, TrendingDown, CheckCircle, AlertCircle, Target, Lightbulb, BookOpen } from 'lucide-react'

export interface FeedbackData {
  overallScore: number
  communicationScore: number
  technicalScore: number
  confidenceScore: number
  strengths: string[]
  weaknesses: string[]
  detailedFeedback: string
  improvementPlan: string[]
  comparisonWithIndustryStandards: string
  recommendedResources?: string[]
}

export interface FeedbackDisplayProps {
  feedback: FeedbackData
  sessionInfo?: {
    role: string
    position: string
    difficulty: string
    totalQuestions: number
    duration: number
  }
}

export function FeedbackDisplay({ feedback, sessionInfo }: FeedbackDisplayProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  const ScoreCircle = ({ score, label }: { score: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className={`relative w-24 h-24 rounded-full ${getScoreBg(score)} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
          <div className="text-xs text-gray-500">/ 100</div>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
    </div>
  )

  return (
    <div className="feedback-display space-y-6">
      {/* Session Info */}
      {sessionInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Interview Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Position</p>
              <p className="font-medium text-gray-900 dark:text-white">{sessionInfo.position}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Type</p>
              <p className="font-medium text-gray-900 dark:text-white">{sessionInfo.role}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Difficulty</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{sessionInfo.difficulty}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Questions</p>
              <p className="font-medium text-gray-900 dark:text-white">{sessionInfo.totalQuestions}</p>
            </div>
          </div>
        </div>
      )}

      {/* Overall Scores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Scores</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ScoreCircle score={feedback.overallScore} label="Overall" />
          <ScoreCircle score={feedback.communicationScore} label="Communication" />
          <ScoreCircle score={feedback.technicalScore} label="Technical" />
          <ScoreCircle score={feedback.confidenceScore} label="Confidence" />
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Strengths</h3>
        </div>
        <ul className="space-y-3">
          {feedback.strengths.map((strength, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas for Improvement */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Areas for Improvement</h3>
        </div>
        <ul className="space-y-3">
          {feedback.weaknesses.map((weakness, index) => (
            <li key={index} className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed Feedback */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Analysis</h3>
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{feedback.detailedFeedback}</p>
        </div>
      </div>

      {/* Improvement Plan */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Action Plan</h3>
        </div>
        <ol className="space-y-3">
          {feedback.improvementPlan.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Industry Comparison */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Industry Comparison</h3>
        <p className="text-gray-700 dark:text-gray-300">{feedback.comparisonWithIndustryStandards}</p>
      </div>

      {/* Recommended Resources */}
      {feedback.recommendedResources && feedback.recommendedResources.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended Resources</h3>
          </div>
          <ul className="space-y-2">
            {feedback.recommendedResources.map((resource, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-indigo-600 dark:text-indigo-400">•</span>
                <span className="text-gray-700 dark:text-gray-300">{resource}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
