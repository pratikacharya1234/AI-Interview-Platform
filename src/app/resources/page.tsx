'use client'

import ResourcesClient from './resources-client'
import { AppLayout } from '@/components/layout/app-layout'

export default function ResourcesPage() {
  return (
    <AppLayout>
      <ResourcesClient />
    </AppLayout>
  )
}