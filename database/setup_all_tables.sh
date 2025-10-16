#!/bin/bash

# Complete Database Setup Script
# Runs all SQL schemas in correct order

echo "🚀 Setting up AI Interview Platform Database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable not set"
    echo "Usage: DATABASE_URL=postgresql://... ./setup_all_tables.sh"
    exit 1
fi

echo "📊 Creating core tables..."
psql "$DATABASE_URL" -f production_schema.sql

echo "🤖 Creating AI features tables..."
psql "$DATABASE_URL" -f ai_features_schema.sql

echo "🎥 Creating video interview tables..."
psql "$DATABASE_URL" -f video_interview_schema.sql

echo "🎤 Creating voice interview tables..."
psql "$DATABASE_URL" -f ../supabase/migrations/003_voice_interview_schema.sql

echo "✅ Database setup complete!"
echo ""
echo "Total tables created: 46"
echo ""
echo "Next steps:"
echo "1. Verify tables: psql \$DATABASE_URL -c '\\dt'"
echo "2. Run the application: npm run dev"
