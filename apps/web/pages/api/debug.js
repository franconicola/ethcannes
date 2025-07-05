// Debug endpoint
import { getEnvVars, handleCORS, jsonResponse, validateMethod } from '../../lib/api/middleware.js';

export default async function handler(req, res) {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  // Only allow GET method
  if (!validateMethod(req, res, ['GET'])) return;

  try {
    const env = getEnvVars();
    
    jsonResponse(res, {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV || 'unknown',
      hasDatabase: !!env.DATABASE_URL,
      hasPrivyConfig: !!(env.PRIVY_APP_ID && env.PRIVY_APP_SECRET),
      hasJwtSecret: !!env.JWT_SECRET,
      hasOpenAIKey: !!env.OPENAI_API_KEY,
      platform: 'vercel',
      note: 'Using Prisma with Vercel Functions and AI Agents'
    });
  } catch (error) {
    jsonResponse(res, {
      success: false,
      error: error.message
    }, 500);
  }
} 