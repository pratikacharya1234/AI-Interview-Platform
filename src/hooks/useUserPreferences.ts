import { useState, useEffect, useCallback } from 'react'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  interviewDifficulty: 'beginner' | 'intermediate' | 'advanced'
  interviewType: 'technical' | 'behavioral' | 'system-design' | 'mixed'
  voiceEnabled: boolean
  voiceSpeed: number
  volume: number
  emailNotifications: boolean
  browserNotifications: boolean
  autoSaveResponses: boolean
  detailedFeedback: boolean
  recordSessions: boolean
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  interviewDifficulty: 'intermediate',
  interviewType: 'mixed',
  voiceEnabled: true,
  voiceSpeed: 1.0,
  volume: 0.8,
  emailNotifications: true,
  browserNotifications: true,
  autoSaveResponses: true,
  detailedFeedback: true,
  recordSessions: false,
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true)
      
      if (typeof window !== 'undefined') {
        const localPrefs = localStorage.getItem('user_preferences')
        if (localPrefs) {
          const parsed = JSON.parse(localPrefs)
          setPreferences({ ...defaultPreferences, ...parsed })
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const savePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    try {
      setIsSaving(true)
      const updatedPrefs = { ...preferences, ...newPreferences }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_preferences', JSON.stringify(updatedPrefs))
      }
      
      setPreferences(updatedPrefs)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }, [preferences])

  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    await savePreferences({ [key]: value })
  }, [savePreferences])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      
      if (preferences.theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', isDark)
      } else {
        root.classList.toggle('dark', preferences.theme === 'dark')
      }
    }
  }, [preferences.theme])

  return {
    preferences,
    isLoading,
    isSaving,
    updatePreference,
    savePreferences,
    loadPreferences
  }
}
