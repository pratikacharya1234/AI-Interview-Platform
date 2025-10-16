import { NextRequest, NextResponse } from 'next/server'

const RUNWARE_API_KEY = 'gDClrvGzAnshgGUFrKnLt3CDyrG7uxTm'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log('Generating image with prompt:', prompt)

    // Try Runware API with fallback
    try {
      const response = await fetch('https://api.runware.ai/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RUNWARE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
          taskType: "imageInference",
          prompt: prompt,
          model: "runware:100@1",
          width: 512,
          height: 512,
          steps: 20,
          guidance_scale: 7.5
        }])
      })

      if (!response.ok) {
        console.error('Runware API error:', await response.text())
        throw new Error('Runware API failed')
      }

      const data = await response.json()
      
      console.log('Image generated successfully!')
      
      return NextResponse.json({ 
        success: true,
        imageUrl: data.images?.[0]?.url || data.url || data.image_url,
        data: data
      })
      
    } catch (runwareError) {
      console.log('Using fallback placeholder image')
      
      // Return a placeholder image URL for demo purposes
      const placeholderUrl = `https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=${encodeURIComponent('Interview Summary')}`
      
      return NextResponse.json({ 
        success: true,
        imageUrl: placeholderUrl,
        fallback: true,
        message: 'Using placeholder image for demo'
      })
    }

  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}