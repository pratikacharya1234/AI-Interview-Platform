#!/bin/bash

# Update client components from NextAuth to Supabase

FILES=(
  "src/components/VideoInterviewNew.tsx"
  "src/components/AIInterviewComponent.tsx"
  "src/components/navigation/landing-navigation.tsx"
  "src/contexts/AIFeaturesContext.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    
    # Remove NextAuth imports
    sed -i "/import.*useSession.*from.*next-auth\/react/d" "$file"
    sed -i "/import.*signIn.*from.*next-auth\/react/d" "$file"
    
    # Add Supabase provider import
    sed -i "1i import { useSupabase } from '@/components/providers/supabase-provider'" "$file"
    
    # Replace useSession hook
    sed -i "s/const { data: session, status } = useSession()/const { user, loading } = useSupabase()/g" "$file"
    sed -i "s/const { data: session } = useSession()/const { user, loading } = useSupabase()/g" "$file"
    
    # Replace session references
    sed -i "s/session?.user/user/g" "$file"
    sed -i "s/session\.user/user/g" "$file"
    sed -i "s/status === 'loading'/loading/g" "$file"
    sed -i "s/status === 'authenticated'/!!user \&\& !loading/g" "$file"
    sed -i "s/status === 'unauthenticated'/!user \&\& !loading/g" "$file"
  fi
done

echo "Done updating client components!"
