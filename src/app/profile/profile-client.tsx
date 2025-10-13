'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usePreferences } from '@/contexts/PreferencesContext'
import {
  User,
  Github,
  Settings,
  Bell,
  Mic,
  Volume2,
  Save,
  Edit,
  Trophy,
  Target,
  Clock,
  Star,
  MapPin,
  Building,
  Users,
  GitBranch,
  Mail
} from 'lucide-react'

export default function ProfileClient() {
  const { data: session, status } = useSession()
  const { preferences, updatePreference, savePreferences, isLoading, isSaving } = usePreferences()
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    bio: '',
    location: '',
    company: ''
  })

  useEffect(() => {
    if (session?.user) {
      setEditedProfile({
        bio: (session.user as any).bio || '',
        location: (session.user as any).location || '',
        company: (session.user as any).company || ''
      })
    }
  }, [session])

  const handleSaveProfile = async () => {
    // In a real app, this would save to the backend
    // For now, we'll just update local state
    setIsEditing(false)
  }

  const handlePreferenceChange = async (key: string, value: any) => {
    await updatePreference(key as keyof typeof preferences, value)
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">Loading profile...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const user = session.user as any

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account settings and interview preferences</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar_url} alt={user.name || user.login} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{user.name || user.login}</h2>
                  <p className="text-gray-600">@{user.login}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    {user.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {user.location}
                      </div>
                    )}
                    {user.company && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Building className="h-4 w-4 mr-1" />
                        {user.company}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant={isEditing ? "primary" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editedProfile.bio}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editedProfile.location}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Your location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={editedProfile.company}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Your company"
                    />
                  </div>
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">Bio</h3>
                      <p className="text-gray-700">{user.bio}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{user.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{user.followers || 0} followers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GitBranch className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{user.public_repos || 0} repositories</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{user.following || 0} following</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24h</div>
                <p className="text-xs text-muted-foreground">+3h from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Interview Preferences
              </CardTitle>
              <CardDescription>
                Customize your interview experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
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
                  <Label htmlFor="type">Interview Type</Label>
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
                <h3 className="text-lg font-semibold flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  Voice Settings
                </h3>

                <div className="flex items-center justify-between">
                  <Label htmlFor="voice-enabled">Enable Voice</Label>
                  <Switch
                    id="voice-enabled"
                    checked={preferences.voiceEnabled}
                    onCheckedChange={(checked) => handlePreferenceChange('voiceEnabled', checked)}
                  />
                </div>

                {preferences.voiceEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Voice Speed: {preferences.voiceSpeed.toFixed(1)}x</Label>
                      <Slider
                        value={[preferences.voiceSpeed]}
                        onValueChange={([value]) => handlePreferenceChange('voiceSpeed', value)}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Volume: {Math.round(preferences.volume * 100)}%</Label>
                      <Slider
                        value={[preferences.volume]}
                        onValueChange={([value]) => handlePreferenceChange('volume', value)}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch
                      id="email-notifications"
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="browser-notifications">Browser Notifications</Label>
                    <Switch
                      id="browser-notifications"
                      checked={preferences.browserNotifications}
                      onCheckedChange={(checked) => handlePreferenceChange('browserNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save">Auto-save Responses</Label>
                    <Switch
                      id="auto-save"
                      checked={preferences.autoSaveResponses}
                      onCheckedChange={(checked) => handlePreferenceChange('autoSaveResponses', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="detailed-feedback">Detailed Feedback</Label>
                    <Switch
                      id="detailed-feedback"
                      checked={preferences.detailedFeedback}
                      onCheckedChange={(checked) => handlePreferenceChange('detailedFeedback', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="record-sessions">Record Sessions</Label>
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

        <TabsContent value="github" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Github className="h-5 w-5 mr-2" />
                GitHub Integration
              </CardTitle>
              <CardDescription>
                Your GitHub profile data and repository analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Profile Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Public Repositories</span>
                      <Badge variant="secondary">{user.public_repos || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Followers</span>
                      <Badge variant="secondary">{user.followers || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Following</span>
                      <Badge variant="secondary">{user.following || 0}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Account Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>GitHub Connected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Profile Data Synced</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Repository Analysis Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold">Recent Activity</h3>
                <div className="text-sm text-gray-600">
                  GitHub activity integration coming soon. This will show your recent commits,
                  pull requests, and repository updates to help tailor interview questions.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Interview Statistics
              </CardTitle>
              <CardDescription>
                Your interview performance and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Total Interviews</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">24h</div>
                  <div className="text-sm text-gray-600">Practice Time</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">8</div>
                  <div className="text-sm text-gray-600">Skills Assessed</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Performance by Category</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Technical Questions</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                      <span className="text-sm font-medium">82%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Behavioral Questions</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Design</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold">Recent Achievements</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium">First Interview Completed</div>
                      <div className="text-sm text-gray-600">Completed your first practice interview</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Star className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">High Scorer</div>
                      <div className="text-sm text-gray-600">Achieved 90%+ in 3 consecutive interviews</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Consistent Performer</div>
                      <div className="text-sm text-gray-600">Maintained 80%+ average for a week</div>
                    </div>
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
