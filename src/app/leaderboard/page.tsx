'use client'

import LeaderboardDisplay from '@/components/leaderboard/LeaderboardDisplay'
import StreakWidget from '@/components/streak/StreakWidget'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="streak">My Streak</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leaderboard" className="space-y-6">
          <LeaderboardDisplay />
        </TabsContent>
        
        <TabsContent value="streak" className="space-y-6">
          <div className="max-w-4xl mx-auto">
            <StreakWidget />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
