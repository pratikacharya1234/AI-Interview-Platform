'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import ModernDashboard from './modern-dashboard'

export default function DashboardPage() {
  const { user, loading } = useSupabase()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  // If not loading and no user, middleware will redirect
  if (!user) {
    return null
  }

  return <ModernDashboard />
}
