'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircle, Users } from 'lucide-react'

export default function MyMentorsPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <UserCircle className="h-8 w-8 text-primary" />
          My Mentors
        </h1>
        <p className="text-muted-foreground">
          Your connected mentors and ongoing sessions
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Mentors Yet</h3>
          <p className="text-muted-foreground text-center">
            Request a session with a mentor to get started
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
