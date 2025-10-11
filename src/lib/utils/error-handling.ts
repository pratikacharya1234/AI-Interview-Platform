/**
 * Production-grade error handling and logging utilities
 */

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  AI_SERVICE = 'AI_SERVICE',
  FILE_UPLOAD = 'FILE_UPLOAD',
  SPEECH_RECOGNITION = 'SPEECH_RECOGNITION',
  AUDIO_PROCESSING = 'AUDIO_PROCESSING',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  details?: any
  timestamp: Date
  userId?: string
  sessionId?: string
  context?: Record<string, any>
}

export class ApplicationError extends Error {
  public readonly type: ErrorType
  public readonly details?: any
  public readonly timestamp: Date
  public readonly userId?: string
  public readonly sessionId?: string
  public readonly context?: Record<string, any>

  constructor(
    type: ErrorType,
    message: string,
    details?: any,
    userId?: string,
    sessionId?: string,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApplicationError'
    this.type = type
    this.details = details
    this.timestamp = new Date()
    this.userId = userId
    this.sessionId = sessionId
    this.context = context
  }

  toJSON(): AppError {
    return {
      type: this.type,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      userId: this.userId,
      sessionId: this.sessionId,
      context: this.context
    }
  }
}

/**
 * Logger utility for production environment
 */
export class Logger {
  static error(error: ApplicationError | Error, context?: Record<string, any>) {
    const errorData = error instanceof ApplicationError ? error.toJSON() : {
      type: ErrorType.UNKNOWN,
      message: error.message,
      details: error.stack,
      timestamp: new Date(),
      context
    }

    // In production, send to logging service (e.g., Sentry, LogRocket, etc.)
    console.error('Application Error:', JSON.stringify(errorData, null, 2))
    
    // TODO: Integrate with actual logging service
    // Example: Sentry.captureException(error, { extra: errorData })
  }

  static warn(message: string, context?: Record<string, any>) {
    console.warn(`[WARNING] ${message}`, context ? JSON.stringify(context) : '')
  }

  static info(message: string, context?: Record<string, any>) {
    console.info(`[INFO] ${message}`, context ? JSON.stringify(context) : '')
  }

  static debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context ? JSON.stringify(context) : '')
    }
  }
}

/**
 * Error handler for API routes
 */
export function handleApiError(error: unknown, userId?: string, sessionId?: string) {
  let appError: ApplicationError

  if (error instanceof ApplicationError) {
    appError = error
  } else if (error instanceof Error) {
    appError = new ApplicationError(
      ErrorType.UNKNOWN,
      error.message,
      error.stack,
      userId,
      sessionId
    )
  } else {
    appError = new ApplicationError(
      ErrorType.UNKNOWN,
      'An unexpected error occurred',
      error,
      userId,
      sessionId
    )
  }

  Logger.error(appError)
  return appError
}

/**
 * User-friendly error messages for different error types
 */
export function getUserFriendlyMessage(error: ApplicationError): string {
  switch (error.type) {
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.'
    
    case ErrorType.AUTHENTICATION:
      return 'Please sign in to continue.'
    
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.'
    
    case ErrorType.DATABASE:
      return 'We are experiencing technical difficulties. Please try again later.'
    
    case ErrorType.NETWORK:
      return 'Network connection issue. Please check your internet connection.'
    
    case ErrorType.AI_SERVICE:
      return 'AI analysis is temporarily unavailable. Your response has been recorded.'
    
    case ErrorType.FILE_UPLOAD:
      return 'Failed to upload file. Please try again.'
    
    case ErrorType.SPEECH_RECOGNITION:
      return 'Speech recognition failed. Please try speaking again.'
    
    case ErrorType.AUDIO_PROCESSING:
      return 'Audio processing failed. Please check your microphone settings.'
    
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Validation utilities
 */
export class Validator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ApplicationError(
        ErrorType.VALIDATION,
        `${fieldName} is required`,
        { field: fieldName, value }
      )
    }
  }

  static validateStringLength(
    value: string, 
    fieldName: string, 
    minLength?: number, 
    maxLength?: number
  ): void {
    if (minLength && value.length < minLength) {
      throw new ApplicationError(
        ErrorType.VALIDATION,
        `${fieldName} must be at least ${minLength} characters`,
        { field: fieldName, value, minLength, actualLength: value.length }
      )
    }
    
    if (maxLength && value.length > maxLength) {
      throw new ApplicationError(
        ErrorType.VALIDATION,
        `${fieldName} must not exceed ${maxLength} characters`,
        { field: fieldName, value, maxLength, actualLength: value.length }
      )
    }
  }

  static validateNumber(
    value: number, 
    fieldName: string, 
    min?: number, 
    max?: number
  ): void {
    if (min !== undefined && value < min) {
      throw new ApplicationError(
        ErrorType.VALIDATION,
        `${fieldName} must be at least ${min}`,
        { field: fieldName, value, min }
      )
    }
    
    if (max !== undefined && value > max) {
      throw new ApplicationError(
        ErrorType.VALIDATION,
        `${fieldName} must not exceed ${max}`,
        { field: fieldName, value, max }
      )
    }
  }
}

/**
 * Async operation wrapper with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorType: ErrorType = ErrorType.UNKNOWN,
  context?: Record<string, any>
): Promise<{ success: true; data: T } | { success: false; error: ApplicationError }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    const appError = error instanceof ApplicationError 
      ? error 
      : new ApplicationError(errorType, error instanceof Error ? error.message : 'Unknown error', error, undefined, undefined, context)
    
    Logger.error(appError)
    return { success: false, error: appError }
  }
}

/**
 * Retry mechanism for unreliable operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  errorType: ErrorType = ErrorType.NETWORK
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      if (attempt === maxRetries) {
        throw new ApplicationError(
          errorType,
          `Operation failed after ${maxRetries} attempts: ${lastError.message}`,
          { attempts: maxRetries, lastError: lastError.message }
        )
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError!
}