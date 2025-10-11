'use client'

import React, { createContext, useContext } from 'react'
import { useUserPreferences, UserPreferences } from '@/hooks/useUserPreferences'

interface PreferencesContextType {
  preferences: UserPreferences
  isLoading: boolean
  isSaving: boolean
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>
  savePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>
  loadPreferences: () => Promise<void>
}

const PreferencesContext = createContext<PreferencesContextType | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const preferences = useUserPreferences()
  
  return (
    <PreferencesContext.Provider value={preferences}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}