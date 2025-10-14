'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  User, 
  Bell, 
  Monitor, 
  Mic, 
  Volume2,
  Globe,
  Clock,
  Target,
  Brain,
  Save,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface UserPreferences {
  // Profile Preferences
  displayName: string
  email: string
  timezone: string
  language: string
  
  // Interview Preferences
  preferredInterviewTypes: string[]
  difficultyLevel: string
  sessionDuration: number
  autoSaveInterval: number
  
  // Audio/Video Preferences
  microphoneEnabled: boolean
  cameraEnabled: boolean
  audioQuality: string
  videoQuality: string
  noiseReduction: boolean
  
  // Notification Preferences
  emailNotifications: boolean
  pushNotifications: boolean
  interviewReminders: boolean
  performanceReports: boolean
  weeklyDigest: boolean
  
  // Learning Preferences
  adaptiveDifficulty: boolean
  showHints: boolean
  detailedFeedback: boolean
  practiceReminders: boolean
  goalTracking: boolean
  
  // Accessibility
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  
  // Privacy
  dataCollection: boolean
  analyticsSharing: boolean
  performanceTracking: boolean
  thirdPartyIntegrations: boolean
}

const defaultPreferences: UserPreferences = {
  // Profile
  displayName: 'John Doe',
  email: 'john.doe@example.com',
  timezone: 'America/New_York',
  language: 'English',
  
  // Interview
  preferredInterviewTypes: ['Technical', 'Behavioral'],
  difficultyLevel: 'Intermediate',
  sessionDuration: 45,
  autoSaveInterval: 5,
  
  // Audio/Video
  microphoneEnabled: true,
  cameraEnabled: true,
  audioQuality: 'High',
  videoQuality: 'HD',
  noiseReduction: true,
  
  // Notifications
  emailNotifications: true,
  pushNotifications: true,
  interviewReminders: true,
  performanceReports: true,
  weeklyDigest: false,
  
  // Learning
  adaptiveDifficulty: true,
  showHints: true,
  detailedFeedback: true,
  practiceReminders: true,
  goalTracking: true,
  
  // Accessibility
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  
  // Privacy
  dataCollection: true,
  analyticsSharing: false,
  performanceTracking: true,
  thirdPartyIntegrations: false
}

const timezones = [
  'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Mumbai', 'Asia/Seoul',
  'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland'
]

const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Portuguese']
const interviewTypes = ['Technical', 'Behavioral', 'System Design', 'Case Study', 'Coding Challenge']
const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const audioQualities = ['Low', 'Medium', 'High', 'Lossless']
const videoQualities = ['SD', 'HD', '1080p', '4K']

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences({ ...defaultPreferences, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved preferences:', error)
      }
    }
  }, [])

  // Track changes
  useEffect(() => {
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      const savedPrefs = JSON.parse(saved)
      const hasChanges = JSON.stringify(preferences) !== JSON.stringify({ ...defaultPreferences, ...savedPrefs })
      setHasChanges(hasChanges)
    } else {
      setHasChanges(JSON.stringify(preferences) !== JSON.stringify(defaultPreferences))
    }
  }, [preferences])

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      setHasChanges(false)
      toast({
        title: "Preferences saved",
        description: "Your preferences have been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
    toast({
      title: "Preferences reset",
      description: "All preferences have been reset to default values.",
    })
  }

  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'interview-preferences.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importPreferences = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedPrefs = JSON.parse(e.target?.result as string)
          setPreferences({ ...defaultPreferences, ...importedPrefs })
          toast({
            title: "Preferences imported",
            description: "Your preferences have been successfully imported.",
          })
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Invalid preferences file format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Preferences</h1>
          <p className="text-muted-foreground">
            Customize your interview platform experience
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              Unsaved changes
            </div>
          )}
          <Button
            variant="outline"
            onClick={resetPreferences}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
            <Button
              onClick={savePreferences}
              disabled={!hasChanges || saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="audio-video">Audio/Video</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          </TabsList>

          {/* Profile Preferences */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Preferences
                </CardTitle>
                <CardDescription>
                  Manage your basic profile information and regional settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={preferences.displayName}
                      onChange={(e) => updatePreference('displayName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={preferences.email}
                      onChange={(e) => updatePreference('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={preferences.timezone} onValueChange={(value) => updatePreference('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map(tz => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={preferences.language} onValueChange={(value) => updatePreference('language', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold">Data Management</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={exportPreferences} className="gap-2">
                      <Download className="h-4 w-4" />
                      Export Preferences
                    </Button>
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importPreferences}
                        className="hidden"
                        id="import-prefs"
                      />
                      <Button variant="outline" onClick={() => document.getElementById('import-prefs')?.click()} className="gap-2">
                        <Upload className="h-4 w-4" />
                        Import Preferences
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interview Preferences */}
          <TabsContent value="interview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Interview Preferences
                </CardTitle>
                <CardDescription>
                  Configure your interview session settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preferred Interview Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {interviewTypes.map(type => (
                        <Button
                          key={type}
                          variant={preferences.preferredInterviewTypes.includes(type) ? "primary" : "outline"}
                          size="sm"
                          onClick={() => {
                            const current = preferences.preferredInterviewTypes
                            const updated = current.includes(type)
                              ? current.filter(t => t !== type)
                              : [...current, type]
                            updatePreference('preferredInterviewTypes', updated)
                          }}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Default Difficulty Level</Label>
                      <Select value={preferences.difficultyLevel} onValueChange={(value) => updatePreference('difficultyLevel', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Default Session Duration (minutes)</Label>
                      <div className="px-2">
                        <Slider
                          value={[preferences.sessionDuration]}
                          onValueChange={(values: number[]) => updatePreference('sessionDuration', values[0])}
                          max={120}
                          min={15}
                          step={15}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>15 min</span>
                          <span className="font-medium">{preferences.sessionDuration} min</span>
                          <span>120 min</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Auto-save Interval (minutes)</Label>
                      <div className="px-2">
                        <Slider
                          value={[preferences.autoSaveInterval]}
                          onValueChange={(values: number[]) => updatePreference('autoSaveInterval', values[0])}
                          max={30}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>1 min</span>
                          <span className="font-medium">{preferences.autoSaveInterval} min</span>
                          <span>30 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audio/Video Preferences */}
          <TabsContent value="audio-video">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Audio & Video Preferences
                </CardTitle>
                <CardDescription>
                  Configure your audio and video settings for interviews
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Microphone</Label>
                        <p className="text-sm text-muted-foreground">Allow microphone access for voice interviews</p>
                      </div>
                      <Switch
                        checked={preferences.microphoneEnabled}
                        onCheckedChange={(checked) => updatePreference('microphoneEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Camera</Label>
                        <p className="text-sm text-muted-foreground">Allow camera access for video interviews</p>
                      </div>
                      <Switch
                        checked={preferences.cameraEnabled}
                        onCheckedChange={(checked) => updatePreference('cameraEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Noise Reduction</Label>
                        <p className="text-sm text-muted-foreground">Reduce background noise during interviews</p>
                      </div>
                      <Switch
                        checked={preferences.noiseReduction}
                        onCheckedChange={(checked) => updatePreference('noiseReduction', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Audio Quality</Label>
                      <Select value={preferences.audioQuality} onValueChange={(value) => updatePreference('audioQuality', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audio quality" />
                        </SelectTrigger>
                        <SelectContent>
                          {audioQualities.map(quality => (
                            <SelectItem key={quality} value={quality}>{quality}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Video Quality</Label>
                      <Select value={preferences.videoQuality} onValueChange={(value) => updatePreference('videoQuality', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select video quality" />
                        </SelectTrigger>
                        <SelectContent>
                          {videoQualities.map(quality => (
                            <SelectItem key={quality} value={quality}>{quality}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Interview Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about scheduled interviews</p>
                    </div>
                    <Switch
                      checked={preferences.interviewReminders}
                      onCheckedChange={(checked) => updatePreference('interviewReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Performance Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive detailed performance analysis</p>
                    </div>
                    <Switch
                      checked={preferences.performanceReports}
                      onCheckedChange={(checked) => updatePreference('performanceReports', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">Weekly summary of your progress</p>
                    </div>
                    <Switch
                      checked={preferences.weeklyDigest}
                      onCheckedChange={(checked) => updatePreference('weeklyDigest', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Preferences */}
          <TabsContent value="learning">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Learning Preferences
                </CardTitle>
                <CardDescription>
                  Customize your learning experience and feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Adaptive Difficulty</Label>
                      <p className="text-sm text-muted-foreground">Automatically adjust difficulty based on performance</p>
                    </div>
                    <Switch
                      checked={preferences.adaptiveDifficulty}
                      onCheckedChange={(checked) => updatePreference('adaptiveDifficulty', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Hints</Label>
                      <p className="text-sm text-muted-foreground">Display helpful hints during challenging questions</p>
                    </div>
                    <Switch
                      checked={preferences.showHints}
                      onCheckedChange={(checked) => updatePreference('showHints', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Detailed Feedback</Label>
                      <p className="text-sm text-muted-foreground">Receive comprehensive feedback after interviews</p>
                    </div>
                    <Switch
                      checked={preferences.detailedFeedback}
                      onCheckedChange={(checked) => updatePreference('detailedFeedback', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Practice Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders to practice regularly</p>
                    </div>
                    <Switch
                      checked={preferences.practiceReminders}
                      onCheckedChange={(checked) => updatePreference('practiceReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Goal Tracking</Label>
                      <p className="text-sm text-muted-foreground">Track progress towards your learning goals</p>
                    </div>
                    <Switch
                      checked={preferences.goalTracking}
                      onCheckedChange={(checked) => updatePreference('goalTracking', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility */}
          <TabsContent value="accessibility">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Accessibility Preferences
                </CardTitle>
                <CardDescription>
                  Configure accessibility features for better usability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>High Contrast Mode</Label>
                      <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                    </div>
                    <Switch
                      checked={preferences.highContrast}
                      onCheckedChange={(checked) => updatePreference('highContrast', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Large Text</Label>
                      <p className="text-sm text-muted-foreground">Increase text size throughout the application</p>
                    </div>
                    <Switch
                      checked={preferences.largeText}
                      onCheckedChange={(checked) => updatePreference('largeText', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Reduced Motion</Label>
                      <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                    </div>
                    <Switch
                      checked={preferences.reducedMotion}
                      onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Screen Reader Support</Label>
                      <p className="text-sm text-muted-foreground">Enhanced support for screen readers</p>
                    </div>
                    <Switch
                      checked={preferences.screenReader}
                      onCheckedChange={(checked) => updatePreference('screenReader', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Keyboard Navigation</Label>
                      <p className="text-sm text-muted-foreground">Enhanced keyboard navigation support</p>
                    </div>
                    <Switch
                      checked={preferences.keyboardNavigation}
                      onCheckedChange={(checked) => updatePreference('keyboardNavigation', checked)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Data Collection</Label>
                        <p className="text-sm text-muted-foreground">Allow collection of usage data for improvement</p>
                      </div>
                      <Switch
                        checked={preferences.dataCollection}
                        onCheckedChange={(checked) => updatePreference('dataCollection', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Analytics Sharing</Label>
                        <p className="text-sm text-muted-foreground">Share anonymized analytics with third parties</p>
                      </div>
                      <Switch
                        checked={preferences.analyticsSharing}
                        onCheckedChange={(checked) => updatePreference('analyticsSharing', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Performance Tracking</Label>
                        <p className="text-sm text-muted-foreground">Track performance metrics for personalization</p>
                      </div>
                      <Switch
                        checked={preferences.performanceTracking}
                        onCheckedChange={(checked) => updatePreference('performanceTracking', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Third-party Integrations</Label>
                        <p className="text-sm text-muted-foreground">Allow integrations with external services</p>
                      </div>
                      <Switch
                        checked={preferences.thirdPartyIntegrations}
                        onCheckedChange={(checked) => updatePreference('thirdPartyIntegrations', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}