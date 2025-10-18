'use client'

import { useState } from 'react'
import Link from 'next/link'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Book, Code, Settings, Shield, Zap, HelpCircle, ChevronRight, Search, FileText, Video, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const docSections = [
  {
    title: 'Getting Started',
    icon: Zap,
    items: [
      { title: 'Quick Start Guide', href: '/docs/quick-start' },
      { title: 'Account Setup', href: '/docs/account-setup' },
      { title: 'First Interview', href: '/docs/first-interview' },
      { title: 'Dashboard Overview', href: '/docs/dashboard' }
    ]
  },
  {
    title: 'Interview Preparation',
    icon: Book,
    items: [
      { title: 'Interview Types', href: '/docs/interview-types' },
      { title: 'Question Banks', href: '/docs/question-banks' },
      { title: 'Practice Strategies', href: '/docs/practice-strategies' },
      { title: 'Performance Tracking', href: '/docs/performance' }
    ]
  },
  {
    title: 'AI Features',
    icon: Code,
    items: [
      { title: 'AI Coach Overview', href: '/docs/ai-coach' },
      { title: 'Voice Analysis', href: '/docs/voice-analysis' },
      { title: 'Feedback System', href: '/docs/feedback' },
      { title: 'Personalization', href: '/docs/personalization' }
    ]
  },
  {
    title: 'API Reference',
    icon: Terminal,
    items: [
      { title: 'Authentication', href: '/docs/api/auth' },
      { title: 'Interviews API', href: '/docs/api/interviews' },
      { title: 'Analytics API', href: '/docs/api/analytics' },
      { title: 'Webhooks', href: '/docs/api/webhooks' }
    ]
  },
  {
    title: 'Account & Settings',
    icon: Settings,
    items: [
      { title: 'Profile Management', href: '/docs/profile' },
      { title: 'Subscription Plans', href: '/docs/subscriptions' },
      { title: 'Privacy Settings', href: '/docs/privacy' },
      { title: 'Data Export', href: '/docs/data-export' }
    ]
  },
  {
    title: 'Security & Privacy',
    icon: Shield,
    items: [
      { title: 'Security Overview', href: '/docs/security' },
      { title: 'Data Protection', href: '/docs/data-protection' },
      { title: 'GDPR Compliance', href: '/docs/gdpr' },
      { title: 'Terms of Service', href: '/docs/terms' }
    ]
  }
]

const popularArticles = [
  { title: 'How to ace your first AI interview', icon: FileText, href: '/docs/first-interview' },
  { title: 'Understanding AI feedback scores', icon: FileText, href: '/docs/feedback-scores' },
  { title: 'Setting up voice interviews', icon: Video, href: '/docs/voice-setup' },
  { title: 'Customizing practice sessions', icon: Settings, href: '/docs/customization' },
  { title: 'Interpreting analytics data', icon: FileText, href: '/docs/analytics-guide' }
]

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Documentation
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about using AI Interview Pro effectively
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Popular Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularArticles.map((article) => {
                const Icon = article.icon
                return (
                  <Link key={article.title} href={article.href}>
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Documentation Sections */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Categories
                </h3>
                <nav className="space-y-2">
                  {docSections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.title}
                        onClick={() => setSelectedSection(section.title === selectedSection ? null : section.title)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                          selectedSection === section.title
                            ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{section.title}</span>
                        <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                          selectedSection === section.title ? 'rotate-90' : ''
                        }`} />
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {selectedSection ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {selectedSection}
                  </h2>
                  <div className="space-y-4">
                    {docSections
                      .find(section => section.title === selectedSection)
                      ?.items.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all group">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {item.title}
                              </h3>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-8">
                  {docSections.map((section) => {
                    const Icon = section.icon
                    return (
                      <div key={section.title} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {section.title}
                          </h2>
                        </div>
                        <div className="space-y-3">
                          {section.items.map((item) => (
                            <Link key={item.href} href={item.href}>
                              <div className="flex items-center justify-between py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                                <span>{item.title}</span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Help Section */}
              <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Need more help?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Can't find what you're looking for? Our support team is here to help you.
                    </p>
                    <div className="flex gap-3">
                      <Link href="/contact">
                        <Button>Contact Support</Button>
                      </Link>
                      <Link href="/help">
                        <Button variant="outline">Visit Help Center</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
