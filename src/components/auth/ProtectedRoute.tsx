'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/auth/supabase-signin'
}: ProtectedRouteProps) {
  const { user, loading } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Save current path for redirect after login
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`
        router.push(redirectUrl)
      } else if (!requireAuth && user) {
        // User is authenticated but on a public-only page
        router.push('/dashboard')
      }
    }
  }, [user, loading, requireAuth, router, pathname, redirectTo])

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
          <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  // Don't render if auth requirement not met
  if (requireAuth && !user) {
    return null
  }

  if (!requireAuth && user) {
    return null
  }

  return <>{children}</>
}
