'use client'

import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Newspaper, Download, Mail, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PressPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Press Kit
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Media resources and company information
            </p>
          </div>

          <div className="space-y-8">
            <section className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Newspaper className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Company Overview
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                AI Interview Pro is the leading AI-powered interview preparation platform, helping professionals worldwide land their dream jobs with confidence. Founded in 2024, we've helped over 50,000 users improve their interview skills through personalized AI coaching.
              </p>
            </section>

            <section className="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Brand Assets
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Logo Package (PNG, SVG)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Brand Guidelines (PDF)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Product Screenshots
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Executive Photos
                </Button>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Media Contact
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                For press inquiries, interviews, or partnership opportunities:
              </p>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white font-medium">Press Relations</p>
                <p className="text-gray-600 dark:text-gray-400">Email: press@aiinterviewpro.com</p>
                <p className="text-gray-600 dark:text-gray-400">Phone: +1 (555) 123-4567</p>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
