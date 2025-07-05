// Dynamic agent sessions endpoint for chat, stop, and conversation
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
    validateRequiredFields
} from '../../../../lib/api/middleware';
import { validatePrivyToken } from '../../../../lib/api/services/authService';
import { getOrCreateAnonymousSession } from '../../../../lib/api/services/sessionService';
import {
    ApiResponse,
    AuthInfo,
    ChatRequest,
    ChatResponse,
    ConversationResponse,
    EnvVars,
    StopSessionResponse
} from '../../../../lib/api/types';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<ChatResponse | StopSessionResponse | ConversationResponse>>
): Promise<void> {
  // Handle CORS
  if (handleCORS(req, res)) return;

  try {
    const env: EnvVars = getEnvVars();
    const prisma = getPrismaClient();
    
    // Parse authentication
    const authHeader: string | undefined = getAuthHeader(req);
    const authInfo: AuthInfo = await validatePrivyToken(authHeader, env);

    // Parse anonymous session
    const anonymousSessionId: string | undefined = getAnonymousSessionId(req);
    const anonymousSession = await getOrCreateAnonymousSession(anonymousSessionId, prisma);

    // Parse route parameters
    const { slug } = req.query;
    
    if (!slug || !Array.isArray(slug) || slug.length < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid route'
      });
    }

    const sessionId: string = slug[0];
    const action: string | undefined = slug[1]; // 'chat', 'stop', or 'conversation'

    // Route based on action
    if (action === 'chat' && req.method === 'POST') {
      return await handleChat(req, res, sessionId, env, authInfo, anonymousSession, prisma);
    } else if (action === 'stop' && req.method === 'POST') {
      return await handleStop(req, res, sessionId, env, authInfo, anonymousSession, prisma);
    } else if (action === 'conversation' && req.method === 'GET') {
      return await handleConversation(req, res, sessionId, env, authInfo, anonymousSession, prisma);
    } else {
      return res.status(405).json({
        success: false,
        error: 'Invalid action or method'
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    errorResponse(res, error as Error, 500);
  }
}

// Handle chat functionality
async function handleChat(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<ChatResponse>>, 
  sessionId: string, 
  env: EnvVars, 
  authInfo: AuthInfo, 
  anonymousSession: any, 
  prisma: any
): Promise<void> {
  const requestBody = safeParseJSON<ChatRequest>(req.body);
  if (!requestBody) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body'
    });
  }

  const { isValid, missingFields } = validateRequiredFields(requestBody, ['message']);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  const { message } = requestBody;

  if (!message.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Message cannot be empty'
    });
  }

  // Build where clause based on authentication status
  const whereClause: any = { id: sessionId };
  
  if (authInfo.isAuthenticated && authInfo.user) {
    whereClause.userId = authInfo.user.id;
  } else if (anonymousSession) {
    whereClause.anonymousSessionId = anonymousSession.id;
  } else {
    return res.status(403).json({
      success: false,
      error: 'Session access denied',
      code: 'ACCESS_DENIED'
    });
  }

  // Find the session
  const session = await prisma.agentSession.findFirst({
    where: whereClause
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'AI agent session not found',
      code: 'SESSION_NOT_FOUND'
    });
  }

  // For now, return a simple echo response
  // In a real implementation, you'd integrate with the AI service
  const userMessage = await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      messageText: message,
      messageType: 'USER',
      createdAt: new Date(),
      creditsUsed: 0
    }
  });

  const agentMessage = await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      messageText: `AI Agent Response: ${message}`,
      messageType: 'AGENT',
      createdAt: new Date(),
      creditsUsed: 0
    }
  });

  // Update session message count
  await prisma.agentSession.update({
    where: { id: sessionId },
    data: {
      messageCount: { increment: 2 }, // User + Agent message
      tokenUsage: { increment: 100 } // Mock token usage
    }
  });

  const responseData: ChatResponse = {
    success: true,
    userMessage: {
      id: userMessage.id,
      messageText: userMessage.messageText,
      messageType: userMessage.messageType,
      createdAt: userMessage.createdAt,
    },
    agentMessage: {
      id: agentMessage.id,
      messageText: agentMessage.messageText,
      messageType: agentMessage.messageType,
      createdAt: agentMessage.createdAt,
    },
    tokenUsage: { total: 100 },
    agentName: 'AI Agent',
    isAuthenticated: authInfo.isAuthenticated,
    freeMessagesRemaining: 10
  };

  res.status(200).json(createSuccessResponse(responseData));
}

// Handle stop functionality
async function handleStop(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<StopSessionResponse>>, 
  sessionId: string, 
  env: EnvVars, 
  authInfo: AuthInfo, 
  anonymousSession: any, 
  prisma: any
): Promise<void> {
  // Build where clause based on authentication status
  const whereClause: any = { id: sessionId };
  
  if (authInfo.isAuthenticated && authInfo.user) {
    whereClause.userId = authInfo.user.id;
  } else if (anonymousSession) {
    whereClause.anonymousSessionId = anonymousSession.id;
  } else {
    return res.status(403).json({
      success: false,
      error: 'Session access denied',
      code: 'ACCESS_DENIED'
    });
  }

  // Find the session
  const session = await prisma.agentSession.findFirst({
    where: whereClause
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'AI agent session not found',
      code: 'SESSION_NOT_FOUND'
    });
  }

  // Calculate session duration
  const sessionDuration = Math.round((new Date().getTime() - session.createdAt.getTime()) / 1000);

  // Update session in database
  const updatedSession = await prisma.agentSession.update({
    where: { id: sessionId },
    data: {
      status: 'ENDED',
      endedAt: new Date(),
      duration: sessionDuration,
    }
  });

  const responseData: StopSessionResponse = {
    success: true,
    session: {
      id: updatedSession.id,
      agentId: updatedSession.agentId,
      status: updatedSession.status,
      endedAt: updatedSession.endedAt,
      duration: updatedSession.duration,
      messageCount: updatedSession.messageCount,
    }
  };

  res.status(200).json(createSuccessResponse(responseData));
}

// Handle conversation history
async function handleConversation(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<ConversationResponse>>, 
  sessionId: string, 
  env: EnvVars, 
  authInfo: AuthInfo, 
  anonymousSession: any, 
  prisma: any
): Promise<void> {
  // Build where clause based on authentication status
  const whereClause: any = { id: sessionId };
  
  if (authInfo.isAuthenticated && authInfo.user) {
    whereClause.userId = authInfo.user.id;
  } else if (anonymousSession) {
    whereClause.anonymousSessionId = anonymousSession.id;
  } else {
    return res.status(403).json({
      success: false,
      error: 'Session access denied',
      code: 'ACCESS_DENIED'
    });
  }

  // Find the session
  const session = await prisma.agentSession.findFirst({
    where: whereClause,
    include: {
      chatMessages: {
        orderBy: { createdAt: 'asc' },
        take: 100, // Limit to last 100 messages
      }
    }
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'AI agent session not found',
      code: 'SESSION_NOT_FOUND'
    });
  }

  const responseData: ConversationResponse = {
    success: true,
    session: {
      id: session.id,
      agentId: session.agentId,
      status: session.status,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
      duration: session.duration,
      messageCount: session.messageCount,
      tokenUsage: session.tokenUsage || 0,
    },
    conversation: session.conversation || [],
    messages: session.chatMessages,
    isAuthenticated: authInfo.isAuthenticated,
  };

  res.status(200).json(createSuccessResponse(responseData));
} 