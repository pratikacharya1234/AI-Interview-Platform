'use client'

import { useEffect } from 'react'

// Client-side storage cleanup component
export default function StorageCleanup() {
  useEffect(() => {
    // Import and run cleanup on client-side only
    const runCleanup = async () => {
      try {
        const { clearCorruptedStorage } = await import('@/utils/clear-storage')
        clearCorruptedStorage()
      } catch (error) {
        console.warn('Could not run storage cleanup:', error)
      }
    }
    
    runCleanup()
  }, [])

  return null // This component doesn't render anything
}