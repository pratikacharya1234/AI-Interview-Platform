'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth'
import { getGitHubProfile, getGitHubRepos } from '@/lib/github'
import type { User } from '@supabase/supabase-js'

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
  user: User
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [githubProfile, setGithubProfile] = useState<GitHubProfile | null>(null)
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [loadingGithub, setLoadingGithub] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load GitHub profile if user signed in with GitHub
    if (user.app_metadata?.provider === 'github' && user.user_metadata?.provider_token) {
      loadGitHubData(user.user_metadata.provider_token)
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

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    
    try {
      await signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoggingOut(false)
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.email}</span>
              <Button
                variant="outline"
                onClick={handleSignOut}
                isLoading={isLoggingOut}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg">
            <div className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to your Dashboard
                </h2>
                <p className="text-gray-600 mb-8">
                  You have successfully logged into your SaaS platform account.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Account Email
                          </dt>
                          <dd className="text-lg font-medium text-gray-900 truncate">
                            {user.email}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Account Status
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {user.email_confirmed_at ? 'Verified' : 'Pending Verification'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Member Since
                          </dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {formatDate(user.created_at)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        User ID
                      </label>
                      <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {user.id}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Updated
                      </label>
                      <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {formatDate(user.updated_at || user.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GitHub Profile Section */}
              {githubProfile && (
                <div className="mt-8 bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <img
                        className="h-16 w-16 rounded-full"
                        src={githubProfile.avatar_url}
                        alt={githubProfile.name || githubProfile.login}
                      />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {githubProfile.name || githubProfile.login}
                        </h3>
                        <p className="text-sm text-gray-500">@{githubProfile.login}</p>
                        {githubProfile.bio && (
                          <p className="text-sm text-gray-700 mt-1">{githubProfile.bio}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-gray-900">{githubProfile.public_repos}</div>
                        <div className="text-sm text-gray-500">Repositories</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-gray-900">{githubProfile.followers}</div>
                        <div className="text-sm text-gray-500">Followers</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-gray-900">{githubProfile.following}</div>
                        <div className="text-sm text-gray-500">Following</div>
                      </div>
                    </div>

                    {githubRepos.length > 0 && (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Recent Repositories</h4>
                        <div className="space-y-3">
                          {githubRepos.slice(0, 5).map((repo) => (
                            <div key={repo.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-sm font-medium text-blue-600">{repo.name}</h5>
                                  {repo.description && (
                                    <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                                  )}
                                  <div className="flex items-center space-x-4 mt-2">
                                    {repo.language && (
                                      <span className="text-xs text-gray-500">{repo.language}</span>
                                    )}
                                    <span className="text-xs text-gray-500">⭐ {repo.stargazers_count}</span>
                                    <span className="text-xs text-gray-500">
                                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!githubProfile && user.app_metadata?.provider !== 'github' && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <svg
                      className="h-6 w-6 text-blue-600 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h3 className="text-lg font-medium text-blue-900">Connect GitHub Profile</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Connect your GitHub account to import your profile and repositories for interview preparation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Ready for your AI Interview Platform. Your authentication is secure and GitHub integration is ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}