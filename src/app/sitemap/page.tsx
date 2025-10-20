'use client'

import Link from 'next/link'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { FileText, ChevronRight } from 'lucide-react'

const sitemapSections = [
  {
    title: 'Main Pages',
    links: [
      { name: 'Home', href: '/' },
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'Blog', href: '/blog' },
      { name: 'Documentation', href: '/docs' },
      { name: 'Help Center', href: '/help' },
      { name: 'Community', href: '/community' },
      { name: 'Tutorials', href: '/tutorials' },
    ]
  },
  {
    title: 'Interview Features',
    links: [
      { name: 'Voice Interview', href: '/interview/voice' },
      { name: 'Video Interview', href: '/interview/video' },
      { name: 'Text Interview', href: '/interview/text' },
      { name: 'Audio Interview', href: '/interview/audio' },
      { name: 'Interview History', href: '/interview/history' },
    ]
  },
  {
    title: 'User Dashboard',
    links: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Profile', href: '/profile' },
      { name: 'Settings', href: '/settings' },
      { name: 'Progress', href: '/progress' },
      { name: 'Achievements', href: '/achievements' },
    ]
  },
  {
    title: 'AI Features',
    links: [
      { name: 'AI Coach', href: '/ai/coach' },
      { name: 'AI Feedback', href: '/ai/feedback' },
      { name: 'AI Prep', href: '/ai/prep' },
      { name: 'AI Voice', href: '/ai/voice' },
    ]
  },
  {
    title: 'Learning',
    links: [
      { name: 'Learning Paths', href: '/learning/paths' },
      { name: 'Skills', href: '/learning/skills' },
      { name: 'Practice', href: '/practice' },
      { name: 'Mock Interviews', href: '/mock' },
      { name: 'Coding Challenges', href: '/coding' },
    ]
  },
  {
    title: 'Social',
    links: [
      { name: 'Leaderboard', href: '/leaderboard' },
      { name: 'Find Mentors', href: '/mentor/find' },
      { name: 'My Mentors', href: '/mentor/my-mentors' },
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
      { name: 'Integrations', href: '/integrations' },
      { name: 'Demo', href: '/demo' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Security', href: '/security' },
      { name: 'Compliance', href: '/compliance' },
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'System Status', href: '/status' },
      { name: 'API Documentation', href: '/api' },
    ]
  }
]

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 mb-6">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Site Navigation
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Sitemap
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Complete overview of all pages on AI Interview Pro
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sitemapSections.map((section) => (
              <div key={section.title} className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        className="flex items-center justify-between text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                      >
                        <span>{link.name}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
