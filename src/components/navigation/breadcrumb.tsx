'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

/**
 * Breadcrumb component for navigation hierarchy
 * Automatically generates breadcrumbs from pathname if items not provided
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname()

  // Generate breadcrumbs from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname)

  if (breadcrumbItems.length === 0) {
    return null
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center gap-2 text-sm", className)}
    >
      {/* Home Icon */}
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dashboard"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1

        return (
          <div key={item.href} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="text-foreground font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

/**
 * Generate breadcrumb items from pathname
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Remove leading/trailing slashes and split
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length === 0) {
    return []
  }

  const breadcrumbs: BreadcrumbItem[] = []
  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Format label: capitalize and replace hyphens with spaces
    const label = formatSegmentLabel(segment)
    
    breadcrumbs.push({
      label,
      href: currentPath
    })
  })

  return breadcrumbs
}

/**
 * Format segment label for display
 */
function formatSegmentLabel(segment: string): string {
  // Special cases for known routes
  const labelMap: Record<string, string> = {
    'ai': 'AI Features',
    'coach': 'AI Coach',
    'voice': 'Voice Analysis',
    'feedback': 'Smart Feedback',
    'prep': 'Personalized Prep',
    'interview': 'Interviews',
    'analytics': 'Analytics',
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'profile': 'Profile',
    'subscription': 'Subscription',
    'achievements': 'Achievements',
    'reports': 'Reports',
    'practice': 'Practice',
    'coding': 'Coding Challenges',
    'mock': 'Mock Interviews',
    'resources': 'Resources',
    'preferences': 'Preferences'
  }

  if (labelMap[segment]) {
    return labelMap[segment]
  }

  // Default: capitalize first letter and replace hyphens/underscores
  return segment
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
