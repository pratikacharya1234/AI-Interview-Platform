'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Map, Target, BookOpen, Plus, Loader2, CheckCircle2 } from 'lucide-react'

interface LearningPath {
  id: string
  title: string
  description: string
  target_role: string
  target_company: string
  difficulty_level: string
  estimated_duration_days: number
  current_progress: number
  status: string
  modules: any[]
}

export default function LearningPathsPage() {
  const router = useRouter()
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaths()
  }, [])

  const fetchPaths = async () => {
    try {
      const response = await fetch('/api/learning-path?action=paths')
      if (response.ok) {
        const data = await response.json()
        setPaths(data)
      }
    } catch (error) {
      console.error('Error fetching learning paths:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewPath = () => {
    router.push('/learning/create')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500">Active</Badge>
      case 'completed': return <Badge className="bg-blue-500">Completed</Badge>
      case 'paused': return <Badge variant="secondary">Paused</Badge>
      default: return <Badge variant="outline">{status}</Badge>
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
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Map className="h-8 w-8 text-primary" />
            My Learning Paths
          </h1>
          <p className="text-muted-foreground">
            Personalized learning journeys tailored to your goals
          </p>
        </div>
        <Button onClick={createNewPath}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Path
        </Button>
      </div>

      {paths.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Map className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Learning Paths Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first personalized learning path to start your journey
            </p>
            <Button onClick={createNewPath}>
              <Plus className="mr-2 h-4 w-4" />
              Create Learning Path
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths.map((path) => (
            <Card key={path.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Target className="h-6 w-6 text-primary" />
                  {getStatusBadge(path.status)}
                </div>
                <CardTitle>{path.title}</CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Target Role</p>
                      <p className="font-semibold">{path.target_role}</p>
                    </div>
                    {path.target_company && (
                      <div>
                        <p className="text-muted-foreground">Target Company</p>
                        <p className="font-semibold">{path.target_company}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{path.current_progress}%</span>
                    </div>
                    <Progress value={path.current_progress} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {path.modules?.length || 0} modules
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {path.estimated_duration_days} days
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={path.status === 'completed' ? 'outline' : undefined}
                    onClick={() => router.push(`/learning/paths/${path.id}`)}
                  >
                    {path.status === 'completed' ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Review Path
                      </>
                    ) : (
                      'Continue Learning'
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
