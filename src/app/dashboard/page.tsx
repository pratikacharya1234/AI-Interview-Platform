'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import ModernDashboard from './modern-dashboard'

export default function DashboardPage() {
  const { user } = useSupabase()

  if (!user) {
    return null
  }

  return <ModernDashboard />
}
