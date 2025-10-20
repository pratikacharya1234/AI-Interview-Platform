'use client'

import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { FileText, Scale, AlertCircle, Shield, Users, Ban } from 'lucide-react'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 mb-6">
              <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Legal Agreement
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Terms of Service
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
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  By accessing or using AI Interview Pro ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  2. Service Description
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  AI Interview Pro provides:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>AI-powered interview preparation and practice</li>
                  <li>Voice, video, and text-based interview simulations</li>
                  <li>Personalized feedback and performance analytics</li>
                  <li>Learning resources and career development tools</li>
                  <li>Community features and mentorship opportunities</li>
                </ul>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  3. User Accounts
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  3.1 Account Creation
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>You must be at least 16 years old to create an account</li>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>You are responsible for all activities under your account</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  3.2 Account Termination
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities.
                </p>
              </section>

              {/* Acceptable Use */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  4. Acceptable Use Policy
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  You agree NOT to:
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Share your account with others</li>
                  <li>Upload malicious code or viruses</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Scrape or copy content without permission</li>
                  <li>Reverse engineer or decompile our software</li>
                  <li>Use automated tools to access the platform</li>
                </ul>
              </section>

              {/* Subscription and Payment */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  5. Subscription and Payment
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  5.1 Pricing
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Subscription fees are billed in advance on a monthly or annual basis. Prices are subject to change with 30 days notice.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  5.2 Free Trial
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  New users may be eligible for a free trial period. You will not be charged until the trial ends unless you cancel.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  5.3 Refunds
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Refunds are provided on a case-by-case basis within 14 days of purchase. Contact support@aiinterviewpro.com for refund requests.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  5.4 Cancellation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You may cancel your subscription at any time. Access continues until the end of your billing period.
                </p>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  6. Intellectual Property
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  6.1 Our Content
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All content, features, and functionality are owned by AI Interview Pro and protected by copyright, trademark, and other intellectual property laws.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  6.2 Your Content
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You retain ownership of content you create. By using our platform, you grant us a license to use, store, and process your content to provide our services.
                </p>
              </section>

              {/* AI-Generated Content */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                  7. AI-Generated Content
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Our platform uses artificial intelligence to provide feedback and recommendations:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                  <li>AI feedback is for educational purposes only</li>
                  <li>Results may vary and are not guaranteed</li>
                  <li>AI analysis should not replace professional career advice</li>
                  <li>We continuously improve our AI models but cannot guarantee 100% accuracy</li>
                </ul>
              </section>

              {/* Disclaimers */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  8. Disclaimers and Limitations
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  8.1 No Guarantee of Results
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  While we strive to provide valuable interview preparation, we do not guarantee job offers or interview success.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  8.2 Service Availability
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We aim for 99.9% uptime but do not guarantee uninterrupted service. Maintenance and updates may cause temporary disruptions.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                  8.3 Third-Party Services
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We integrate with third-party services (payment processors, AI providers). We are not responsible for their availability or performance.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  9. Limitation of Liability
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  To the maximum extent permitted by law, AI Interview Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.
                </p>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  10. Indemnification
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  You agree to indemnify and hold harmless AI Interview Pro from any claims, damages, or expenses arising from your violation of these terms or misuse of the platform.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  11. Governing Law
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  These terms are governed by the laws of the State of California, USA, without regard to conflict of law principles.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  12. Changes to Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  We may modify these terms at any time. Significant changes will be communicated via email or platform notification. Continued use after changes constitutes acceptance.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  13. Contact Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  For questions about these Terms of Service, contact us:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                  <p className="text-gray-900 dark:text-white font-medium mb-2">AI Interview Pro</p>
                  <p className="text-gray-600 dark:text-gray-400">Email: legal@aiinterviewpro.com</p>
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
