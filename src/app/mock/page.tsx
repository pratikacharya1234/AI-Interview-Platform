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
  Monitor, 
  Clock, 
  Users, 
  Star, 
  Play, 
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Target,
  TrendingUp,
  User,
  Briefcase,
  Code,
  MessageSquare
} from 'lucide-react'

interface MockInterview {
  id: string
  title: string
  description: string
  company: string
  position: string
  duration: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  type: 'Technical' | 'Behavioral' | 'System Design' | 'Case Study'
  status: 'Available' | 'Scheduled' | 'Completed'
  rating: number | null
  feedback: string | null
  scheduledDate: string | null
  completedDate: string | null
  participants: number
  questions: number
  tags: string[]
}

const mockInterviews: MockInterview[] = [
  {
    id: 'google-swe-l3',
    title: 'Google Software Engineer L3',
    description: 'Technical interview simulation focusing on algorithms, data structures, and system design fundamentals.',
    company: 'Google',
    position: 'Software Engineer L3',
    duration: 45,
    difficulty: 'Intermediate',
    type: 'Technical',
    status: 'Completed',
    rating: 4.2,
    feedback: 'Strong algorithmic thinking, good communication. Work on time complexity analysis.',
    scheduledDate: null,
    completedDate: '2024-10-08T10:30:00Z',
    participants: 1,
    questions: 3,
    tags: ['Algorithms', 'Data Structures', 'Coding']
  },
  {
    id: 'meta-senior-behavioral',
    title: 'Meta Senior Engineer Behavioral',
    description: 'Behavioral interview focusing on leadership, collaboration, and Meta culture fit.',
    company: 'Meta',
    position: 'Senior Software Engineer',
    duration: 30,
    difficulty: 'Intermediate',
    type: 'Behavioral',
    status: 'Scheduled',
    rating: null,
    feedback: null,
    scheduledDate: '2024-10-15T14:00:00Z',
    completedDate: null,
    participants: 1,
    questions: 8,
    tags: ['Leadership', 'Culture Fit', 'Communication']
  },
  {
    id: 'amazon-system-design',
    title: 'Amazon Principal Engineer System Design',
    description: 'High-level system design interview covering scalability, reliability, and architecture decisions.',
    company: 'Amazon',
    position: 'Principal Engineer',
    duration: 60,
    difficulty: 'Advanced',
    type: 'System Design',
    status: 'Available',
    rating: null,
    feedback: null,
    scheduledDate: null,
    completedDate: null,
    participants: 1,
    questions: 2,
    tags: ['System Design', 'Scalability', 'Architecture']
  },
  {
    id: 'microsoft-case-study',
    title: 'Microsoft PM Case Study',
    description: 'Product management case study interview focusing on product strategy and market analysis.',
    company: 'Microsoft',
    position: 'Senior Product Manager',
    duration: 45,
    difficulty: 'Intermediate',
    type: 'Case Study',
    status: 'Available',
    rating: null,
    feedback: null,
    scheduledDate: null,
    completedDate: null,
    participants: 1,
    questions: 4,
    tags: ['Product Strategy', 'Market Analysis', 'Business']
  },
  {
    id: 'apple-technical-coding',
    title: 'Apple iOS Developer Technical',
    description: 'iOS-specific technical interview covering Swift, iOS frameworks, and mobile architecture.',
    company: 'Apple',
    position: 'iOS Developer',
    duration: 50,
    difficulty: 'Intermediate',
    type: 'Technical',
    status: 'Available',
    rating: null,
    feedback: null,
    scheduledDate: null,
    completedDate: null,
    participants: 1,
    questions: 5,
    tags: ['iOS', 'Swift', 'Mobile Development']
  },
  {
    id: 'netflix-behavioral-senior',
    title: 'Netflix Senior Engineer Culture',
    description: 'Culture-focused behavioral interview emphasizing Netflix values and high-performance culture.',
    company: 'Netflix',
    position: 'Senior Software Engineer',
    duration: 30,
    difficulty: 'Advanced',
    type: 'Behavioral',
    status: 'Completed',
    rating: 3.8,
    feedback: 'Good cultural alignment, strong examples. Improve storytelling structure using STAR method.',
    scheduledDate: null,
    completedDate: '2024-10-05T11:00:00Z',
    participants: 1,
    questions: 6,
    tags: ['Netflix Culture', 'High Performance', 'Values']
  }
]

const companies = ['All', 'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix']
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']
const types = ['All', 'Technical', 'Behavioral', 'System Design', 'Case Study']
const statuses = ['All', 'Available', 'Scheduled', 'Completed']

export default function MockInterviewsPage() {
  const [interviews, setInterviews] = useState<MockInterview[]>(mockInterviews)
  const [filteredInterviews, setFilteredInterviews] = useState<MockInterview[]>(mockInterviews)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [activeTab, setActiveTab] = useState('all')

  // Filter interviews based on search and filters
  useEffect(() => {
    let filtered = interviews

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(interview =>
        interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Company filter
    if (selectedCompany !== 'All') {
      filtered = filtered.filter(interview => interview.company === selectedCompany)
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(interview => interview.difficulty === selectedDifficulty)
    }

    // Type filter
    if (selectedType !== 'All') {
      filtered = filtered.filter(interview => interview.type === selectedType)
    }

    // Status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(interview => interview.status === selectedStatus)
    }

    // Tab filter
    if (activeTab === 'scheduled') {
      filtered = filtered.filter(interview => interview.status === 'Scheduled')
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(interview => interview.status === 'Completed')
    } else if (activeTab === 'available') {
      filtered = filtered.filter(interview => interview.status === 'Available')
    }

    setFilteredInterviews(filtered)
  }, [searchTerm, selectedCompany, selectedDifficulty, selectedType, selectedStatus, activeTab, interviews])

  // Calculate statistics
  const totalInterviews = interviews.length
  const completedInterviews = interviews.filter(i => i.status === 'Completed').length
  const scheduledInterviews = interviews.filter(i => i.status === 'Scheduled').length
  const averageRating = interviews.filter(i => i.rating !== null).reduce((sum, i, _, arr) => sum + (i.rating || 0) / arr.length, 0)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-blue-100 text-blue-800'
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Technical': return <Code className="h-4 w-4" />
      case 'Behavioral': return <MessageSquare className="h-4 w-4" />
      case 'System Design': return <Monitor className="h-4 w-4" />
      case 'Case Study': return <Briefcase className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const scheduleInterview = (interviewId: string) => {
    // In production, this would open a scheduling modal/dialog
    console.log('Scheduling interview:', interviewId)
    setInterviews(prev => prev.map(i => 
      i.id === interviewId ? { ...i, status: 'Scheduled' as const, scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() } : i
    ))
  }

  const startInterview = (interviewId: string) => {
    // In production, this would navigate to the interview interface
    console.log('Starting interview:', interviewId)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mock Interviews</h1>
            <p className="text-muted-foreground">
              Practice with realistic interview simulations from top tech companies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Custom
            </Button>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Quick Match
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Total Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInterviews}</div>
              <p className="text-xs text-muted-foreground">Available simulations</p>
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
              <div className="text-2xl font-bold text-green-600">{completedInterviews}</div>
              <Progress value={(completedInterviews / totalInterviews) * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{scheduledInterviews}</div>
              <p className="text-xs text-muted-foreground">Upcoming sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                Avg Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {averageRating > 0 ? averageRating.toFixed(1) : '-'}
              </div>
              <p className="text-xs text-muted-foreground">Interview performance</p>
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
                placeholder="Search interviews by company, position, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
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

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Interview Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({interviews.length})</TabsTrigger>
            <TabsTrigger value="available">Available ({interviews.filter(i => i.status === 'Available').length})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({scheduledInterviews})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedInterviews})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid gap-4">
              {filteredInterviews.map((interview) => (
                <Card key={interview.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{interview.title}</CardTitle>
                          <Badge className={getDifficultyColor(interview.difficulty)}>
                            {interview.difficulty}
                          </Badge>
                          <Badge className={getStatusColor(interview.status)}>
                            {interview.status}
                          </Badge>
                          {interview.rating && (
                            <Badge variant="outline" className="gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {interview.rating}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {interview.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            <span className="font-medium">{interview.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(interview.type)}
                            <span>{interview.type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{interview.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>{interview.questions} questions</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {interview.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">{interview.position}</div>
                        {interview.scheduledDate && (
                          <div className="text-xs text-muted-foreground">
                            {formatDate(interview.scheduledDate)}
                          </div>
                        )}
                        {interview.completedDate && (
                          <div className="text-xs text-muted-foreground">
                            Completed: {formatDate(interview.completedDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {interview.feedback && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Feedback:</p>
                        <p className="text-sm text-muted-foreground">{interview.feedback}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Interview simulation for {interview.company} {interview.position} position
                      </div>
                      <div className="flex items-center gap-2">
                        {interview.status === 'Available' && (
                          <>
                            <Button 
                              variant="outline"
                              onClick={() => scheduleInterview(interview.id)}
                              className="gap-2"
                            >
                              <Calendar className="h-4 w-4" />
                              Schedule
                            </Button>
                            <Button 
                              onClick={() => startInterview(interview.id)}
                              className="gap-2"
                            >
                              <Play className="h-4 w-4" />
                              Start Now
                            </Button>
                          </>
                        )}
                        {interview.status === 'Scheduled' && (
                          <Button 
                            onClick={() => startInterview(interview.id)}
                            className="gap-2"
                          >
                            <Play className="h-4 w-4" />
                            Join Interview
                          </Button>
                        )}
                        {interview.status === 'Completed' && (
                          <Button 
                            variant="outline"
                            onClick={() => startInterview(interview.id)}
                            className="gap-2"
                          >
                            <TrendingUp className="h-4 w-4" />
                            Review Performance
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredInterviews.length === 0 && (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center space-y-2">
                    <Monitor className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No interviews found</h3>
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