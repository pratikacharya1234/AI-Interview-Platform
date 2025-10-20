#!/bin/bash

# GitHub OAuth Setup Script
# This script helps you configure GitHub authentication

set -e

echo ""
echo "=================================================="
echo "  GitHub OAuth Setup for AI Interview Platform"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local from .env.example...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

echo ""
echo -e "${BLUE}Step 1: Generate NEXTAUTH_SECRET${NC}"
echo "----------------------------------------"

# Generate NEXTAUTH_SECRET
SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}Generated secret: ${SECRET}${NC}"

# Update NEXTAUTH_SECRET in .env.local
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${SECRET}|g" .env.local
else
    # Linux
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${SECRET}|g" .env.local
fi

echo -e "${GREEN}✓ Updated NEXTAUTH_SECRET in .env.local${NC}"

echo ""
echo -e "${BLUE}Step 2: Set up GitHub OAuth App${NC}"
echo "----------------------------------------"
echo ""
echo "1. Go to: ${YELLOW}https://github.com/settings/developers${NC}"
echo "2. Click 'New OAuth App'"
echo "3. Fill in the details:"
echo "   - Application name: AI Interview Platform"
echo "   - Homepage URL: ${YELLOW}http://localhost:3000${NC}"
echo "   - Authorization callback URL: ${YELLOW}http://localhost:3000/api/auth/callback/github${NC}"
echo "4. Click 'Register application'"
echo "5. Copy the Client ID and generate a Client Secret"
echo ""

read -p "Press Enter when you have your GitHub Client ID and Secret ready..."

echo ""
read -p "Enter your GitHub Client ID: " CLIENT_ID
read -p "Enter your GitHub Client Secret: " CLIENT_SECRET

# Update GitHub credentials in .env.local
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|GITHUB_CLIENT_ID=.*|GITHUB_CLIENT_ID=${CLIENT_ID}|g" .env.local
    sed -i '' "s|GITHUB_CLIENT_SECRET=.*|GITHUB_CLIENT_SECRET=${CLIENT_SECRET}|g" .env.local
else
    # Linux
    sed -i "s|GITHUB_CLIENT_ID=.*|GITHUB_CLIENT_ID=${CLIENT_ID}|g" .env.local
    sed -i "s|GITHUB_CLIENT_SECRET=.*|GITHUB_CLIENT_SECRET=${CLIENT_SECRET}|g" .env.local
fi

echo ""
echo -e "${GREEN}✓ Updated GitHub credentials in .env.local${NC}"

echo ""
echo -e "${BLUE}Step 3: Verify Configuration${NC}"
echo "----------------------------------------"
echo ""

# Run verification script
if [ -f verify-github-auth.js ]; then
    node verify-github-auth.js
else
    echo -e "${YELLOW}⚠ Verification script not found, skipping...${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Run: ${YELLOW}npm install${NC} (if you haven't already)"
echo "2. Run: ${YELLOW}npm run dev${NC}"
echo "3. Visit: ${YELLOW}http://localhost:3000${NC}"
echo "4. Click 'Sign In with GitHub'"
echo ""
echo "If you encounter issues, check:"
echo "- ${YELLOW}GITHUB_AUTH_SETUP.md${NC} for detailed troubleshooting"
echo "- Run ${YELLOW}node verify-github-auth.js${NC} to verify configuration"
echo ""
