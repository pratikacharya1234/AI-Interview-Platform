'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mic, MicOff, Phone, PhoneOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { vapi, VapiMessage, handleVapiError, checkVapiConnection } from '@/lib/vapi.sdk';
import { interviewerConfig, interviewStages } from '@/constants/interview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ENDING = 'ENDING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR',
}

interface SavedMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  confidence?: number;
}

interface AgentProps {
  userName: string;
  userId: string;
  interviewId: string;
  feedbackId?: string;
  type: 'generate' | 'interview';
  questions?: string[];
  position: string;
  company: string;
  experience: string;
  techStack?: string[];
}

export default function Agent({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  position,
  company,
  experience,
  techStack = [],
}: AgentProps) {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>('');
  const [currentStage, setCurrentStage] = useState<string>('INTRODUCTION');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  
  const callStartTime = useRef<Date | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  // Check Vapi connection on mount
  useEffect(() => {
    if (!checkVapiConnection()) {
      setError('Vapi configuration is missing. Please check your environment variables.');
      setCallStatus(CallStatus.ERROR);
    }
  }, []);

  // Set up Vapi event listeners
  useEffect(() => {
    const onCallStart = () => {
      console.log('[Agent] Call started');
      setCallStatus(CallStatus.ACTIVE);
      setIsRecording(true);
      callStartTime.current = new Date();
      startDurationTimer();
      reconnectAttempts.current = 0;
      
      // Save interview start to database
      saveInterviewEvent('started');
    };

    const onCallEnd = async () => {
      console.log('[Agent] Call ended');
      setCallStatus(CallStatus.FINISHED);
      setIsRecording(false);
      stopDurationTimer();
      
      // Save interview completion
      await saveInterviewEvent('completed');
      
      // Generate feedback if interview type
      if (type === 'interview' && messages.length > 0) {
        await generateFeedback();
      }
    };

    const onMessage = (message: VapiMessage) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage: SavedMessage = {
          role: message.role,
          content: message.transcript,
          timestamp: new Date().toISOString(),
          confidence: message.role === 'user' ? 0.95 : 1.0,
        };
        
        setMessages(prev => [...prev, newMessage]);
        updateInterviewStage(newMessage);
        saveMessageToDatabase(newMessage);
      }
    };

    const onSpeechStart = () => {
      console.log('[Agent] Speech started');
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log('[Agent] Speech ended');
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error('[Agent] Error:', error);
      handleVapiError(error);
      setError(error.message);
      
      // Attempt reconnection for network errors
      if (callStatus === CallStatus.ACTIVE && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          console.log(`[Agent] Attempting reconnection ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          handleCall();
        }, 2000 * reconnectAttempts.current);
      } else {
        setCallStatus(CallStatus.ERROR);
      }
    };

    const onVolumeLevel = (level: number) => {
      // Update connection quality based on audio levels
      if (level < 0.1) setConnectionQuality('poor');
      else if (level < 0.5) setConnectionQuality('good');
      else setConnectionQuality('excellent');
    };

    // Register event listeners
    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('error', onError);
    vapi.on('volume-level', onVolumeLevel);

    // Cleanup
    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('error', onError);
      vapi.off('volume-level', onVolumeLevel);
    };
  }, [callStatus, messages, type]);

  // Handle feedback generation and navigation
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED && type === 'interview') {
      if (messages.length > 0) {
        generateFeedback();
      } else if (type === 'generate') {
        router.push('/interviews');
      }
    }
  }, [callStatus, messages, type, router]);

  // Update last message display
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  // Timer functions
  const startDurationTimer = () => {
    durationInterval.current = setInterval(() => {
      if (callStartTime.current) {
        const elapsed = Math.floor((Date.now() - callStartTime.current.getTime()) / 1000);
        setCallDuration(elapsed);
        
        // Update progress based on elapsed time (45 min interview)
        const progressPercentage = Math.min((elapsed / 2700) * 100, 100);
        setProgress(progressPercentage);
      }
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  // Format duration display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Update interview stage based on message count and content
  const updateInterviewStage = (message: SavedMessage) => {
    const messageCount = messages.length;
    
    if (messageCount < 3) {
      setCurrentStage('INTRODUCTION');
    } else if (messageCount < 10) {
      setCurrentStage('TECHNICAL');
    } else if (messageCount < 15) {
      setCurrentStage('BEHAVIORAL');
    } else if (messageCount < 20) {
      setCurrentStage('PROBLEM_SOLVING');
    } else if (messageCount < 23) {
      setCurrentStage('QUESTIONS');
    } else {
      setCurrentStage('CLOSING');
    }
  };

  // Save interview event to database
  const saveInterviewEvent = async (event: 'started' | 'completed') => {
    try {
      const { error } = await supabase
        .from('interview_sessions')
        .update({
          status: event === 'started' ? 'in_progress' : 'completed',
          [event === 'started' ? 'started_at' : 'completed_at']: new Date().toISOString(),
          duration_minutes: event === 'completed' ? Math.floor(callDuration / 60) : null,
        })
        .eq('id', interviewId);

      if (error) throw error;
    } catch (error) {
      console.error(`[Agent] Failed to save interview ${event}:`, error);
    }
  };

  // Save message to database in real-time
  const saveMessageToDatabase = async (message: SavedMessage) => {
    try {
      const { error } = await supabase
        .from('interview_responses')
        .insert({
          interview_id: interviewId,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp,
          confidence: message.confidence,
          stage: currentStage,
        });

      if (error) throw error;
    } catch (error) {
      console.error('[Agent] Failed to save message:', error);
    }
  };

  // Generate feedback
  const generateFeedback = async () => {
    try {
      const response = await fetch('/api/voice-interview/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          userId,
          messages,
          position,
          company,
          experience,
          techStack,
          duration: callDuration,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate feedback');

      const { feedbackId: generatedFeedbackId } = await response.json();
      
      // Navigate to feedback page
      router.push(`/interview/${interviewId}/feedback?id=${generatedFeedbackId}`);
    } catch (error) {
      console.error('[Agent] Failed to generate feedback:', error);
      setError('Failed to generate feedback. Please try again.');
    }
  };

  // Handle call initiation
  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      setError(null);

      // Prepare interview configuration
      const interviewConfig = {
        ...interviewerConfig,
        firstMessage: `Hello ${userName}! I'm your AI interviewer today. We'll be discussing the ${position} position at ${company}. This interview will last about 45 minutes. Are you ready to begin?`,
        variableValues: {
          candidateName: userName,
          position,
          company,
          experience,
          techStack: techStack.join(', '),
          userId,
          interviewId,
        },
      };

      if (type === 'generate') {
        // Dynamic question generation mode
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, interviewConfig);
      } else {
        // Pre-generated questions mode
        const formattedQuestions = questions?.map((q, i) => `Question ${i + 1}: ${q}`).join('\n\n') || '';
        
        await vapi.start(interviewerConfig, {
          ...interviewConfig,
          variableValues: {
            ...interviewConfig.variableValues,
            questions: formattedQuestions,
          },
        });
      }
    } catch (error: any) {
      console.error('[Agent] Failed to start call:', error);
      handleVapiError(error);
      setError('Failed to start the interview. Please check your connection and try again.');
      setCallStatus(CallStatus.ERROR);
    }
  };

  // Handle call termination
  const handleDisconnect = () => {
    setCallStatus(CallStatus.ENDING);
    vapi.stop();
    stopDurationTimer();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Interview Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Interview Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {position} Interview
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {company} • {experience} Level
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={callStatus === CallStatus.ACTIVE ? 'default' : 'secondary'}>
              {currentStage.replace('_', ' ')}
            </Badge>
            <div className="text-right">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-lg font-mono font-semibold">{formatDuration(callDuration)}</p>
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Interview Interface */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Interviewer Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className={cn(
                  "w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center",
                  isSpeaking && "animate-pulse"
                )}>
                  <Image
                    src="/ai-avatar.png"
                    alt="AI Interviewer"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </div>
                {isSpeaking && (
                  <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping" />
                )}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold">AI Interviewer</h3>
                <p className="text-sm text-gray-500 mt-1">Professional Interview Assistant</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  connectionQuality === 'excellent' && "bg-green-500",
                  connectionQuality === 'good' && "bg-yellow-500",
                  connectionQuality === 'poor' && "bg-red-500"
                )} />
                <span className="text-xs text-gray-500">
                  Connection: {connectionQuality}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidate Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                  <Image
                    src="/user-avatar.png"
                    alt={userName}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </div>
                {isRecording && (
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold">{userName}</h3>
                <p className="text-sm text-gray-500 mt-1">Candidate</p>
              </div>
              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {techStack.slice(0, 5).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Transcript */}
      {messages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Live Transcript</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300 animate-fade-in">
                {lastMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Controls */}
      <div className="flex justify-center">
        {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.ERROR ? (
          <Button
            onClick={handleCall}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-full"
            disabled={callStatus === CallStatus.ERROR && !error}
          >
            <Phone className="w-6 h-6 mr-2" />
            Start Interview
          </Button>
        ) : callStatus === CallStatus.CONNECTING ? (
          <Button
            size="lg"
            disabled
            className="px-8 py-6 text-lg rounded-full"
          >
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            Connecting...
          </Button>
        ) : callStatus === CallStatus.ACTIVE ? (
          <Button
            onClick={handleDisconnect}
            size="lg"
            variant="destructive"
            className="px-8 py-6 text-lg rounded-full"
          >
            <PhoneOff className="w-6 h-6 mr-2" />
            End Interview
          </Button>
        ) : callStatus === CallStatus.ENDING ? (
          <Button
            size="lg"
            disabled
            className="px-8 py-6 text-lg rounded-full"
          >
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            Ending...
          </Button>
        ) : (
          <Button
            onClick={() => router.push('/interviews')}
            size="lg"
            className="px-8 py-6 text-lg rounded-full"
          >
            View Results
          </Button>
        )}
      </div>

      {/* Interview Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Interview Tips</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Speak clearly and at a moderate pace</li>
            <li>• Take a moment to think before answering complex questions</li>
            <li>• Use specific examples from your experience</li>
            <li>• Ask clarifying questions if needed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
