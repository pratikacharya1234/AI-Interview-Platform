#!/bin/bash

# Migration Script: NextAuth → Supabase Auth
# Run this script to automate the migration process

echo "🔄 AI Interview Platform - Supabase Auth Migration"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${BLUE}📦 Step 1: Installing Supabase Auth Helpers...${NC}"
npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Step 2: Backup existing files
echo -e "${BLUE}💾 Step 2: Backing up existing files...${NC}"

# Backup middleware
if [ -f "middleware.ts" ]; then
    cp middleware.ts middleware-nextauth-backup.ts
    echo -e "${GREEN}✅ Backed up middleware.ts${NC}"
fi

# Backup layout
if [ -f "src/app/layout.tsx" ]; then
    cp src/app/layout.tsx src/app/layout-nextauth-backup.tsx
    echo -e "${GREEN}✅ Backed up layout.tsx${NC}"
fi

# Backup modern-layout
if [ -f "src/components/layout/modern-layout.tsx" ]; then
    cp src/components/layout/modern-layout.tsx src/components/layout/modern-layout-nextauth-backup.tsx
    echo -e "${GREEN}✅ Backed up modern-layout.tsx${NC}"
fi
echo ""

# Step 3: Replace files
echo -e "${BLUE}🔄 Step 3: Replacing files with Supabase versions...${NC}"

# Replace middleware
if [ -f "middleware-supabase.ts" ]; then
    cp middleware-supabase.ts middleware.ts
    echo -e "${GREEN}✅ Updated middleware.ts${NC}"
else
    echo -e "${YELLOW}⚠️  middleware-supabase.ts not found${NC}"
fi

# Replace layout
if [ -f "src/app/layout-supabase.tsx" ]; then
    cp src/app/layout-supabase.tsx src/app/layout.tsx
    echo -e "${GREEN}✅ Updated layout.tsx${NC}"
else
    echo -e "${YELLOW}⚠️  layout-supabase.tsx not found${NC}"
fi

# Replace modern-layout
if [ -f "src/components/layout/modern-layout-supabase.tsx" ]; then
    cp src/components/layout/modern-layout-supabase.tsx src/components/layout/modern-layout.tsx
    echo -e "${GREEN}✅ Updated modern-layout.tsx${NC}"
else
    echo -e "${YELLOW}⚠️  modern-layout-supabase.tsx not found${NC}"
fi
echo ""

# Step 4: Instructions
echo -e "${BLUE}📋 Step 4: Manual Steps Required${NC}"
echo ""
echo -e "${YELLOW}You still need to:${NC}"
echo ""
echo "1. 🗄️  Run database migrations in Supabase:"
echo "   - Open Supabase Dashboard → SQL Editor"
echo "   - Run: database/COMPLETE_SCHEMA.sql"
echo "   - Run: database/SUPABASE_AUTH_SCHEMA.sql"
echo ""
echo "2. 🔐 Configure GitHub OAuth in Supabase:"
echo "   - Go to Authentication → Providers"
echo "   - Enable GitHub"
echo "   - Add your GitHub OAuth credentials"
echo ""
echo "3. 🧪 Test the migration:"
echo "   - npm run dev"
echo "   - Navigate to /auth/supabase-signin"
echo "   - Sign in with GitHub"
echo "   - Verify profile created in Supabase"
echo ""
echo "4. 🧹 After testing, clean up:"
echo "   - npm uninstall next-auth"
echo "   - Delete backup files"
echo "   - Update .env.local (remove NextAuth vars)"
echo ""

echo -e "${GREEN}✅ Automated migration steps complete!${NC}"
echo ""
echo -e "${BLUE}📖 For detailed instructions, see: SUPABASE_AUTH_MIGRATION.md${NC}"
echo ""

# Ask if user wants to remove NextAuth now
read -p "Do you want to uninstall next-auth now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${BLUE}Uninstalling next-auth...${NC}"
    npm uninstall next-auth
    echo -e "${GREEN}✅ next-auth uninstalled${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Migration script complete!${NC}"
echo -e "${BLUE}Next: Follow the manual steps above${NC}"
