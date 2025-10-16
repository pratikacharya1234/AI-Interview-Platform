'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Star, Briefcase, Award, Loader2, MessageSquare } from 'lucide-react'

interface Mentor {
  id: string
  user_id: string
  expertise_areas: string[]
  years_experience: number
  current_company: string
  current_role: string
  bio: string
  rating: number
  total_reviews: number
  sessions_conducted: number
  is_available: boolean
}

export default function FindMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState<string | null>(null)

  useEffect(() => {
    fetchMentors()
  }, [])

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/mentor?action=available')
      if (response.ok) {
        const data = await response.json()
        setMentors(data)
      }
    } catch (error) {
      console.error('Error fetching mentors:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestSession = async (mentorId: string) => {
    setRequesting(mentorId)
    try {
      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_session',
          mentor_id: mentorId,
          session_type: 'interview-review',
          preferred_date: new Date().toISOString()
        })
      })

      if (response.ok) {
        alert('Session request sent successfully!')
      }
    } catch (error) {
      console.error('Error requesting session:', error)
    } finally {
      setRequesting(null)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
          Find Mentors
        </h1>
        <p className="text-muted-foreground">
          Connect with experienced professionals for personalized guidance
        </p>
      </div>

      {mentors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Mentors Available</h3>
            <p className="text-muted-foreground text-center">
              Check back later for available mentors
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    {mentor.is_available && (
                      <Badge className="bg-green-500">Available</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(mentor.rating)}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({mentor.total_reviews})
                    </span>
                  </div>
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {mentor.current_role}
                </CardTitle>
                <CardDescription>{mentor.current_company}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {mentor.bio}
                  </p>

                  <div>
                    <p className="text-xs font-semibold mb-2">Expertise Areas:</p>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise_areas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Experience</p>
                      <p className="font-semibold">{mentor.years_experience} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sessions</p>
                      <p className="font-semibold">{mentor.sessions_conducted}</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => requestSession(mentor.id)}
                    disabled={!mentor.is_available || requesting === mentor.id}
                  >
                    {requesting === mentor.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Request Session
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
