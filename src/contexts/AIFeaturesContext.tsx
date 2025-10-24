'use client'

import { useSupabase } from '@/components/providers/supabase-provider'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

interface AIFeatureMetrics {
  coaching_sessions_completed: number
  voice_sessions_completed: number
  feedback_sessions_completed: number
  prep_plans_active: number
  average_score: number
  improvement_rate: number
  last_activity: string | null
}

interface AIFeaturesContextType {
  metrics: AIFeatureMetrics
  refreshMetrics: () => Promise<void>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
}

const AIFeaturesContext = createContext<AIFeaturesContextType | undefined>(undefined)

export function AIFeaturesProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useSupabase()
  const [metrics, setMetrics] = useState<AIFeatureMetrics>({
    coaching_sessions_completed: 0,
    voice_sessions_completed: 0,
    feedback_sessions_completed: 0,
    prep_plans_active: 0,
    average_score: 0,
    improvement_rate: 0,
    last_activity: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshMetrics = useCallback(async () => {
    if (!user?.email) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/metrics')
      
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err: any) {
      console.error('Error fetching AI features metrics:', err)
      setError(err.message || 'Failed to load metrics')
    } finally {
      setIsLoading(false)
    }
  }, [user?.email])

  // Load metrics on mount and when session changes
  useEffect(() => {
    refreshMetrics()
  }, [refreshMetrics])

  return (
    <AIFeaturesContext.Provider
      value={{
        metrics,
        refreshMetrics,
        isLoading,
        setIsLoading,
        error
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
