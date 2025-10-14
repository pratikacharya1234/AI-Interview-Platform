'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface AIFeatureMetrics {
  sessionsCompleted: number
  averageScore: number
  improvementRate: number
  lastActivity: string | null
}

interface AIFeaturesContextType {
  metrics: AIFeatureMetrics
  updateMetrics: (newMetrics: Partial<AIFeatureMetrics>) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const AIFeaturesContext = createContext<AIFeaturesContextType | undefined>(undefined)

export function AIFeaturesProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<AIFeatureMetrics>({
    sessionsCompleted: 0,
    averageScore: 0,
    improvementRate: 0,
    lastActivity: null
  })
  const [isLoading, setIsLoading] = useState(false)

  const updateMetrics = useCallback((newMetrics: Partial<AIFeatureMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }))
  }, [])

  return (
    <AIFeaturesContext.Provider
      value={{
        metrics,
        updateMetrics,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </AIFeaturesContext.Provider>
  )
}

export function useAIFeatures() {
  const context = useContext(AIFeaturesContext)
  if (context === undefined) {
    throw new Error('useAIFeatures must be used within AIFeaturesProvider')
  }
  return context
}
