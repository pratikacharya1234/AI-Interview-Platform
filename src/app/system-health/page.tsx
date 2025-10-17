'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  Cpu,
  Globe,
  Shield,
  Activity
} from 'lucide-react'

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/system-check')
      if (!response.ok) {
        throw new Error('Failed to fetch system health')
      }
      
      const data = await response.json()
      setHealthData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'working':
      case 'available':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
      case 'limited':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'critical':
      case 'error':
      case 'missing':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === 'healthy' || status === 'connected' || status === 'working' ? 'success' :
                   status === 'degraded' || status === 'limited' ? 'warning' :
                   status === 'critical' || status === 'error' ? 'destructive' : 'secondary'
    
    return <Badge variant={variant as any}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Checking system health...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to fetch system health: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!healthData) {
    return null
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Health</h1>
            <p className="text-muted-foreground">
              Monitor the status of all system components and services
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last checked</p>
              <p className="text-sm font-medium">
                {new Date(healthData.timestamp).toLocaleString()}
              </p>
            </div>
            <Button onClick={fetchHealthData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {getStatusIcon(healthData.status)}
            <div>
              <p className="text-2xl font-bold capitalize">{healthData.status}</p>
              <p className="text-sm text-muted-foreground">
                {healthData.status === 'healthy' ? 'All systems operational' :
                 healthData.status === 'degraded' ? 'Some services may be limited' :
                 'Critical services are unavailable'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Services Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Core Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthData.services && Object.entries(healthData.services).map(([service, info]: [string, any]) => (
              <div key={service} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(info.status)}
                  <span className="font-medium capitalize">{service}</span>
                </div>
                {getStatusBadge(info.status)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* API Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              API Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthData.apis && Object.entries(healthData.apis).map(([api, info]: [string, any]) => (
              <div key={api} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(info.configured ? info.status : 'missing')}
                  <span className="font-medium capitalize">{api}</span>
                </div>
                {info.configured ? getStatusBadge(info.status) : 
                 <Badge variant="outline">Not configured</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Database Tables */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Tables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthData.database && Object.entries(healthData.database).map(([table, info]: [string, any]) => (
              <div key={table} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(info.exists ? 'connected' : 'missing')}
                  <div>
                    <p className="font-medium text-sm">{table}</p>
                    {info.exists && (
                      <p className="text-xs text-muted-foreground">
                        {info.count} records
                      </p>
                    )}
                  </div>
                </div>
                {!info.exists && (
                  <Badge variant="destructive" className="text-xs">Missing</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Feature Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {healthData.features && Object.entries(healthData.features).map(([feature, info]: [string, any]) => (
              <div key={feature} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(info.status)}
                  <div>
                    <p className="font-medium text-sm capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    {info.dependencies && (
                      <p className="text-xs text-muted-foreground">
                        Requires: {info.dependencies.join(', ')}
                      </p>
                    )}
                    {info.note && (
                      <p className="text-xs text-muted-foreground">{info.note}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(info.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {healthData.recommendations && healthData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Actions to improve system health and functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {healthData.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
