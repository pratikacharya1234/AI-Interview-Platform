import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Building2,
  Briefcase,
  CheckCircle2,
  Brain,
  Award,
  MessageSquare,
  Target,
  Users,
  Zap,
  BarChart3,
  RefreshCw,
  Star,
  ArrowRight,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { InterviewConfig, UserProfile } from '../types'

interface SetupViewProps {
  userProfile: UserProfile | null
  config: InterviewConfig
  setConfig: React.Dispatch<React.SetStateAction<InterviewConfig>>
  errors: Record<string, string>
  loading: boolean
  onStartInterview: () => void
}

const focusAreas = [
  { id: 'technical', label: 'Technical Skills', icon: Brain },
  { id: 'leadership', label: 'Leadership', icon: Award },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
  { id: 'problem-solving', label: 'Problem Solving', icon: Target },
  { id: 'teamwork', label: 'Teamwork', icon: Users },
  { id: 'innovation', label: 'Innovation', icon: Zap },
  { id: 'analytical', label: 'Analytical Thinking', icon: BarChart3 },
  { id: 'adaptability', label: 'Adaptability', icon: RefreshCw },
  { id: 'culture-fit', label: 'Culture Fit', icon: Star }
]

export default function SetupView({
  userProfile,
  config,
  setConfig,
  errors,
  loading,
  onStartInterview
}: SetupViewProps) {
  const [activeTab, setActiveTab] = React.useState('details')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Audio Interview
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Prepare for your interview with our advanced AI interviewer
          </p>
        </div>
        
        <Card className="mb-6">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {userProfile?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{userProfile?.name}</h2>
              <p className="text-slate-600 dark:text-slate-400">{userProfile?.email}</p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Profile Verified
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Interview Configuration</CardTitle>
            <CardDescription>
              Customize your interview experience for the best preparation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="details">Job Details</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="focus">Focus Areas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <div className="relative mt-2">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="company"
                        placeholder="Enter company name"
                        value={config.company}
                        onChange={(e) => setConfig(prev => ({ ...prev, company: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                    {errors.company && (
                      <p className="text-red-500 text-sm mt-1">{errors.company}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <div className="relative mt-2">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="position"
                        placeholder="e.g., Senior Software Engineer"
                        value={config.position}
                        onChange={(e) => setConfig(prev => ({ ...prev, position: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                    {errors.position && (
                      <p className="text-red-500 text-sm mt-1">{errors.position}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Engineering, Product, Marketing"
                    value={config.department}
                    onChange={(e) => setConfig(prev => ({ ...prev, department: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="jobDescription">Job Description *</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the job description here..."
                    value={config.jobDescription}
                    onChange={(e) => setConfig(prev => ({ ...prev, jobDescription: e.target.value }))}
                    className="mt-2 min-h-[150px]"
                  />
                  {errors.jobDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.jobDescription}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="requirements">Key Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List key skills and requirements..."
                    value={config.requirements}
                    onChange={(e) => setConfig(prev => ({ ...prev, requirements: e.target.value }))}
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Experience Level</Label>
                    <Select
                      value={config.experienceLevel}
                      onValueChange={(value: any) => setConfig(prev => ({ ...prev, experienceLevel: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intern">Intern</SelectItem>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                        <SelectItem value="senior">Senior Level (5-8 years)</SelectItem>
                        <SelectItem value="lead">Lead/Staff (8+ years)</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Interview Type</Label>
                    <Select
                      value={config.interviewType}
                      onValueChange={(value: any) => setConfig(prev => ({ ...prev, interviewType: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="situational">Situational</SelectItem>
                        <SelectItem value="competency">Competency-Based</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Select
                      value={config.duration.toString()}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, duration: parseInt(value) }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes (Quick)</SelectItem>
                        <SelectItem value="30">30 minutes (Standard)</SelectItem>
                        <SelectItem value="45">45 minutes (Comprehensive)</SelectItem>
                        <SelectItem value="60">60 minutes (Full)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Difficulty Level</Label>
                    <Select
                      value={config.difficulty}
                      onValueChange={(value: any) => setConfig(prev => ({ ...prev, difficulty: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="focus" className="mt-6">
                <div className="space-y-4">
                  <Label>Select Focus Areas *</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {focusAreas.map(area => (
                      <Card
                        key={area.id}
                        className={`cursor-pointer transition-all ${
                          config.interviewFocus.includes(area.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'hover:border-slate-300'
                        }`}
                        onClick={() => {
                          setConfig(prev => ({
                            ...prev,
                            interviewFocus: prev.interviewFocus.includes(area.id)
                              ? prev.interviewFocus.filter(f => f !== area.id)
                              : [...prev.interviewFocus, area.id]
                          }))
                        }}
                      >
                        <CardContent className="flex items-center gap-3 p-4">
                          <area.icon className={`h-5 w-5 ${
                            config.interviewFocus.includes(area.id)
                              ? 'text-blue-600'
                              : 'text-slate-400'
                          }`} />
                          <span className="text-sm font-medium">{area.label}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {errors.focus && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{errors.focus}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 flex justify-end">
              <Button
                size="lg"
                onClick={onStartInterview}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Preparing Interview...
                  </>
                ) : (
                  <>
                    Start Interview
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
            
            {errors.general && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
