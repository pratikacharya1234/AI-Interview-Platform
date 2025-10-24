#!/usr/bin/env python3
"""
Fix NextAuth to Supabase migration in API routes
"""

import re
import sys

def fix_api_route(filepath):
    """Fix a single API route file"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        # Remove NextAuth imports
        content = re.sub(r"import\s+{\s*getServerSession\s*}\s+from\s+['\"]next-auth[/\w-]*['\"][\s\n]*", "", content)
        content = re.sub(r"import\s+.*authOptions.*from.*[\s\n]*", "", content)

        # Add Supabase auth import if not present
        if "requireAuth" not in content and "getServerSession" in content:
            content = "import { requireAuth } from '@/lib/auth/supabase-auth'\n" + content

        # Fix the pattern: getServerSession() -> requireAuth()
        content = re.sub(
            r"const\s+session\s*=\s*await\s+getServerSession\([^)]*\)",
            "const user = await requireAuth()",
            content
        )

        # Fix pattern: if (!session?.user?.email)
        content = re.sub(r"if\s*\(\s*!session\?\.user\?\.email\s*\)", "if (!user)", content)
        content = re.sub(r"if\s*\(\s*!session\.user\.email\s*\)", "if (!user)", content)
        content = re.sub(r"if\s*\(\s*!session\?\.user\s*\)", "if (!user)", content)

        # Remove duplicate user declarations from Supabase queries
        # Pattern: const { data: user } = await supabase...
        content = re.sub(
            r"const\s*{\s*data:\s*user\s*}\s*=\s*await\s+supabase\s*\.from\(['\"]users['\"]\)[\s\S]*?\.single\(\)[\s\n]*if\s*\(\s*!user\s*\)[\s\S]*?}\s*\n",
            "",
            content
        )

        # Replace session.user.id with user.id
        content = re.sub(r"session\?\.user\?\.id", "user.id", content)
        content = re.sub(r"session\.user\.id", "user.id", content)
        content = re.sub(r"session\?\.user\?\.email", "user.email", content)
        content = re.sub(r"session\.user\.email", "user.email", content)

        with open(filepath, 'w') as f:
            f.write(content)

        print(f"✓ Fixed {filepath}")
        return True
    except Exception as e:
        print(f"✗ Error fixing {filepath}: {e}")
        return False

# Files to fix
files = [
    "src/app/api/learning-path/route.ts",
    "src/app/api/mentor/route.ts",
    "src/app/api/voice-analysis/route.ts",
]

print("Fixing API routes...")
success_count = 0
for file in files:
    if fix_api_route(file):
        success_count += 1

print(f"\nFixed {success_count}/{len(files)} files")
sys.exit(0 if success_count == len(files) else 1)
