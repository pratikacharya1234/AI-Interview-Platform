'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Video, 
  FileText, 
  Download, 
  ExternalLink,
  Clock,
  Star,
  Users,
  Code,
  Lightbulb,
  Target,
  Brain,
  Award,
  Search
} from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string
  type: 'guide' | 'video' | 'template' | 'course' | 'tool'
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration?: string
  rating: number
  downloads?: number
  url?: string
  isExternal?: boolean
  tags: string[]
  isPremium?: boolean
}

interface ResourceCategory {
  id: string
  name: string
  description: string
  icon: any
  color: string
}

const categories: ResourceCategory[] = [
  {
    id: 'technical',
    name: 'Technical Skills',
    description: 'Programming, algorithms, and system design',
    icon: Code,
    color: 'text-prism-teal'
  },
  {
    id: 'behavioral',
    name: 'Behavioral Interviews',
    description: 'Communication and soft skills',
    icon: Users,
    color: 'text-lavender-mist'
  },
  {
    id: 'system-design',
    name: 'System Design',
    description: 'Architecture and scalability',
    icon: Target,
    color: 'text-jade-success'
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    description: 'Algorithms and data structures',
    icon: Lightbulb,
    color: 'text-amber-500'
  },
  {
    id: 'career',
    name: 'Career Development',
    description: 'Professional growth and networking',
    icon: Award,
    color: 'text-rose-alert'
  }
]

const resources: Resource[] = [
  {
    id: '1',
    title: 'Complete System Design Interview Guide',
    description: 'Comprehensive guide covering scalability, databases, and microservices architecture patterns.',
    type: 'guide',
    category: 'system-design',
    difficulty: 'intermediate',
    duration: '45 min read',
    rating: 4.8,
    downloads: 1250,
    tags: ['scalability', 'databases', 'microservices', 'architecture'],
    isPremium: false
  },
  {
    id: '2',
    title: 'JavaScript Algorithm Patterns',
    description: 'Essential algorithms and data structures patterns commonly asked in technical interviews.',
    type: 'course',
    category: 'technical',
    difficulty: 'intermediate',
    duration: '3 hours',
    rating: 4.9,
    downloads: 2100,
    tags: ['javascript', 'algorithms', 'data-structures'],
    isPremium: false
  },
  {
    id: '3',
    title: 'Behavioral Interview Response Template',
    description: 'STAR method templates and examples for common behavioral questions.',
    type: 'template',
    category: 'behavioral',
    difficulty: 'beginner',
    rating: 4.6,
    downloads: 890,
    tags: ['STAR method', 'communication', 'examples'],
    isPremium: false
  },
  {
    id: '4',
    title: 'Advanced React Interview Questions',
    description: 'Deep dive into React internals, hooks, performance optimization, and testing strategies.',
    type: 'video',
    category: 'technical',
    difficulty: 'advanced',
    duration: '2 hours',
    rating: 4.7,
    downloads: 1580,
    tags: ['react', 'hooks', 'performance', 'testing'],
    isPremium: true
  },
  {
    id: '5',
    title: 'Leadership & Management Scenarios',
    description: 'Real-world leadership scenarios and frameworks for senior-level interviews.',
    type: 'guide',
    category: 'behavioral',
    difficulty: 'advanced',
    duration: '30 min read',
    rating: 4.5,
    downloads: 720,
    tags: ['leadership', 'management', 'senior-level'],
    isPremium: true
  },
  {
    id: '6',
    title: 'Database Design Checklist',
    description: 'Step-by-step checklist for designing scalable database schemas and optimizations.',
    type: 'tool',
    category: 'system-design',
    difficulty: 'intermediate',
    rating: 4.4,
    downloads: 950,
    tags: ['database', 'schema', 'optimization'],
    isPremium: false
  }
]

export default function ResourcesClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty

    return matchesCategory && matchesSearch && matchesDifficulty
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return FileText
      case 'video': return Video
      case 'template': return Download
      case 'course': return BookOpen
      case 'tool': return Brain
      default: return FileText
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-red-100 text-red-800'
      case 'template': return 'bg-green-100 text-green-800'
      case 'course': return 'bg-purple-100 text-purple-800'
      case 'tool': return 'bg-amber-100 text-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-jade-success/20 text-jade-success'
      case 'intermediate': return 'bg-amber-500/20 text-amber-600'
      case 'advanced': return 'bg-rose-alert/20 text-rose-alert'
      default: return 'bg-silver/20 text-silver'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-obsidian dark:text-pearl mb-2">
          Interview Resources
        </h1>
        <p className="text-silver">
          Curated study materials, guides, and tools to help you succeed in interviews
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver w-4 h-4" />
          <input
            type="text"
            placeholder="Search resources by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-silver/20 rounded-lg bg-background text-obsidian dark:text-pearl focus:border-prism-teal focus:ring-2 focus:ring-prism-teal/20"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <span className="text-sm text-silver font-medium py-2">Difficulty:</span>
            {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`
                  px-3 py-1 rounded-full text-sm transition-colors
                  ${selectedDifficulty === difficulty
                    ? 'bg-prism-teal text-white'
                    : 'bg-silver/10 text-graphite dark:text-silver hover:bg-silver/20'
                  }
                `}
              >
                {difficulty === 'all' ? 'All' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-obsidian dark:text-pearl mb-4">Browse by Category</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${selectedCategory === 'all'
                ? 'border-prism-teal bg-prism-teal/10 shadow-prism-glow'
                : 'border-silver/20 hover:border-silver/40'
              }
            `}
          >
            <BookOpen className="w-6 h-6 text-prism-teal mb-2" />
            <div className="font-medium text-obsidian dark:text-pearl">All Resources</div>
            <div className="text-sm text-silver">View everything</div>
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${selectedCategory === category.id
                  ? 'border-prism-teal bg-prism-teal/10 shadow-prism-glow'
                  : 'border-silver/20 hover:border-silver/40'
                }
              `}
            >
              <category.icon className={`w-6 h-6 mb-2 ${category.color}`} />
              <div className="font-medium text-obsidian dark:text-pearl">{category.name}</div>
              <div className="text-sm text-silver">{category.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const TypeIcon = getTypeIcon(resource.type)
          
          return (
            <Card key={resource.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getTypeColor(resource.type)}>
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {resource.type}
                  </Badge>
                  {resource.isPremium && (
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-prism-teal transition-colors">
                  {resource.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-sm text-silver">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      {resource.rating}
                    </div>
                    {resource.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {resource.duration}
                      </div>
                    )}
                    {resource.downloads && (
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {resource.downloads.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Difficulty Badge */}
                  <Badge className={getDifficultyColor(resource.difficulty)}>
                    {resource.difficulty}
                  </Badge>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-silver/10 rounded-full text-silver">
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-silver/10 rounded-full text-silver">
                        +{resource.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Download className="w-3 h-3 mr-1" />
                      {resource.type === 'video' ? 'Watch' : 'Download'}
                    </Button>
                    {resource.url && (
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No Results */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <div className="text-silver mb-4">No resources found matching your criteria</div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSelectedDifficulty('all')
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Coming Soon Section */}
      <Card className="mt-12 text-center bg-gradient-to-br from-prism-teal/10 to-lavender-mist/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lightbulb className="w-5 h-5 text-prism-teal" />
            More Resources Coming Soon
          </CardTitle>
          <CardDescription>
            We&apos;re constantly adding new study materials and tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-white/50 dark:bg-obsidian/50 rounded-lg">
              <Video className="w-8 h-8 text-prism-teal mx-auto mb-2" />
              <div className="font-medium">Video Courses</div>
              <div className="text-silver">Interactive learning paths</div>
            </div>
            <div className="p-4 bg-white/50 dark:bg-obsidian/50 rounded-lg">
              <Code className="w-8 h-8 text-lavender-mist mx-auto mb-2" />
              <div className="font-medium">Code Challenges</div>
              <div className="text-silver">Practice coding problems</div>
            </div>
            <div className="p-4 bg-white/50 dark:bg-obsidian/50 rounded-lg">
              <Users className="w-8 h-8 text-jade-success mx-auto mb-2" />
              <div className="font-medium">Mock Interviews</div>
              <div className="text-silver">Live practice sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}