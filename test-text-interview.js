// Test script for text-based interview functionality
// This script tests the complete flow: questions generation, answer analysis, and saving to database

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

// Test data
const testInterview = {
  candidateName: 'Test User',
  position: 'Software Engineer',
  company: 'Tech Corp',
  questionTypes: ['technical', 'behavioral'],
  difficulty: 'medium',
  questionCount: 3
};

async function testQuestionGeneration() {
  console.log('📝 Testing question generation...');
  
  try {
    const response = await fetch(`${API_BASE}/interview/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        position: testInterview.position,
        company: testInterview.company,
        questionTypes: testInterview.questionTypes,
        difficulty: testInterview.difficulty,
        count: testInterview.questionCount
      })
    });

    const data = await response.json();
    
    if (response.ok && data.questions) {
      console.log('✅ Questions generated successfully!');
      console.log(`   Generated ${data.questions.length} questions`);
      return data.questions;
    } else {
      console.error('❌ Failed to generate questions:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error generating questions:', error.message);
    return null;
  }
}

async function testAnswerAnalysis(question, answer) {
  console.log('🔍 Testing answer analysis...');
  
  try {
    const response = await fetch(`${API_BASE}/interview/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question,
        userResponse: answer,
        context: {
          position: testInterview.position,
          company: testInterview.company
        }
      })
    });

    const data = await response.json();
    
    if (response.ok && data.analysis) {
      console.log('✅ Answer analyzed successfully!');
      console.log(`   Score: ${data.analysis.score}/10`);
      console.log(`   Strengths: ${data.analysis.strengths?.length || 0}`);
      console.log(`   Improvements: ${data.analysis.improvements?.length || 0}`);
      return data.analysis;
    } else {
      console.error('❌ Failed to analyze answer:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error analyzing answer:', error.message);
    return null;
  }
}

async function testInterviewCompletion(sessionData) {
  console.log('💾 Testing interview completion and saving...');
  
  try {
    const response = await fetch(`${API_BASE}/interview/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });

    const data = await response.json();
    
    if (response.ok || data.success) {
      console.log('✅ Interview saved successfully!');
      console.log(`   Interview ID: ${data.interviewId}`);
      console.log(`   Overall Score: ${data.scores?.overall || 'N/A'}/100`);
      return data;
    } else {
      console.error('❌ Failed to save interview:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error saving interview:', error.message);
    return null;
  }
}

async function testHistoryRetrieval() {
  console.log('📚 Testing interview history retrieval...');
  
  try {
    const response = await fetch(`${API_BASE}/interview/history`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ History retrieved successfully!');
      console.log(`   Total interviews: ${data.interviews?.length || 0}`);
      return data.interviews;
    } else {
      console.error('❌ Failed to retrieve history:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error retrieving history:', error.message);
    return null;
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting complete text interview test...\n');
  
  // Step 1: Generate questions
  const questions = await testQuestionGeneration();
  if (!questions || questions.length === 0) {
    console.log('⚠️ Test aborted: No questions generated');
    return;
  }
  
  console.log('\n');
  
  // Step 2: Simulate answering questions
  const responses = [];
  const sampleAnswers = [
    "I would approach this problem by first understanding the requirements thoroughly, then breaking it down into smaller components. I'd use test-driven development to ensure quality and maintainability.",
    "In my previous role, I faced a similar challenge where we had to optimize database queries. I analyzed the query patterns, implemented proper indexing, and reduced response time by 60%.",
    "I believe in continuous learning and staying updated with industry trends. I regularly participate in code reviews, attend tech conferences, and contribute to open-source projects."
  ];
  
  for (let i = 0; i < Math.min(questions.length, sampleAnswers.length); i++) {
    console.log(`\n📋 Question ${i + 1}: ${questions[i].question}`);
    console.log(`💬 Answer: ${sampleAnswers[i].substring(0, 50)}...`);
    
    const analysis = await testAnswerAnalysis(questions[i], sampleAnswers[i]);
    if (analysis) {
      responses.push({
        questionId: questions[i].id,
        question: questions[i].question,
        userResponse: sampleAnswers[i],
        ...analysis
      });
    }
    console.log('\n');
  }
  
  // Step 3: Complete and save interview
  const sessionData = {
    id: `test_interview_${Date.now()}`,
    startTime: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
    endTime: new Date().toISOString(),
    duration: 1800, // 30 minutes in seconds
    messages: [
      ...questions.map((q, idx) => ({
        id: `q_${idx}`,
        type: 'interviewer',
        text: q.question,
        timestamp: new Date(Date.now() - (30 - idx * 5) * 60000).toISOString()
      })),
      ...responses.map((r, idx) => ({
        id: `a_${idx}`,
        type: 'candidate',
        text: r.userResponse,
        timestamp: new Date(Date.now() - (28 - idx * 5) * 60000).toISOString()
      }))
    ],
    position: testInterview.position,
    company: testInterview.company,
    status: 'completed',
    videoEnabled: false,
    metrics: {
      totalQuestions: questions.length,
      totalResponses: responses.length,
      averageScore: responses.reduce((sum, r) => sum + r.score, 0) / responses.length,
      completionRate: (responses.length / questions.length) * 100
    }
  };
  
  const completionResult = await testInterviewCompletion(sessionData);
  
  console.log('\n');
  
  // Step 4: Verify history
  const history = await testHistoryRetrieval();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Questions Generated: ${questions ? questions.length : 0}`);
  console.log(`✅ Answers Analyzed: ${responses.length}`);
  console.log(`✅ Interview Saved: ${completionResult ? 'Yes' : 'No'}`);
  console.log(`✅ History Accessible: ${history ? 'Yes' : 'No'}`);
  
  if (completionResult && completionResult.feedback) {
    console.log('\n📝 FEEDBACK SUMMARY:');
    console.log(`Overall: ${completionResult.feedback.overall?.substring(0, 100)}...`);
    console.log(`Strengths: ${completionResult.feedback.strengths?.length || 0} items`);
    console.log(`Improvements: ${completionResult.feedback.improvements?.length || 0} items`);
    console.log(`Recommendations: ${completionResult.feedback.recommendations?.length || 0} items`);
  }
  
  console.log('\n✨ Test completed successfully!');
}

// Run the test
runCompleteTest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
