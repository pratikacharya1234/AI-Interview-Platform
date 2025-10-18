#!/bin/bash

# Production Deployment Script for https://interviewmock.vercel.app/
# Run this script to deploy to production

echo "🚀 Starting Production Deployment..."
echo "Target: https://interviewmock.vercel.app/"
echo ""

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Uncommitted changes detected. Committing..."
    git add -A
    git commit -m "Production deployment: Complete interview system with Supabase integration

- Removed all dummy/mock data
- Fixed text interview saving with complete Q&A history
- Fixed history page to show real interviews
- Fixed feedback display after completion
- Connected all APIs to Supabase
- Added automatic score updates
- Added session logging for streaks
- Improved error handling throughout"
else
    echo "✅ No uncommitted changes"
fi

echo ""
echo "🔨 Running build test..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "📤 Pushing to GitHub (Vercel will auto-deploy)..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Code pushed successfully!"
    echo ""
    echo "📋 POST-DEPLOYMENT CHECKLIST:"
    echo "================================"
    echo "1. ⏳ Wait 2-3 minutes for Vercel deployment"
    echo "2. 🔐 Ensure all env variables are set in Vercel"
    echo "3. 🧪 Test: https://interviewmock.vercel.app/api/test-database"
    echo "4. 🔑 Test login: https://interviewmock.vercel.app/signin"
    echo "5. 📝 Complete a test interview"
    echo "6. 📊 Check history page for saved interview"
    echo ""
    echo "🎉 Deployment initiated successfully!"
else
    echo "❌ Push failed! Please check your connection and try again."
    exit 1
fi
