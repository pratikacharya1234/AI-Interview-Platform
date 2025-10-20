'use client'

import { useState, useEffect } from 'react'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { CheckCircle, AlertCircle, Clock, Activity } from 'lucide-react'

export default function StatusPage() {
  const [uptime, setUptime] = useState('99.99%')

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              System Status
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                All Systems Operational
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'API Services', status: 'operational' },
                  { name: 'Voice Interviews (Vapi)', status: 'operational' },
                  { name: 'AI Features (Gemini)', status: 'operational' },
                  { name: 'Database (Supabase)', status: 'operational' },
                  { name: 'Authentication', status: 'operational' },
                  { name: 'File Storage', status: 'operational' },
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">Operational</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <Activity className="w-8 h-8 text-blue-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{uptime}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime (30 days)</div>
              </div>

              <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <Clock className="w-8 h-8 text-green-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">45ms</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
              </div>

              <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Incidents (7 days)</div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Subscribe to Updates
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get notified about system status changes and scheduled maintenance
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                />
                <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
