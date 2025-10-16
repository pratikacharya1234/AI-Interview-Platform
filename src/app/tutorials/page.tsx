'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Clock, CheckCircle } from 'lucide-react'

const tutorials = [
  {
    id: 1,
    title: 'Platform Overview',
    description: 'Get a complete tour of the AI Interview Platform and its features',
    duration: '5 min',
    difficulty: 'Beginner',
    completed: false
  },
  {
    id: 2,
    title: 'Your First Interview',
    description: 'Step-by-step guide to taking your first AI-powered interview',
    duration: '8 min',
    difficulty: 'Beginner',
    completed: false
  },
  {
    id: 3,
    title: 'Multi-Persona Interviews',
    description: 'Learn how to use different interviewer personalities effectively',
    duration: '10 min',
    difficulty: 'Intermediate',
    completed: false
  },
  {
    id: 4,
    title: 'Voice Analysis Features',
    description: 'Understanding confidence, tone, and speech pattern analysis',
    duration: '12 min',
    difficulty: 'Intermediate',
    completed: false
  },
  {
    id: 5,
    title: 'Company Simulations',
    description: 'Prepare for specific companies with tailored interview questions',
    duration: '15 min',
    difficulty: 'Advanced',
    completed: false
  },
  {
    id: 6,
    title: 'Maximizing XP and Achievements',
    description: 'Strategies to level up faster and unlock all achievements',
    duration: '7 min',
    difficulty: 'Intermediate',
    completed: false
  },
  {
    id: 7,
    title: 'Creating Learning Paths',
    description: 'Build personalized learning journeys for your target role',
    duration: '10 min',
    difficulty: 'Advanced',
    completed: false
  },
  {
    id: 8,
    title: 'Working with Mentors',
    description: 'How to find mentors and get the most from feedback sessions',
    duration: '8 min',
    difficulty: 'Intermediate',
    completed: false
  }
]

export default function TutorialsPage() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500'
      case 'Intermediate': return 'bg-yellow-500'
      case 'Advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Play className="h-8 w-8 text-primary" />
          Video Tutorials
        </h1>
        <p className="text-muted-foreground">
          Learn how to use the platform with step-by-step video guides
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Play className="h-6 w-6 text-primary" />
                <Badge className={getDifficultyColor(tutorial.difficulty)}>
                  {tutorial.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg">{tutorial.title}</CardTitle>
              <CardDescription>{tutorial.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{tutorial.duration}</span>
                </div>
                {tutorial.completed && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <Button className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Watch Tutorial
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
