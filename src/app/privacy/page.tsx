'use client'

import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 mb-6">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Your Privacy Matters
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Last updated: October 19, 2024
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  1. Introduction
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  AI Interview Pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered interview preparation platform.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Database className="w-6 h-6 text-blue-600" />
                  2. Information We Collect
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  2.1 Personal Information
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Name and email address</li>
                  <li>Profile information (job title, experience level, skills)</li>
                  <li>Account credentials</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  2.2 Interview Data
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Voice recordings and transcripts</li>
                  <li>Video recordings (if enabled)</li>
                  <li>Interview responses and answers</li>
                  <li>Performance metrics and feedback</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  2.3 Usage Information
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Device information and IP address</li>
                  <li>Browser type and version</li>
                  <li>Usage patterns and preferences</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                  3. How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Provide and improve our interview preparation services</li>
                  <li>Generate AI-powered feedback and recommendations</li>
                  <li>Personalize your learning experience</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Send important updates and notifications</li>
                  <li>Analyze usage patterns to enhance our platform</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-blue-600" />
                  4. Data Security
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>End-to-end encryption for sensitive data</li>
                  <li>Secure data storage with regular backups</li>
                  <li>Access controls and authentication</li>
                  <li>Regular security audits and updates</li>
                  <li>Compliance with GDPR, CCPA, and other regulations</li>
                </ul>
              </section>

              {/* Data Sharing */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-blue-600" />
                  5. Data Sharing and Disclosure
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We do not sell your personal information. We may share your data only in these circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform (e.g., cloud hosting, payment processing)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                </ul>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  6. Your Rights
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You have the following rights regarding your personal data:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  7. Cookies and Tracking
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze platform usage and performance</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Ensure platform security</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                  You can control cookies through your browser settings. See our <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a> for more details.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Children's Privacy
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Our platform is not intended for users under 16 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  9. International Data Transfers
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in compliance with applicable laws.
                </p>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  10. Changes to This Policy
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through our platform. Your continued use of our services after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  11. Contact Us
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If you have questions about this Privacy Policy or want to exercise your rights, please contact us:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                  <p className="text-gray-900 dark:text-white font-medium mb-2">AI Interview Pro</p>
                  <p className="text-gray-600 dark:text-gray-400">Email: privacy@aiinterviewpro.com</p>
                  <p className="text-gray-600 dark:text-gray-400">Address: 123 Tech Street, San Francisco, CA 94105</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
