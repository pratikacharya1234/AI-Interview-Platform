'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Clock,
  Award,
  Users,
  Filter,
  RefreshCw
} from 'lucide-react'

interface Report {
  id: string
  title: string
  type: 'performance' | 'skill' | 'progress' | 'comparative'
  period: string
  generatedAt: string
  status: 'ready' | 'generating' | 'failed'
  insights: number
  downloadUrl?: string
}

const reports: Report[] = [
  {
    id: '1',
    title: 'Monthly Performance Summary',
    type: 'performance',
    period: 'January 2024',
    generatedAt: '2024-01-31',
    status: 'ready',
    insights: 12,
    downloadUrl: '/reports/monthly-jan-2024.pdf'
  },
  {
    id: '2',
    title: 'Technical Skills Assessment',
    type: 'skill',
    period: 'Q4 2023',
    generatedAt: '2024-01-01',
    status: 'ready',
    insights: 8,
    downloadUrl: '/reports/skills-q4-2023.pdf'
  },
  {
    id: '3',
    title: 'Interview Progress Report',
    type: 'progress',
    period: 'Last 6 Months',
    generatedAt: '2024-01-15',
    status: 'ready',
    insights: 15,
    downloadUrl: '/reports/progress-6months.pdf'
  },
  {
    id: '4',
    title: 'Weekly Performance Report',
    type: 'performance',
    period: 'This Week',
    generatedAt: '2024-02-05',
    status: 'generating',
    insights: 0
  }
]

const performanceMetrics = [
  { label: 'Average Score', value: '87%', change: '+5%', trend: 'up' },
  { label: 'Interviews Completed', value: '23', change: '+8', trend: 'up' },
  { label: 'Response Time', value: '2.3s', change: '-0.5s', trend: 'down' },
  { label: 'Consistency Rating', value: '92%', change: '+3%', trend: 'up' }
]

const skillBreakdown = [
  { skill: 'Technical Knowledge', score: 88, trend: 'up', change: '+4' },
  { skill: 'Communication', score: 92, trend: 'up', change: '+2' },
  { skill: 'Problem Solving', score: 85, trend: 'up', change: '+7' },
  { skill: 'Leadership', score: 78, trend: 'down', change: '-1' },
  { skill: 'Cultural Fit', score: 94, trend: 'up', change: '+3' }
]

export default function ReportsPage() {
  const { data: session } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedType, setSelectedType] = useState('all')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateNewReport = async () => {
    setIsGenerating(true)
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }

  const downloadReport = (reportId: string) => {
    // Simulate download
    console.log(`Downloading report ${reportId}`)
  }

  const filteredReports = selectedType === 'all' 
    ? reports 
    : reports.filter(report => report.type === selectedType)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Performance Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and download comprehensive reports on your interview performance and skill development.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateNewReport} disabled={isGenerating}>
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Generate Report
          </Button>
        </div>
      </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {performanceMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change} from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
            <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription>
                    Your interview performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Overall Improvement</p>
                        <p className="text-sm text-muted-foreground">Last 30 days</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">+12%</p>
                        <p className="text-sm text-muted-foreground">vs. previous month</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Interview Success Rate</span>
                        <span className="font-medium">89%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Average Response Quality</span>
                        <span className="font-medium">8.7/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Confidence Level</span>
                        <span className="font-medium">High</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Improvement Areas
                  </CardTitle>
                  <CardDescription>
                    Focus areas for better performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { area: 'System Design Questions', priority: 'High', improvement: '15%' },
                      { area: 'Behavioral Responses', priority: 'Medium', improvement: '8%' },
                      { area: 'Code Optimization', priority: 'Low', improvement: '5%' }
                    ].map((item) => (
                      <div key={item.area} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.area}</p>
                          <Badge 
                            variant={item.priority === 'High' ? 'destructive' : 
                                   item.priority === 'Medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.priority} Priority
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-600">+{item.improvement}</p>
                          <p className="text-xs text-muted-foreground">potential gain</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skills Breakdown</CardTitle>
                <CardDescription>
                  Detailed analysis of your performance across different skill areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillBreakdown.map((skill) => (
                    <div key={skill.skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{skill.skill}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{skill.score}%</span>
                          <div className={`flex items-center gap-1 text-sm ${
                            skill.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {skill.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {skill.change}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="skill">Skills</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="comparative">Comparative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <CardDescription>{report.period}</CardDescription>
                      </div>
                      <Badge variant={
                        report.status === 'ready' ? 'default' :
                        report.status === 'generating' ? 'secondary' : 'destructive'
                      }>
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Generated {new Date(report.generatedAt).toLocaleDateString()}
                      </span>
                      {report.insights > 0 && (
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {report.insights} insights
                        </span>
                      )}
                    </div>
                    
                    {report.status === 'ready' && (
                      <Button 
                        onClick={() => downloadReport(report.id)}
                        className="w-full"
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    )}
                    
                    {report.status === 'generating' && (
                      <Button disabled className="w-full" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
    </div>
  )
}