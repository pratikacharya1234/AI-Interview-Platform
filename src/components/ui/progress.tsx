'use client'

import * as React from 'react'
import { MotionDiv, MotionSpan } from './motion-wrapper'
import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'ai-prism'
  showPercentage?: boolean
  label?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    size = 'md', 
    variant = 'default',
    showPercentage = false,
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizeClasses = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4'
    }

    const variantClasses = {
      default: 'bg-prism-teal',
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      error: 'bg-red-500',
      'ai-prism': 'bg-gradient-to-r from-prism-teal to-lavender-mist'
    }

    return (
      <div className={cn('w-full', className)} ref={ref} {...props}>
        {(label || showPercentage) && (
          <MotionDiv 
            className="flex justify-between items-center mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {label && (
              <span className="text-sm font-medium text-obsidian dark:text-pearl">
                {label}
              </span>
            )}
            {showPercentage && (
              <MotionSpan 
                className="text-sm text-silver"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {Math.round(percentage)}%
              </MotionSpan>
            )}
          </MotionDiv>
        )}
        <MotionDiv
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800',
            sizeClasses[size]
          )}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <MotionDiv
            className={cn(
              'h-full rounded-full',
              variantClasses[variant],
              variant === 'ai-prism' && 'shadow-prism-glow'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: 1,
              ease: "easeOut",
              delay: 0.2
            }}
          />
        </MotionDiv>
      </div>
    )
  }
)
Progress.displayName = "Progress"

// Specialized progress components for AI Interview Platform
export interface InterviewProgressProps extends Omit<ProgressProps, 'value' | 'max'> {
  currentQuestion: number
  totalQuestions: number
}

const InterviewProgress = React.forwardRef<HTMLDivElement, InterviewProgressProps>(
  ({ currentQuestion, totalQuestions, ...props }, ref) => (
    <Progress
      ref={ref}
      value={currentQuestion}
      max={totalQuestions}
      variant="ai-prism"
      showPercentage={true}
      label={`Question ${currentQuestion} of ${totalQuestions}`}
      {...props}
    />
  )
)
InterviewProgress.displayName = "InterviewProgress"

export interface SkillProgressProps extends Omit<ProgressProps, 'variant'> {
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

const SkillProgress = React.forwardRef<HTMLDivElement, SkillProgressProps>(
  ({ skillLevel, value = 0, ...props }, ref) => {
    const skillConfigs = {
      beginner: { variant: 'default' as const, color: 'bg-slate-400' },
      intermediate: { variant: 'default' as const, color: 'bg-prism-teal' },
      advanced: { variant: 'default' as const, color: 'bg-lavender-mist' },
      expert: { variant: 'ai-prism' as const, color: '' }
    }

    const config = skillConfigs[skillLevel]
    
    return (
      <Progress
        ref={ref}
        value={value}
        variant={config.variant}
        {...props}
      />
    )
  }
)
SkillProgress.displayName = "SkillProgress"

export { Progress, InterviewProgress, SkillProgress }