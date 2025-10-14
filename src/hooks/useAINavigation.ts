'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

interface AIFeatureRoute {
  id: string
  name: string
  path: string
  description: string
}

const AI_FEATURE_ROUTES: AIFeatureRoute[] = [
  {
    id: 'coach',
    name: 'AI Coach',
    path: '/ai/coach',
    description: 'Personalized coaching sessions'
  },
  {
    id: 'voice',
    name: 'Voice Analysis',
    path: '/ai/voice',
    description: 'Advanced voice metrics'
  },
  {
    id: 'feedback',
    name: 'Smart Feedback',
    path: '/ai/feedback',
    description: 'AI-enhanced insights'
  },
  {
    id: 'prep',
    name: 'Personalized Prep',
    path: '/ai/prep',
    description: 'Custom study plans'
  }
]

/**
 * Hook for managing AI features navigation
 * Provides utilities for routing and current feature detection
 */
export function useAINavigation() {
  const pathname = usePathname()
  const router = useRouter()

  // Get current active feature
  const currentFeature = useMemo(() => {
    return AI_FEATURE_ROUTES.find(route => pathname === route.path)
  }, [pathname])

  // Check if we're in AI features section
  const isAIFeature = useMemo(() => {
    return pathname.startsWith('/ai/')
  }, [pathname])

  // Navigate to specific AI feature
  const navigateToFeature = useCallback((featureId: string) => {
    const feature = AI_FEATURE_ROUTES.find(route => route.id === featureId)
    if (feature) {
      router.push(feature.path)
    }
  }, [router])

  // Get next feature in sequence (for guided navigation)
  const getNextFeature = useCallback(() => {
    if (!currentFeature) return null
    
    const currentIndex = AI_FEATURE_ROUTES.findIndex(
      route => route.id === currentFeature.id
    )
    
    if (currentIndex === -1 || currentIndex === AI_FEATURE_ROUTES.length - 1) {
      return null
    }
    
    return AI_FEATURE_ROUTES[currentIndex + 1]
  }, [currentFeature])

  // Get previous feature in sequence
  const getPreviousFeature = useCallback(() => {
    if (!currentFeature) return null
    
    const currentIndex = AI_FEATURE_ROUTES.findIndex(
      route => route.id === currentFeature.id
    )
    
    if (currentIndex <= 0) {
      return null
    }
    
    return AI_FEATURE_ROUTES[currentIndex - 1]
  }, [currentFeature])

  return {
    currentFeature,
    isAIFeature,
    allFeatures: AI_FEATURE_ROUTES,
    navigateToFeature,
    getNextFeature,
    getPreviousFeature
  }
}
