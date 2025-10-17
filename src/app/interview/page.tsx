'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Mic, 
  Bot, 
  Sparkles, 
  Clock, 
  BarChart3,
  ArrowRight,
  Zap,
  Image as ImageIcon,
  Volume2
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function InterviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading interview page...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const user = session?.user
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Choose Your Interview Experience</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Practice with our advanced AI interviewer using cutting-edge technology. Get ready for your next opportunity with personalized feedback and real-time analysis.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Conversational AI Interview */}
          <Card className="relative overflow-hidden border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-4 right-4">
              <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Latest
              </Badge>
            </div>
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">
                    Conversational AI Interview
                  </CardTitle>
                  <CardDescription className="text-base">
                    Realistic voice-to-voice interview experience
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">AI speaks questions aloud with natural voice</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mic className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Respond naturally by speaking your answers</span>
                </div>
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">AI-generated performance visualization</span>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Comprehensive analysis with pros and cons</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Real-time conversation flow</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Perfect For:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Practicing natural conversation skills</li>
                  <li>• Improving verbal communication</li>
                  <li>• Realistic interview simulation</li>
                  <li>• Getting comfortable with speaking</li>
                </ul>
              </div>

              <Link href="/interview/conversational" className="block">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start Conversational Interview
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Traditional Text Interview */}
          <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">
                    Text-Based Interview
                  </CardTitle>
                  <CardDescription className="text-base">
                    Classic written interview practice
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Read questions and type your responses</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Quick and focused practice sessions</span>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Detailed written feedback and scoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Work at your own pace</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Perfect For:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Structured answer preparation</li>
                  <li>• Quiet practice environments</li>
                  <li>• Detailed written analysis</li>
                  <li>• Focused skill development</li>
                </ul>
              </div>

              <Link href="/interview/text" className="block">
                <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start Text Interview
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Feature Comparison
          </h2>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Conversational AI</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Text-Based</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Voice Interaction</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Full Support
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Text Only
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">AI-Generated Images</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Leonardo AI
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not Available
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Natural Speech</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ElevenLabs
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not Available
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Real-time Analysis</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Live Processing
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Post-Submit
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Detailed Feedback</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Comprehensive
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Detailed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  )
}