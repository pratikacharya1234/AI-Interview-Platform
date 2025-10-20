// Production-ready interview configuration constants

export const interviewerConfig = {
  model: {
    provider: 'google',
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 500,
    systemPrompt: `You are a professional AI interviewer conducting a job interview. 
    Your role is to:
    1. Ask questions one at a time and wait for the candidate's response
    2. Listen carefully to their answers
    3. Provide follow-up questions when appropriate
    4. Maintain a professional and encouraging tone
    5. Evaluate responses for clarity, relevance, and depth
    6. Guide the conversation naturally through the interview stages
    
    Interview Structure:
    - Start with a brief introduction
    - Move through technical questions based on the role
    - Include behavioral questions
    - Allow the candidate to ask questions at the end
    
    Remember to:
    - Be respectful and professional
    - Give the candidate time to think
    - Acknowledge good answers
    - Probe deeper when answers are vague
    - Keep track of time and pace the interview appropriately`,
  },
  voice: {
    provider: 'google',
    voiceId: 'en-US-Neural2-J', // Professional voice from Google
    languageCode: 'en-US',
    pitch: 0,
    speakingRate: 1.0,
  },
  transcriber: {
    provider: 'deepgram',
    model: 'nova-2',
    language: 'en',
    smartFormat: true,
    profanityFilter: false,
    redact: false,
    diarize: true,
    punctuate: true,
    utterances: true,
  },
  recordingEnabled: true,
  endCallFunctionEnabled: true,
  maxDuration: 3600, // 60 minutes max
  silenceTimeoutSeconds: 30,
  responseDelaySeconds: 1,
  llmRequestDelaySeconds: 0.5,
  numWordsToInterruptAssistant: 3,
  
  // Custom metadata for tracking
  metadata: {
    platform: 'AI-Interview-Platform',
    version: '2.0',
    environment: process.env.NODE_ENV || 'development',
  },
};

// Interview stages configuration
export const interviewStages = {
  INTRODUCTION: {
    name: 'Introduction',
    duration: 2, // minutes
    description: 'Brief introduction and ice-breaker',
  },
  TECHNICAL: {
    name: 'Technical Assessment',
    duration: 15,
    description: 'Role-specific technical questions',
  },
  BEHAVIORAL: {
    name: 'Behavioral Questions',
    duration: 10,
    description: 'Past experience and situational questions',
  },
  PROBLEM_SOLVING: {
    name: 'Problem Solving',
    duration: 10,
    description: 'Scenario-based problem solving',
  },
  QUESTIONS: {
    name: 'Candidate Questions',
    duration: 5,
    description: 'Opportunity for candidate to ask questions',
  },
  CLOSING: {
    name: 'Closing',
    duration: 3,
    description: 'Wrap-up and next steps',
  },
};

// Difficulty levels with corresponding parameters
export const difficultyLevels = {
  ENTRY: {
    label: 'Entry Level',
    questionComplexity: 'basic',
    followUpDepth: 1,
    technicalDepth: 'fundamental',
  },
  MID: {
    label: 'Mid Level',
    questionComplexity: 'intermediate',
    followUpDepth: 2,
    technicalDepth: 'practical',
  },
  SENIOR: {
    label: 'Senior Level',
    questionComplexity: 'advanced',
    followUpDepth: 3,
    technicalDepth: 'architectural',
  },
  LEAD: {
    label: 'Lead/Principal',
    questionComplexity: 'expert',
    followUpDepth: 4,
    technicalDepth: 'strategic',
  },
};

// Question types configuration
export const questionTypes = {
  TECHNICAL: {
    label: 'Technical',
    weight: 0.4,
    categories: ['coding', 'system design', 'architecture', 'best practices'],
  },
  BEHAVIORAL: {
    label: 'Behavioral',
    weight: 0.3,
    categories: ['teamwork', 'leadership', 'conflict resolution', 'communication'],
  },
  SITUATIONAL: {
    label: 'Situational',
    weight: 0.2,
    categories: ['problem-solving', 'decision-making', 'prioritization'],
  },
  CULTURAL: {
    label: 'Cultural Fit',
    weight: 0.1,
    categories: ['values', 'work style', 'career goals'],
  },
};

// Evaluation criteria with weights
export const evaluationCriteria = {
  COMMUNICATION: {
    label: 'Communication Skills',
    weight: 0.2,
    factors: ['clarity', 'articulation', 'structure', 'listening'],
  },
  TECHNICAL: {
    label: 'Technical Knowledge',
    weight: 0.3,
    factors: ['depth', 'accuracy', 'practical application', 'current trends'],
  },
  PROBLEM_SOLVING: {
    label: 'Problem Solving',
    weight: 0.25,
    factors: ['analytical thinking', 'creativity', 'systematic approach', 'edge cases'],
  },
  CULTURAL_FIT: {
    label: 'Cultural & Role Fit',
    weight: 0.15,
    factors: ['alignment', 'enthusiasm', 'growth mindset', 'collaboration'],
  },
  CONFIDENCE: {
    label: 'Confidence & Clarity',
    weight: 0.1,
    factors: ['self-assurance', 'honesty', 'engagement', 'professionalism'],
  },
};

// Tech stack mappings for icon display
export const techMappings: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  react: 'react',
  nextjs: 'nextjs',
  nodejs: 'nodejs',
  python: 'python',
  java: 'java',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  docker: 'docker',
  kubernetes: 'kubernetes',
  aws: 'amazonwebservices',
  gcp: 'googlecloud',
  azure: 'azure',
  mongodb: 'mongodb',
  postgresql: 'postgresql',
  mysql: 'mysql',
  redis: 'redis',
  graphql: 'graphql',
  git: 'git',
  linux: 'linux',
  angular: 'angular',
  vue: 'vuejs',
  svelte: 'svelte',
  django: 'django',
  flask: 'flask',
  spring: 'spring',
  express: 'express',
  fastapi: 'fastapi',
  tensorflow: 'tensorflow',
  pytorch: 'pytorch',
  scikit: 'scikitlearn',
  pandas: 'pandas',
  numpy: 'numpy',
};

// Interview cover images for UI
export const interviewCovers = [
  '/interview-1.jpg',
  '/interview-2.jpg',
  '/interview-3.jpg',
  '/interview-4.jpg',
  '/interview-5.jpg',
];

// Response quality indicators
export const responseQualityIndicators = {
  EXCELLENT: {
    score: 90,
    label: 'Excellent',
    color: 'text-green-500',
    feedback: 'Outstanding response with great depth and clarity',
  },
  GOOD: {
    score: 75,
    label: 'Good',
    color: 'text-blue-500',
    feedback: 'Solid response with good understanding',
  },
  SATISFACTORY: {
    score: 60,
    label: 'Satisfactory',
    color: 'text-yellow-500',
    feedback: 'Adequate response but could be improved',
  },
  NEEDS_IMPROVEMENT: {
    score: 40,
    label: 'Needs Improvement',
    color: 'text-orange-500',
    feedback: 'Response lacks depth or clarity',
  },
  POOR: {
    score: 20,
    label: 'Poor',
    color: 'text-red-500',
    feedback: 'Significant gaps in understanding or communication',
  },
};
