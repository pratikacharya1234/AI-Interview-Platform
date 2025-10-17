'use client'

import { useSession } from 'next-auth/react'
import ModernDashboard from './modern-dashboard'

export default function DashboardPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  return <ModernDashboard />
}