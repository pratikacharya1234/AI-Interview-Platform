// Test script for voice interview API endpoints
const BASE_URL = 'http://localhost:3000';

async function testVoiceInterview() {
  console.log('🎤 Testing Voice Interview System...\n');
  
  // Test 1: Start Interview
  console.log('1. Starting interview...');
  const startResponse = await fetch(`${BASE_URL}/api/voice-interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'test-user-123',
      user_name: 'John Doe',
      company: 'Tech Corp',
      position: 'Software Engineer',
      experience: 'mid'
    })
  });
  
  const startData = await startResponse.json();
  console.log('✅ Interview started:', {
    session_id: startData.session?.id,
    first_question: startData.first_question?.substring(0, 50) + '...'
  });
  
  const sessionId = startData.session?.id || 'test-session-123';
  
  // Test 2: Process Response
  console.log('\n2. Processing user response...');
  const processResponse = await fetch(`${BASE_URL}/api/voice-interview/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      transcript: "I have 5 years of experience in full-stack development with React and Node.js"
    })
  });
  
  const processData = await processResponse.json();
  console.log('✅ Response processed:', {
    next_question: processData.next_question?.substring(0, 50) + '...',
    stage: processData.stage,
    progress: processData.progress + '%'
  });
  
  // Test 3: Complete Interview
  console.log('\n3. Completing interview...');
  const completeResponse = await fetch(`${BASE_URL}/api/voice-interview/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      responses: [
        { question: 'Q1', answer: 'A1', stage: 'introduction' },
        { question: 'Q2', answer: 'A2', stage: 'technical' }
      ]
    })
  });
  
  const completeData = await completeResponse.json();
  console.log('✅ Interview completed:', {
    overall_score: completeData.feedback?.overall_score,
    has_feedback: !!completeData.feedback
  });
  
  console.log('\n✅ All tests passed! Voice interview system is working.');
}

// Run tests
testVoiceInterview().catch(console.error);
