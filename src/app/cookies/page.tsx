'use client'

import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Cookie, Settings, Eye, Shield } from 'lucide-react'

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 mb-6">
              <Cookie className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Cookie Information
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Cookie Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Last updated: October 19, 2024
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                What Are Cookies?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                Types of Cookies We Use
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                Essential Cookies
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Required for the platform to function. These enable core features like security, authentication, and accessibility.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                Performance Cookies
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Help us understand how visitors interact with our platform by collecting anonymous usage data.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                Functional Cookies
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Remember your preferences and settings to provide a personalized experience.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                Analytics Cookies
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Help us improve our platform by analyzing user behavior and identifying areas for enhancement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-600" />
                Managing Cookies
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You can control cookies through your browser settings:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Block all cookies</li>
                <li>Accept only first-party cookies</li>
                <li>Delete cookies after each session</li>
                <li>Manage cookie preferences per website</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Note: Blocking essential cookies may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                For questions about our cookie policy, email us at privacy@aiinterviewpro.com
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
