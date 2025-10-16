'use client'

/**
 * Video Interview Page
 * Lobby for starting video interviews
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  Mic, 
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  Target
} from 'lucide-react'
import VideoInterviewLive from '@/components/VideoInterviewLive'

interface Persona {
  id: string
  name: string
  role: string
  personality_traits: string[]
  interview_style: string
  tone: string
}

export default function VideoInterviewPage() {
  const router = useRouter()
  
  // Lobby states
  const [personas, setPersonas] = useState<Persona[]>([])
  const [selectedPersona, setSelectedPersona] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'system-design'>('technical')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [loading, setLoading] = useState(false)
  
  // Permission states
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  
  // Interview states
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [personaName, setPersonaName] = useState('')
  const [showLive, setShowLive] = useState(false)

  useEffect(() => {
    fetchPersonas()
    checkPermissions()
  }, [])

  const fetchPersonas = async () => {
    try {
      const response = await fetch('/api/persona')
      if (response.ok) {
        const data = await response.json()
        setPersonas(data)
      }
    } catch (error) {
      console.error('Error fetching personas:', error)
    }
  }

  const checkPermissions = async () => {
    try {
      const cameraStatus = await navigator.permissions.query({ name: 'camera' as PermissionName })
      const micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      
      setCameraPermission(cameraStatus.state as any)
      setMicPermission(micStatus.state as any)

      cameraStatus.onchange = () => setCameraPermission(cameraStatus.state as any)
      micStatus.onchange = () => setMicPermission(micStatus.state as any)
    } catch (error) {
      console.error('Permission check error:', error)
    }
  }

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getTracks().forEach(track => track.stop())
      setCameraPermission('granted')
      setMicPermission('granted')
    } catch (error) {
      console.error('Permission request error:', error)
      setCameraPermission('denied')
      setMicPermission('denied')
    }
  }

  const startInterview = async () => {
    if (!selectedPersona || !jobTitle) {
      alert('Please select a persona and enter job title')
      return
    }

    if (cameraPermission !== 'granted' || micPermission !== 'granted') {
      alert('Please grant camera and microphone permissions')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/video-interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_id: selectedPersona,
          job_title: jobTitle,
          interview_type: interviewType,
          difficulty: difficulty
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start interview')
      }

      const data = await response.json()
      setSessionId(data.session.id)
      
      const selectedPersonaData = personas.find(p => p.id === selectedPersona)
      setPersonaName(selectedPersonaData?.name || 'Interviewer')
      
      setShowLive(true)
    } catch (error) {
      console.error('Start interview error:', error)
      alert('Failed to start interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = (reportId: string) => {
    router.push(`/interview/video/report/${reportId}`)
  }

  if (showLive && sessionId) {
    return (
      <VideoInterviewLive
        sessionId={sessionId}
        personaName={personaName}
        jobTitle={jobTitle}
        onComplete={handleComplete}
      />
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Video Interview</h1>
        <p className="text-muted-foreground">
          Practice with real-time AI interviewer using voice and video
        </p>
      </div>

      <div className="grid gap-6">
        {/* Permissions Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Device Permissions
            </CardTitle>
            <CardDescription>
              We need access to your camera and microphone for the video interview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>Camera</span>
              </div>
              {cameraPermission === 'granted' ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Granted
                </Badge>
              ) : cameraPermission === 'denied' ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Denied
                </Badge>
              ) : (
                <Badge variant="secondary">Not Requested</Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <span>Microphone</span>
              </div>
              {micPermission === 'granted' ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Granted
                </Badge>
              ) : micPermission === 'denied' ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Denied
                </Badge>
              ) : (
                <Badge variant="secondary">Not Requested</Badge>
              )}
            </div>

            {(cameraPermission !== 'granted' || micPermission !== 'granted') && (
              <Button onClick={requestPermissions} className="w-full">
                Grant Permissions
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Interview Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Setup</CardTitle>
            <CardDescription>
              Configure your interview preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="job-title" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Title
              </Label>
              <Input
                id="job-title"
                placeholder="e.g. Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            {/* Interview Type */}
            <div className="space-y-2">
              <Label htmlFor="interview-type" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Interview Type
              </Label>
              <Select value={interviewType} onValueChange={(value: any) => setInterviewType(value)}>
                <SelectTrigger id="interview-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="system-design">System Design</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Persona Selection */}
            <div className="space-y-2">
              <Label htmlFor="persona" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Select Interviewer
              </Label>
              <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                <SelectTrigger id="persona">
                  <SelectValue placeholder="Choose an interviewer persona" />
                </SelectTrigger>
                <SelectContent>
                  {personas.map(persona => (
                    <SelectItem key={persona.id} value={persona.id}>
                      {persona.name} - {persona.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Persona Details */}
            {selectedPersona && (
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  {(() => {
                    const persona = personas.find(p => p.id === selectedPersona)
                    if (!persona) return null
                    return (
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Style:</span>
                          <span className="text-sm ml-2">{persona.interview_style}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Tone:</span>
                          <span className="text-sm ml-2">{persona.tone}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Traits:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {persona.personality_traits?.map((trait, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button
          size="lg"
          onClick={startInterview}
          disabled={loading || !selectedPersona || !jobTitle || cameraPermission !== 'granted' || micPermission !== 'granted'}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Starting Interview...
            </>
          ) : (
            <>
              <Video className="h-5 w-5 mr-2" />
              Start Video Interview
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
