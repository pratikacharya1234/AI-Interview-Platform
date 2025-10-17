'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronDown, 
  ChevronRight,
  Home,
  MessageSquare,
  BarChart3,
  BookOpen,
  History,
  User,
  Settings,
  Award,
  Target,
  TrendingUp,
  FileText,
  Play,
  Mic,
  Code,
  Brain,
  Clock,
  Star,
  Download,
  Calendar,
  HelpCircle,
  Zap,
  Shield,
  Headphones,
  Monitor,
  Users,
  Building2,
  GraduationCap,
  Trophy,
  Flame,
  Map,
  UserCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarItem {
  id: string
  name: string
  href?: string
  icon: any
  badge?: string
  children?: SidebarItem[]
}

const navigationItems: SidebarItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    id: 'interviews',
    name: 'Interviews',
    icon: MessageSquare,
    children: [
      {
        id: 'start-interview',
        name: 'Start New Interview',
        href: '/interview',
        icon: Play,
      },
      {
        id: 'text-interview',
        name: 'Text Interview',
        href: '/interview/text',
        icon: FileText,
      },
      {
        id: 'voice-interview',
        name: 'Voice Interview',
        href: '/interview/conversational',
        icon: Mic,
      },
      {
        id: 'persona-interviews',
        name: 'Multi-Persona Interviews',
        href: '/interview/persona',
        icon: Users,
        badge: 'New',
      },
      {
        id: 'company-simulations',
        name: 'Company Simulations',
        href: '/interview/company',
        icon: Building2,
        badge: 'New',
      },
      {
        id: 'interview-history',
        name: 'Interview History',
        href: '/interview/history',
        icon: History,
      },
      {
        id: 'interview-feedback',
        name: 'Feedback & Results',
        href: '/interview/feedback',
        icon: Star,
      },
    ]
  },
  {
    id: 'gamification',
    name: 'Gamification',
    icon: Trophy,
    badge: 'New',
    children: [
      {
        id: 'achievements',
        name: 'Achievements',
        href: '/achievements',
        icon: Award,
      },
      {
        id: 'leaderboard',
        name: 'Leaderboard',
        href: '/leaderboard',
        icon: Trophy,
      },
      {
        id: 'streak',
        name: 'Daily Streak',
        href: '/streak',
        icon: Flame,
      },
      {
        id: 'xp-progress',
        name: 'XP & Levels',
        href: '/progress',
        icon: TrendingUp,
      },
    ]
  },
  {
    id: 'learning',
    name: 'Learning Paths',
    icon: Map,
    badge: 'New',
    children: [
      {
        id: 'my-paths',
        name: 'My Learning Paths',
        href: '/learning/paths',
        icon: Map,
      },
      {
        id: 'skill-assessment',
        name: 'Skill Assessment',
        href: '/learning/skills',
        icon: Target,
      },
      {
        id: 'resources',
        name: 'Study Resources',
        href: '/resources',
        icon: BookOpen,
      },
      {
        id: 'practice',
        name: 'Practice Questions',
        href: '/practice',
        icon: Brain,
      },
      {
        id: 'coding-challenges',
        name: 'Coding Challenges',
        href: '/coding',
        icon: Code,
      },
    ]
  },
  {
    id: 'performance',
    name: 'Analytics',
    icon: BarChart3,
    children: [
      {
        id: 'analytics-dashboard',
        name: 'Performance Dashboard',
        href: '/analytics',
        icon: BarChart3,
      },
      {
        id: 'voice-analysis',
        name: 'Voice Analysis',
        href: '/analytics/voice',
        icon: Mic,
        badge: 'New',
      },
      {
        id: 'progress-tracking',
        name: 'Progress Tracking',
        href: '/interview/performance',
        icon: TrendingUp,
      },
      {
        id: 'reports',
        name: 'Performance Reports',
        href: '/reports',
        icon: FileText,
      },
    ]
  },
  {
    id: 'mentor',
    name: 'Mentorship',
    icon: GraduationCap,
    badge: 'New',
    children: [
      {
        id: 'find-mentors',
        name: 'Find Mentors',
        href: '/mentor/find',
        icon: Users,
      },
      {
        id: 'my-mentors',
        name: 'My Mentors',
        href: '/mentor/my-mentors',
        icon: UserCircle,
      },
      {
        id: 'mentor-feedback',
        name: 'Mentor Feedback',
        href: '/mentor/feedback',
        icon: Star,
      },
    ]
  },
  {
    id: 'ai-features',
    name: 'AI Features',
    href: '/ai/coach',
    icon: Zap,
  },
  {
    id: 'account',
    name: 'Account',
    icon: User,
    children: [
      {
        id: 'profile',
        name: 'My Profile',
        href: '/profile',
        icon: User,
      },
      {
        id: 'settings',
        name: 'Settings',
        href: '/settings',
        icon: Settings,
      },
      {
        id: 'preferences',
        name: 'Preferences',
        href: '/preferences',
        icon: Settings,
      },
      {
        id: 'subscription',
        name: 'Subscription',
        href: '/subscription',
        icon: Shield,
      },
    ]
  },
  {
    id: 'help',
    name: 'Help & Support',
    icon: HelpCircle,
    children: [
      {
        id: 'help-center',
        name: 'Help Center',
        href: '/help',
        icon: HelpCircle,
      },
      {
        id: 'tutorials',
        name: 'Tutorials',
        href: '/tutorials',
        icon: Play,
      },
      {
        id: 'contact',
        name: 'Contact Support',
        href: '/contact',
        icon: MessageSquare,
      },
      {
        id: 'system-health',
        name: 'System Health',
        href: '/system-health',
        icon: Shield,
      },
    ]
  }
]

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['interviews'])
  const pathname = usePathname()

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isParentActive = (item: SidebarItem): boolean => {
    if (item.href && isActive(item.href)) return true
    if (item.children) {
      return item.children.some(child => 
        child.href && isActive(child.href)
      )
    }
    return false
  }

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.id)
    const isItemActive = item.href ? isActive(item.href) : isParentActive(item)
    const Icon = item.icon

    return (
      <div key={item.id} className="relative">
        {/* Main Item */}
        <div 
          className={cn(
            "group relative flex items-center w-full",
            level > 0 && "pl-4"
          )}
        >
          {item.href ? (
            <Link
              href={item.href}
              className={cn(
                "flex items-center flex-1 gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                isItemActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-muted-foreground hover:text-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isCollapsed && "h-5 w-5")} />
              {!isCollapsed && (
                <>
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary text-primary-foreground px-1.5 py-0.5 text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ) : (
            <Button
              variant="ghost"
              className={cn(
                "flex items-center justify-start flex-1 gap-3 px-3 py-2 text-sm font-medium h-auto",
                isItemActive 
                  ? "bg-primary/5 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => hasChildren && toggleExpanded(item.id)}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isCollapsed && "h-5 w-5")} />
              {!isCollapsed && (
                <>
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary text-primary-foreground px-1.5 py-0.5 text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {hasChildren && (
                    <div className="ml-auto">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1 ml-4">
            {item.children!.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full w-16 border-r bg-card/50 backdrop-blur">
        <div className="flex-1 p-2 space-y-2">
          {navigationItems.map((item) => renderSidebarItem(item))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-64 border-r bg-card/50 backdrop-blur">
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Navigation
        </h2>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-2">
          {navigationItems.map((item) => renderSidebarItem(item))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">AI Interview Pro</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}