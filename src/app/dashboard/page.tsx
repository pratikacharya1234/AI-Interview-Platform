'use client'

import { useEffect } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import ModernDashboard from './modern-dashboard'

export default function DashboardPage() {
  const { user, loading } = useSupabase()

  useEffect(() => {
    console.log('Dashboard - Auth state:', { user: !!user, loading, userId: user?.id })
  }, [user, loading])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If not loading and no user, show message (middleware should redirect)
  if (!user) {
    console.log('Dashboard - No user, should redirect')
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  console.log('Dashboard - Rendering ModernDashboard for user:', user.id)
  return <ModernDashboard />
}
