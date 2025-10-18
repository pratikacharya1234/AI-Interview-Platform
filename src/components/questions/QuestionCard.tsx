'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
      color?: string
      icon?: string
    }
  }
  onClick: () => void
}

// Define static classes for difficulty levels
const DIFFICULTY_STYLES = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  expert: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

// Define static classes for category colors
const CATEGORY_COLORS = {
  blue: 'bg-blue-100 dark:bg-blue-900/20',
  green: 'bg-green-100 dark:bg-green-900/20',
  purple: 'bg-purple-100 dark:bg-purple-900/20',
  red: 'bg-red-100 dark:bg-red-900/20',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/20',
  default: 'bg-gray-100 dark:bg-gray-900/20'
}

export default function QuestionCard({ question, onClick }: QuestionCardProps) {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTY_STYLES[difficulty as keyof typeof DIFFICULTY_STYLES] || DIFFICULTY_STYLES.default
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
  
  const getCategoryColor = (color?: string) => {
    if (!color) return CATEGORY_COLORS.default
    return CATEGORY_COLORS[color as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default
  }

  // Prevent hydration issues
  if (!mounted) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getCategoryColor(question.question_categories?.color)}`}>
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
              <Badge key={`${question.id}-tag-${index}`} variant="secondary" className="text-xs">
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
            onClick={(e) => {
              e.stopPropagation()
              // Navigate to practice page with question ID
              router.push(`/practice?questionId=${question.id}`)
            }}
          >
            Practice
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
