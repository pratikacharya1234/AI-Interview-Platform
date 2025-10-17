'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Video,
  MessageSquare,
  BarChart3,
  BookOpen,
  Trophy,
  Users,
  Settings,
  ChevronRight,
  Search,
  Plus,
  Clock,
  TrendingUp,
  Target,
  Briefcase,
  GraduationCap,
  Code2,
  Brain,
  Sparkles,
  FileText,
  HelpCircle
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  href?: string
  icon: React.ElementType
  badge?: string
  badgeType?: 'default' | 'success' | 'warning' | 'error'
  children?: NavItem[]
  disabled?: boolean
}

interface ModernSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
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
        icon: Video,
        badge: 'Beta',
        badgeType: 'warning'
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
        id: 'voice-analysis',
        label: 'Voice Analysis',
        href: '/analytics/voice',
        icon: BarChart3
      },
      {
        id: 'progress',
        label: 'Progress Tracking',
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
        id: 'skills',
        label: 'Skill Assessment',
        href: '/learning/skills',
        icon: Brain
      },
      {
        id: 'resources',
        label: 'Resources',
        href: '/resources',
        icon: BookOpen
      },
      {
        id: 'mentorship',
        label: 'Mentorship',
        href: '/mentor/find',
        icon: Users
      }
    ]
  },
  {
    id: 'gamification',
    label: 'Achievements',
    icon: Trophy,
    children: [
      {
        id: 'achievements',
        label: 'My Achievements',
        href: '/achievements',
        icon: Trophy
      },
      {
        id: 'leaderboard',
        label: 'Leaderboard',
        href: '/leaderboard',
        icon: TrendingUp
      },
      {
        id: 'streak',
        label: 'Streaks',
        href: '/streak',
        icon: Clock
      },
      {
        id: 'progress-xp',
        label: 'XP Progress',
        href: '/progress',
        icon: Target
      }
    ]
  }
]

const bottomNavigation: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings
  },
  {
    id: 'help',
    label: 'Help & Support',
    href: '/help',
    icon: HelpCircle
  }
]

export function ModernSidebar({ open, onOpenChange, className }: ModernSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Auto-expand active sections
  useMemo(() => {
    const activeSection = navigation.find(item => 
      item.children?.some(child => child.href === pathname)
    )
    if (activeSection && !expandedItems.includes(activeSection.id)) {
      setExpandedItems(prev => [...prev, activeSection.id])
    }
  }, [pathname])
  
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
  
  const filteredNavigation = useMemo(() => {
    if (!searchQuery) return navigation
    
    const query = searchQuery.toLowerCase()
    return navigation.map(item => ({
      ...item,
      children: item.children?.filter(child =>
        child.label.toLowerCase().includes(query)
      )
    })).filter(item =>
      item.label.toLowerCase().includes(query) ||
      (item.children && item.children.length > 0)
    )
  }, [searchQuery])
  
  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const Icon = item.icon
    
    if (item.href) {
      return (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            isActive(item.href)
              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300",
            level > 0 && "ml-6",
            item.disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Icon className={cn(
            "h-5 w-5 flex-shrink-0 transition-colors",
            isActive(item.href)
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
          )} />
          {open && (
            <>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "px-2 py-0.5 text-xs rounded-full",
                  item.badgeType === 'success' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                  item.badgeType === 'warning' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                  item.badgeType === 'error' && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                  !item.badgeType && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                )}>
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Link>
      )
    }
    
    return (
      <div key={item.id}>
        <button
          onClick={() => hasChildren && toggleExpanded(item.id)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "text-gray-700 dark:text-gray-300"
          )}
        >
          <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
          {open && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {hasChildren && (
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-90"
                )} />
              )}
            </>
          )}
        </button>
        {open && hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <aside className={cn(
      "flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
      className
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          {open && (
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Interview Pro
            </span>
          )}
        </Link>
      </div>
      
      {/* Search */}
      {open && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredNavigation.map(item => renderNavItem(item))}
      </nav>
      
      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-1">
        {bottomNavigation.map(item => renderNavItem(item))}
      </div>
    </aside>
  )
}
