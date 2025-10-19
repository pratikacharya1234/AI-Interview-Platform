'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Search,
  X,
  FileText,
  Video,
  MessageSquare,
  BarChart3,
  BookOpen,
  Trophy,
  Users,
  Settings,
  HelpCircle,
  Clock,
  TrendingUp,
  Target,
  Briefcase,
  GraduationCap,
  Code2,
  Brain,
  Sparkles,
  Home,
  ArrowRight
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ElementType
  action: () => void
  category: string
  keywords: string[]
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      description: 'View your interview dashboard',
      icon: Home,
      action: () => router.push('/dashboard'),
      category: 'Navigation',
      keywords: ['home', 'dashboard', 'overview']
    },
    {
      id: 'nav-interviews',
      title: 'Start New Interview',
      description: 'Begin a new interview session',
      icon: Video,
      action: () => router.push('/interview'),
      category: 'Navigation',
      keywords: ['interview', 'start', 'new', 'begin']
    },
    {
      id: 'nav-text-interview',
      title: 'Text Interview',
      description: 'Start a text-based interview',
      icon: MessageSquare,
      action: () => router.push('/interview/text'),
      category: 'Navigation',
      keywords: ['text', 'chat', 'written']
    },
    {
      id: 'nav-voice-interview',
      title: 'Audio Interview',
      description: 'Start an audio interview',
      icon: MessageSquare,
      action: () => router.push('/interview/audio'),
      category: 'Navigation',
      keywords: ['voice', 'audio', 'speak', 'interview']
    },
    {
      id: 'nav-video-interview',
      title: 'Video Interview',
      description: 'Start a video interview',
      icon: Video,
      action: () => router.push('/interview/video'),
      category: 'Navigation',
      keywords: ['video', 'camera', 'visual']
    },
    
    // Practice
    {
      id: 'practice-questions',
      title: 'Practice Questions',
      description: 'Browse question bank',
      icon: BookOpen,
      action: () => router.push('/practice'),
      category: 'Practice',
      keywords: ['practice', 'questions', 'bank', 'study']
    },
    {
      id: 'practice-coding',
      title: 'Coding Challenges',
      description: 'Practice coding problems',
      icon: Code2,
      action: () => router.push('/coding'),
      category: 'Practice',
      keywords: ['code', 'programming', 'algorithm', 'leetcode']
    },
    {
      id: 'practice-mock',
      title: 'Mock Interviews',
      description: 'Take a mock interview',
      icon: Users,
      action: () => router.push('/mock'),
      category: 'Practice',
      keywords: ['mock', 'simulation', 'practice']
    },
    {
      id: 'practice-company',
      title: 'Company Specific',
      description: 'Company interview prep',
      icon: Briefcase,
      action: () => router.push('/interview/company'),
      category: 'Practice',
      keywords: ['company', 'faang', 'google', 'amazon', 'microsoft']
    },
    {
      id: 'practice-persona',
      title: 'AI Personas',
      description: 'Interview with AI personas',
      icon: Sparkles,
      action: () => router.push('/interview/persona'),
      category: 'Practice',
      keywords: ['ai', 'persona', 'personality', 'interviewer']
    },
    
    // Analytics
    {
      id: 'analytics-performance',
      title: 'View Performance',
      description: 'Check your performance metrics',
      icon: BarChart3,
      action: () => router.push('/analytics'),
      category: 'Analytics',
      keywords: ['analytics', 'performance', 'metrics', 'stats']
    },
    {
      id: 'analytics-progress',
      title: 'Progress Tracking',
      description: 'Track your progress',
      icon: TrendingUp,
      action: () => router.push('/interview/performance'),
      category: 'Analytics',
      keywords: ['progress', 'tracking', 'improvement']
    },
    {
      id: 'analytics-reports',
      title: 'View Reports',
      description: 'Detailed interview reports',
      icon: FileText,
      action: () => router.push('/reports'),
      category: 'Analytics',
      keywords: ['reports', 'analysis', 'feedback']
    },
    
    // Learning
    {
      id: 'learning-paths',
      title: 'Learning Paths',
      description: 'Structured learning paths',
      icon: GraduationCap,
      action: () => router.push('/learning/paths'),
      category: 'Learning',
      keywords: ['learning', 'paths', 'curriculum', 'study']
    },
    {
      id: 'learning-resources',
      title: 'Resources',
      description: 'Study materials and resources',
      icon: BookOpen,
      action: () => router.push('/resources'),
      category: 'Learning',
      keywords: ['resources', 'materials', 'study', 'books']
    },
    
    // Achievements
    {
      id: 'achievements-view',
      title: 'My Achievements',
      description: 'View your achievements',
      icon: Trophy,
      action: () => router.push('/achievements'),
      category: 'Achievements',
      keywords: ['achievements', 'badges', 'rewards', 'trophies']
    },
    {
      id: 'achievements-leaderboard',
      title: 'Leaderboard',
      description: 'View global rankings',
      icon: TrendingUp,
      action: () => router.push('/leaderboard'),
      category: 'Achievements',
      keywords: ['leaderboard', 'ranking', 'top', 'best']
    },
    
    // Settings
    {
      id: 'settings-profile',
      title: 'Profile Settings',
      description: 'Manage your profile',
      icon: Settings,
      action: () => router.push('/profile'),
      category: 'Settings',
      keywords: ['profile', 'account', 'user', 'settings']
    },
    {
      id: 'settings-preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      icon: Settings,
      action: () => router.push('/settings'),
      category: 'Settings',
      keywords: ['preferences', 'settings', 'customize', 'configure']
    },
    {
      id: 'settings-help',
      title: 'Help & Support',
      description: 'Get help and support',
      icon: HelpCircle,
      action: () => router.push('/help'),
      category: 'Settings',
      keywords: ['help', 'support', 'faq', 'contact']
    }
  ]
  
  const filteredCommands = search
    ? commands.filter(command => {
        const searchLower = search.toLowerCase()
        return (
          command.title.toLowerCase().includes(searchLower) ||
          command.description?.toLowerCase().includes(searchLower) ||
          command.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
        )
      })
    : commands
  
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category].push(command)
    return acc
  }, {} as Record<string, CommandItem[]>)
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return
    
    const flatCommands = filteredCommands
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % flatCommands.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + flatCommands.length) % flatCommands.length)
        break
      case 'Enter':
        e.preventDefault()
        if (flatCommands[selectedIndex]) {
          flatCommands[selectedIndex].action()
          onOpenChange(false)
        }
        break
      case 'Escape':
        e.preventDefault()
        onOpenChange(false)
        break
    }
  }, [open, filteredCommands, selectedIndex, onOpenChange])
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
  
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])
  
  useEffect(() => {
    if (!open) {
      setSearch('')
      setSelectedIndex(0)
    }
  }, [open])
  
  if (!open) return null
  
  let currentIndex = -1
  
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-20 -translate-x-1/2 w-full max-w-2xl">
        <div className="mx-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands..."
              className="flex-1 border-0 bg-transparent px-4 py-4 text-sm focus:outline-none"
              autoFocus
            />
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-2">
            {Object.keys(groupedCommands).length > 0 ? (
              Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {category}
                  </div>
                  {items.map(item => {
                    currentIndex++
                    const isSelected = currentIndex === selectedIndex
                    const Icon = item.icon
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.action()
                          onOpenChange(false)
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                          isSelected
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No commands found
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1">↑</kbd>
                  <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-1">esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
