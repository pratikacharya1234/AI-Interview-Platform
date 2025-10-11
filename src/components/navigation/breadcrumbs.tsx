'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/interview': 'Interview',
  '/interview/text': 'Text Interview',
  '/interview/conversational': 'Voice Interview',
  '/interview/history': 'Interview History',
  '/interview/feedback': 'Feedback & Results',
  '/interview/performance': 'Performance',
  '/analytics': 'Analytics',
  '/resources': 'Resources',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/preferences': 'Preferences',
  '/achievements': 'Achievements',
  '/reports': 'Reports',
  '/practice': 'Practice',
  '/coding': 'Coding Challenges',
  '/mock': 'Mock Interviews',
  '/ai/coach': 'AI Coach',
  '/ai/voice': 'Voice Analysis',
  '/ai/feedback': 'Smart Feedback',
  '/ai/prep': 'Personalized Prep',
  '/subscription': 'Subscription',
  '/help': 'Help Center',
  '/tutorials': 'Tutorials',
  '/contact': 'Contact Support',
}

export function Breadcrumbs() {
  const pathname = usePathname()

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/dashboard' }
    ]

    let currentPath = ''
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      const label = routeLabels[currentPath] || 
                   segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs on dashboard
  if (pathname === '/dashboard') {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Home className="h-4 w-4" />
      {breadcrumbs.map((item, index) => (
        <div key={item.href || item.label} className="flex items-center space-x-1">
          {index > 0 && <ChevronRight className="h-3 w-3" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={cn(
                "font-medium",
                item.current && "text-foreground"
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

export function PageHeader({ 
  title, 
  description, 
  children 
}: { 
  title: string
  description?: string
  children?: React.ReactNode 
}) {
  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-2">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}