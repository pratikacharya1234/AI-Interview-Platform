'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Database, Server, User, Activity } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
}

export default function TestConnectionPage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    setTests([])

    // Test 1: Check API health
    await testAPI('API Health Check', '/api/health')
    
    // Test 2: Get interviews
    await testAPI('Fetch Interviews', '/api/interview')
    
    // Test 3: Get leaderboard
    await testAPI('Fetch Leaderboard', '/api/leaderboard?page=1&limit=10')
    
    // Test 4: Get streaks
    await testAPI('Fetch Streaks', '/api/streaks')
    
    // Test 5: Create test interview
    await testAPI('Create Interview', '/api/interview', 'POST', {
      interview_type: 'test',
      title: 'Test Interview',
      description: 'Testing Supabase connection'
    })

    setTesting(false)
  }

  const testAPI = async (name: string, endpoint: string, method = 'GET', body?: any) => {
    setTests(prev => [...prev, { name, status: 'pending', message: 'Testing...' }])
    
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' }
      }
      
      if (body) {
        options.body = JSON.stringify(body)
      }
      
      const response = await fetch(endpoint, options)
      const data = await response.json()
      
      if (response.ok) {
        setTests(prev => prev.map(t => 
          t.name === name 
            ? { ...t, status: 'success', message: 'Connected successfully', data }
            : t
        ))
      } else {
        setTests(prev => prev.map(t => 
          t.name === name 
            ? { ...t, status: 'error', message: data.error || 'Failed to connect', data }
            : t
        ))
      }
    } catch (error) {
      setTests(prev => prev.map(t => 
        t.name === name 
          ? { ...t, status: 'error', message: error instanceof Error ? error.message : 'Connection failed' }
          : t
      ))
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Supabase Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Testing all API endpoints and database connections
            </p>
            <Button 
              onClick={runTests} 
              disabled={testing}
              size="sm"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run Tests'
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {tests.map((test, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getIcon(test.status)}
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm opacity-75">{test.message}</p>
                    </div>
                  </div>
                  {test.status === 'success' && test.data && (
                    <span className="text-xs bg-white px-2 py-1 rounded">
                      {JSON.stringify(test.data).substring(0, 50)}...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {tests.length === 0 && !testing && (
            <Alert>
              <AlertDescription>
                Click "Run Tests" to start testing your Supabase connection
              </AlertDescription>
            </Alert>
          )}

          {tests.length > 0 && !testing && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Success: {tests.filter(t => t.status === 'success').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Failed: {tests.filter(t => t.status === 'error').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-500" />
                  <span>Pending: {tests.filter(t => t.status === 'pending').length}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-6 h-6" />
            Environment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Supabase URL:</span>
              <span className="font-mono">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supabase Anon Key:</span>
              <span className="font-mono">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Build Status:</span>
              <span className="font-mono text-green-600">✅ Successful</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
