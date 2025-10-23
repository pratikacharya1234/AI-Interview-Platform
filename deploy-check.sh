#!/bin/bash

# AI Interview Platform - Pre-Deployment Check Script
# Run this before deploying to production

echo "🚀 AI Interview Platform - Pre-Deployment Check"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Check 1: Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Node.js version too old. Need 18+, got $(node -v)${NC}"
    ((FAILED++))
fi
echo ""

# Check 2: Dependencies installed
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Dependencies not installed. Run: npm install${NC}"
    ((FAILED++))
fi
echo ""

# Check 3: Environment file exists
echo "🔐 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local file exists${NC}"
    ((PASSED++))
    
    # Check critical variables
    CRITICAL_VARS=("NEXTAUTH_URL" "NEXTAUTH_SECRET" "GITHUB_CLIENT_ID" "GITHUB_CLIENT_SECRET")
    for var in "${CRITICAL_VARS[@]}"; do
        if grep -q "^$var=" .env.local; then
            echo -e "${GREEN}  ✅ $var is set${NC}"
        else
            echo -e "${RED}  ❌ $var is missing${NC}"
            ((FAILED++))
        fi
    done
else
    echo -e "${YELLOW}⚠️  .env.local not found. Copy from .env.example${NC}"
    ((WARNINGS++))
fi
echo ""

# Check 4: Build test
echo "🔨 Testing production build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Production build successful${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Production build failed. Run: npm run build${NC}"
    ((FAILED++))
fi
echo ""

# Check 5: TypeScript check
echo "📝 Checking TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  TypeScript warnings found (non-critical)${NC}"
    ((WARNINGS++))
fi
echo ""

# Check 6: Critical files exist
echo "📄 Checking critical files..."
CRITICAL_FILES=(
    "src/app/layout.tsx"
    "src/app/page.tsx"
    "middleware.ts"
    "next.config.js"
    "package.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✅ $file${NC}"
    else
        echo -e "${RED}  ❌ $file missing${NC}"
        ((FAILED++))
    fi
done
echo ""

# Check 7: Git status
echo "🔄 Checking Git status..."
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    ((WARNINGS++))
fi
echo ""

# Summary
echo "================================================"
echo "📊 Summary:"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical checks passed! Ready to deploy!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub: git push origin main"
    echo "2. Deploy on Vercel: vercel --prod"
    echo "3. Or use Vercel Dashboard to deploy"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Fix issues before deploying.${NC}"
    exit 1
fi
