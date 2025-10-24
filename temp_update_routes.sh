#!/bin/bash

# Batch update API routes from NextAuth to Supabase

# List of files to update
FILES=(
  "src/app/api/ai/coaching/route.ts"
  "src/app/api/ai/feedback/route.ts"
  "src/app/api/ai/voice/route.ts"
  "src/app/api/ai/metrics/route.ts"
  "src/app/api/ai/prep/route.ts"
  "src/app/api/analytics/route.ts"
  "src/app/api/mentor/route.ts"
  "src/app/api/company/route.ts"
  "src/app/api/persona/route.ts"
  "src/app/api/interview/history/route.ts"
  "src/app/api/interview/save/route.ts"
  "src/app/api/voice-analysis/route.ts"
  "src/app/api/speech-to-text/route.ts"
  "src/app/api/system-check/route.ts"
  "src/app/api/video-interview/report/[reportId]/route.ts"
  "src/app/api/video-interview/initial-question/route.ts"
  "src/app/api/video-interview/metrics/route.ts"
  "src/app/api/video-interview/end/route.ts"
  "src/app/api/video-interview/process/route.ts"
  "src/app/api/video-interview/start/route.ts"
  "src/app/api/learning-path/route.ts"
  "src/app/api/resume/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    
    # Remove NextAuth imports
    sed -i "/import.*getServerSession.*from.*next-auth/d" "$file"
    sed -i "/import.*authOptions.*from/d" "$file"
    
    # Add Supabase auth import at top
    sed -i "1i import { requireAuth } from '@/lib/auth/supabase-auth'" "$file"
    
    # Replace getServerSession with requireAuth
    sed -i "s/const session = await getServerSession([^)]*)/const user = await requireAuth()/g" "$file"
    sed -i "s/const session = await getServerSession()/const user = await requireAuth()/g" "$file"
    
    # Replace session checks
    sed -i "s/if (!session)/if (!user)/g" "$file"
    sed -i "s/if (!session?.user)/if (!user)/g" "$file"
    sed -i "s/!session?.user\.email/!user/g" "$file"
    sed -i "s/!session\.user\.email/!user/g" "$file"
    
    # Replace user access
    sed -i "s/session\.user\.id/user.id/g" "$file"
    sed -i "s/session\.user\.email/user.email/g" "$file"
    sed -i "s/session?.user?.id/user.id/g" "$file"
    sed -i "s/session?.user?.email/user.email/g" "$file"
  fi
done

echo "Done updating API routes!"
