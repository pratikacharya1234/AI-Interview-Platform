'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Code, 
  Clock, 
  Trophy, 
  Star, 
  CheckCircle, 
  Play, 
  Filter,
  Search,
  BookOpen,
  Target,
  Zap,
  Brain
} from 'lucide-react'

interface CodingChallenge {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  timeLimit: number
  points: number
  completed: boolean
  accuracy: number | null
  bestTime: number | null
  attempts: number
  tags: string[]
  language: string[]
  successRate: number
}

const codingChallenges: CodingChallenge[] = [
  {
    id: 'array-two-sum',
    title: 'Two Sum Problem',
    description: 'Find two numbers in an array that add up to a target sum. Classic algorithm problem testing hash map usage.',
    difficulty: 'Easy',
    category: 'Arrays',
    timeLimit: 30,
    points: 100,
    completed: true,
    accuracy: 95,
    bestTime: 18,
    attempts: 3,
    tags: ['Hash Map', 'Array', 'Optimization'],
    language: ['JavaScript', 'Python', 'Java', 'C++'],
    successRate: 78
  },
  {
    id: 'linked-list-reverse',
    title: 'Reverse Linked List',
    description: 'Reverse a singly linked list iteratively and recursively. Fundamental data structure manipulation.',
    difficulty: 'Medium',
    category: 'Linked Lists',
    timeLimit: 45,
    points: 200,
    completed: true,
    accuracy: 88,
    bestTime: 32,
    attempts: 2,
    tags: ['Pointers', 'Recursion', 'Iteration'],
    language: ['JavaScript', 'Python', 'Java', 'C++'],
    successRate: 65
  },
  {
    id: 'binary-tree-traversal',
    title: 'Binary Tree Inorder Traversal',
    description: 'Implement inorder traversal of binary tree using both recursive and iterative approaches.',
    difficulty: 'Medium',
    category: 'Trees',
    timeLimit: 40,
    points: 180,
    completed: false,
    accuracy: null,
    bestTime: null,
    attempts: 0,
    tags: ['Binary Tree', 'DFS', 'Stack'],
    language: ['JavaScript', 'Python', 'Java', 'C++'],
    successRate: 72
  },
  {
    id: 'dynamic-programming-coins',
    title: 'Coin Change Problem',
    description: 'Find minimum number of coins needed to make a given amount. Classic dynamic programming challenge.',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    timeLimit: 50,
    points: 250,
    completed: false,
    accuracy: null,
    bestTime: null,
    attempts: 1,
    tags: ['DP', 'Optimization', 'Bottom-up'],
    language: ['JavaScript', 'Python', 'Java', 'C++'],
    successRate: 58
  },
  {
    id: 'graph-shortest-path',
    title: 'Shortest Path in Graph',
    description: 'Implement Dijkstra algorithm to find shortest path between nodes in weighted graph.',
    difficulty: 'Hard',
    category: 'Graphs',
    timeLimit: 75,
    points: 400,
    completed: false,
    accuracy: null,
    bestTime: null,
    attempts: 0,
    tags: ['Dijkstra', 'Priority Queue', 'Graph Theory'],
    language: ['JavaScript', 'Python', 'Java', 'C++'],
    successRate: 34
  },
  {
    id: 'string-palindrome-partition',
    title: 'Palindrome Partitioning',
    description: 'Partition string into palindromic substrings. Advanced backtracking and string manipulation.',
    difficulty: 'Hard',
    category: 'Strings',
    timeLimit: 60,
    points: 350,
    completed: false,
    accuracy: null,
    bestTime: null,
    attempts: 0,
    tags: ['Backtracking', 'String', 'Recursion'],
    language: ['JavaScript', 'Python', 'Java', 'C++'],
    successRate: 41
  }
]

const categories = ['All', 'Arrays', 'Linked Lists', 'Trees', 'Dynamic Programming', 'Graphs', 'Strings', 'Sorting', 'Searching']
const difficulties = ['All', 'Easy', 'Medium', 'Hard']
const languages = ['All', 'JavaScript', 'Python', 'Java', 'C++']

export default function CodingPage() {
  const [challenges, setChallenges] = useState<CodingChallenge[]>(codingChallenges)
  const [filteredChallenges, setFilteredChallenges] = useState<CodingChallenge[]>(codingChallenges)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedLanguage, setSelectedLanguage] = useState('All')
  const [activeTab, setActiveTab] = useState('all')

  // Filter challenges based on search and filters
  useEffect(() => {
    let filtered = challenges

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(challenge => challenge.category === selectedCategory)
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(challenge => challenge.difficulty === selectedDifficulty)
    }

    // Language filter
    if (selectedLanguage !== 'All') {
      filtered = filtered.filter(challenge => challenge.language.includes(selectedLanguage))
    }

    // Tab filter
    if (activeTab === 'completed') {
      filtered = filtered.filter(challenge => challenge.completed)
    } else if (activeTab === 'in-progress') {
      filtered = filtered.filter(challenge => challenge.attempts > 0 && !challenge.completed)
    } else if (activeTab === 'not-started') {
      filtered = filtered.filter(challenge => challenge.attempts === 0)
    }

    setFilteredChallenges(filtered)
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedLanguage, activeTab, challenges])

  // Calculate statistics
  const totalChallenges = challenges.length
  const completedChallenges = challenges.filter(c => c.completed).length
  const inProgressChallenges = challenges.filter(c => c.attempts > 0 && !c.completed).length
  const totalPoints = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0)
  const averageAccuracy = challenges.filter(c => c.accuracy !== null).reduce((sum, c, _, arr) => sum + (c.accuracy || 0) / arr.length, 0)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const startChallenge = (challengeId: string) => {
    // In production, this would navigate to the coding editor
    console.log('Starting challenge:', challengeId)
    // Update attempt count
    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, attempts: c.attempts + 1 } : c
    ))
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Coding Challenges</h1>
            <p className="text-muted-foreground">
              Sharpen your programming skills with real-world coding problems
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="gap-2">
              <Code className="h-4 w-4" />
              Practice Mode
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Total Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalChallenges}</div>
              <p className="text-xs text-muted-foreground">Available problems</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedChallenges}</div>
              <Progress value={(completedChallenges / totalChallenges) * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
              <p className="text-xs text-muted-foreground">Points earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                Avg Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{Math.round(averageAccuracy)}%</div>
              <p className="text-xs text-muted-foreground">Success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search challenges by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(language => (
                    <SelectItem key={language} value={language}>{language}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Challenge Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({challenges.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedChallenges})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgressChallenges})</TabsTrigger>
            <TabsTrigger value="not-started">Not Started ({totalChallenges - completedChallenges - inProgressChallenges})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid gap-4">
              {filteredChallenges.map((challenge) => (
                <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                          {challenge.completed && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {challenge.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-1">
                          {challenge.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-lg font-semibold text-blue-600">
                          {challenge.points} pts
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-1">
                          <Clock className="h-3 w-3" />
                          {challenge.timeLimit} min
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium">{challenge.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Success Rate:</span>
                          <span className="font-medium">{challenge.successRate}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Attempts:</span>
                          <span className="font-medium">{challenge.attempts}</span>
                        </div>
                        {challenge.accuracy && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Best:</span>
                            <span className="font-medium text-green-600">{challenge.accuracy}%</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={() => startChallenge(challenge.id)}
                        className="gap-2"
                      >
                        {challenge.completed ? (
                          <>
                            <BookOpen className="h-4 w-4" />
                            Review Solution
                          </>
                        ) : challenge.attempts > 0 ? (
                          <>
                            <Play className="h-4 w-4" />
                            Continue
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Start Challenge
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredChallenges.length === 0 && (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center space-y-2">
                    <Code className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No challenges found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}