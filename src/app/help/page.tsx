'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HelpCircle, Search, BookOpen, Video, MessageCircle, FileText } from 'lucide-react'
import { useState } from 'react'

const helpTopics = [
  {
    id: 1,
    title: 'Getting Started',
    description: 'Learn the basics of using the AI Interview Platform',
    icon: BookOpen,
    articles: [
      'How to create your account',
      'Setting up your profile',
      'Taking your first interview',
      'Understanding your dashboard'
    ]
  },
  {
    id: 2,
    title: 'Interview Features',
    description: 'Master all interview types and features',
    icon: Video,
    articles: [
      'Multi-persona interviews explained',
      'Company-specific simulations',
      'Voice analysis features',
      'Understanding feedback reports'
    ]
  },
  {
    id: 3,
    title: 'Gamification System',
    description: 'Learn about XP, levels, and achievements',
    icon: MessageCircle,
    articles: [
      'How XP and leveling works',
      'Unlocking achievements',
      'Maintaining your streak',
      'Climbing the leaderboard'
    ]
  },
  {
    id: 4,
    title: 'Learning Paths',
    description: 'Optimize your learning journey',
    icon: FileText,
    articles: [
      'Creating personalized learning paths',
      'Skill assessment guide',
      'Tracking your progress',
      'Resource recommendations'
    ]
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTopics = helpTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          Help Center
        </h1>
        <p className="text-muted-foreground">
          Find answers to common questions and learn how to use the platform
        </p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search help articles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTopics.map((topic) => {
          const Icon = topic.icon
          return (
            <Card key={topic.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-6 w-6 text-primary" />
                  <CardTitle>{topic.title}</CardTitle>
                </div>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topic.articles.map((article, index) => (
                    <li key={index} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                      {article}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTopics.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground text-center">
              Try searching with different keywords
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
