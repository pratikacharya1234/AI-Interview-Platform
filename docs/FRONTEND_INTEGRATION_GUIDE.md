# Frontend Integration Guide

## Overview

This guide shows how to update AI feature pages to use real data from the API instead of hardcoded mock data.

## Pattern to Follow

### 1. Import Required Hooks and Types

```typescript
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAIFeatures } from '@/contexts/AIFeaturesContext'
```

### 2. Set Up State Management

```typescript
export default function FeaturePage() {
  const { data: session } = useSession()
  const { refreshMetrics } = useAIFeatures()
  
  // Data state
  const [data, setData] = useState<YourDataType[]>([])
  
  // UI states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // ... rest of component
}
```

### 3. Fetch Data on Mount

```typescript
useEffect(() => {
  const fetchData = async () => {
    if (!session?.user?.email) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/your-endpoint')
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const data = await response.json()
      setData(data)
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }
  
  fetchData()
}, [session?.user?.email])
```

### 4. Handle Loading and Error States

```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

if (error) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold text-lg">Error Loading Data</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

if (data.length === 0) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-lg">No Data Yet</h3>
              <p className="text-muted-foreground">
                Start your first session to see data here
              </p>
            </div>
            <Button onClick={handleCreateNew}>
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 5. Create/Update Data

```typescript
const handleCreateSession = async (sessionData: any) => {
  setIsLoading(true)
  setError(null)
  
  try {
    const response = await fetch('/api/ai/your-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create_session',
        ...sessionData
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create session')
    }
    
    const newSession = await response.json()
    
    // Update local state
    setData(prev => [newSession, ...prev])
    
    // Refresh metrics
    await refreshMetrics()
    
    // Show success message
    toast.success('Session created successfully!')
  } catch (err: any) {
    console.error('Error creating session:', err)
    setError(err.message || 'Failed to create session')
    toast.error('Failed to create session')
  } finally {
    setIsLoading(false)
  }
}
```

## Example: AI Coach Page

Here's a complete example for the AI Coach page:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAIFeatures } from '@/contexts/AIFeaturesContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'

interface CoachingSession {
  id: string
  topic: string
  difficulty: string
  status: string
  completed_steps: number
  total_steps: number
  ai_insights: string[]
  last_activity: string
}

export default function AICoachPage() {
  const { data: session } = useSession()
  const { refreshMetrics } = useAIFeatures()
  
  const [sessions, setSessions] = useState<CoachingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      if (!session?.user?.email) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/ai/coaching')
        
        if (!response.ok) {
          throw new Error('Failed to fetch coaching sessions')
        }
        
        const data = await response.json()
        setSessions(data)
      } catch (err: any) {
        console.error('Error fetching coaching sessions:', err)
        setError(err.message || 'Failed to load coaching sessions')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSessions()
  }, [session?.user?.email])
  
  // Handle creating new session
  const handleCreateSession = async (sessionData: Partial<CoachingSession>) => {
    try {
      const response = await fetch('/api/ai/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_session',
          ...sessionData
        })
      })
      
      if (!response.ok) throw new Error('Failed to create session')
      
      const newSession = await response.json()
      setSessions(prev => [newSession, ...prev])
      await refreshMetrics()
    } catch (err: any) {
      console.error('Error creating session:', err)
      setError(err.message)
    }
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading coaching sessions...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">Error Loading Sessions</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Main content
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Interview Coach</h1>
        <Button onClick={() => handleCreateSession({
          topic: 'New Session',
          difficulty: 'Intermediate',
          total_steps: 6
        })}>
          Start New Session
        </Button>
      </div>
      
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No coaching sessions yet. Start your first session!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map(session => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle>{session.topic}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Progress: {session.completed_steps}/{session.total_steps}</p>
                <p>Status: {session.status}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Common Patterns

### Optimistic Updates

```typescript
const handleUpdate = async (id: string, updates: any) => {
  // Optimistically update UI
  setData(prev => prev.map(item => 
    item.id === id ? { ...item, ...updates } : item
  ))
  
  try {
    const response = await fetch(`/api/ai/your-endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, updates })
    })
    
    if (!response.ok) throw new Error('Update failed')
    
    const updated = await response.json()
    setData(prev => prev.map(item => 
      item.id === id ? updated : item
    ))
  } catch (err) {
    // Revert on error
    fetchData() // Re-fetch to get correct state
    setError('Failed to update')
  }
}
```

### Pagination

```typescript
const [page, setPage] = useState(1)
const [hasMore, setHasMore] = useState(true)

const fetchMore = async () => {
  const response = await fetch(`/api/ai/your-endpoint?page=${page + 1}`)
  const newData = await response.json()
  
  if (newData.length === 0) {
    setHasMore(false)
  } else {
    setData(prev => [...prev, ...newData])
    setPage(prev => prev + 1)
  }
}
```

### Real-time Updates

```typescript
useEffect(() => {
  // Poll for updates every 30 seconds
  const interval = setInterval(() => {
    fetchData()
  }, 30000)
  
  return () => clearInterval(interval)
}, [])
```

## Testing

### Test Loading State
```typescript
// Temporarily add delay in API route
await new Promise(resolve => setTimeout(resolve, 2000))
```

### Test Error State
```typescript
// Temporarily throw error in API route
throw new Error('Test error')
```

### Test Empty State
```typescript
// Return empty array from API
return NextResponse.json([])
```

## Best Practices

1. **Always handle loading states** - Users should know when data is being fetched
2. **Always handle error states** - Provide clear error messages and retry options
3. **Always handle empty states** - Guide users on what to do when no data exists
4. **Use optimistic updates** - Update UI immediately for better UX
5. **Refresh metrics** - Update global metrics after data changes
6. **Add success/error toasts** - Provide feedback for user actions
7. **Implement retry logic** - Allow users to retry failed operations
8. **Cache data when appropriate** - Reduce unnecessary API calls
9. **Debounce search/filter** - Avoid excessive API calls
10. **Clean up effects** - Prevent memory leaks with cleanup functions

## Checklist

- [ ] Remove all hardcoded mock data
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add empty states
- [ ] Implement data fetching
- [ ] Implement data creation
- [ ] Implement data updates
- [ ] Add success/error feedback
- [ ] Test all states (loading, error, empty, success)
- [ ] Update metrics after changes
- [ ] Add retry mechanisms
- [ ] Optimize performance

---

**Next Steps:** Apply this pattern to all AI feature pages (coach, voice, feedback, prep)
