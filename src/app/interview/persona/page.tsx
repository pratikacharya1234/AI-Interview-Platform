'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Building2, Briefcase, ArrowRight, Loader2 } from 'lucide-react'

interface Persona {
  id: string
  name: string
  role: string
  company_type: string
  description: string
  personality_traits: string[]
  interview_style: string
  difficulty_preference: string
  focus_areas: string[]
}

export default function PersonaInterviewPage() {
  const router = useRouter()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)

  useEffect(() => {
    fetchPersonas()
  }, [])

  const fetchPersonas = async () => {
    try {
      const response = await fetch('/api/persona')
      if (response.ok) {
        const data = await response.json()
        setPersonas(data)
      }
    } catch (error) {
      console.error('Error fetching personas:', error)
    } finally {
      setLoading(false)
    }
  }

  const startInterview = async (personaId: string) => {
    setSelectedPersona(personaId)
    router.push(`/interview?persona=${personaId}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-Persona Interviews</h1>
        <p className="text-muted-foreground">
          Choose from 7 unique interviewer personalities, each with distinct styles and expertise
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map((persona) => (
          <Card key={persona.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Users className="h-8 w-8 text-primary" />
                <Badge className={getDifficultyColor(persona.difficulty_preference)}>
                  {persona.difficulty_preference}
                </Badge>
              </div>
              <CardTitle>{persona.name}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{persona.role}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4" />
                  <span>{persona.company_type}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {persona.description}
              </p>
              
              <div className="mb-4">
                <p className="text-xs font-semibold mb-2">Interview Style:</p>
                <Badge variant="outline">{persona.interview_style}</Badge>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold mb-2">Focus Areas:</p>
                <div className="flex flex-wrap gap-1">
                  {persona.focus_areas.slice(0, 3).map((area, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => startInterview(persona.id)}
                disabled={selectedPersona === persona.id}
              >
                {selectedPersona === persona.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Interview
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
