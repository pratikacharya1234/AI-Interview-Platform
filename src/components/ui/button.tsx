'use client'

import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { MotionDiv } from './motion-wrapper'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    icon,
    fullWidth = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg',
      fullWidth && 'w-full'
    )
    
    const variants = {
      primary: 'bg-prism-teal hover:bg-teal-600 text-white shadow-md hover:shadow-teal-glow hover:scale-[1.02] active:scale-95 focus:ring-prism-teal',
      secondary: 'bg-lavender-mist hover:bg-purple-500 text-white shadow-md hover:shadow-lavender-glow hover:scale-[1.02] active:scale-95 focus:ring-lavender-mist',
      outline: 'border-2 border-prism-teal text-prism-teal hover:bg-prism-teal hover:text-white focus:ring-prism-teal',
      ghost: 'text-graphite dark:text-silver hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-300',
      danger: 'bg-rose-alert hover:bg-red-600 text-white shadow-md hover:scale-[1.02] active:scale-95 focus:ring-rose-alert',
      success: 'bg-jade-success hover:bg-green-600 text-white shadow-md hover:scale-[1.02] active:scale-95 focus:ring-jade-success',
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
      xl: 'px-10 py-5 text-lg',
    }

    return (
      <MotionDiv
        className="inline-flex"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        <button
          className={cn(
            baseClasses,
            variants[variant],
            sizes[size],
            className
          )}
          ref={ref}
          disabled={isLoading || props.disabled}
          {...props}
        >
          {isLoading && (
            <MotionDiv
              className="mr-2"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Loader2 className="h-4 w-4" />
            </MotionDiv>
          )}
          {icon && !isLoading && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
        </button>
      </MotionDiv>
    )
  }
)
Button.displayName = "Button"

export { Button }