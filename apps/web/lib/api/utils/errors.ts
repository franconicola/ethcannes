// Error utilities for API endpoints
import { APIError } from '../types';

// Create a custom API error
export function createError(
  message: string,
  statusCode: number = 500,
  code?: string
): APIError {
  const error = new Error(message) as APIError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

// Common error creators
export function createValidationError(message: string): APIError {
  return createError(message, 400, 'VALIDATION_ERROR');
}

export function createAuthError(message: string = 'Authentication required'): APIError {
  return createError(message, 401, 'AUTH_ERROR');
}

export function createForbiddenError(message: string = 'Access denied'): APIError {
  return createError(message, 403, 'FORBIDDEN_ERROR');
}

export function createNotFoundError(message: string = 'Resource not found'): APIError {
  return createError(message, 404, 'NOT_FOUND_ERROR');
}

export function createRateLimitError(message: string = 'Rate limit exceeded'): APIError {
  return createError(message, 429, 'RATE_LIMIT_ERROR');
}

export function createInternalError(message: string = 'Internal server error'): APIError {
  return createError(message, 500, 'INTERNAL_ERROR');
}

// Error type guards
export function isAPIError(error: unknown): error is APIError {
  return error instanceof Error && 'statusCode' in error;
}

export function isValidationError(error: unknown): boolean {
  return isAPIError(error) && error.code === 'VALIDATION_ERROR';
}

export function isAuthError(error: unknown): boolean {
  return isAPIError(error) && error.code === 'AUTH_ERROR';
}

// Error logging utility
export function logError(error: unknown, context: string = 'API'): void {
  if (isAPIError(error)) {
    console.error(`[${context}] ${error.code || 'ERROR'}: ${error.message}`, {
      statusCode: error.statusCode,
      stack: error.stack
    });
  } else {
    console.error(`[${context}] Unexpected error:`, error);
  }
}

// Error formatting for responses
export function formatError(error: unknown): {
  error: string;
  code?: string;
  statusCode: number;
} {
  if (isAPIError(error)) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode || 500
    };
  }
  
  return {
    error: 'Internal server error',
    statusCode: 500
  };
} 