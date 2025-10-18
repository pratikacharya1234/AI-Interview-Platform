'use client'

import Link from 'next/link'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Zap, Calendar, MessageSquare, Video, FileText, Users, Database, Shield, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const integrations = [
  {
    category: 'Calendar & Scheduling',
    items: [
      {
        name: 'Google Calendar',
        description: 'Schedule and manage interview practice sessions directly from your calendar',
        icon: Calendar,
        status: 'Available',
        features: ['Auto-scheduling', 'Reminders', 'Time zone sync']
      },
      {
        name: 'Calendly',
        description: 'Seamlessly book mock interviews with mentors and peers',
        icon: Calendar,
        status: 'Available',
        features: ['Booking links', 'Availability sync', 'Automated confirmations']
      }
    ]
  },
  {
    category: 'Communication',
    items: [
      {
        name: 'Slack',
        description: 'Get interview tips, reminders, and progress updates in your Slack workspace',
        icon: MessageSquare,
        status: 'Available',
        features: ['Daily tips', 'Progress notifications', 'Team channels']
      },
      {
        name: 'Microsoft Teams',
        description: 'Integrate interview practice into your Teams workflow',
        icon: Video,
        status: 'Coming Soon',
        features: ['Video practice', 'Team collaboration', 'Analytics sharing']
      }
    ]
  },
  {
    category: 'Productivity',
    items: [
      {
        name: 'Notion',
        description: 'Export interview feedback and notes to your Notion workspace',
        icon: FileText,
        status: 'Available',
        features: ['Auto-export', 'Custom templates', 'Progress tracking']
      },
      {
        name: 'Google Drive',
        description: 'Store interview recordings and reports in your Drive',
        icon: Database,
        status: 'Available',
        features: ['Auto-backup', 'Folder organization', 'Sharing options']
      }
    ]
  },
  {
    category: 'HR & Recruiting',
    items: [
      {
        name: 'Greenhouse',
        description: 'Streamline candidate preparation with integrated interview coaching',
        icon: Users,
        status: 'Enterprise',
        features: ['Candidate tracking', 'Custom assessments', 'Bulk invitations']
      },
      {
        name: 'Workday',
        description: 'Enhance your talent acquisition with AI-powered interview prep',
        icon: Shield,
        status: 'Enterprise',
        features: ['SSO integration', 'Employee development', 'Analytics dashboard']
      }
    ]
  }
]

const apiFeatures = [
  {
    title: 'RESTful API',
    description: 'Full-featured REST API for seamless integration with your existing tools'
  },
  {
    title: 'Webhooks',
    description: 'Real-time event notifications for interview completions and progress updates'
  },
  {
    title: 'OAuth 2.0',
    description: 'Secure authentication and authorization for third-party applications'
  },
  {
    title: 'SDK Libraries',
    description: 'Native SDKs for JavaScript, Python, and other popular languages'
  }
]

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 mb-6">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Powerful Integrations
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Connect Your Favorite Tools
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Integrate AI Interview Pro with your existing workflow and maximize your productivity
            </p>
          </div>

          {/* Integration Categories */}
          {integrations.map((category) => (
            <div key={category.category} className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                {category.category}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {category.items.map((integration) => {
                  const Icon = integration.icon
                  return (
                    <div key={integration.name} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {integration.name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              integration.status === 'Available' 
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                : integration.status === 'Coming Soon'
                                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                                : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                            }`}>
                              {integration.status}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {integration.description}
                          </p>
                          <div className="space-y-2">
                            {integration.features.map((feature) => (
                              <div key={feature} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                          {integration.status === 'Available' && (
                            <Button className="mt-4" size="sm">
                              Connect
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* API Section */}
          <div className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Build Custom Integrations
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Use our comprehensive API to create custom integrations and automate your interview preparation workflow
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {apiFeatures.map((feature) => (
                <div key={feature.title} className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/docs/api">
                <Button size="lg">
                  View API Documentation
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Request Integration */}
          <div className="text-center p-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-3xl font-bold text-white mb-4">
              Don't See Your Tool?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Let us know which integrations you'd like to see next. We're constantly expanding our ecosystem.
            </p>
            <Link href="/contact?type=integration-request">
              <Button size="lg" variant="secondary">
                Request Integration
              </Button>
            </Link>
          </div>

          {/* Security Note */}
          <div className="mt-16 p-6 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Enterprise-Grade Security
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All integrations are built with security in mind. We use OAuth 2.0 for authentication, 
                  encrypt all data in transit and at rest, and never store third-party credentials. 
                  Our platform is SOC 2 Type II certified and GDPR compliant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
