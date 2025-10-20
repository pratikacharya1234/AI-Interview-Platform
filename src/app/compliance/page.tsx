'use client'

import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { CheckCircle, FileText, Globe, Shield } from 'lucide-react'

export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Compliance & Certifications
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We maintain the highest standards of compliance and security
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">GDPR Compliant</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Full compliance with EU General Data Protection Regulation
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">SOC 2 Type II</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Certified for security, availability, and confidentiality
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">CCPA Compliant</h3>
              <p className="text-gray-600 dark:text-gray-400">
                California Consumer Privacy Act compliance
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">ISO 27001</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Information security management system certified
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
