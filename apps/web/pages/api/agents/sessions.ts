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
import { getAgentById } from '../../../lib/api/services/aiAgentService';
import { validatePrivyToken } from '../../../lib/api/services/authService';
import { getOrCreateAnonymousSession } from '../../../lib/api/services/sessionService';
import {
    ApiResponse,
    AuthInfo,
    CreateAgentSessionRequest,
    CreateSessionResponse,
    EnvVars
} from '../../../lib/api/types';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

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

    // Look up agent details to get the agent name
    const agent = await getAgentById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Agent not found: ${agentId}`
      });
    }

    // Create agent session with required agentName field
    const sessionData: any = {
      agentId,
      agentName: agent.name, // Include the required agent name
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
      agentName: session.agentName,
      userId: session.userId,
      anonymousSessionId: session.anonymousSessionId,
    });

    const responseData: CreateSessionResponse = {
      success: true,
      session: {
        id: session.id,
        agentId: session.agentId,
        agentName: session.agentName, // Include agent name in response
        status: session.status,
        createdAt: session.createdAt,
        messageCount: session.messageCount,
        tokenUsage: typeof session.tokenUsage === 'number' ? session.tokenUsage : 0,
        conversation: session.conversation || [],
        isAuthenticated: authInfo.isAuthenticated,
        freeMessagesRemaining: anonymousSession?.freeMessagesUsed ? 
          Math.max(0, 10 - anonymousSession.freeMessagesUsed) : 10, // Default free limit
      }
    };

    res.status(200).json(createSuccessResponse(responseData));

  } catch (error) {
    console.error('Failed to create agent session:', error);
    errorResponse(res, error as Error, 500);
  }
} 