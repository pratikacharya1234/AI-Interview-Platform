'use client'

import { motion, HTMLMotionProps, Variants } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

// Animation variants with proper typing
export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

// Page transition variants
export const pageTransition: Variants = {
  hidden: { opacity: 0, x: 300 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {
    opacity: 0,
    x: -300,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

// Modal animation
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

export const modalContent: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 50
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Generic animated wrapper component
interface AnimatedWrapperProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode
  variant?: 'fadeIn' | 'slideInFromLeft' | 'slideInFromRight' | 'scaleIn'
  delay?: number
  className?: string
}

export const AnimatedWrapper = ({ 
  children, 
  variant = 'fadeIn', 
  delay = 0, 
  className,
  ...props 
}: AnimatedWrapperProps) => {
  const variants: Record<string, Variants> = {
    fadeIn,
    slideInFromLeft,
    slideInFromRight,
    scaleIn
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[variant]}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Stagger container component
interface StaggerContainerProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export const StaggerContainer = ({ 
  children, 
  className,
  staggerDelay = 0.1,
  ...props 
}: StaggerContainerProps) => {
  const customStagger: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.2
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={customStagger}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Animated button wrapper
interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode
  className?: string
  glowOnHover?: boolean
}

export const AnimatedButton = ({ 
  children, 
  className,
  glowOnHover = true,
  ...props 
}: AnimatedButtonProps) => {
  return (
    <motion.button
      whileHover={{ 
        scale: 1.05,
        ...(glowOnHover && { boxShadow: '0 0 25px rgba(20, 184, 166, 0.5)' })
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// Animated card wrapper with client-side only rendering
interface AnimatedCardProps {
  children: ReactNode
  className?: string
}

export const AnimatedCard = ({ 
  children, 
  className,
}: AnimatedCardProps) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Always render as static div to avoid SSR issues
  // In production, you can enhance this with proper client-side hydration
  return (
    <div 
      className={`${className} ${isMounted ? 'animate-fadeIn' : ''}`}
      style={isMounted ? { 
        transition: 'all 0.3s ease',
      } : {}}
      onMouseEnter={(e) => {
        if (isMounted) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (isMounted) {
          e.currentTarget.style.transform = 'translateY(0px)'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {children}
    </div>
  )
}

// Loading spinner component
interface LoadingSpinnerProps {
  size?: number
  className?: string
}

export const LoadingSpinner = ({ size = 24, className }: LoadingSpinnerProps) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={className}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full border-2 border-prism-teal border-t-transparent rounded-full" />
    </motion.div>
  )
}