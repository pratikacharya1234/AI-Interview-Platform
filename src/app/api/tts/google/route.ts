import { NextRequest, NextResponse } from 'next/server';

/**
 * Google TTS API Route
 * Note: This endpoint returns 503 to trigger browser TTS fallback
 * Google Cloud TTS requires additional setup and credentials
 * For production, consider using Vapi's built-in TTS or browser Web Speech API
 */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Google Cloud TTS requires service account credentials
    // For now, we return 503 to trigger browser TTS fallback
    // To enable Google TTS:
    // 1. Set up Google Cloud project
    // 2. Enable Text-to-Speech API
    // 3. Create service account and download credentials
    // 4. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
    
    console.log('Google TTS not configured - using browser TTS fallback');
    return NextResponse.json(
      { 
        error: 'Google TTS not available',
        message: 'Using browser TTS fallback'
      },
      { status: 503 }
    );

  } catch (error: any) {
    console.error('Google TTS error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate speech',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
