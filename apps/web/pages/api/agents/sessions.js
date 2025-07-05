// Agent sessions endpoint
import { getEnvVars, getPrismaClient, handleCORS, jsonResponse, validateMethod } from '../../../lib/api/middleware.js';
import { validatePrivyToken } from '../../../lib/api/services/authService.js';
import { getOrCreateAnonymousSession } from '../../../lib/api/services/sessionService.js';
import { createError } from '../../../lib/api/utils/errors.js';

export default async function handler(req, res) {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  // Only allow POST method
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const env = getEnvVars();
    const prisma = getPrismaClient();
    
    // Parse authentication
    const authHeader = req.headers.authorization;
    const authInfo = await validatePrivyToken(authHeader, env);

    // Parse anonymous session
    const anonymousSessionId = req.headers['x-anonymous-session-id'];
    const anonymousSession = await getOrCreateAnonymousSession(anonymousSessionId, prisma);

    // Parse request body
    const { agentId, initialMessage } = req.body;

    if (!agentId) {
      return jsonResponse(res, {
        success: false,
        error: 'Agent ID is required'
      }, 400);
    }

    // Create agent session
    const sessionData = {
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
      throw createError('Authentication required', 401, 'AUTH_REQUIRED');
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

    jsonResponse(res, {
      success: true,
      session: {
        id: session.id,
        agentId: session.agentId,
        status: session.status,
        createdAt: session.createdAt,
        messageCount: session.messageCount,
        tokenUsage: session.tokenUsage,
      }
    });

  } catch (error) {
    console.error('Failed to create agent session:', error);
    jsonResponse(res, {
      success: false,
      error: error.message || 'Failed to create agent session',
      code: error.code
    }, error.statusCode || 500);
  }
} 