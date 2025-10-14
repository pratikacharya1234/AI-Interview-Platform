import { NextRequest, NextResponse } from 'next/server'

/**
 * Generate Feedback Image API
 * Creates a visual feedback report image using Canvas
 */
export async function POST(request: NextRequest) {
  try {
    const { feedback, metrics, interviewId } = await request.json()

    if (!feedback || !metrics) {
      return NextResponse.json(
        { error: 'Feedback and metrics are required' },
        { status: 400 }
      )
    }

    // Generate SVG image with feedback data
    const svg = generateFeedbackSVG(feedback, metrics)
    
    // Convert SVG to base64
    const base64Image = Buffer.from(svg).toString('base64')
    const dataUrl = `data:image/svg+xml;base64,${base64Image}`

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      imageData: base64Image,
      format: 'svg'
    })

  } catch (error: any) {
    console.error('Feedback image generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate feedback image', details: error.message },
      { status: 500 }
    )
  }
}

function generateFeedbackSVG(feedback: any, metrics: any): string {
  const width = 1200
  const height = 800
  
  // Calculate scores
  const overallScore = feedback.scores?.overall || 0
  const communicationScore = feedback.scores?.communication || 0
  const technicalScore = feedback.scores?.technicalSkills || 0
  const problemSolvingScore = feedback.scores?.problemSolving || 0
  const culturalFitScore = feedback.scores?.culturalFit || 0

  // Generate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981' // green
    if (score >= 60) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
      
      <!-- Main Container -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" 
            fill="white" rx="20" filter="url(#shadow)"/>
      
      <!-- Header -->
      <text x="${width / 2}" y="100" font-family="Arial, sans-serif" 
            font-size="42" font-weight="bold" fill="#1f2937" text-anchor="middle">
        Interview Feedback Report
      </text>
      
      <!-- Overall Score Circle -->
      <circle cx="200" cy="280" r="80" fill="#f3f4f6" stroke="${getScoreColor(overallScore)}" stroke-width="8"/>
      <text x="200" y="290" font-family="Arial, sans-serif" 
            font-size="48" font-weight="bold" fill="${getScoreColor(overallScore)}" text-anchor="middle">
        ${overallScore}
      </text>
      <text x="200" y="320" font-family="Arial, sans-serif" 
            font-size="18" fill="#6b7280" text-anchor="middle">
        Overall Score
      </text>
      
      <!-- Metrics -->
      <text x="350" y="200" font-family="Arial, sans-serif" 
            font-size="24" font-weight="bold" fill="#1f2937">
        Performance Metrics
      </text>
      
      <!-- Communication Score Bar -->
      <text x="350" y="240" font-family="Arial, sans-serif" font-size="16" fill="#4b5563">
        Communication
      </text>
      <rect x="350" y="250" width="700" height="30" fill="#e5e7eb" rx="15"/>
      <rect x="350" y="250" width="${(communicationScore / 100) * 700}" height="30" 
            fill="${getScoreColor(communicationScore)}" rx="15"/>
      <text x="${350 + (communicationScore / 100) * 700 + 20}" y="270" 
            font-family="Arial, sans-serif" font-size="16" font-weight="bold" 
            fill="${getScoreColor(communicationScore)}">
        ${communicationScore}%
      </text>
      
      <!-- Technical Skills Bar -->
      <text x="350" y="310" font-family="Arial, sans-serif" font-size="16" fill="#4b5563">
        Technical Skills
      </text>
      <rect x="350" y="320" width="700" height="30" fill="#e5e7eb" rx="15"/>
      <rect x="350" y="320" width="${(technicalScore / 100) * 700}" height="30" 
            fill="${getScoreColor(technicalScore)}" rx="15"/>
      <text x="${350 + (technicalScore / 100) * 700 + 20}" y="340" 
            font-family="Arial, sans-serif" font-size="16" font-weight="bold" 
            fill="${getScoreColor(technicalScore)}">
        ${technicalScore}%
      </text>
      
      <!-- Problem Solving Bar -->
      <text x="350" y="380" font-family="Arial, sans-serif" font-size="16" fill="#4b5563">
        Problem Solving
      </text>
      <rect x="350" y="390" width="700" height="30" fill="#e5e7eb" rx="15"/>
      <rect x="350" y="390" width="${(problemSolvingScore / 100) * 700}" height="30" 
            fill="${getScoreColor(problemSolvingScore)}" rx="15"/>
      <text x="${350 + (problemSolvingScore / 100) * 700 + 20}" y="410" 
            font-family="Arial, sans-serif" font-size="16" font-weight="bold" 
            fill="${getScoreColor(problemSolvingScore)}">
        ${problemSolvingScore}%
      </text>
      
      <!-- Cultural Fit Bar -->
      <text x="350" y="450" font-family="Arial, sans-serif" font-size="16" fill="#4b5563">
        Cultural Fit
      </text>
      <rect x="350" y="460" width="700" height="30" fill="#e5e7eb" rx="15"/>
      <rect x="350" y="460" width="${(culturalFitScore / 100) * 700}" height="30" 
            fill="${getScoreColor(culturalFitScore)}" rx="15"/>
      <text x="${350 + (culturalFitScore / 100) * 700 + 20}" y="480" 
            font-family="Arial, sans-serif" font-size="16" font-weight="bold" 
            fill="${getScoreColor(culturalFitScore)}">
        ${culturalFitScore}%
      </text>
      
      <!-- Interview Stats -->
      <rect x="80" y="520" width="1040" height="200" fill="#f9fafb" rx="15"/>
      
      <text x="120" y="560" font-family="Arial, sans-serif" 
            font-size="20" font-weight="bold" fill="#1f2937">
        Interview Statistics
      </text>
      
      <!-- Stats Grid -->
      <text x="120" y="600" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
        Duration: <tspan font-weight="bold" fill="#1f2937">${Math.floor(metrics.interviewDuration / 60)} min</tspan>
      </text>
      <text x="120" y="630" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
        Questions: <tspan font-weight="bold" fill="#1f2937">${metrics.totalQuestions}</tspan>
      </text>
      <text x="120" y="660" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
        Avg Response: <tspan font-weight="bold" fill="#1f2937">${metrics.averageResponseLength} words</tspan>
      </text>
      
      <text x="600" y="600" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
        Total Words: <tspan font-weight="bold" fill="#1f2937">${metrics.totalWords}</tspan>
      </text>
      <text x="600" y="630" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
        Confidence: <tspan font-weight="bold" fill="#1f2937">${metrics.confidenceScore}%</tspan>
      </text>
      <text x="600" y="660" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
        Completion: <tspan font-weight="bold" fill="#1f2937">${metrics.completionRate}%</tspan>
      </text>
      
      <!-- Footer -->
      <text x="${width / 2}" y="760" font-family="Arial, sans-serif" 
            font-size="14" fill="#9ca3af" text-anchor="middle">
        Generated by AI Interview Platform • ${new Date().toLocaleDateString()}
      </text>
    </svg>
  `

  return svg
}
