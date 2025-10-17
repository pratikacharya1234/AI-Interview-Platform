'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Shield, 
  User, 
  Mic, 
  Volume2, 
  Globe,
  Clock,
  Trash2,
  Download,
  Upload
} from 'lucide-react'
import { useUserPreferences } from '@/hooks/useUserPreferences'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { preferences, updatePreference, savePreferences, isLoading, isSaving } = useUserPreferences()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handlePreferenceChange = async (key: string, value: any) => {
    await updatePreference(key as keyof typeof preferences, value)
    setHasUnsavedChanges(true)
  }

  const handleSaveAll = async () => {
    await savePreferences(preferences)
    setHasUnsavedChanges(false)
  }

  const exportSettings = () => {
    const data = {
      preferences,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ai-interview-settings.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.preferences) {
          await savePreferences(data.preferences)
          setHasUnsavedChanges(false)
        }
      } catch (error) {
        console.error('Failed to import settings:', error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your AI interview experience and manage your account preferences.
          </p>
        </div>
        {hasUnsavedChanges && (
          <Button onClick={handleSaveAll} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="interview">Interview</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the interface looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={preferences.theme} 
                  onValueChange={(value) => handlePreferenceChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Language & Region</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            English
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Auto-detect
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Preferences</CardTitle>
              <CardDescription>
                Configure your default interview settings and behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Difficulty</Label>
                  <Select 
                    value={preferences.interviewDifficulty} 
                    onValueChange={(value) => handlePreferenceChange('interviewDifficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Interview Type</Label>
                  <Select 
                    value={preferences.interviewType} 
                    onValueChange={(value) => handlePreferenceChange('interviewType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="system-design">System Design</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Interview Behavior</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-save">Auto-save responses</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save your responses as you type
                      </p>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={preferences.autoSaveResponses}
                      onCheckedChange={(checked) => handlePreferenceChange('autoSaveResponses', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="detailed-feedback">Detailed feedback</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive comprehensive analysis and suggestions
                      </p>
                    </div>
                    <Switch
                      id="detailed-feedback"
                      checked={preferences.detailedFeedback}
                      onCheckedChange={(checked) => handlePreferenceChange('detailedFeedback', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="record-sessions">Record interview sessions</Label>
                      <p className="text-sm text-muted-foreground">
                        Save audio/video recordings for later review
                      </p>
                    </div>
                    <Switch
                      id="record-sessions"
                      checked={preferences.recordSessions}
                      onCheckedChange={(checked) => handlePreferenceChange('recordSessions', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="browser-notifications">Browser notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get real-time notifications in your browser
                    </p>
                  </div>
                  <Switch
                    id="browser-notifications"
                    checked={preferences.browserNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('browserNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control your privacy settings and data sharing preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Data & Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Help us improve the platform by sharing anonymous usage data.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="usage-analytics">Usage analytics</Label>
                    <Switch id="usage-analytics" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="performance-tracking">Performance tracking</Label>
                    <Switch id="performance-tracking" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Account Security</h4>
                <div className="space-y-2">
                  <Label>Connected Account</Label>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">GH</span>
                      </div>
                      <div>
                        <p className="font-medium">{session?.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">GitHub</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Audio Settings
              </CardTitle>
              <CardDescription>
                Configure microphone, voice recognition, and audio playback settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="voice-enabled">Enable voice features</Label>
                    <p className="text-sm text-muted-foreground">
                      Use voice input and audio feedback during interviews
                    </p>
                  </div>
                  <Switch
                    id="voice-enabled"
                    checked={preferences.voiceEnabled}
                    onCheckedChange={(checked) => handlePreferenceChange('voiceEnabled', checked)}
                  />
                </div>
              </div>

              {preferences.voiceEnabled && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="voice-speed">Voice speed: {preferences.voiceSpeed}x</Label>
                      <input
                        type="range"
                        id="voice-speed"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={preferences.voiceSpeed}
                        onChange={(e) => handlePreferenceChange('voiceSpeed', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="volume">Volume: {Math.round(preferences.volume * 100)}%</Label>
                      <input
                        type="range"
                        id="volume"
                        min="0"
                        max="1"
                        step="0.1"
                        value={preferences.volume}
                        onChange={(e) => handlePreferenceChange('volume', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export, import, or reset your settings and data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Export Settings</Label>
                    <p className="text-sm text-muted-foreground">
                      Download your current settings as a JSON file
                    </p>
                  </div>
                  <Button variant="outline" onClick={exportSettings}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Import Settings</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload and restore settings from a JSON file
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={importSettings}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-red-600">Danger Zone</h4>
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="space-y-0.5">
                      <Label className="text-red-700">Reset All Settings</Label>
                      <p className="text-sm text-red-600">
                        This will reset all your preferences to default values
                      </p>
                    </div>
                    <Button variant="danger" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
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
