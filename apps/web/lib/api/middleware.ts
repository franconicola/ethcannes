// Shared middleware utilities for Vercel Functions
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import {
    APIError,
    ApiRequest,
    ApiResponse,
    EnvVars
} from './types';

// CORS utilities
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Anonymous-Session-Id',
  'Access-Control-Max-Age': '86400',
} as const;

// Apply CORS headers to response
export function applyCORS(res: NextApiResponse): void {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

// Handle CORS preflight requests
export function handleCORS(req: NextApiRequest, res: NextApiResponse): boolean {
  applyCORS(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// Initialize Prisma client
let prisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
}

// Environment variables helper
export function getEnvVars(): EnvVars {
  return {
    DATABASE_URL: process.env.DATABASE_URL || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    OPENAI_MAX_TOKENS: process.env.OPENAI_MAX_TOKENS,
    OPENAI_TEMPERATURE: process.env.OPENAI_TEMPERATURE,
    PRIVY_APP_ID: process.env.PRIVY_APP_ID || '',
    PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    NODE_ENV: process.env.NODE_ENV,
  };
}

// JSON response helper with CORS
export function jsonResponse<T = any>(
  res: NextApiResponse<ApiResponse<T>>, 
  data: ApiResponse<T>, 
  status: number = 200
): void {
  applyCORS(res);
  res.status(status).json(data);
}

// Error response helper
export function errorResponse(
  res: NextApiResponse<ApiResponse>, 
  error: APIError | Error, 
  status: number = 500
): void {
  console.error('API Error:', error);
  applyCORS(res);
  res.status(status).json({
    success: false,
    error: 'Internal Server Error',
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}

// Method validation helper
export function validateMethod(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse>, 
  allowedMethods: string[]
): boolean {
  if (!allowedMethods.includes(req.method || '')) {
    jsonResponse(res, { 
      success: false, 
      error: 'Method not allowed' 
    }, 405);
    return false;
  }
  return true;
}

// Type guard for API requests
export function isApiRequest(req: NextApiRequest): req is ApiRequest {
  return req !== null && typeof req === 'object';
}

// Helper to extract anonymous session ID from headers
export function getAnonymousSessionId(req: NextApiRequest): string | undefined {
  return req.headers['x-anonymous-session-id'] as string | undefined;
}

// Helper to extract authorization header
export function getAuthHeader(req: NextApiRequest): string | undefined {
  return req.headers.authorization;
}

// Helper to safely parse JSON body
export function safeParseJSON<T = any>(body: any): T | null {
  try {
    if (typeof body === 'string') {
      return JSON.parse(body) as T;
    }
    return body as T;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
}

// Helper to validate required fields
export function validateRequiredFields<T extends Record<string, any>>(
  data: T, 
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  );
  
  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields.map(field => String(field))
  };
}

// Helper to create standardized error responses
export function createErrorResponse(
  message: string, 
  code?: string, 
  statusCode?: number
): ApiResponse & { statusCode: number } {
  return {
    success: false,
    error: message,
    code,
    statusCode: statusCode || 500
  };
}

// Helper to create standardized success responses
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  };
} 