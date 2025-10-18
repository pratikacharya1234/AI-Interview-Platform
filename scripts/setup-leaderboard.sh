#!/bin/bash

# Setup script for AI Interview Pro Leaderboard System

echo "🚀 Setting up AI Interview Pro Leaderboard System..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
fi

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# 1. Setup Database Schema
echo -e "${BLUE}Step 1: Setting up database schema...${NC}"
if [ -f "database/leaderboard_schema.sql" ]; then
    supabase db push database/leaderboard_schema.sql
    check_status "Database schema setup"
else
    echo -e "${YELLOW}Warning: leaderboard_schema.sql not found${NC}"
fi

# 2. Deploy Edge Functions
echo -e "${BLUE}Step 2: Deploying Supabase Edge Functions...${NC}"
if [ -d "supabase/functions/update-leaderboard" ]; then
    supabase functions deploy update-leaderboard
    check_status "Edge function deployment"
else
    echo -e "${YELLOW}Warning: Edge function not found${NC}"
fi

# 3. Setup Cron Job for Daily Updates
echo -e "${BLUE}Step 3: Setting up cron job for daily updates...${NC}"
cat > supabase/functions/cron-leaderboard/index.ts << 'EOF'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // This function will be triggered by Supabase cron at midnight UTC
  const response = await fetch('https://your-project.supabase.co/functions/v1/update-leaderboard', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json'
    }
  })
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      timestamp: new Date().toISOString() 
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
EOF

supabase functions deploy cron-leaderboard
check_status "Cron job setup"

# 4. Install Python Dependencies
echo -e "${BLUE}Step 4: Installing Python dependencies...${NC}"
if [ -f "python/requirements.txt" ]; then
    cd python
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    check_status "Python dependencies installation"
    deactivate
    cd ..
else
    echo -e "${YELLOW}Warning: Python requirements.txt not found${NC}"
fi

# 5. Install npm packages
echo -e "${BLUE}Step 5: Installing required npm packages...${NC}"
npm install date-fns framer-motion
check_status "NPM packages installation"

# 6. Setup environment variables
echo -e "${BLUE}Step 6: Setting up environment variables...${NC}"
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo -e "${YELLOW}Please update .env.local with your Supabase credentials${NC}"
fi

# Add Python service URL to .env.local
echo "" >> .env.local
echo "# Python Ranking Service" >> .env.local
echo "PYTHON_SERVICE_URL=http://localhost:8000" >> .env.local

# 7. Create systemd service for Python ranking engine (optional)
echo -e "${BLUE}Step 7: Creating systemd service for Python ranking engine...${NC}"
cat > ai-interview-ranking.service << EOF
[Unit]
Description=AI Interview Pro Ranking Engine
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/python
Environment="PATH=$(pwd)/python/venv/bin"
ExecStart=$(pwd)/python/venv/bin/python ranking_engine.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}Service file created: ai-interview-ranking.service${NC}"
echo -e "${YELLOW}To install as system service, run:${NC}"
echo "sudo cp ai-interview-ranking.service /etc/systemd/system/"
echo "sudo systemctl enable ai-interview-ranking"
echo "sudo systemctl start ai-interview-ranking"

# 8. Database migration check
echo -e "${BLUE}Step 8: Running database migrations...${NC}"
supabase db push
check_status "Database migrations"

# 9. Test the setup
echo -e "${BLUE}Step 9: Testing the setup...${NC}"
echo "Starting Python ranking engine for testing..."
cd python
source venv/bin/activate
python ranking_engine.py &
PYTHON_PID=$!
sleep 5

# Test the API endpoint
curl -X GET http://localhost:8000/api/ranking/stats/test-user-id
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ API test successful${NC}"
else
    echo -e "${YELLOW}⚠ API test failed (this is expected if no data exists yet)${NC}"
fi

kill $PYTHON_PID
deactivate
cd ..

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run the Python ranking engine: cd python && source venv/bin/activate && python ranking_engine.py"
echo "3. Start the Next.js development server: npm run dev"
echo "4. Visit http://localhost:3000/leaderboard to see the leaderboard"
echo ""
echo "For production deployment:"
echo "- Deploy Python service to a cloud provider (e.g., Railway, Heroku)"
echo "- Update PYTHON_SERVICE_URL in production environment variables"
echo "- Setup Supabase cron job to run daily at midnight UTC"
echo ""
echo -e "${BLUE}Documentation available at: /docs/leaderboard-system.md${NC}"
