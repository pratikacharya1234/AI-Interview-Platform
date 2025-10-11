'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ProfileClient() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p className="text-gray-600">
          Profile management is temporarily unavailable during authentication migration.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Migration Notice</CardTitle>
          <CardDescription>
            Profile management features are temporarily disabled while we upgrade to GitHub OAuth authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We&apos;re upgrading our authentication system to provide better security and integration with your GitHub profile.
            Profile features will be restored after the migration is complete.
          </p>
          
          <div className="flex gap-4">
            <Link href="/interview">
              <Button>Start New Interview</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
