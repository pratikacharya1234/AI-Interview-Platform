#!/bin/bash

# NextAuth to Supabase Migration Script
# This script automates the removal of NextAuth and updates to Supabase Auth

set -e

echo "🚀 Starting NextAuth to Supabase migration..."
echo "⚠️  Make sure you have committed your changes before running this script!"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# Create backup branch
echo "📦 Creating backup branch..."
git checkout -b backup-before-auth-migration-$(date +%Y%m%d-%H%M%S)
git push origin HEAD
git checkout main

# 1. Delete NextAuth files
echo "🗑️  Deleting NextAuth files..."
rm -f src/app/api/auth/\[...nextauth\]/route.ts
rm -f src/app/api/auth/debug/route.ts
rm -f src/lib/auth.ts
rm -f src/lib/auth-unified.ts

# 2. Update API routes - Replace getServerSession with requireAuth
echo "🔧 Updating API routes..."

# List of API route files that use NextAuth
API_FILES=(
  "src/app/api/gamification/route.ts"
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

for file in "${API_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Updating $file..."

    # Remove NextAuth imports
    sed -i "s/import { getServerSession } from 'next-auth\/next'//g" "$file"
    sed -i "s/import { getServerSession } from 'next-auth'//g" "$file"
    sed -i "/import.*authOptions.*from.*@\/lib\/auth/d" "$file"

    # Add Supabase auth import
    if ! grep -q "import { requireAuth } from '@/lib/auth/supabase-auth'" "$file"; then
      sed -i "1i import { requireAuth } from '@/lib/auth/supabase-auth'" "$file"
    fi

    # Replace getServerSession calls
    sed -i "s/const session = await getServerSession(authOptions)/const user = await requireAuth()/g" "$file"
    sed -i "s/const session = await getServerSession()/const user = await requireAuth()/g" "$file"

    # Replace session checks
    sed -i "s/if (!session)/if (!user)/g" "$file"
    sed -i "s/if (!session?.user)/if (!user)/g" "$file"

    # Replace user ID access patterns
    sed -i "s/session.user.id/user.id/g" "$file"
    sed -i "s/session.user.email/user.email/g" "$file"
    sed -i "s/session?.user?.id/user.id/g" "$file"
    sed -i "s/session?.user?.email/user.email/g" "$file"
  fi
done

# 3. Update client components
echo "🔧 Updating client components..."

CLIENT_FILES=(
  "src/components/VideoInterviewNew.tsx"
  "src/components/AIInterviewComponent.tsx"
  "src/components/navigation/landing-navigation.tsx"
  "src/contexts/AIFeaturesContext.tsx"
)

for file in "${CLIENT_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Updating $file..."

    # Remove NextAuth imports
    sed -i "s/import { useSession } from 'next-auth\/react'//g" "$file"
    sed -i "s/import { useSession, signIn } from 'next-auth\/react'//g" "$file"
    sed -i "s/import { signIn } from 'next-auth\/react'//g" "$file"

    # Add Supabase provider import
    if ! grep -q "import { useSupabase } from '@/components/providers/supabase-provider'" "$file"; then
      sed -i "1i import { useSupabase } from '@/components/providers/supabase-provider'" "$file"
    fi

    # Replace useSession hook
    sed -i "s/const { data: session } = useSession()/const { user, loading } = useSupabase()/g" "$file"
    sed -i "s/const { data: session, status } = useSession()/const { user, loading } = useSupabase()/g" "$file"

    # Replace session references
    sed -i "s/session?.user/user/g" "$file"
    sed -i "s/session.user/user/g" "$file"
    sed -i "s/status === 'loading'/loading/g" "$file"
    sed -i "s/status === 'authenticated'/!!user/g" "$file"
    sed -i "s/status === 'unauthenticated'/!user/g" "$file"
  fi
done

# 4. Update package.json - remove next-auth
echo "📦 Updating package.json..."
npm uninstall next-auth || true

# 5. Clean up comments and temporary code
echo "🧹 Cleaning up migration comments..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "/NextAuth migration/d" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "/Temporarily disabled for NextAuth/d" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "/Removed for NextAuth migration/d" {} +

# 6. Format code
echo "✨ Formatting code..."
npm run format || npx prettier --write "src/**/*.{ts,tsx}" || true

# 7. Check for remaining NextAuth references
echo "🔍 Checking for remaining NextAuth references..."
echo ""
echo "=== Remaining 'next-auth' imports ==="
grep -r "from 'next-auth" src/ || echo "✅ None found!"
echo ""
echo "=== Remaining 'NextAuth' references ==="
grep -r "NextAuth" src/ || echo "✅ None found!"
echo ""
echo "=== Remaining 'getServerSession' calls ==="
grep -r "getServerSession" src/ || echo "✅ None found!"
echo ""
echo "=== Remaining 'useSession' from next-auth ==="
grep -r "useSession.*next-auth" src/ || echo "✅ None found!"
echo ""

# 8. Try to build
echo "🔨 Testing build..."
if npm run build; then
  echo "✅ Build successful!"
else
  echo "⚠️  Build failed. Please fix errors manually."
  exit 1
fi

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff"
echo "2. Test authentication flow manually"
echo "3. Update environment variables (remove NEXTAUTH_*)"
echo "4. Commit changes: git add -A && git commit -m 'Migrate from NextAuth to Supabase Auth'"
echo "5. Deploy to Vercel"
echo ""
echo "📝 See MIGRATION_PLAN.md for detailed next steps"
