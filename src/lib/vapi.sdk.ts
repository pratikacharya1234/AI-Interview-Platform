import Vapi from '@vapi-ai/web';

// Initialize Vapi instance with production configuration
const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || '');

// Export configured Vapi instance
export const vapi = vapiInstance;

// Vapi event types for TypeScript
export interface VapiMessage {
  type: string;
  role: 'user' | 'assistant' | 'system';
  transcript: string;
  transcriptType?: 'partial' | 'final';
  timestamp?: string;
}

export interface VapiCallConfig {
  variableValues?: Record<string, any>;
  firstMessage?: string;
  transcriptionEnabled?: boolean;
  recordingEnabled?: boolean;
  endCallFunctionEnabled?: boolean;
  serverUrl?: string;
  serverUrlSecret?: string;
}

// Production-ready error handler
export const handleVapiError = (error: Error): void => {
  console.error('[Vapi Error]:', error);
  
  // Log to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service (e.g., Sentry, LogRocket)
    // This would be your actual error tracking implementation
    logErrorToMonitoring({
      service: 'vapi',
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }
};

// Helper function to log errors to monitoring service
const logErrorToMonitoring = (errorData: any) => {
  // Implement your error tracking service here
  // Example: Sentry, LogRocket, DataDog, etc.
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    fetch('/api/monitoring/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
    }).catch(console.error);
  }
};

// Vapi connection status checker
export const checkVapiConnection = (): boolean => {
  return vapiInstance && !!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
};

// Helper to format questions for Vapi
export const formatQuestionsForVapi = (questions: string[]): string => {
  return questions.map((q, index) => `${index + 1}. ${q}`).join('\n');
};
