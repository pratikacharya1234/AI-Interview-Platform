'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'

interface SkillAssessment {
  id: string
  skill_category: string
  skill_name: string
  current_level: number
  target_level: number
  proficiency_score: number
  last_assessed: string
  practice_recommendations: string[]
}

export default function SkillAssessmentPage() {
  const [skills, setSkills] = useState<SkillAssessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/learning-path?action=skills')
      if (response.ok) {
        const data = await response.json()
        setSkills(data)
      }
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProficiencyLevel = (score: number) => {
    if (score < 25) return { label: 'Beginner', color: 'bg-red-500' }
    if (score < 50) return { label: 'Intermediate', color: 'bg-yellow-500' }
    if (score < 75) return { label: 'Advanced', color: 'bg-blue-500' }
    return { label: 'Expert', color: 'bg-green-500' }
  }

  const getTrendIcon = (current: number, target: number) => {
    const progress = (current / target) * 100
    if (progress >= 90) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (progress >= 50) return <Minus className="h-4 w-4 text-yellow-500" />
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }

  const groupByCategory = (skills: SkillAssessment[]) => {
    return skills.reduce((acc, skill) => {
      if (!acc[skill.skill_category]) {
        acc[skill.skill_category] = []
      }
      acc[skill.skill_category].push(skill)
      return acc
    }, {} as Record<string, SkillAssessment[]>)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const groupedSkills = groupByCategory(skills)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Target className="h-8 w-8 text-primary" />
          Skill Assessment
        </h1>
        <p className="text-muted-foreground">
          Track your proficiency across different skill areas
        </p>
      </div>

      {Object.keys(groupedSkills).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Skills Assessed Yet</h3>
            <p className="text-muted-foreground text-center">
              Complete interviews to start tracking your skill proficiency
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category}</CardTitle>
                <CardDescription>
                  {categorySkills.length} skills tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categorySkills.map((skill) => {
                    const proficiency = getProficiencyLevel(skill.proficiency_score)
                    return (
                      <div key={skill.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{skill.skill_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Last assessed: {new Date(skill.last_assessed).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(skill.current_level, skill.target_level)}
                            <Badge className={proficiency.color}>
                              {proficiency.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Proficiency</span>
                            <span className="font-semibold">{skill.proficiency_score}%</span>
                          </div>
                          <Progress value={skill.proficiency_score} />
                        </div>

                        {skill.practice_recommendations.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-2">Recommendations:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {skill.practice_recommendations.slice(0, 2).map((rec, index) => (
                                <li key={index}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
