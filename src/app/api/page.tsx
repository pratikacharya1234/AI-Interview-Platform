'use client'

import { useState } from 'react'
import Link from 'next/link'
import LandingNavigation from '@/components/landing/landing-navigation'
import Footer from '@/components/landing/footer'
import { Code, Terminal, Book, Key, Shield, Zap, Copy, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const apiEndpoints = [
  {
    method: 'GET',
    endpoint: '/api/interviews',
    description: 'List all interviews for the authenticated user'
  },
  {
    method: 'POST',
    endpoint: '/api/interviews',
    description: 'Create a new interview session'
  },
  {
    method: 'GET',
    endpoint: '/api/interviews/:id',
    description: 'Get details of a specific interview'
  },
  {
    method: 'POST',
    endpoint: '/api/interviews/:id/feedback',
    description: 'Get AI-generated feedback for an interview'
  },
  {
    method: 'GET',
    endpoint: '/api/analytics',
    description: 'Retrieve performance analytics and metrics'
  },
  {
    method: 'GET',
    endpoint: '/api/questions',
    description: 'Access question bank with filters'
  }
]

const codeExamples = {
  javascript: `// Initialize the AI Interview Pro client
const client = new AIInterviewPro({
  apiKey: 'your-api-key-here'
});

// Create a new interview session
const interview = await client.interviews.create({
  type: 'behavioral',
  role: 'software-engineer',
  level: 'senior'
});

// Get interview feedback
const feedback = await client.interviews.getFeedback(interview.id);
console.log(feedback.score, feedback.recommendations);`,
  
  python: `# Initialize the AI Interview Pro client
from aiinterviewpro import Client

client = Client(api_key='your-api-key-here')

# Create a new interview session
interview = client.interviews.create(
    type='behavioral',
    role='software-engineer',
    level='senior'
)

# Get interview feedback
feedback = client.interviews.get_feedback(interview.id)
print(f"Score: {feedback.score}")
print(f"Recommendations: {feedback.recommendations}")`,
  
  curl: `# Create a new interview session
curl -X POST https://api.aiinterviewpro.com/v1/interviews \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "behavioral",
    "role": "software-engineer",
    "level": "senior"
  }'

# Get interview feedback
curl https://api.aiinterviewpro.com/v1/interviews/{id}/feedback \\
  -H "Authorization: Bearer your-api-key-here"`
}

export default function APIPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'curl'>('javascript')
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExamples[selectedLanguage])
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800 mb-6">
              <Terminal className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Developer API
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Build with AI Interview Pro
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Integrate interview preparation capabilities into your applications with our powerful API
            </p>
          </div>

          {/* Quick Start */}
          <div className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Start</h2>
            
            {/* Language Selector */}
            <div className="flex gap-2 mb-6">
              {(['javascript', 'python', 'curl'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedLanguage === lang
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : 'cURL'}
                </button>
              ))}
            </div>

            {/* Code Example */}
            <div className="relative">
              <pre className="p-6 rounded-lg bg-gray-900 text-gray-100 overflow-x-auto">
                <code>{codeExamples[selectedLanguage]}</code>
              </pre>
              <button
                onClick={handleCopyCode}
                className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            <div className="mt-6 flex gap-4">
              <Link href="/docs/api">
                <Button>
                  <Book className="w-4 h-4 mr-2" />
                  View Documentation
                </Button>
              </Link>
              <Link href="/dashboard/settings/api">
                <Button variant="outline">
                  <Key className="w-4 h-4 mr-2" />
                  Get API Key
                </Button>
              </Link>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">API Endpoints</h2>
            <div className="space-y-4">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <span className={`px-3 py-1 rounded text-xs font-mono font-medium ${
                    endpoint.method === 'GET' 
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="flex-1 font-mono text-sm text-gray-700 dark:text-gray-300">
                    {endpoint.endpoint}
                  </code>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {endpoint.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
              API Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Real-time Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get instant AI feedback and analysis with sub-second response times
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Secure & Compliant
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  OAuth 2.0 authentication, encrypted data, and GDPR compliance
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Code className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  SDK Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Native libraries for JavaScript, Python, Ruby, and more
                </p>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="mb-16 p-8 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Rate Limits</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Free Tier</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>100 requests per day</li>
                  <li>10 requests per minute</li>
                  <li>Basic endpoints only</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pro Tier</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>10,000 requests per day</li>
                  <li>100 requests per minute</li>
                  <li>All endpoints available</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Enterprise</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Unlimited requests</li>
                  <li>Custom rate limits</li>
                  <li>Dedicated infrastructure</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-12 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Building?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get your API key and start integrating AI-powered interview preparation into your application today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact?type=enterprise">
                <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
