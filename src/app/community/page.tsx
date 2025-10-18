'use client'

import { useState } from 'react'
import Link from 'next/link'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Users, MessageSquare, Trophy, Calendar, TrendingUp, Star, ArrowRight, Github, Linkedin, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/button'

const communityStats = [
  { label: 'Active Members', value: '50,000+', icon: Users },
  { label: 'Success Stories', value: '10,000+', icon: Trophy },
  { label: 'Monthly Events', value: '20+', icon: Calendar },
  { label: 'Expert Mentors', value: '500+', icon: Star }
]

const communityChannels = [
  {
    platform: 'Discord',
    description: 'Join our Discord server for real-time discussions, study groups, and peer support',
    members: '25,000+ members',
    link: 'https://discord.gg/aiinterviewpro',
    icon: MessageSquare
  },
  {
    platform: 'LinkedIn',
    description: 'Connect with professionals, share experiences, and network with industry leaders',
    members: '15,000+ followers',
    link: 'https://linkedin.com/company/aiinterviewpro',
    icon: Linkedin
  },
  {
    platform: 'GitHub',
    description: 'Contribute to open-source projects and access interview preparation resources',
    members: '5,000+ contributors',
    link: 'https://github.com/aiinterviewpro',
    icon: Github
  },
  {
    platform: 'Twitter',
    description: 'Stay updated with latest tips, industry news, and platform announcements',
    members: '10,000+ followers',
    link: 'https://twitter.com/aiinterviewpro',
    icon: Twitter
  }
]

const upcomingEvents = [
  {
    title: 'Mock Interview Marathon',
    date: 'November 15, 2024',
    time: '2:00 PM EST',
    type: 'Virtual Event',
    description: 'Practice with peers and get feedback from industry professionals'
  },
  {
    title: 'Tech Career Workshop',
    date: 'November 20, 2024',
    time: '6:00 PM EST',
    type: 'Webinar',
    description: 'Learn about breaking into tech and preparing for technical interviews'
  },
  {
    title: 'Resume Review Session',
    date: 'November 25, 2024',
    time: '3:00 PM EST',
    type: 'Virtual Event',
    description: 'Get your resume reviewed by hiring managers and recruiters'
  }
]

export default function CommunityPage() {
  const [selectedTab, setSelectedTab] = useState('overview')

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Join Our Community
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Connect with thousands of professionals on their interview journey. Share experiences, get support, and grow together.
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {communityStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
                  <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              )
            })}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-12 border-b border-gray-200 dark:border-gray-800">
            {['overview', 'channels', 'events', 'success-stories'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                  selectedTab === tab
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                {selectedTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {selectedTab === 'overview' && (
            <div className="space-y-12">
              {/* Welcome Message */}
              <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome to AI Interview Pro Community
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Our community is built on the foundation of mutual support, continuous learning, and shared success. 
                  Whether you&apos;re preparing for your first interview or helping others with their journey, you&apos;ll find 
                  a welcoming space here to grow and connect.
                </p>
                <div className="flex gap-4">
                  <Link href="#channels">
                    <Button>Join Community</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline">Start Free Trial</Button>
                  </Link>
                </div>
              </div>

              {/* Community Values */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Our Community Values</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Collaboration</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We believe in lifting each other up. Share knowledge, provide feedback, and celebrate wins together.
                    </p>
                  </div>
                  <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Growth Mindset</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Every interview is a learning opportunity. Embrace challenges and continuous improvement.
                    </p>
                  </div>
                  <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                      <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Excellence</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Strive for excellence in preparation and execution. Quality over quantity in all interactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'channels' && (
            <div id="channels" className="grid md:grid-cols-2 gap-6">
              {communityChannels.map((channel) => {
                const Icon = channel.icon
                return (
                  <div key={channel.platform} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {channel.platform}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {channel.description}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                          {channel.members}
                        </p>
                        <a href={channel.link} target="_blank" rel="noopener noreferrer">
                          <Button className="group">
                            Join {channel.platform}
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {selectedTab === 'events' && (
            <div className="space-y-8">
              <div className="p-6 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Weekly Office Hours
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Every Thursday at 5:00 PM EST - Get your questions answered by our expert mentors
                </p>
                <Button>Register for Office Hours</Button>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Events</h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.title} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {event.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {event.date}
                            </span>
                            <span>{event.time}</span>
                            <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs">
                              {event.type}
                            </span>
                          </div>
                        </div>
                        <Button>Register</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'success-stories' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Success Stories Coming Soon
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We&apos;re collecting inspiring stories from our community members who have successfully landed their dream jobs. 
                Check back soon to read about their journeys and get motivated for your own.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
