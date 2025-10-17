'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  X,
  ChevronRight,
  LayoutDashboard,
  Video,
  MessageSquare,
  BarChart3,
  BookOpen,
  Trophy,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Clock,
  TrendingUp,
  Target,
  Briefcase,
  GraduationCap,
  Code2,
  Brain,
  Sparkles,
  FileText
} from 'lucide-react'
import { signOut } from 'next-auth/react'

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: any
}

interface NavItem {
  id: string
  label: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'interviews',
    label: 'Interviews',
    icon: Video,
    children: [
      {
        id: 'new-interview',
        label: 'Start Interview',
        href: '/interview',
        icon: Plus
      },
      {
        id: 'text-interview',
        label: 'Text Based',
        href: '/interview/text',
        icon: MessageSquare
      },
      {
        id: 'voice-interview',
        label: 'Voice Interview',
        href: '/interview/conversational',
        icon: Video
      },
      {
        id: 'video-interview',
        label: 'Video Interview',
        href: '/interview/video',
        icon: Video
      },
      {
        id: 'history',
        label: 'History',
        href: '/interview/history',
        icon: Clock
      },
      {
        id: 'feedback',
        label: 'Feedback',
        href: '/interview/feedback',
        icon: FileText
      }
    ]
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: Brain,
    children: [
      {
        id: 'questions',
        label: 'Question Bank',
        href: '/practice',
        icon: BookOpen
      },
      {
        id: 'coding',
        label: 'Coding Challenges',
        href: '/coding',
        icon: Code2
      },
      {
        id: 'mock',
        label: 'Mock Interviews',
        href: '/mock',
        icon: Users
      },
      {
        id: 'company',
        label: 'Company Specific',
        href: '/interview/company',
        icon: Briefcase
      },
      {
        id: 'persona',
        label: 'AI Personas',
        href: '/interview/persona',
        icon: Sparkles
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    children: [
      {
        id: 'performance',
        label: 'Performance',
        href: '/analytics',
        icon: TrendingUp
      },
      {
        id: 'progress',
        label: 'Progress',
        href: '/interview/performance',
        icon: Target
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/reports',
        icon: FileText
      }
    ]
  },
  {
    id: 'learning',
    label: 'Learning',
    icon: GraduationCap,
    children: [
      {
        id: 'paths',
        label: 'Learning Paths',
        href: '/learning/paths',
        icon: Target
      },
      {
        id: 'resources',
        label: 'Resources',
        href: '/resources',
        icon: BookOpen
      }
    ]
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    children: [
      {
        id: 'my-achievements',
        label: 'My Achievements',
        href: '/achievements',
        icon: Trophy
      },
      {
        id: 'leaderboard',
        label: 'Leaderboard',
        href: '/leaderboard',
        icon: TrendingUp
      }
    ]
  }
]

export function MobileNav({ open, onOpenChange, session }: MobileNavProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }
  
  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href || pathname.startsWith(href + '/')
  }
  
  const handleSignOut = async () => {
    await signOut({ redirect: false })
    window.location.href = '/'
  }
  
  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const Icon = item.icon
    
    if (item.href) {
      return (
        <Link
          key={item.id}
          href={item.href}
          onClick={() => onOpenChange(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
            isActive(item.href)
              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300",
            level > 0 && "ml-8"
          )}
        >
          <Icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      )
    }
    
    return (
      <div key={item.id}>
        <button
          onClick={() => hasChildren && toggleExpanded(item.id)}
          className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </div>
          {hasChildren && (
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-90"
            )} />
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Interview Pro
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="flex flex-col h-[calc(100%-4rem)]">
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map(item => renderNavItem(item))}
          </nav>
          
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-1">
            <Link
              href="/settings"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
            <Link
              href="/help"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
