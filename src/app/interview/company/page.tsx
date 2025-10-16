'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, TrendingUp, Code, ArrowRight, Loader2, Star } from 'lucide-react'

interface Company {
  id: string
  company_name: string
  industry: string
  size: string
  description: string
  tech_stack: string[]
  difficulty_rating: number
  culture_values: string[]
}

export default function CompanySimulationPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/company')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const startSimulation = async (companyName: string) => {
    setSelectedCompany(companyName)
    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          position: 'Software Engineer',
          difficulty: 'medium'
        })
      })

      if (response.ok) {
        const { session_id } = await response.json()
        router.push(`/interview?session=${session_id}&company=${companyName}`)
      }
    } catch (error) {
      console.error('Error starting simulation:', error)
      setSelectedCompany(null)
    }
  }

  const getDifficultyStars = (rating: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Company-Specific Interview Simulations</h1>
        <p className="text-muted-foreground">
          Practice with real interview questions and processes from top tech companies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Building2 className="h-8 w-8 text-primary" />
                <Badge variant="outline">{company.size}</Badge>
              </div>
              <CardTitle>{company.company_name}</CardTitle>
              <CardDescription>{company.industry}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {company.description}
              </p>

              <div className="mb-4">
                <p className="text-xs font-semibold mb-2">Difficulty Rating:</p>
                <div className="flex items-center gap-1">
                  {getDifficultyStars(company.difficulty_rating)}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {company.difficulty_rating}/10
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  Tech Stack:
                </p>
                <div className="flex flex-wrap gap-1">
                  {company.tech_stack.slice(0, 4).map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold mb-2">Culture Values:</p>
                <div className="flex flex-wrap gap-1">
                  {company.culture_values.slice(0, 2).map((value, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => startSimulation(company.company_name)}
                disabled={selectedCompany === company.company_name}
              >
                {selectedCompany === company.company_name ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Simulation
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
