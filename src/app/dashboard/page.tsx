'use client'

import { useSession } from 'next-auth/react'
import DashboardClient from './dashboard-client'

export default function DashboardPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  return (
    <DashboardClient user={session.user} />
  )
}