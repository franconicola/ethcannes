// Debug endpoint
import { NextApiRequest, NextApiResponse } from 'next';
import {
    createSuccessResponse,
    errorResponse,
    getEnvVars,
    handleCORS,
    validateMethod
} from '../../lib/api/middleware';
import { ApiResponse, DebugResponse, EnvVars } from '../../lib/api/types';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<DebugResponse>>
): Promise<void> {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  // Only allow GET method
  if (!validateMethod(req, res, ['GET'])) return;

  try {
    const env: EnvVars = getEnvVars();
    
    const debugData: DebugResponse = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV || 'unknown',
      hasDatabase: !!env.DATABASE_URL,
      hasPrivyConfig: !!(env.PRIVY_APP_ID && env.PRIVY_APP_SECRET),
      hasJwtSecret: !!env.JWT_SECRET,
      hasOpenAIKey: !!env.OPENAI_API_KEY,
      platform: 'vercel',
      note: 'Using Prisma with Vercel Functions and AI Agents'
    };

    res.status(200).json(createSuccessResponse(debugData));
  } catch (error) {
    errorResponse(res, error as Error, 500);
  }
} 