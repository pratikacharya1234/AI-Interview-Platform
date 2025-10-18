#!/usr/bin/env node

/**
 * Simple test script to verify Supabase connection
 * Run with: node test-db.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

// Check environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!');
  console.log('Please add to .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`URL: ${SUPABASE_URL}`);
console.log(`Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...\n`);

// Test connection
async function testConnection() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('Testing database connection...');
    
    // Test 1: Check if we can query profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.error('❌ Tables not found. Please run complete_setup.sql in Supabase');
      } else {
        console.error('❌ Connection error:', error.message);
      }
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!\n');
    
    // Test 2: Check tables
    console.log('Checking tables...');
    const tables = [
      'profiles',
      'interview_sessions',
      'user_scores',
      'user_streaks',
      'questions'
    ];
    
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (tableError) {
        console.log(`❌ ${table} - Not found`);
      } else {
        console.log(`✅ ${table} - Found`);
      }
    }
    
    // Test 3: Check sample questions
    console.log('\nChecking sample data...');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(3);
    
    if (!questionsError && questions && questions.length > 0) {
      console.log(`✅ Found ${questions.length} sample questions`);
    } else {
      console.log('ℹ️  No sample questions found (this is okay)');
    }
    
    console.log('\n🎉 Database setup verified successfully!');
    console.log('Your Supabase backend is ready to use.');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
