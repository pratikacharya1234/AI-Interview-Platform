// @ts-nocheck
// This is a Supabase Edge Function (Deno runtime), not a regular TypeScript file
// VSCode errors can be ignored - this runs on Supabase's servers, not in Next.js
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserScore {
  user_id: string
  ai_accuracy_score: number
  communication_score: number
  completion_rate: number
  performance_score: number
  last_activity_timestamp: string
  country_code?: string
}

interface UserStreak {
  user_id: string
  streak_count: number
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calculate performance scores and rankings
    const { data: userScores, error: scoresError } = await supabase
      .from('user_scores')
      .select('*')
      .gt('total_interviews', 0)
      .order('performance_score', { ascending: false })

    if (scoresError) throw scoresError

    // Get user streaks
    const { data: userStreaks, error: streaksError } = await supabase
      .from('user_streaks')
      .select('user_id, streak_count')

    if (streaksError) throw streaksError

    // Create a map of user streaks
    const streakMap = new Map(
      userStreaks?.map(s => [s.user_id, s.streak_count]) || []
    )

    // Calculate adjusted scores and rankings
    const rankedUsers = userScores?.map((user: UserScore) => {
      const streakCount = streakMap.get(user.user_id) || 0
      const streakBonus = Math.min(streakCount * 0.05, 0.5)
      const adjustedScore = user.performance_score * (1 + streakBonus)
      
      return {
        ...user,
        streak_count: streakCount,
        streak_bonus: streakBonus,
        adjusted_score: adjustedScore
      }
    }).sort((a, b) => {
      // Sort by adjusted score, then by last activity (tie-breaker)
      if (b.adjusted_score !== a.adjusted_score) {
        return b.adjusted_score - a.adjusted_score
      }
      return new Date(b.last_activity_timestamp).getTime() - 
             new Date(a.last_activity_timestamp).getTime()
    })

    // Get previous rankings for rank change calculation
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    const { data: previousRanks } = await supabase
      .from('leaderboard_cache')
      .select('user_id, global_rank')
      .eq('cache_date', yesterday)

    const previousRankMap = new Map(
      previousRanks?.map(r => [r.user_id, r.global_rank]) || []
    )

    // Clear today's cache
    await supabase
      .from('leaderboard_cache')
      .delete()
      .eq('cache_date', today)

    // Insert new rankings
    const cacheEntries = rankedUsers?.map((user, index) => {
      const rank = index + 1
      const previousRank = previousRankMap.get(user.user_id)
      
      return {
        user_id: user.user_id,
        username: 'User', // This should be fetched from profiles
        global_rank: rank,
        previous_rank: previousRank || rank,
        performance_score: user.performance_score,
        adjusted_score: user.adjusted_score,
        streak_bonus: user.streak_bonus,
        streak_count: user.streak_count,
        country_code: user.country_code,
        badge_level: getBadgeLevel(user.performance_score),
        last_activity_timestamp: user.last_activity_timestamp,
        cache_date: today
      }
    }) || []

    if (cacheEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('leaderboard_cache')
        .insert(cacheEntries)

      if (insertError) throw insertError

      // Update leaderboard history
      const historyEntries = cacheEntries.map(entry => ({
        user_id: entry.user_id,
        rank_date: today,
        global_rank: entry.global_rank,
        performance_score: entry.performance_score,
        adjusted_score: entry.adjusted_score,
        streak_count: entry.streak_count
      }))

      await supabase
        .from('leaderboard_history')
        .upsert(historyEntries, { onConflict: 'user_id,rank_date' })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Leaderboard updated with ${cacheEntries.length} users`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error updating leaderboard:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function getBadgeLevel(score: number): string {
  if (score >= 90) return 'diamond'
  if (score >= 80) return 'platinum'
  if (score >= 70) return 'gold'
  if (score >= 60) return 'silver'
  return 'bronze'
}
