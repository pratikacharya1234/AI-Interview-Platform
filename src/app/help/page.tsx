'use client'

import { useState } from 'react'
import Link from 'next/link'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  FileText,
  Mail,
  Phone,
  MessageSquare,
  ChevronRight,
  Zap,
  Shield,
  Settings
} from 'lucide-react'

const helpTopics = [
  {
    id: 1,
    title: 'Getting Started',
    description: 'Learn the basics of using the AI Interview Platform',
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-500',
    articles: [
      { title: 'How to create your account', href: '/docs/account-setup' },
      { title: 'Setting up your profile', href: '/docs/profile' },
      { title: 'Taking your first interview', href: '/docs/first-interview' },
      { title: 'Understanding your dashboard', href: '/docs/dashboard' }
    ]
  },
  {
    id: 2,
    title: 'Interview Features',
    description: 'Master all interview types and features',
    icon: Video,
    color: 'from-purple-500 to-pink-500',
    articles: [
      { title: 'Voice interview setup', href: '/docs/voice-setup' },
      { title: 'Video interview guide', href: '/docs/video-guide' },
      { title: 'Text interview tips', href: '/docs/text-tips' },
      { title: 'Understanding feedback reports', href: '/docs/feedback' }
    ]
  },
  {
    id: 3,
    title: 'AI Features',
    description: 'Leverage AI-powered tools effectively',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    articles: [
      { title: 'AI coach overview', href: '/docs/ai-coach' },
      { title: 'Voice analysis explained', href: '/docs/voice-analysis' },
      { title: 'Personalized feedback', href: '/docs/personalization' },
      { title: 'Performance tracking', href: '/docs/performance' }
    ]
  },
  {
    id: 4,
    title: 'Account & Settings',
    description: 'Manage your account and preferences',
    icon: Settings,
    color: 'from-green-500 to-emerald-500',
    articles: [
      { title: 'Profile management', href: '/docs/profile' },
      { title: 'Subscription plans', href: '/docs/subscriptions' },
      { title: 'Privacy settings', href: '/docs/privacy' },
      { title: 'Data export', href: '/docs/data-export' }
    ]
  },
  {
    id: 5,
    title: 'Security & Privacy',
    description: 'Learn about data protection and security',
    icon: Shield,
    color: 'from-indigo-500 to-purple-500',
    articles: [
      { title: 'Security overview', href: '/docs/security' },
      { title: 'Data protection', href: '/docs/data-protection' },
      { title: 'GDPR compliance', href: '/docs/gdpr' },
      { title: 'Terms of service', href: '/docs/terms' }
    ]
  },
  {
    id: 6,
    title: 'Troubleshooting',
    description: 'Common issues and solutions',
    icon: MessageCircle,
    color: 'from-pink-500 to-rose-500',
    articles: [
      { title: 'Audio/video issues', href: '/docs/av-troubleshooting' },
      { title: 'Login problems', href: '/docs/login-issues' },
      { title: 'Payment questions', href: '/docs/payment-help' },
      { title: 'Technical support', href: '/docs/tech-support' }
    ]
  }
]

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    action: 'Send Email',
    href: 'mailto:support@aiinterviewpro.com',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    action: 'Start Chat',
    href: '#',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Call us for urgent assistance',
    action: 'Call Now',
    href: 'tel:+1-555-0123',
    color: 'from-purple-500 to-pink-500'
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTopics = helpTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.articles.some(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 mb-6">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                We're here to help
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Help Center
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Find answers to common questions and learn how to use the platform effectively
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg"
              />
            </div>
          </div>

          {/* Help Topics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredTopics.map((topic) => {
              const Icon = topic.icon
              return (
                <Card key={topic.id} className="hover:shadow-lg transition-all border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${topic.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-gray-900 dark:text-white">{topic.title}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {topic.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {topic.articles.map((article, index) => (
                        <li key={index}>
                          <Link href={article.href}>
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group py-1">
                              <span>{article.title}</span>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredTopics.length === 0 && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  Try searching with different keywords or browse our help topics above
                </p>
                <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
              </CardContent>
            </Card>
          )}

          {/* Contact Support Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Still need help?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Our support team is ready to assist you
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {contactMethods.map((method) => {
                const Icon = method.icon
                return (
                  <Card key={method.title} className="hover:shadow-lg transition-all border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {method.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {method.description}
                      </p>
                      <Link href={method.href}>
                        <Button className="w-full">
                          {method.action}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Additional Resources */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Explore our documentation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Detailed guides and tutorials to help you get the most out of the platform
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/docs">
                  <Button size="lg">
                    View Docs
                  </Button>
                </Link>
                <Link href="/blog">
                  <Button variant="outline" size="lg">
                    Read Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
