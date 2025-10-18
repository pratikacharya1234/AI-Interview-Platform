'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Target, 
  CheckCircle, 
  Code, 
  Users, 
  Layout,
  MessageSquare,
  BookOpen,
  Eye,
  Bookmark,
  Share2
} from 'lucide-react'

interface QuestionCardProps {
  question: {
    id: string
    question_text: string
    question_type: string
    difficulty_level: string
    estimated_time_minutes: number
    tags: string[]
    is_attempted: boolean
    times_asked: number
    average_score?: number
    question_categories?: {
      name: string
      color: string
      icon: string
    }
  }
  onClick: () => void
}

export default function QuestionCard({ question, onClick }: QuestionCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'expert':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'coding':
        return Code
      case 'behavioral':
        return Users
      case 'system_design':
        return Layout
      case 'open_ended':
        return MessageSquare
      default:
        return BookOpen
    }
  }

  const TypeIcon = getTypeIcon(question.question_type)

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              question.question_categories?.color 
                ? `bg-${question.question_categories.color}-100 dark:bg-${question.question_categories.color}-900/20`
                : 'bg-blue-100 dark:bg-blue-900/20'
            }`}>
              <TypeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            {question.is_attempted && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
          <div className="flex gap-2">
            <Badge className={getDifficultyColor(question.difficulty_level)}>
              {question.difficulty_level}
            </Badge>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {question.question_text}
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{question.estimated_time_minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{question.times_asked} asked</span>
          </div>
          {question.average_score && (
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{Math.round(question.average_score)}% avg</span>
            </div>
          )}
        </div>
        
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {question.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {question.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{question.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              // Handle bookmark
            }}
          >
            <Bookmark className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              // Handle share
            }}
          >
            <Share2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            className="flex-1"
          >
            Practice
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
