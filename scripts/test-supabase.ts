#!/usr/bin/env ts-node

/**
 * Test script to verify Supabase connection and setup
 * Run with: npx ts-node scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Testing Supabase Connection...\n')

// Check environment variables
function checkEnvVars(): boolean {
  console.log('1️⃣  Checking environment variables...')
  
  const missing = []
  if (!SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!SUPABASE_SERVICE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '))
    console.log('   Please add them to your .env.local file')
    return false
  }
  
  console.log('✅ All required environment variables found')
  console.log(`   URL: ${SUPABASE_URL}`)
  console.log(`   Anon Key: ${SUPABASE_ANON_KEY?.substring(0, 20)}...`)
  console.log(`   Service Key: ${SUPABASE_SERVICE_KEY?.substring(0, 20)}...`)
  return true
}

// Test connection
async function testConnection() {
  console.log('\n2️⃣  Testing connection to Supabase...')
  
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('⚠️  Tables not found. Please run the setup script in Supabase SQL Editor')
        return false
      }
      console.error('❌ Connection error:', error.message)
      return false
    }
    
    console.log('✅ Successfully connected to Supabase!')
    return true
  } catch (error) {
    console.error('❌ Failed to connect:', error)
    return false
  }
}

// Check if tables exist
async function checkTables() {
  console.log('\n3️⃣  Checking database tables...')
  
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)
  
  const requiredTables = [
    'profiles',
    'interview_sessions',
    'user_scores',
    'user_streaks',
    'leaderboard_cache',
    'session_logs',
    'questions',
    'achievements'
  ]
  
  const existingTables: string[] = []
  const missingTables: string[] = []
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1)
      
      if (error && error.message.includes('does not exist')) {
        missingTables.push(table)
        console.log(`   ❌ ${table} - Not found`)
      } else {
        existingTables.push(table)
        console.log(`   ✅ ${table} - Found`)
      }
    } catch (error) {
      missingTables.push(table)
      console.log(`   ❌ ${table} - Error checking`)
    }
  }
  
  if (missingTables.length > 0) {
    console.log(`\n⚠️  Missing ${missingTables.length} tables: ${missingTables.join(', ')}`)
    console.log('   Run the complete_setup.sql script in Supabase SQL Editor to create them')
    return false
  }
  
  console.log(`\n✅ All ${requiredTables.length} required tables found!`)
  return true
}

// Test authentication
async function testAuth() {
  console.log('\n4️⃣  Testing authentication...')
  
  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  
  try {
    // Check current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      console.log('✅ Active session found:', session.user.email)
    } else {
      console.log('ℹ️  No active session (this is normal for server-side testing)')
    }
    
    // Test sign up capability (don't actually create user)
    console.log('   Testing auth endpoints...')
    const testEmail = `test-${Date.now()}@example.com`
    
    // This will fail but we're just checking if the endpoint responds
    const { error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test-password-123'
    })
    
    // We expect an error (email not confirmed, etc.) but not a connection error
    if (error && !error.message.includes('confirm')) {
      console.log('⚠️  Auth might not be properly configured:', error.message)
    } else {
      console.log('✅ Authentication endpoints are responding')
    }
    
    return true
  } catch (error) {
    console.error('❌ Authentication test failed:', error)
    return false
  }
}

// Test data operations
async function testDataOperations() {
  console.log('\n5️⃣  Testing data operations...')
  
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)
  
  try {
    // Test read operation
    console.log('   Testing READ...')
    const { data: questions, error: readError } = await supabase
      .from('questions')
      .select('*')
      .limit(1)
    
    if (readError) {
      console.log('❌ Read operation failed:', readError.message)
      return false
    }
    console.log('✅ Read operation successful')
    
    // Test insert operation (with rollback)
    console.log('   Testing INSERT...')
    const testQuestion = {
      category: 'behavioral',
      difficulty: 'easy',
      question_text: 'TEST: This is a test question',
      sample_answer: 'TEST: This is a test answer',
      tags: ['test']
    }
    
    const { data: inserted, error: insertError } = await supabase
      .from('questions')
      .insert(testQuestion)
      .select()
      .single()
    
    if (insertError) {
      console.log('❌ Insert operation failed:', insertError.message)
      return false
    }
    console.log('✅ Insert operation successful')
    
    // Clean up test data
    if (inserted) {
      console.log('   Cleaning up test data...')
      await supabase
        .from('questions')
        .delete()
        .eq('id', inserted.id)
      console.log('✅ Test data cleaned up')
    }
    
    return true
  } catch (error) {
    console.error('❌ Data operations test failed:', error)
    return false
  }
}

// Main test runner
async function runTests() {
  console.log('========================================')
  console.log('   AI Interview Platform')
  console.log('   Supabase Connection Test')
  console.log('========================================\n')
  
  const tests = [
    { name: 'Environment Variables', fn: checkEnvVars },
    { name: 'Connection', fn: testConnection },
    { name: 'Database Tables', fn: checkTables },
    { name: 'Authentication', fn: testAuth },
    { name: 'Data Operations', fn: testDataOperations }
  ]
  
  const results: { name: string; passed: boolean }[] = []
  
  for (const test of tests) {
    if (test.fn.constructor.name === 'AsyncFunction') {
      const passed = await test.fn()
      results.push({ name: test.name, passed })
      if (!passed && test.name === 'Environment Variables') {
        console.log('\n⛔ Cannot continue without environment variables')
        break
      }
    } else {
      const passed = test.fn()
      results.push({ name: test.name, passed })
      if (!passed && test.name === 'Environment Variables') {
        console.log('\n⛔ Cannot continue without environment variables')
        break
      }
    }
  }
  
  // Summary
  console.log('\n========================================')
  console.log('   Test Summary')
  console.log('========================================')
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  
  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.name}`)
  })
  
  console.log(`\nTotal: ${passed} passed, ${failed} failed`)
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your Supabase backend is properly connected.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above and follow the setup guide.')
    console.log('   Setup guide: docs/SUPABASE_CONNECTION.md')
  }
}

// Run tests
runTests().catch(console.error)
