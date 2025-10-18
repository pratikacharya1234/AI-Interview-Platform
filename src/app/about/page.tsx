'use client'

import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Brain, Users, Target, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              About AI Interview Pro
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We&apos;re on a mission to democratize interview preparation and help millions of professionals land their dream jobs through AI-powered practice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Founded in 2023, AI Interview Pro was born from the frustration of traditional interview preparation methods. Our founders, having gone through countless interviews themselves, realized that practice with real-time feedback was the key to success.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Today, we&apos;ve helped over 50,000 professionals across the globe improve their interview skills and land positions at top companies including Google, Microsoft, Amazon, and many more.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We believe that everyone deserves access to high-quality interview preparation, regardless of their background or resources. Our AI technology levels the playing field, providing personalized coaching that was once only available to a privileged few.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                We&apos;re committed to continuous innovation, ensuring our platform evolves with the changing job market and interview trends.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <Brain className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">50K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">92%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <Target className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">10M+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Practice Sessions</div>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">4.9/5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">User Rating</div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Innovation First</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We constantly push the boundaries of AI technology to provide the best interview preparation experience.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User Success</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your success is our success. We measure ourselves by the careers we help transform.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Privacy & Trust</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We protect your data with enterprise-grade security and never share your information.
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
