'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award, ChevronLeft, ChevronRight, Globe, Filter, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LeaderboardUser {
  user_id: string
  username: string
  avatar_url?: string
  global_rank: number
  previous_rank?: number
  rank_change: number
  performance_score: number
  adjusted_score: number
  streak_bonus: number
  streak_count: number
  country_code?: string
  country_name?: string
  badge_level: string
  last_activity_timestamp: string
  profiles?: {
    username: string
    avatar_url?: string
    full_name?: string
  }
}

interface UserPosition {
  rank: number
  score: number
  streak: number
  badge: string
  rankChange: number
}

export default function LeaderboardDisplay() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [timeframe, setTimeframe] = useState('all')
  const [country, setCountry] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredRank, setHoveredRank] = useState<number | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [page, timeframe, country])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        timeframe,
        ...(country !== 'all' && { country })
      })

      const response = await fetch(`/api/leaderboard?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLeaderboard(data.leaderboard)
        setTotalPages(data.pagination.totalPages)
        setUserPosition(data.userPosition)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />
      default:
        return null
    }
  }

  const getRankChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'diamond':
        return 'bg-gradient-to-r from-blue-400 to-purple-400 text-white'
      case 'platinum':
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
      case 'silver':
        return 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800'
      default:
        return 'bg-gradient-to-r from-orange-300 to-orange-400 text-white'
    }
  }

  const topThree = leaderboard.slice(0, 3)
  const restOfLeaderboard = leaderboard.slice(3)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Global Leaderboard
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compete with interview masters from around the world
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-40">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Position Sticky Banner */}
      {userPosition && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-20 z-10"
        >
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your Rank</p>
                    <p className="text-2xl font-bold">#{userPosition.rank}</p>
                  </div>
                  <div className="h-12 w-px bg-gray-300 dark:bg-gray-700" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                    <p className="text-2xl font-bold">{userPosition.score}</p>
                  </div>
                  <div className="h-12 w-px bg-gray-300 dark:bg-gray-700" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      {userPosition.streak}
                      <Sparkles className="w-4 h-4 text-orange-500" />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRankChangeIcon(userPosition.rankChange)}
                  <span className={cn(
                    "text-sm font-medium",
                    userPosition.rankChange > 0 ? "text-green-500" : 
                    userPosition.rankChange < 0 ? "text-red-500" : "text-gray-500"
                  )}>
                    {Math.abs(userPosition.rankChange)} places
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top 3 Highlight Cards */}
      {!loading && topThree.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {topThree.map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <Card className={cn(
                "relative overflow-hidden",
                index === 0 && "ring-2 ring-yellow-500 ring-offset-2"
              )}>
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-shift" />
                
                <CardContent className="relative p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    {getRankIcon(user.global_rank)}
                  </div>
                  
                  <Avatar className="w-20 h-20 mx-auto ring-4 ring-white dark:ring-gray-800">
                    <AvatarImage src={user.profiles?.avatar_url || user.avatar_url} />
                    <AvatarFallback>
                      {(user.profiles?.username || user.username || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-bold text-lg">
                      {user.profiles?.username || user.username}
                    </h3>
                    <Badge className={getBadgeColor(user.badge_level)}>
                      {user.badge_level}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Score</span>
                      <span className="font-bold">{user.adjusted_score.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Streak</span>
                      <span className="font-bold flex items-center gap-1">
                        {user.streak_count}
                        <Sparkles className="w-3 h-3 text-orange-500" />
                      </span>
                    </div>
                    {user.country_name && (
                      <div className="flex justify-center items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Globe className="w-3 h-3" />
                        {user.country_name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rest of Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            <AnimatePresence>
              {loading ? (
                // Loading skeletons
                [...Array(10)].map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))
              ) : (
                restOfLeaderboard.map((user, index) => (
                  <motion.div
                    key={user.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredRank(user.global_rank)}
                    onMouseLeave={() => setHoveredRank(null)}
                    className={cn(
                      "p-4 flex items-center justify-between transition-colors",
                      hoveredRank === user.global_rank && "bg-gray-50 dark:bg-gray-900"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center">
                        <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                          #{user.global_rank}
                        </span>
                      </div>
                      
                      <Avatar>
                        <AvatarImage src={user.profiles?.avatar_url || user.avatar_url} />
                        <AvatarFallback>
                          {(user.profiles?.username || user.username || 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-medium">
                          {user.profiles?.username || user.username}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Badge variant="outline" className="text-xs">
                            {user.badge_level}
                          </Badge>
                          {user.country_name && (
                            <>
                              <span>•</span>
                              <span>{user.country_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-lg">{user.adjusted_score.toFixed(1)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          +{(user.streak_bonus * 100).toFixed(0)}% bonus
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{user.streak_count}</span>
                        <Sparkles className="w-4 h-4 text-orange-500" />
                      </div>
                      
                      <div className="flex items-center gap-1 w-20 justify-end">
                        {getRankChangeIcon(user.rank_change)}
                        <span className={cn(
                          "text-sm",
                          user.rank_change > 0 ? "text-green-500" : 
                          user.rank_change < 0 ? "text-red-500" : "text-gray-500"
                        )}>
                          {Math.abs(user.rank_change)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-10 h-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = i + 1
            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? "primary" : "outline"}
                size="sm"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}
          {totalPages > 5 && (
            <>
              <span className="px-2">...</span>
              <Button
                variant={page === totalPages ? "primary" : "outline"}
                size="sm"
                onClick={() => setPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-10 h-10"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
