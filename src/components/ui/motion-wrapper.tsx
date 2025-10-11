'use client'

import { motion } from 'framer-motion'

// Client-side motion components to prevent SSR issues
export const MotionDiv = motion.div
export const MotionSpan = motion.span
export const MotionInput = motion.input
export const MotionButton = motion.button

// Export motion directly for convenience
export { motion }