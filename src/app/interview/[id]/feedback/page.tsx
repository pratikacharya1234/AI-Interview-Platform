'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Share2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  Target,
  Lightbulb,
  BarChart3,
  Clock,
  Loader2
} from 'lucide-react';
import { evaluationCriteria, responseQualityIndicators } from '@/constants/interview';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FeedbackData {
  id: string;
  interview_id: string;
  overall_score: number;
  scores: Array<{
    category: string;
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }>;
  strengths: string[];
  improvements: string[];
  detailed_feedback: string;
  hiring_recommendation: string;
  duration_seconds: number;
  metadata: {
    position: string;
    company: string;
    experience: string;
    techStack: string[];
    messageCount: number;
  };
}

export default function FeedbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const interviewId = params.id as string;
  const feedbackId = searchParams.get('id');
  
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (feedbackId) {
      loadFeedback();
    }
  }, [feedbackId]);

  const loadFeedback = async () => {
    try {
      setIsLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('interview_feedback')
        .select('*')
        .eq('id', feedbackId)
        .single();

      if (fetchError || !data) {
        throw new Error('Feedback not found');
      }

      setFeedback(data);
    } catch (error: any) {
      console.error('[Feedback] Load error:', error);
      setError(error.message || 'Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Satisfactory';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  const getRecommendationColor = (recommendation: string): string => {
    if (recommendation.includes('Strong Yes')) return 'bg-green-100 text-green-800';
    if (recommendation.includes('Yes')) return 'bg-blue-100 text-blue-800';
    if (recommendation.includes('Maybe')) return 'bg-yellow-100 text-yellow-800';
    if (recommendation.includes('Unlikely')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/voice-interview/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId }),
      });

      if (!response.ok) throw new Error('Failed to export PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-feedback-${interviewId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[Feedback] Export error:', error);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/interview/${interviewId}/feedback?id=${feedbackId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Interview Feedback',
          text: `Check out my interview feedback - Score: ${feedback?.overall_score}/100`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Analyzing your interview performance...</p>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Unable to Load Feedback</h2>
            <p className="text-gray-600 mb-6">{error || 'Feedback not found'}</p>
            <Button onClick={() => router.push('/interviews')}>
              Back to Interviews
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
            <p className="text-gray-600">
              {feedback.metadata.position} at {feedback.metadata.company}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => router.push('/interview/voice')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              New Interview
            </Button>
          </div>
        </div>

        {/* Overall Score Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Score Display */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(feedback.overall_score / 100) * 352} 352`}
                      strokeLinecap="round"
                      className={getScoreColor(feedback.overall_score)}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                  </svg>
                  <div className="absolute">
                    <p className={`text-4xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                      {feedback.overall_score}
                    </p>
                    <p className="text-sm text-gray-500">out of 100</p>
                  </div>
                </div>
                <Badge className="mt-4" variant="outline">
                  {getScoreLabel(feedback.overall_score)}
                </Badge>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3">
                <h3 className="font-semibold mb-3">Interview Metrics</h3>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Duration: {formatDuration(feedback.duration_seconds)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Responses: {feedback.metadata.messageCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Level: {feedback.metadata.experience}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {feedback.metadata.techStack.slice(0, 5).map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Hiring Recommendation */}
              <div>
                <h3 className="font-semibold mb-3">Hiring Recommendation</h3>
                <div className={`p-4 rounded-lg ${getRecommendationColor(feedback.hiring_recommendation)}`}>
                  <p className="font-medium">{feedback.hiring_recommendation.split('-')[0].trim()}</p>
                  <p className="text-sm mt-1 opacity-90">
                    {feedback.hiring_recommendation.split('-')[1]?.trim() || ''}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Feedback Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scores">Detailed Scores</TabsTrigger>
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {feedback.detailed_feedback}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Top Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                  Key Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.improvements.slice(0, 3).map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          {feedback.scores.map((score, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{score.category}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                      {score.score}
                    </span>
                    <span className="text-gray-500">/100</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={score.score} className="h-2" />
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {score.feedback}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {score.strengths.map((strength, i) => (
                        <li key={i} className="text-sm flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Areas for Improvement</h4>
                    <ul className="space-y-1">
                      {score.improvements.map((improvement, i) => (
                        <li key={i} className="text-sm flex items-start gap-1">
                          <TrendingUp className="w-3 h-3 text-orange-500 mt-0.5" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="strengths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Your Strengths
              </CardTitle>
              <CardDescription>
                These are the areas where you excelled during the interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedback.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <p className="text-sm flex-1">{strength}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Areas for Improvement
              </CardTitle>
              <CardDescription>
                Focus on these areas to enhance your interview performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedback.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-orange-600 mt-0.5" />
                    <p className="text-sm flex-1">{improvement}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push('/interviews')}>
          View All Interviews
        </Button>
        <Button onClick={() => router.push('/interview/voice')}>
          Practice Again
        </Button>
      </div>
    </div>
  );
}
