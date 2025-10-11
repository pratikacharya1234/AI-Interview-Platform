import * as React from 'react'
import { cn } from '@/lib/utils'
import { Rocket, CheckCircle, PartyPopper, Wifi, AlertTriangle } from 'lucide-react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info' | 'ai-feature'
  size?: 'sm' | 'md' | 'lg'
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = 'relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300'
    
    const variantClasses = {
      default: 'bg-background text-foreground border-border',
      destructive: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50',
      warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-50',
      success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50',
      info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-50',
      'ai-feature': 'border-prism-teal/30 bg-gradient-to-r from-prism-teal/5 to-lavender-mist/5 text-obsidian dark:text-pearl shadow-prism-glow'
    }

    const sizeClasses = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-4 py-3 text-sm',
      lg: 'px-6 py-4 text-base'
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
)
AlertDescription.displayName = "AlertDescription"

// Toast notification system for real-time feedback
export interface ToastProps extends Omit<AlertProps, 'size'> {
  title?: string
  description?: string
  action?: React.ReactNode
  onClose?: () => void
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    className, 
    variant = 'default', 
    title, 
    description, 
    action, 
    onClose, 
    children,
    ...props 
  }, ref) => {
    React.useEffect(() => {
      if (onClose) {
        const timer = setTimeout(onClose, 5000) // Auto-close after 5 seconds
        return () => clearTimeout(timer)
      }
    }, [onClose])

    return (
      <Alert
        ref={ref}
        variant={variant}
        className={cn(
          'flex items-start space-x-3 shadow-lg border-l-4',
          variant === 'ai-feature' && 'border-l-prism-teal',
          variant === 'success' && 'border-l-green-500',
          variant === 'destructive' && 'border-l-red-500',
          variant === 'warning' && 'border-l-amber-500',
          variant === 'info' && 'border-l-blue-500',
          className
        )}
        {...props}
      >
        <div className="flex-1 space-y-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          {description && <AlertDescription>{description}</AlertDescription>}
          {children}
        </div>
        <div className="flex items-center space-x-2">
          {action}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close notification"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </Alert>
    )
  }
)
Toast.displayName = "Toast"

// AI Interview Platform specific alerts
export interface InterviewAlertProps extends Omit<AlertProps, 'variant'> {
  type: 'interview-started' | 'question-completed' | 'interview-completed' | 'connection-lost' | 'ai-processing'
  interviewData?: {
    questionNumber?: number
    totalQuestions?: number
    timeRemaining?: number
  }
}

const InterviewAlert = React.forwardRef<HTMLDivElement, InterviewAlertProps>(
  ({ type, interviewData, className, ...props }, ref) => {
    const alertConfigs = {
      'interview-started': {
        variant: 'ai-feature' as const,
        title: 'Interview Started',
        icon: <Rocket className="w-5 h-5" />,
        description: 'Your AI interview session has begun. Take your time and answer thoughtfully.'
      },
      'question-completed': {
        variant: 'success' as const,
        title: 'Question Completed',
        icon: <CheckCircle className="w-5 h-5" />,
        description: `Question ${interviewData?.questionNumber} of ${interviewData?.totalQuestions} completed successfully.`
      },
      'interview-completed': {
        variant: 'success' as const,
        title: 'Interview Completed',
        icon: <PartyPopper className="w-5 h-5" />,
        description: 'Congratulations! Your interview has been completed successfully.'
      },
      'connection-lost': {
        variant: 'warning' as const,
        title: 'Connection Lost',
        icon: <Wifi className="w-5 h-5" />,
        description: 'Connection to the interview server was lost. Reconnecting...'
      },
      'ai-processing': {
        variant: 'info' as const,
        title: 'AI Processing',
        icon: <AlertTriangle className="w-5 h-5" />,
        description: 'AI is analyzing your response. Please wait...'
      }
    }

    const config = alertConfigs[type]

    return (
      <Alert
        ref={ref}
        variant={config.variant}
        className={className}
        {...props}
      >
        <AlertTitle className="flex items-center gap-2">
          {config.icon}
          {config.title}
        </AlertTitle>
        <AlertDescription>{config.description}</AlertDescription>
      </Alert>
    )
  }
)
InterviewAlert.displayName = "InterviewAlert"

export { Alert, AlertTitle, AlertDescription, Toast, InterviewAlert }