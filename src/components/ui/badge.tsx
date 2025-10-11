'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

type BadgeVariant = 
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'
  | 'skill-beginner'
  | 'skill-intermediate'
  | 'skill-advanced'
  | 'skill-expert'
  | 'interview-scheduled'
  | 'interview-in-progress'
  | 'interview-completed'
  | 'interview-cancelled'
  | 'ai-prism'
  | 'prism-glow'

type BadgeSize = 'sm' | 'md' | 'lg' | 'xl'

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-obsidian text-pearl hover:bg-obsidian/80',
  secondary: 'border-transparent bg-silver/10 text-silver hover:bg-silver/20',
  destructive: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100',
  outline: 'text-obsidian dark:text-pearl border-silver/30',
  success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  warning: 'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  'skill-beginner': 'border-transparent bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'skill-intermediate': 'border-transparent bg-prism-teal/10 text-prism-teal dark:bg-prism-teal/20',
  'skill-advanced': 'border-transparent bg-lavender-mist/10 text-lavender-mist dark:bg-lavender-mist/20',
  'skill-expert': 'border-transparent bg-gradient-to-r from-prism-teal to-lavender-mist text-white',
  'interview-scheduled': 'border-transparent bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  'interview-in-progress': 'border-transparent bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 animate-pulse',
  'interview-completed': 'border-transparent bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
  'interview-cancelled': 'border-transparent bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  'ai-prism': 'border-transparent bg-gradient-to-r from-prism-teal/20 to-lavender-mist/20 text-obsidian dark:text-pearl border-prism-teal/30',
  'prism-glow': 'border-prism-teal/50 bg-gradient-to-r from-prism-teal/10 to-lavender-mist/10 text-prism-teal shadow-prism-glow animate-prism-pulse'
}

const badgeSizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
  xl: 'px-4 py-1.5 text-base'
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: React.ReactNode
}

function Badge({ className, variant = 'default', size = 'md', icon, children, ...props }: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-prism-teal/20 focus:ring-offset-2'
  
  return (
    <div 
      className={cn(
        baseClasses,
        badgeVariants[variant],
        badgeSizes[size],
        className
      )} 
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  )
}

// Predefined skill level badges
const SkillBadge = ({ level, className, ...props }: { level: 'beginner' | 'intermediate' | 'advanced' | 'expert' } & Omit<BadgeProps, 'variant'>) => {
  const skillConfig = {
    beginner: { variant: 'skill-beginner' as const, text: 'Beginner' },
    intermediate: { variant: 'skill-intermediate' as const, text: 'Intermediate' },
    advanced: { variant: 'skill-advanced' as const, text: 'Advanced' },
    expert: { variant: 'skill-expert' as const, text: 'Expert' }
  }

  const config = skillConfig[level]
  
  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.text}
    </Badge>
  )
}

// Predefined interview status badges
const InterviewStatusBadge = ({ 
  status, 
  className, 
  ...props 
}: { 
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' 
} & Omit<BadgeProps, 'variant'>) => {
  const statusConfig = {
    scheduled: { variant: 'interview-scheduled' as const, text: 'Scheduled' },
    'in-progress': { variant: 'interview-in-progress' as const, text: 'In Progress' },
    completed: { variant: 'interview-completed' as const, text: 'Completed' },
    cancelled: { variant: 'interview-cancelled' as const, text: 'Cancelled' }
  }

  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.text}
    </Badge>
  )
}

// AI-powered feature badge
const AIPrismBadge = ({ className, children, ...props }: Omit<BadgeProps, 'variant'>) => (
  <Badge variant="ai-prism" className={className} {...props}>
    <Sparkles className="mr-1 w-3 h-3" />
    {children || 'AI Powered'}
  </Badge>
)

export { Badge, SkillBadge, InterviewStatusBadge, AIPrismBadge, badgeVariants }