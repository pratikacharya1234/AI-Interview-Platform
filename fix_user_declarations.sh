#!/bin/bash
FILES=(
  "src/app/api/learning-path/route.ts"
  "src/app/api/mentor/route.ts"
  "src/app/api/resume/route.ts"
  "src/app/api/video-interview/start/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Remove the problematic lines that create duplicate user declaration
    sed -i '/const { data: user }/,/if (!user)/d' "$file"
    # Add userId = user.id after requireAuth
    sed -i '/const user = await requireAuth()/a\    const userId = user.id' "$file"
  fi
done
