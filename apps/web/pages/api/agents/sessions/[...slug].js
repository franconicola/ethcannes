// Dynamic agent sessions endpoint for chat, stop, and conversation
import { getEnvVars, getPrismaClient, handleCORS, jsonResponse } from '../../../../lib/api/middleware.js';
import { validatePrivyToken } from '../../../../lib/api/services/authService.js';
import { getOrCreateAnonymousSession } from '../../../../lib/api/services/sessionService.js';
import { createError } from '../../../../lib/api/utils/errors.js';

export default async function handler(req, res) {
  // Handle CORS
  if (handleCORS(req, res)) return;

  try {
    const env = getEnvVars();
    const prisma = getPrismaClient();
    
    // Parse authentication
    const authHeader = req.headers.authorization;
    const authInfo = await validatePrivyToken(authHeader, env);

    // Parse anonymous session
    const anonymousSessionId = req.headers['x-anonymous-session-id'];
    const anonymousSession = await getOrCreateAnonymousSession(anonymousSessionId, prisma);

    // Parse route parameters
    const { slug } = req.query;
    
    if (!slug || slug.length < 1) {
      return jsonResponse(res, {
        success: false,
        error: 'Invalid route'
      }, 400);
    }

    const sessionId = slug[0];
    const action = slug[1]; // 'chat', 'stop', or 'conversation'

    // Route based on action
    if (action === 'chat' && req.method === 'POST') {
      return await handleChat(req, res, sessionId, env, authInfo, anonymousSession, prisma);
    } else if (action === 'stop' && req.method === 'POST') {
      return await handleStop(req, res, sessionId, env, authInfo, anonymousSession, prisma);
    } else if (action === 'conversation' && req.method === 'GET') {
      return await handleConversation(req, res, sessionId, env, authInfo, anonymousSession, prisma);
    } else {
      return jsonResponse(res, {
        success: false,
        error: 'Invalid action or method'
      }, 405);
    }

  } catch (error) {
    console.error('API Error:', error);
    jsonResponse(res, {
      success: false,
      error: error.message || 'Internal server error',
      code: error.code
    }, error.statusCode || 500);
  }
}

// Handle chat functionality
async function handleChat(req, res, sessionId, env, authInfo, anonymousSession, prisma) {
  const { message } = req.body;
  
  if (!message || !message.trim()) {
    return jsonResponse(res, {
      success: false,
      error: 'Message is required'
    }, 400);
  }

  // Build where clause based on authentication status
  const whereClause = { id: sessionId };
  
  if (authInfo.isAuthenticated && authInfo.user) {
    whereClause.userId = authInfo.user.id;
  } else if (anonymousSession) {
    whereClause.anonymousSessionId = anonymousSession.id;
  } else {
    throw createError('Session access denied', 403, 'ACCESS_DENIED');
  }

  // Find the session
  const session = await prisma.agentSession.findFirst({
    where: whereClause
  });

  if (!session) {
    throw createError('AI agent session not found', 404, 'SESSION_NOT_FOUND');
  }

  // For now, return a simple echo response
  // In a real implementation, you'd integrate with the AI service
  const userMessage = await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      messageText: message,
      messageType: 'USER',
      createdAt: new Date()
    }
  });

  const agentMessage = await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      messageText: `AI Agent Response: ${message}`,
      messageType: 'AGENT',
      createdAt: new Date()
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

  return jsonResponse(res, {
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
  });
}

// Handle stop functionality
async function handleStop(req, res, sessionId, env, authInfo, anonymousSession, prisma) {
  // Build where clause based on authentication status
  const whereClause = { id: sessionId };
  
  if (authInfo.isAuthenticated && authInfo.user) {
    whereClause.userId = authInfo.user.id;
  } else if (anonymousSession) {
    whereClause.anonymousSessionId = anonymousSession.id;
  } else {
    throw createError('Session access denied', 403, 'ACCESS_DENIED');
  }

  // Find the session
  const session = await prisma.agentSession.findFirst({
    where: whereClause
  });

  if (!session) {
    throw createError('AI agent session not found', 404, 'SESSION_NOT_FOUND');
  }

  // Calculate session duration
  const sessionDuration = Math.round((new Date() - session.createdAt) / 1000);

  // Update session in database
  const updatedSession = await prisma.agentSession.update({
    where: { id: sessionId },
    data: {
      status: 'ENDED',
      endedAt: new Date(),
      duration: sessionDuration,
    }
  });

  return jsonResponse(res, {
    success: true,
    session: {
      id: updatedSession.id,
      agentId: updatedSession.agentId,
      status: updatedSession.status,
      endedAt: updatedSession.endedAt,
      duration: updatedSession.duration,
      messageCount: updatedSession.messageCount,
    }
  });
}

// Handle conversation history
async function handleConversation(req, res, sessionId, env, authInfo, anonymousSession, prisma) {
  // Build where clause based on authentication status
  const whereClause = { id: sessionId };
  
  if (authInfo.isAuthenticated && authInfo.user) {
    whereClause.userId = authInfo.user.id;
  } else if (anonymousSession) {
    whereClause.anonymousSessionId = anonymousSession.id;
  } else {
    throw createError('Session access denied', 403, 'ACCESS_DENIED');
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
    throw createError('AI agent session not found', 404, 'SESSION_NOT_FOUND');
  }

  return jsonResponse(res, {
    success: true,
    session: {
      id: session.id,
      agentId: session.agentId,
      status: session.status,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
      duration: session.duration,
      messageCount: session.messageCount,
      tokenUsage: session.tokenUsage,
    },
    conversation: session.conversation || [],
    messages: session.chatMessages,
    isAuthenticated: authInfo.isAuthenticated,
  });
} 