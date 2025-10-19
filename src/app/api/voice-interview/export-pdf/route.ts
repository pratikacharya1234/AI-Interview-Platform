import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, feedback } = body

    if (!session_id || !feedback) {
      return NextResponse.json(
        { error: 'Session ID and feedback are required' },
        { status: 400 }
      )
    }

    // Get session data
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    const { data: session } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', session_id)
      .single()

    // Generate HTML content for PDF
    const htmlContent = generatePDFHTML(session, feedback)

    // For now, return HTML that can be printed as PDF
    // In production, you would use a service like Puppeteer or wkhtmltopdf
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="interview-feedback-${session_id}.html"`
      }
    })

  } catch (error) {
    console.error('Error exporting PDF:', error)
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    )
  }
}

function generatePDFHTML(session: any, feedback: any): string {
  const date = new Date().toLocaleDateString()
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Feedback Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #1e40af;
      margin: 0 0 10px 0;
    }
    .meta {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin: 30px 0;
    }
    .section h2 {
      color: #1e40af;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .scores {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .score-item {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
    }
    .score-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }
    .score-value {
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
    }
    .overall-score {
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin: 30px 0;
    }
    .overall-score .value {
      font-size: 48px;
      font-weight: bold;
    }
    .list {
      list-style: none;
      padding: 0;
    }
    .list li {
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
    }
    .list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
    }
    .improvements li:before {
      content: "→";
      color: #f59e0b;
    }
    .summary {
      background: #f9fafb;
      padding: 20px;
      border-left: 4px solid #2563eb;
      margin: 20px 0;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body {
        padding: 20px;
      }
      .overall-score {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Interview Feedback Report</h1>
    <div class="meta">
      <p><strong>Position:</strong> ${session?.position || 'N/A'}</p>
      <p><strong>Company:</strong> ${session?.company || 'N/A'}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Duration:</strong> ${feedback.interview_duration || 0} minutes</p>
    </div>
  </div>

  <div class="overall-score">
    <div class="value">${feedback.overall_score}/10</div>
    <div>Overall Performance Score</div>
  </div>

  <div class="section">
    <h2>Performance Metrics</h2>
    <div class="scores">
      <div class="score-item">
        <div class="score-label">Communication Clarity</div>
        <div class="score-value">${feedback.communication_clarity}/10</div>
      </div>
      <div class="score-item">
        <div class="score-label">Confidence Level</div>
        <div class="score-value">${feedback.confidence}/10</div>
      </div>
      <div class="score-item">
        <div class="score-label">Technical Understanding</div>
        <div class="score-value">${feedback.technical_understanding}/10</div>
      </div>
      <div class="score-item">
        <div class="score-label">Problem Solving</div>
        <div class="score-value">${feedback.problem_solving}/10</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Key Strengths</h2>
    <ul class="list">
      ${feedback.strengths?.map((s: string) => `<li>${s}</li>`).join('') || '<li>No specific strengths noted</li>'}
    </ul>
  </div>

  <div class="section">
    <h2>Areas for Improvement</h2>
    <ul class="list improvements">
      ${feedback.improvements?.map((i: string) => `<li>${i}</li>`).join('') || '<li>No specific improvements noted</li>'}
    </ul>
  </div>

  <div class="section">
    <h2>Detailed Summary</h2>
    <div class="summary">
      ${feedback.summary || 'No detailed summary available.'}
    </div>
  </div>

  <div class="section">
    <h2>Hiring Recommendation</h2>
    <p><strong>Decision:</strong> ${feedback.recommendation?.toUpperCase() || 'PENDING'}</p>
  </div>

  <div class="footer">
    <p>This report was generated automatically by the AI Interview Platform</p>
    <p>© ${new Date().getFullYear()} AI Interview Platform. All rights reserved.</p>
  </div>
</body>
</html>
  `
}
