// Agent sessions endpoint
import { NextApiRequest, NextApiResponse } from 'next';
import {
    createSuccessResponse,
    errorResponse,
    getAnonymousSessionId,
    getAuthHeader,
    getEnvVars,
    getPrismaClient,
    handleCORS,
    safeParseJSON,
    validateMethod,
    validateRequiredFields
} from '../../../lib/api/middleware';
import { validatePrivyToken } from '../../../lib/api/services/authService';
import { getOrCreateAnonymousSession } from '../../../lib/api/services/sessionService';
import {
    ApiResponse,
    AuthInfo,
    CreateAgentSessionRequest,
    CreateSessionResponse,
    EnvVars
} from '../../../lib/api/types';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<CreateSessionResponse>>
): Promise<void> {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  // Only allow POST method
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const env: EnvVars = getEnvVars();
    const prisma = getPrismaClient();
    
    // Parse authentication
    const authHeader: string | undefined = getAuthHeader(req);
    const authInfo: AuthInfo = await validatePrivyToken(authHeader, env);

    // Parse anonymous session
    const anonymousSessionId: string | undefined = getAnonymousSessionId(req);
    const anonymousSession = await getOrCreateAnonymousSession(anonymousSessionId, prisma);

    // Parse and validate request body
    const requestBody = safeParseJSON<CreateAgentSessionRequest>(req.body);
    if (!requestBody) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON in request body'
      });
    }

    const { isValid, missingFields } = validateRequiredFields(requestBody, ['agentId']);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const { agentId, initialMessage } = requestBody;

    // Create agent session
    const sessionData: any = {
      agentId,
      status: 'ACTIVE',
      conversation: initialMessage ? [{ role: 'user', content: initialMessage }] : [],
      messageCount: 0,
      tokenUsage: 0,
      createdAt: new Date(),
    };

    if (authInfo.isAuthenticated && authInfo.user) {
      sessionData.userId = authInfo.user.id;
    } else if (anonymousSession) {
      sessionData.anonymousSessionId = anonymousSession.id;
    } else {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const session = await prisma.agentSession.create({
      data: sessionData
    });

    console.log('✅ AI agent session created:', {
      sessionId: session.id,
      agentId: session.agentId,
      userId: session.userId,
      anonymousSessionId: session.anonymousSessionId,
    });

    const responseData: CreateSessionResponse = {
      success: true,
      session: {
        id: session.id,
        agentId: session.agentId,
        status: session.status,
        createdAt: session.createdAt,
        messageCount: session.messageCount,
        tokenUsage: session.tokenUsage || 0,
      }
    };

    res.status(200).json(createSuccessResponse(responseData));

  } catch (error) {
    console.error('Failed to create agent session:', error);
    errorResponse(res, error as Error, 500);
  }
} 