'use client'

import { useState } from 'react'
import { Building2, Search, TrendingUp, Users, Briefcase, Star, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  logo: string
  industry: string
  interviewCount: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  rating: number
  topics: string[]
  description: string
}

const companies: Company[] = [
  {
    id: 'google',
    name: 'Google',
    logo: '🔍',
    industry: 'Technology',
    interviewCount: 245,
    difficulty: 'Hard',
    rating: 4.8,
    topics: ['Algorithms', 'System Design', 'Behavioral', 'Coding'],
    description: 'Practice Google-style interviews with algorithm-heavy questions and system design.'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    logo: '📦',
    industry: 'E-commerce',
    interviewCount: 198,
    difficulty: 'Medium',
    rating: 4.6,
    topics: ['Leadership Principles', 'System Design', 'Coding', 'Behavioral'],
    description: 'Master Amazon\'s leadership principles and behavioral interview format.'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: '🪟',
    industry: 'Technology',
    interviewCount: 176,
    difficulty: 'Medium',
    rating: 4.7,
    topics: ['Coding', 'System Design', 'Problem Solving', 'Behavioral'],
    description: 'Prepare for Microsoft interviews with focus on problem-solving and design.'
  },
  {
    id: 'meta',
    name: 'Meta (Facebook)',
    logo: '👥',
    industry: 'Social Media',
    interviewCount: 189,
    difficulty: 'Hard',
    rating: 4.5,
    topics: ['Coding', 'System Design', 'Product Design', 'Behavioral'],
    description: 'Practice Meta\'s rigorous technical and product-focused interviews.'
  },
  {
    id: 'apple',
    name: 'Apple',
    logo: '🍎',
    industry: 'Technology',
    interviewCount: 134,
    difficulty: 'Hard',
    rating: 4.6,
    topics: ['Hardware', 'Software', 'Design', 'Behavioral'],
    description: 'Prepare for Apple\'s unique blend of hardware and software interviews.'
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '🎬',
    industry: 'Entertainment',
    interviewCount: 87,
    difficulty: 'Hard',
    rating: 4.7,
    topics: ['System Design', 'Culture Fit', 'Coding', 'Behavioral'],
    description: 'Master Netflix\'s culture-focused and technical interview process.'
  },
  {
    id: 'tesla',
    name: 'Tesla',
    logo: '⚡',
    industry: 'Automotive',
    interviewCount: 92,
    difficulty: 'Hard',
    rating: 4.4,
    topics: ['Engineering', 'Problem Solving', 'Innovation', 'Behavioral'],
    description: 'Prepare for Tesla\'s fast-paced and innovation-driven interviews.'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    logo: '☁️',
    industry: 'Cloud Computing',
    interviewCount: 103,
    difficulty: 'Medium',
    rating: 4.5,
    topics: ['CRM', 'Cloud', 'Coding', 'Behavioral'],
    description: 'Practice Salesforce\'s cloud-focused technical interviews.'
  }
]

export default function CompanySpecificPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All')

  const industries = ['All', ...Array.from(new Set(companies.map(c => c.industry)))]
  const difficulties = ['All', 'Easy', 'Medium', 'Hard']

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesIndustry = selectedIndustry === 'All' || company.industry === selectedIndustry
    const matchesDifficulty = selectedDifficulty === 'All' || company.difficulty === selectedDifficulty
    
    return matchesSearch && matchesIndustry && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'Hard': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company-Specific Interviews</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Practice interviews tailored to specific companies and their unique interview styles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{companies.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Interview Questions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {companies.reduce((sum, c) => sum + c.interviewCount, 0)}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Industries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{industries.length - 1}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(companies.reduce((sum, c) => sum + c.rating, 0) / companies.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{company.logo}</div>
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription>{company.industry}</CardDescription>
                  </div>
                </div>
                <Badge className={getDifficultyColor(company.difficulty)}>
                  {company.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {company.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{company.interviewCount} questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{company.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {company.topics.slice(0, 3).map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {company.topics.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{company.topics.length - 3} more
                  </Badge>
                )}
              </div>

              <Link href={`/interview?company=${company.id}`}>
                <Button className="w-full" variant="outline">
                  <span>Start Interview</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No companies found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
