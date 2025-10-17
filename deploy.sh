#!/bin/bash

# Add all changes
git add -A

# Commit with message
git commit -m "Fix Next.js 15 build errors - update params to Promise type in page and API routes"

# Push to main branch
git push origin main

echo "Changes pushed successfully!"
