'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, SkillBadge, InterviewStatusBadge, AIPrismBadge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/avatar'
import { Progress, InterviewProgress } from '@/components/ui/progress'
import { InterviewAlert } from '@/components/ui/alert'
import { getGitHubProfile, getGitHubRepos } from '@/lib/github'
import { Hand, Building, MapPin, BarChart3, Target, BookOpen, Sparkles } from 'lucide-react'
interface AuthUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
  login?: string
  avatar_url?: string
  bio?: string
  company?: string
  location?: string
  public_repos?: number
  followers?: number
  following?: number
  githubId?: string
}

interface GitHubProfile {
  login: string
  name: string
  avatar_url: string
  bio?: string
  public_repos: number
  followers: number
  following: number
  company?: string
  location?: string
}

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description?: string
  language?: string
  stargazers_count: number
  updated_at: string
}

interface DashboardClientProps {
  user: AuthUser
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [githubProfile, setGithubProfile] = useState<GitHubProfile | null>(null)
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [loadingGithub, setLoadingGithub] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // GitHub profile will be loaded automatically through NextAuth callback
    // The user object already contains GitHub data if authenticated with GitHub
    if (user.login && user.public_repos !== undefined) {
      // User has GitHub data, set it as the profile
      setGithubProfile({
        login: user.login,
        name: user.name || '',
        avatar_url: user.avatar_url || user.image || '',
        bio: user.bio,
        public_repos: user.public_repos || 0,
        followers: user.followers || 0,
        following: user.following || 0,
        company: user.company,
        location: user.location
      })
    }
  }, [user])

  const loadGitHubData = async (token: string) => {
    setLoadingGithub(true)
    
    try {
      const [profileResult, reposResult] = await Promise.all([
        getGitHubProfile(token),
        getGitHubRepos(token)
      ])
      
      if (profileResult.success) {
        setGithubProfile(profileResult.profile)
      }
      
      if (reposResult.success) {
        setGithubRepos(reposResult.repos)
      }
    } catch (error) {
      console.error('Error loading GitHub data:', error)
    } finally {
      setLoadingGithub(false)
    }
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-prism-teal/5 to-lavender-mist/10 dark:from-graphite dark:via-obsidian dark:to-graphite">

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-obsidian dark:text-pearl mb-2 flex items-center gap-2">
            Welcome back, {githubProfile?.name?.split(' ')[0] || user.name?.split(' ')[0] || 'Developer'}!
            <Hand className="w-8 h-8 text-prism-teal" />
          </h2>
          <p className="text-lg text-silver">
            Ready to enhance your interview skills with AI-powered practice sessions?
          </p>
        </div>

        {/* AI Processing Alert */}
        <div className="mb-6">
          <InterviewAlert 
            type="ai-processing" 
            className="animate-prism-pulse"
          />
        </div>

        {/* Account Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="highlight">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-silver">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant="success" size="sm">
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="highlight">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-silver">GitHub Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {githubProfile ? (
                  <Badge variant="success" size="sm">Connected</Badge>
                ) : (
                  <Badge variant="outline" size="sm">Not Connected</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card variant="highlight">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-silver">Interview Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <InterviewStatusBadge status="scheduled" />
            </CardContent>
          </Card>

          <Card variant="highlight">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-silver">Member Since</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-prism-teal">
                {formatDate(new Date().toISOString()).split(',')[0]}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GitHub Profile Integration */}
        {githubProfile && (
          <Card className="mb-8" variant="interactive">
            <CardHeader>
              <CardTitle>GitHub Profile Integration</CardTitle>
              <CardDescription>
                Your GitHub data helps us personalize your interview experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4 mb-6">
                <UserAvatar
                  src={githubProfile.avatar_url}
                  name={githubProfile.name || githubProfile.login}
                  size="lg"
                  variant="ai-prism"
                />
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-obsidian dark:text-pearl text-lg">
                      {githubProfile.name || githubProfile.login}
                    </h3>
                    <p className="text-sm text-prism-teal">@{githubProfile.login}</p>
                    {githubProfile.bio && (
                      <p className="text-sm text-silver mt-1">{githubProfile.bio}</p>
                    )}
                    {(githubProfile.company || githubProfile.location) && (
                      <div className="flex items-center space-x-3 mt-2 text-xs text-silver">
                        {githubProfile.company && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {githubProfile.company}
                          </span>
                        )}
                        {githubProfile.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {githubProfile.location}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Connected</Badge>
                    <Badge variant="success">Verified</Badge>
                    <AIPrismBadge size="sm">Profile Analyzed</AIPrismBadge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-prism-teal/10 to-prism-teal/5 rounded-lg">
                  <div className="text-2xl font-bold text-prism-teal">{githubProfile.public_repos}</div>
                  <div className="text-sm text-silver">Repositories</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-lavender-mist/10 to-lavender-mist/5 rounded-lg">
                  <div className="text-2xl font-bold text-lavender-mist">{githubProfile.followers}</div>
                  <div className="text-sm text-silver">Followers</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-prism-teal/10 to-lavender-mist/10 rounded-lg">
                  <div className="text-2xl font-bold bg-gradient-to-r from-prism-teal to-lavender-mist bg-clip-text text-transparent">{githubProfile.following}</div>
                  <div className="text-sm text-silver">Following</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Repositories */}
        {githubRepos.length > 0 && (
          <Card className="mb-8" variant="ai-feature">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Recent GitHub Repositories</span>
                <AIPrismBadge size="sm">AI Analyzed</AIPrismBadge>
              </CardTitle>
              <CardDescription>
                Your most recently updated repositories for technical interview preparation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {githubRepos.slice(0, 5).map((repo) => (
                  <Card key={repo.id} variant="interactive" className="group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-prism-teal group-hover:text-lavender-mist transition-colors">
                            {repo.name}
                          </h4>
                          {repo.description && (
                            <p className="text-sm text-silver mt-1 line-clamp-2">{repo.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            {repo.language && (
                              <Badge variant="outline" size="sm">{repo.language}</Badge>
                            )}
                            <span className="text-xs text-silver flex items-center">
                              {repo.stargazers_count} stars
                            </span>
                            <span className="text-xs text-silver">
                              Updated {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Interview Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="interactive" className="group">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Technical Interviews
                <SkillBadge level="advanced" />
              </CardTitle>
              <CardDescription>
                Practice coding challenges, algorithms, and technical problem solving with AI feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-silver">
                • Algorithm & Data Structures
                • System Design Basics  
                • Code Review & Debugging
                • GitHub Repository Analysis
              </div>
              <Button className="w-full btn-primary group-hover:scale-105 transition-transform">
                Start Technical Interview
                <span className="ml-2">→</span>
              </Button>
            </CardContent>
          </Card>

          <Card variant="interactive" className="group">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Behavioral Interviews
                <SkillBadge level="intermediate" />
              </CardTitle>
              <CardDescription>
                Improve your soft skills and behavioral responses with AI-powered coaching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-silver">
                • Leadership & Teamwork
                • Conflict Resolution
                • Communication Skills  
                • STAR Method Practice
              </div>
              <Button className="w-full btn-secondary group-hover:scale-105 transition-transform">
                Start Behavioral Interview
                <span className="ml-2">→</span>
              </Button>
            </CardContent>
          </Card>

          <Card variant="interactive" className="group">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                System Design
                <SkillBadge level="expert" />
              </CardTitle>
              <CardDescription>
                Master system architecture and design patterns for senior roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-silver">
                • Scalability & Performance
                • Database Design
                • Architecture Patterns
                • Real-world Case Studies
              </div>
              <Button className="w-full bg-gradient-to-r from-prism-teal to-lavender-mist text-white hover:shadow-prism-glow group-hover:scale-105 transition-all">
                Start System Design Interview
                <span className="ml-2">→</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your secure account details and platform settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-silver">
                  User ID
                </label>
                <div className="text-sm text-obsidian dark:text-pearl bg-gradient-to-r from-prism-teal/5 to-lavender-mist/5 p-3 rounded-lg border border-prism-teal/10 font-mono">
                  {user.id}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-silver">
                  Last Updated
                </label>
                <div className="text-sm text-obsidian dark:text-pearl bg-gradient-to-r from-prism-teal/5 to-lavender-mist/5 p-3 rounded-lg border border-prism-teal/10">
                  {formatDate(new Date().toISOString())}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GitHub Connection for non-GitHub users */}
        {!githubProfile && !user.login && (
          <Card className="mb-8" variant="ai-feature">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-gradient-to-br from-prism-teal to-lavender-mist rounded-xl flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-obsidian dark:text-pearl mb-2">
                    Connect GitHub Profile
                  </h3>
                  <p className="text-silver text-sm mb-4">
                    Connect your GitHub account to import your profile and repositories for personalized interview preparation with AI analysis.
                  </p>
                  <div className="flex items-center space-x-2">
                    <AIPrismBadge size="sm">Enhanced Experience</AIPrismBadge>
                    <Badge variant="info" size="sm">Recommended</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mb-8" variant="ai-feature">
          <CardHeader>
            <CardTitle>Quick Actions & Resources</CardTitle>
            <CardDescription>
              Jump into common interview scenarios or access learning resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-prism-teal/30 text-prism-teal hover:bg-prism-teal/10 flex-col h-auto py-3"
                onClick={() => router.push('/interview')}
              >
                <Target className="w-5 h-5 mb-1" />
                <span className="text-xs">AI Interview</span>
              </Button>
              <Button variant="outline" size="sm" className="border-prism-teal/30 text-prism-teal hover:bg-prism-teal/10 flex-col h-auto py-3">
                <BarChart3 className="w-5 h-5 mb-1" />
                <span className="text-xs">System Design</span>
              </Button>
              <Button variant="outline" size="sm" className="border-prism-teal/30 text-prism-teal hover:bg-prism-teal/10 flex-col h-auto py-3">
                <BookOpen className="w-5 h-5 mb-1" />
                <span className="text-xs">Resources</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-lavender-mist/30 text-lavender-mist hover:bg-lavender-mist/10 flex-col h-auto py-3"
                onClick={() => router.push('/interview')}
              >
                <Sparkles className="w-5 h-5 mb-1" />
                <span className="text-xs">Practice Now</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Platform Status */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-silver">Platform Status: All systems operational</span>
          </div>
          <p className="text-xs text-silver">
            Your AI Interview Platform is ready. Advanced features and GitHub integration available.
          </p>
        </div>
      </main>
    </div>
  )
}