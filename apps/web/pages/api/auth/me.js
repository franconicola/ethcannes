// Auth me endpoint
import { getEnvVars, getPrismaClient, handleCORS, jsonResponse, validateMethod } from '../../../lib/api/middleware.js';
import { validatePrivyToken } from '../../../lib/api/services/authService.js';
import { getOrCreateAnonymousSession } from '../../../lib/api/services/sessionService.js';

export default async function handler(req, res) {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  // Only allow GET method
  if (!validateMethod(req, res, ['GET'])) return;

  try {
    const env = getEnvVars();
    const prisma = getPrismaClient();
    
    // Parse authentication
    const authHeader = req.headers.authorization;
    const authInfo = await validatePrivyToken(authHeader, env);

    // Parse anonymous session
    const anonymousSessionId = req.headers['x-anonymous-session-id'];
    const anonymousSession = await getOrCreateAnonymousSession(anonymousSessionId, prisma);

    jsonResponse(res, {
      success: authInfo.isAuthenticated,
      user: authInfo.user,
      isAuthenticated: authInfo.isAuthenticated,
    });
  } catch (error) {
    jsonResponse(res, {
      success: false,
      error: error.message
    }, 500);
  }
} 