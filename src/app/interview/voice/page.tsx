'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Agent from '@/components/voice/Agent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Briefcase, Building2, GraduationCap, Code2, Mic, ArrowRight, CheckCircle2 } from 'lucide-react';
import { difficultyLevels, questionTypes } from '@/constants/interview';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface InterviewSetup {
  userName: string;
  userId: string;
  position: string;
  company: string;
  experience: string;
  techStack: string[];
  interviewType: 'generate' | 'prepared';
  questionCount: number;
  questionFocus: 'technical' | 'behavioral' | 'mixed';
}

export default function VoiceInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interview setup state
  const [setup, setSetup] = useState<InterviewSetup>({
    userName: '',
    userId: '',
    position: '',
    company: '',
    experience: 'MID',
    techStack: [],
    interviewType: 'generate',
    questionCount: 10,
    questionFocus: 'mixed',
  });
  
  // Interview session state
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [preparedQuestions, setPreparedQuestions] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Get current user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // Use demo profile if not authenticated
        setSetup(prev => ({
          ...prev,
          userName: 'Demo User',
          userId: 'demo-user-id',
        }));
        setIsLoading(false);
        return;
      }

      // Fetch user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // Use email as fallback name
        setSetup(prev => ({
          ...prev,
          userName: user.email?.split('@')[0] || 'Candidate',
          userId: user.id,
        }));
      } else {
        // Use profile data
        setSetup(prev => ({
          ...prev,
          userName: profile.name || profile.email?.split('@')[0] || 'Candidate',
          userId: user.id,
        }));
      }
    } catch (error) {
      console.error('[Voice Interview] Error loading profile:', error);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (!setup.techStack.includes(techInput.trim())) {
        setSetup(prev => ({
          ...prev,
          techStack: [...prev.techStack, techInput.trim()],
        }));
      }
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setSetup(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech),
    }));
  };

  const validateSetup = (): boolean => {
    if (!setup.position.trim()) {
      setError('Please enter the position you are applying for');
      return false;
    }
    if (!setup.company.trim()) {
      setError('Please enter the company name');
      return false;
    }
    if (setup.techStack.length === 0) {
      setError('Please add at least one technology to your tech stack');
      return false;
    }
    return true;
  };

  const handleStartInterview = async () => {
    if (!validateSetup()) return;
    
    setIsStarting(true);
    setError(null);

    try {
      // Create interview session in database
      const { data: session, error: sessionError } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: setup.userId,
          title: `${setup.position} at ${setup.company}`,
          description: `Voice interview for ${setup.position} position`,
          interview_type: 'voice',
          status: 'pending',
          metadata: {
            company: setup.company,
            position: setup.position,
            experience: setup.experience,
            techStack: setup.techStack,
            questionFocus: setup.questionFocus,
            questionCount: setup.questionCount,
          },
        })
        .select()
        .single();

      if (sessionError || !session) {
        throw new Error('Failed to create interview session');
      }

      setInterviewId(session.id);

      // Generate questions if needed
      if (setup.interviewType === 'prepared') {
        const questions = await generateQuestions();
        setPreparedQuestions(questions);
      }

      setInterviewStarted(true);
    } catch (error: any) {
      console.error('[Voice Interview] Start error:', error);
      setError(error.message || 'Failed to start interview');
    } finally {
      setIsStarting(false);
    }
  };

  const generateQuestions = async (): Promise<string[]> => {
    try {
      const response = await fetch('/api/vapi/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: setup.position,
          level: setup.experience,
          techStack: setup.techStack,
          type: setup.questionFocus,
          amount: setup.questionCount,
          company: setup.company,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      return data.questions || [];
    } catch (error) {
      console.error('[Voice Interview] Question generation error:', error);
      // Return fallback questions
      return [
        `Tell me about yourself and your experience relevant to the ${setup.position} role.`,
        `Why are you interested in working at ${setup.company}?`,
        `Describe a challenging project you worked on recently.`,
        `How do you stay updated with new technologies?`,
        `What are your strengths and areas for improvement?`,
      ];
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Loading interview setup...</p>
        </div>
      </div>
    );
  }

  if (interviewStarted && interviewId) {
    return (
      <Agent
        userName={setup.userName}
        userId={setup.userId}
        interviewId={interviewId}
        type={setup.interviewType === 'generate' ? 'generate' : 'interview'}
        questions={preparedQuestions}
        position={setup.position}
        company={setup.company}
        experience={setup.experience}
        techStack={setup.techStack}
      />
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="border-2">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Mic className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">AI Voice Interview</CardTitle>
          <CardDescription className="text-lg mt-2">
            Practice your interview skills with our AI-powered voice interviewer
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* User Info Display */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Interviewing as</p>
            <p className="text-lg font-semibold">{setup.userName}</p>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Interview Details</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-6">
              {/* Position Input */}
              <div className="space-y-2">
                <Label htmlFor="position" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Position Applied For *
                </Label>
                <Input
                  id="position"
                  placeholder="e.g., Senior Software Engineer"
                  value={setup.position}
                  onChange={(e) => setSetup(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>

              {/* Company Input */}
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company Name *
                </Label>
                <Input
                  id="company"
                  placeholder="e.g., Tech Corp"
                  value={setup.company}
                  onChange={(e) => setSetup(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="experience" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Experience Level *
                </Label>
                <Select
                  value={setup.experience}
                  onValueChange={(value) => setSetup(prev => ({ ...prev, experience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(difficultyLevels).map(([key, level]) => (
                      <SelectItem key={key} value={key}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tech Stack */}
              <div className="space-y-2">
                <Label htmlFor="techstack" className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Tech Stack * (Press Enter to add)
                </Label>
                <Input
                  id="techstack"
                  placeholder="e.g., React, Node.js, Python..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleAddTech}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {setup.techStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTech(tech)}
                    >
                      {tech} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-6">
              {/* Interview Type */}
              <div className="space-y-2">
                <Label>Interview Mode</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all ${
                      setup.interviewType === 'generate' ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => setSetup(prev => ({ ...prev, interviewType: 'generate' }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Dynamic</p>
                          <p className="text-sm text-gray-500">AI generates questions in real-time</p>
                        </div>
                        {setup.interviewType === 'generate' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    className={`cursor-pointer transition-all ${
                      setup.interviewType === 'prepared' ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => setSetup(prev => ({ ...prev, interviewType: 'prepared' }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Prepared</p>
                          <p className="text-sm text-gray-500">Pre-generated question set</p>
                        </div>
                        {setup.interviewType === 'prepared' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Question Settings (for prepared mode) */}
              {setup.interviewType === 'prepared' && (
                <>
                  <div className="space-y-2">
                    <Label>Number of Questions</Label>
                    <Select
                      value={setup.questionCount.toString()}
                      onValueChange={(value) => setSetup(prev => ({ ...prev, questionCount: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Questions (15 mins)</SelectItem>
                        <SelectItem value="10">10 Questions (30 mins)</SelectItem>
                        <SelectItem value="15">15 Questions (45 mins)</SelectItem>
                        <SelectItem value="20">20 Questions (60 mins)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Question Focus</Label>
                    <Select
                      value={setup.questionFocus}
                      onValueChange={(value: any) => setSetup(prev => ({ ...prev, questionFocus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Questions</SelectItem>
                        <SelectItem value="behavioral">Behavioral Questions</SelectItem>
                        <SelectItem value="mixed">Mixed (Technical + Behavioral)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Start Button */}
          <div className="pt-6">
            <Button
              onClick={handleStartInterview}
              disabled={isStarting || !setup.position || !setup.company || setup.techStack.length === 0}
              className="w-full h-12 text-lg"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Preparing Interview...
                </>
              ) : (
                <>
                  Start Voice Interview
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-blue-900 dark:text-blue-300">Before you start:</p>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Ensure you have a working microphone</li>
              <li>Find a quiet environment with minimal background noise</li>
              <li>Allow browser permissions for microphone access</li>
              <li>Speak clearly and at a moderate pace</li>
              <li>The interview will last approximately 30-45 minutes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
