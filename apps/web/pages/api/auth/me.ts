// Auth me endpoint
import { NextApiRequest, NextApiResponse } from 'next';
import {
    createSuccessResponse,
    errorResponse,
    getAnonymousSessionId,
    getAuthHeader,
    getEnvVars,
    getPrismaClient,
    handleCORS,
    validateMethod
} from '../../../lib/api/middleware';
import { validatePrivyToken } from '../../../lib/api/services/authService';
import { getOrCreateAnonymousSession } from '../../../lib/api/services/sessionService';
import { ApiResponse, AuthInfo, AuthMeResponse, EnvVars } from '../../../lib/api/types';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<AuthMeResponse>>
): Promise<void> {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  // Only allow GET method
  if (!validateMethod(req, res, ['GET'])) return;

  try {
    const env: EnvVars = getEnvVars();
    const prisma = getPrismaClient();
    
    // Parse authentication
    const authHeader: string | undefined = getAuthHeader(req);
    const authInfo: AuthInfo = await validatePrivyToken(authHeader, env);

    // Parse anonymous session
    const anonymousSessionId: string | undefined = getAnonymousSessionId(req);
    const anonymousSession = await getOrCreateAnonymousSession(anonymousSessionId, prisma);

    const responseData: AuthMeResponse = {
      success: authInfo.isAuthenticated,
      user: authInfo.user,
      isAuthenticated: authInfo.isAuthenticated,
    };

    res.status(200).json(createSuccessResponse(responseData));
  } catch (error) {
    errorResponse(res, error as Error, 500);
  }
} 