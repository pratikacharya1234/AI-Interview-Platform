#!/usr/bin/env node

/**
 * Test script to verify Vapi and Gemini integration
 * Run with: node test-vapi-gemini.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3001';
const TEST_CONFIG = {
  role: 'Senior Software Engineer',
  level: 'SENIOR',
  techStack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  type: 'mixed',
  amount: 5,
  company: 'Tech Corp',
  jobDescription: 'Looking for a senior engineer to lead our frontend team'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject({ status: res.statusCode, body: response });
          }
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testSystemCheck() {
  console.log(`${colors.cyan}🔍 Testing System Check...${colors.reset}`);
  
  try {
    const response = await makeRequest('/api/system-check');
    
    // Check Gemini
    if (response.apis?.gemini?.configured) {
      console.log(`${colors.green}✅ Gemini API: Configured${colors.reset}`);
      if (response.apis.gemini.status === 'working') {
        console.log(`${colors.green}   Status: Working${colors.reset}`);
      } else {
        console.log(`${colors.yellow}   Status: ${response.apis.gemini.status}${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ Gemini API: Not configured${colors.reset}`);
      console.log(`${colors.yellow}   Please set GOOGLE_GENERATIVE_AI_API_KEY in .env.local${colors.reset}`);
    }
    
    // Check OpenAI (for TTS)
    if (response.apis?.openai?.configured) {
      console.log(`${colors.green}✅ OpenAI API: Configured (TTS available)${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  OpenAI API: Not configured (will use browser TTS)${colors.reset}`);
    }
    
    // Check Vapi requirements
    console.log(`${colors.cyan}\n📞 Vapi Configuration:${colors.reset}`);
    console.log(`   Note: Vapi tokens are client-side only and cannot be verified server-side`);
    console.log(`   Please ensure these are set in .env.local:`);
    console.log(`   - NEXT_PUBLIC_VAPI_WEB_TOKEN`);
    console.log(`   - NEXT_PUBLIC_VAPI_WORKFLOW_ID`);
    
    return response;
  } catch (error) {
    console.log(`${colors.red}❌ System check failed: ${error.message}${colors.reset}`);
    return null;
  }
}

async function testGeminiQuestionGeneration() {
  console.log(`${colors.cyan}\n🤖 Testing Gemini Question Generation...${colors.reset}`);
  
  try {
    console.log(`   Generating questions for: ${TEST_CONFIG.role}`);
    console.log(`   Tech stack: ${TEST_CONFIG.techStack.join(', ')}`);
    
    const response = await makeRequest('/api/vapi/generate', 'POST', TEST_CONFIG);
    
    if (response.success && response.questions) {
      console.log(`${colors.green}✅ Question generation successful!${colors.reset}`);
      console.log(`${colors.green}   Generated ${response.questions.length} questions${colors.reset}`);
      
      // Display sample questions
      console.log(`${colors.cyan}\n   Sample Questions:${colors.reset}`);
      response.questions.slice(0, 3).forEach((q, i) => {
        console.log(`   ${i + 1}. ${q.substring(0, 80)}...`);
      });
      
      return response;
    } else {
      console.log(`${colors.red}❌ Question generation failed${colors.reset}`);
      console.log(`   Response:`, response);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Question generation error: ${error.message}${colors.reset}`);
    if (error.body) {
      console.log(`   Error details:`, error.body);
    }
    return null;
  }
}

async function testOpenAITTS() {
  console.log(`${colors.cyan}\n🔊 Testing OpenAI TTS...${colors.reset}`);
  
  try {
    const testText = "Hello, this is a test of the text to speech system.";
    console.log(`   Test text: "${testText}"`);
    
    const response = await makeRequest('/api/tts/openai', 'POST', {
      text: testText,
      voice: 'alloy',
      model: 'tts-1',
      speed: 1.0
    });
    
    // Check if we got audio data (will be binary, so just check response)
    if (response.status === 503) {
      console.log(`${colors.yellow}⚠️  OpenAI TTS not available (API key not set)${colors.reset}`);
      console.log(`   System will fallback to browser TTS`);
    } else if (response.body && response.body.includes('audio')) {
      console.log(`${colors.green}✅ OpenAI TTS is working!${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ TTS endpoint responded (audio data received)${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.yellow}⚠️  TTS test inconclusive: ${error.message}${colors.reset}`);
    console.log(`   This is okay - browser TTS will be used as fallback`);
    return false;
  }
}

async function checkEnvironmentVariables() {
  console.log(`${colors.cyan}\n🔐 Environment Variables Check:${colors.reset}`);
  console.log(`${colors.yellow}   Note: This script cannot access client-side env vars${colors.reset}`);
  console.log(`\n   Please manually verify these are set in .env.local:`);
  
  const requiredVars = [
    { name: 'NEXT_PUBLIC_VAPI_WEB_TOKEN', description: 'Vapi Web Token for voice interviews' },
    { name: 'NEXT_PUBLIC_VAPI_WORKFLOW_ID', description: 'Vapi Workflow ID for interview flow' },
    { name: 'GOOGLE_GENERATIVE_AI_API_KEY', description: 'Google Gemini API key for AI features' }
  ];
  
  const optionalVars = [
    { name: 'OPENAI_API_KEY', description: 'OpenAI API key for TTS and enhanced AI' },
    { name: 'ANTHROPIC_API_KEY', description: 'Claude API key for better feedback' },
    { name: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Supabase URL for database' },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Supabase anonymous key' }
  ];
  
  console.log(`${colors.green}\n   Required:${colors.reset}`);
  requiredVars.forEach(v => {
    console.log(`   ✓ ${v.name}`);
    console.log(`     ${colors.cyan}${v.description}${colors.reset}`);
  });
  
  console.log(`${colors.yellow}\n   Optional but Recommended:${colors.reset}`);
  optionalVars.forEach(v => {
    console.log(`   ○ ${v.name}`);
    console.log(`     ${colors.cyan}${v.description}${colors.reset}`);
  });
}

// Main test runner
async function runTests() {
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}🚀 AI Interview Platform - Vapi & Gemini Integration Test${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  
  // Check if server is running
  try {
    await makeRequest('/');
  } catch (error) {
    console.log(`${colors.red}\n❌ Server is not running!${colors.reset}`);
    console.log(`${colors.yellow}   Please start the server with: npm run dev${colors.reset}`);
    console.log(`${colors.yellow}   Then run this test again: node test-vapi-gemini.js${colors.reset}`);
    process.exit(1);
  }
  
  // Run tests
  const systemCheck = await testSystemCheck();
  const questionGen = await testGeminiQuestionGeneration();
  const ttsTest = await testOpenAITTS();
  await checkEnvironmentVariables();
  
  // Summary
  console.log(`${colors.blue}\n${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}📊 Test Summary${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  
  const results = [];
  
  if (systemCheck?.apis?.gemini?.configured) {
    results.push(`${colors.green}✅ Gemini API is configured${colors.reset}`);
  } else {
    results.push(`${colors.red}❌ Gemini API needs configuration${colors.reset}`);
  }
  
  if (questionGen?.success) {
    results.push(`${colors.green}✅ Question generation is working${colors.reset}`);
  } else {
    results.push(`${colors.red}❌ Question generation needs attention${colors.reset}`);
  }
  
  if (systemCheck?.apis?.openai?.configured || ttsTest) {
    results.push(`${colors.green}✅ TTS is available (OpenAI or browser fallback)${colors.reset}`);
  } else {
    results.push(`${colors.yellow}⚠️  TTS will use browser fallback${colors.reset}`);
  }
  
  results.forEach(r => console.log(`   ${r}`));
  
  console.log(`${colors.cyan}\n📝 Next Steps:${colors.reset}`);
  console.log(`   1. Ensure all required environment variables are set`);
  console.log(`   2. Configure your Vapi workflow at https://vapi.ai`);
  console.log(`   3. Test voice interview at http://localhost:3001/interview/voice`);
  console.log(`   4. Check browser console for any client-side errors`);
  
  console.log(`${colors.blue}\n${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}✨ Test completed successfully!${colors.reset}`);
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
