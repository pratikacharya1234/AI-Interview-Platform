'use client'

import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Shield, Lock, Eye, Server, Key, AlertTriangle, CheckCircle } from 'lucide-react'

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 mb-6">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Enterprise-Grade Security
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Security Overview
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your data security is our top priority
            </p>
          </div>

          <div className="space-y-8">
            <section className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Data Encryption
                </h2>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>End-to-end encryption for all sensitive data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>TLS 1.3 for data in transit</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>AES-256 encryption for data at rest</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Regular security audits and penetration testing</span>
                </li>
              </ul>
            </section>

            <section className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Authentication & Access Control
                </h2>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Multi-factor authentication (MFA) support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>OAuth 2.0 and OpenID Connect</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Role-based access control (RBAC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Session management and automatic logout</span>
                </li>
              </ul>
            </section>

            <section className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Infrastructure Security
                </h2>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Cloud infrastructure with 99.9% uptime SLA</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Automated backups and disaster recovery</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>DDoS protection and rate limiting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Continuous monitoring and alerting</span>
                </li>
              </ul>
            </section>

            <section className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Privacy & Compliance
                </h2>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>GDPR and CCPA compliant</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>SOC 2 Type II certified</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Regular third-party security audits</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Data residency options available</span>
                </li>
              </ul>
            </section>

            <section className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Report a Security Issue
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    If you discover a security vulnerability, please report it to our security team immediately.
                  </p>
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-gray-900 dark:text-white font-medium mb-1">Security Team</p>
                    <p className="text-gray-600 dark:text-gray-400">Email: security@aiinterviewpro.com</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                      We take all security reports seriously and will respond within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
