'use client'

import { useState } from 'react'
import { Bot, Sparkles, Briefcase, GraduationCap, Code2, Users, TrendingUp, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Persona {
  id: string
  name: string
  icon: React.ElementType
  role: string
  description: string
  style: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  traits: string[]
  bestFor: string[]
  rating: number
  usageCount: number
  color: string
}

const personas: Persona[] = [
  {
    id: 'friendly-mentor',
    name: 'Friendly Mentor',
    icon: Users,
    role: 'Supportive Coach',
    description: 'A warm and encouraging interviewer who provides constructive feedback and helps you build confidence.',
    style: 'Supportive, patient, and encouraging',
    difficulty: 'Beginner',
    traits: ['Patient', 'Encouraging', 'Constructive', 'Supportive'],
    bestFor: ['First-time interviewees', 'Building confidence', 'Learning basics'],
    rating: 4.9,
    usageCount: 1247,
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'technical-expert',
    name: 'Technical Expert',
    icon: Code2,
    role: 'Senior Engineer',
    description: 'A highly technical interviewer who dives deep into algorithms, system design, and coding best practices.',
    style: 'Analytical, detail-oriented, and thorough',
    difficulty: 'Advanced',
    traits: ['Analytical', 'Detail-oriented', 'Technical', 'Thorough'],
    bestFor: ['Technical roles', 'Algorithm practice', 'System design'],
    rating: 4.7,
    usageCount: 2134,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'behavioral-specialist',
    name: 'Behavioral Specialist',
    icon: Briefcase,
    role: 'HR Manager',
    description: 'Focuses on behavioral questions, cultural fit, and soft skills assessment using STAR methodology.',
    style: 'Observant, empathetic, and structured',
    difficulty: 'Intermediate',
    traits: ['Empathetic', 'Observant', 'Structured', 'Insightful'],
    bestFor: ['Behavioral interviews', 'Cultural fit', 'Soft skills'],
    rating: 4.8,
    usageCount: 1876,
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'startup-founder',
    name: 'Startup Founder',
    icon: TrendingUp,
    role: 'CEO/Founder',
    description: 'Fast-paced interviewer looking for adaptability, innovation, and entrepreneurial mindset.',
    style: 'Dynamic, innovative, and fast-paced',
    difficulty: 'Advanced',
    traits: ['Innovative', 'Fast-paced', 'Entrepreneurial', 'Adaptable'],
    bestFor: ['Startup roles', 'Innovation focus', 'Adaptability'],
    rating: 4.6,
    usageCount: 892,
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'academic-professor',
    name: 'Academic Professor',
    icon: GraduationCap,
    role: 'University Professor',
    description: 'Theoretical and conceptual interviewer who tests fundamental understanding and problem-solving approach.',
    style: 'Theoretical, conceptual, and methodical',
    difficulty: 'Expert',
    traits: ['Theoretical', 'Methodical', 'Conceptual', 'Rigorous'],
    bestFor: ['Research roles', 'Theoretical knowledge', 'Problem-solving'],
    rating: 4.5,
    usageCount: 634,
    color: 'from-teal-500 to-cyan-600'
  },
  {
    id: 'tough-critic',
    name: 'Tough Critic',
    icon: Sparkles,
    role: 'Senior Director',
    description: 'Challenging interviewer who pushes you to your limits and expects excellence in every answer.',
    style: 'Demanding, critical, and high-standards',
    difficulty: 'Expert',
    traits: ['Demanding', 'Critical', 'High-standards', 'Challenging'],
    bestFor: ['Advanced preparation', 'Stress testing', 'High-level roles'],
    rating: 4.4,
    usageCount: 567,
    color: 'from-red-500 to-rose-600'
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    icon: Bot,
    role: 'Senior PM',
    description: 'Focuses on product thinking, user empathy, and cross-functional collaboration skills.',
    style: 'User-focused, strategic, and collaborative',
    difficulty: 'Intermediate',
    traits: ['User-focused', 'Strategic', 'Collaborative', 'Analytical'],
    bestFor: ['Product roles', 'Strategic thinking', 'User empathy'],
    rating: 4.7,
    usageCount: 1123,
    color: 'from-yellow-500 to-amber-600'
  },
  {
    id: 'leadership-coach',
    name: 'Leadership Coach',
    icon: Users,
    role: 'Executive Coach',
    description: 'Evaluates leadership qualities, team management skills, and strategic decision-making abilities.',
    style: 'Strategic, leadership-focused, and insightful',
    difficulty: 'Advanced',
    traits: ['Strategic', 'Leadership-focused', 'Insightful', 'Visionary'],
    bestFor: ['Leadership roles', 'Management positions', 'Executive roles'],
    rating: 4.8,
    usageCount: 789,
    color: 'from-indigo-500 to-purple-600'
  }
]

export default function AIPersonasPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert']

  const filteredPersonas = personas.filter(persona => 
    selectedDifficulty === 'All' || persona.difficulty === selectedDifficulty
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'Intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      case 'Advanced': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      case 'Expert': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Interview Personas</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Choose from different AI interviewer personalities to practice various interview styles and scenarios
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Personas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{personas.length}</p>
              </div>
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {personas.reduce((sum, p) => sum + p.usageCount, 0).toLocaleString()}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(personas.reduce((sum, p) => sum + p.rating, 0) / personas.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Most Popular</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {personas.reduce((max, p) => p.usageCount > max.usageCount ? p : max).name.split(' ')[0]}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by difficulty:
            </label>
            <div className="flex gap-2">
              {difficulties.map(difficulty => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty)}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersonas.map((persona) => {
          const Icon = persona.icon
          return (
            <Card key={persona.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${persona.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{persona.name}</CardTitle>
                      <CardDescription>{persona.role}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getDifficultyColor(persona.difficulty)}>
                    {persona.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {persona.description}
                </p>

                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interview Style:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {persona.style}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Key Traits:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {persona.traits.map((trait) => (
                      <Badge key={trait} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Best For:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {persona.bestFor.slice(0, 2).map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <ChevronRight className="h-3 w-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{persona.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{persona.usageCount.toLocaleString()} interviews</span>
                  </div>
                </div>

                <Link href={`/interview?persona=${persona.id}`}>
                  <Button className="w-full">
                    <span>Start Interview</span>
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredPersonas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No personas found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
