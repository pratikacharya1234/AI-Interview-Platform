import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'highlight' | 'ai-feature'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, onDrag, onDragStart, onDragEnd, onAnimationStart, onAnimationEnd, ...props }, ref) => {
    const baseClasses = 'rounded-xl border transition-all duration-300'
    
    const variants = {
      default: 'bg-white dark:bg-graphite border-gray-100 dark:border-gray-800 shadow-prism-card',
      interactive: 'bg-white dark:bg-graphite border-gray-100 dark:border-gray-800 shadow-prism-card hover:shadow-xl hover:scale-[1.02] cursor-pointer',
      highlight: 'bg-gradient-to-r from-prism-teal/5 to-lavender-mist/5 border-prism-teal/20 shadow-lg',
      'ai-feature': 'bg-gradient-to-r from-lavender-mist/10 to-prism-teal/10 border-lavender-mist/30 shadow-lavender-glow'
    }

    const paddings = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    }

    const isInteractive = variant === 'interactive'

    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          paddings[padding],
          isInteractive ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : '',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 pb-6", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight text-obsidian dark:text-pearl", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-silver dark:text-silver", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-6", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }