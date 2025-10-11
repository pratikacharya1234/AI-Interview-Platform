import { NextRequest, NextResponse } from 'next/server'
import { ApplicationError, ErrorType, Logger, Validator, withRetry } from '@/lib/utils/error-handling'

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      modelId = 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Leonardo Diffusion XL
      width = 1024,
      height = 1024,
      num_images = 1,
      guidance_scale = 7,
      num_inference_steps = 20
    } = await request.json()

    // Validate input
    Validator.validateRequired(prompt, 'Prompt')
    Validator.validateStringLength(prompt, 'Prompt', 10, 1000)
    Validator.validateNumber(width, 'Width', 512, 2048)
    Validator.validateNumber(height, 'Height', 512, 2048)

    if (!process.env.LEONARDO_API_KEY) {
      throw new ApplicationError(
        ErrorType.AI_SERVICE,
        'Leonardo AI API key not configured',
        { service: 'Leonardo AI' }
      )
    }

    // Generate image with retry mechanism
    const result = await withRetry(async () => {
      // Step 1: Submit generation request
      const generationResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modelId,
          width,
          height,
          num_images,
          guidance_scale,
          num_inference_steps,
          presetStyle: 'GENERAL',
          scheduler: 'DPM_SOLVER',
          public: false,
          promptMagic: true,
          photoReal: false,
          alchemy: false
        })
      })

      if (!generationResponse.ok) {
        const error = await generationResponse.json().catch(() => ({ error: 'Unknown error' }))
        throw new ApplicationError(
          ErrorType.AI_SERVICE,
          `Leonardo AI generation failed: ${generationResponse.status} - ${error.message || 'Unknown error'}`,
          { status: generationResponse.status, error }
        )
      }

      const generationData = await generationResponse.json()
      const generationId = generationData.sdGenerationJob?.generationId

      if (!generationId) {
        throw new ApplicationError(
          ErrorType.AI_SERVICE,
          'No generation ID received from Leonardo AI',
          { generationData }
        )
      }

      // Step 2: Poll for completion
      let attempts = 0
      const maxAttempts = 60 // 5 minutes maximum wait time
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
        
        const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`
          }
        })

        if (!statusResponse.ok) {
          throw new ApplicationError(
            ErrorType.AI_SERVICE,
            `Failed to check generation status: ${statusResponse.status}`,
            { generationId }
          )
        }

        const statusData = await statusResponse.json()
        const generation = statusData.generations_by_pk

        if (generation?.status === 'COMPLETE' && generation.generated_images?.length > 0) {
          return generation.generated_images[0]
        }

        if (generation?.status === 'FAILED') {
          throw new ApplicationError(
            ErrorType.AI_SERVICE,
            'Leonardo AI generation failed',
            { generationId, status: generation.status }
          )
        }

        attempts++
      }

      throw new ApplicationError(
        ErrorType.AI_SERVICE,
        'Leonardo AI generation timeout',
        { generationId, attempts }
      )
      
    }, 2, 2000, ErrorType.AI_SERVICE)

    Logger.info('Leonardo AI image generation successful', {
      prompt: prompt.substring(0, 100),
      imageUrl: result.url,
      generationTime: 'completed'
    })

    return NextResponse.json({
      success: true,
      imageUrl: result.url,
      id: result.id,
      seed: result.seed,
      prompt: prompt
    })

  } catch (error) {
    Logger.error(error as ApplicationError)
    
    if (error instanceof ApplicationError) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message, 
          type: error.type 
        },
        { status: error.type === ErrorType.VALIDATION ? 400 : 500 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Image generation failed', 
        type: ErrorType.AI_SERVICE 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const generationId = url.searchParams.get('id')

    if (!generationId) {
      return NextResponse.json(
        { error: 'Generation ID required' },
        { status: 400 }
      )
    }

    if (!process.env.LEONARDO_API_KEY) {
      throw new ApplicationError(
        ErrorType.AI_SERVICE,
        'Leonardo AI API key not configured'
      )
    }

    const response = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`
      }
    })

    if (!response.ok) {
      throw new ApplicationError(
        ErrorType.AI_SERVICE,
        `Failed to get generation: ${response.status}`,
        { generationId }
      )
    }

    const data = await response.json()
    const generation = data.generations_by_pk

    return NextResponse.json({
      id: generationId,
      status: generation?.status || 'UNKNOWN',
      images: generation?.generated_images || [],
      complete: generation?.status === 'COMPLETE'
    })

  } catch (error) {
    Logger.error(error as ApplicationError)
    return NextResponse.json(
      { error: 'Failed to get generation status' },
      { status: 500 }
    )
  }
}