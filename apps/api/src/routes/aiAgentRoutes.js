import { createAIAgentSession, sendMessageToAgent, getAgentConversationContext } from '../services/aiAgentService.js';
import { checkUsageLimits, incrementFreeMessageUsage, updateSessionActivity } from '../services/sessionService.js';
import { corsHeaders } from '../utils/cors.js';
import { createError } from '../utils/errors.js';

// POST /agents/sessions - Create AI Agent session
export async function createAgentSession(request, env, authInfo, anonymousSession, prisma) {
  try {
    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Agent ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check usage limits
    await checkUsageLimits(authInfo, anonymousSession, prisma);

    console.log('🤖 AI Agent Session Creation Started:', {
      agentId,
      isAuthenticated: authInfo.isAuthenticated,
      userId: authInfo.user?.id,
      anonymousSessionId: anonymousSession?.id,
      timestamp: new Date().toISOString()
    });

    // Create AI agent session
    const agentSessionData = await createAIAgentSession(agentId, env);

    // Create session in database
    const sessionDbData = {
      agentId: agentSessionData.agentId,
      agentName: agentSessionData.agentName,
      systemPrompt: agentSessionData.systemPrompt,
      conversation: agentSessionData.messages,
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: parseFloat(env.OPENAI_TEMPERATURE || '0.7'),
      status: 'ACTIVE',
      lastUsed: new Date(),
      tokenUsage: {
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
      },
    };

    if (authInfo.isAuthenticated && authInfo.user) {
      sessionDbData.userId = authInfo.user.id;
    } else if (anonymousSession) {
      sessionDbData.anonymousSessionId = anonymousSession.id;
    }

    const dbSession = await prisma.agentSession.create({
      data: sessionDbData
    });

    console.log('✅ AI Agent session created successfully:', {
      sessionId: dbSession.id,
      agentId: dbSession.agentId,
      agentName: dbSession.agentName,
      isAuthenticated: authInfo.isAuthenticated,
    });

    return new Response(JSON.stringify({
      success: true,
      session: {
        id: dbSession.id,
        agentId: dbSession.agentId,
        agentName: dbSession.agentName,
        status: dbSession.status,
        createdAt: dbSession.createdAt,
        conversation: dbSession.conversation,
        isAuthenticated: authInfo.isAuthenticated,
        freeMessagesRemaining: anonymousSession ? Math.max(0, 5 - (anonymousSession.freeMessagesUsed || 0)) : null,
      },
      isAuthenticated: authInfo.isAuthenticated,
      anonymousSessionId: anonymousSession?.id || null,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create AI agent session',
      code: error.code
    }), {
      status: error.statusCode || 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// POST /agents/sessions/:sessionId/chat - Send message to AI agent
export async function chatWithAgent(request, env, authInfo, anonymousSession, prisma, sessionId) {
  try {
    const body = await request.json();
    const { message } = body;

    console.log('💬 Chat with AI agent request:', {
      sessionId,
      message: message ? `${message.substring(0, 50)}${message.length > 50 ? '...' : ''}` : 'null',
      isAuthenticated: authInfo.isAuthenticated,
      userId: authInfo.user?.id,
      anonymousSessionId: anonymousSession?.id,
      timestamp: new Date().toISOString()
    });

    if (!message || message.trim().length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Message is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
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

    console.log('🔍 Looking for AI agent session:', whereClause);

    // Find the session
    const session = await prisma.agentSession.findFirst({
      where: whereClause
    });

    console.log('🔍 AI Agent session lookup result:', {
      found: !!session,
      sessionId: session?.id,
      agentId: session?.agentId,
      agentName: session?.agentName,
      status: session?.status,
      messageCount: session?.messageCount || 0,
    });

    if (!session) {
      throw createError('AI agent session not found', 404, 'SESSION_NOT_FOUND');
    }

    // Check if session is recently ended (within 30 minutes) and reactivate it
    if (session.status === 'ENDED') {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const sessionAge = session.endedAt || session.createdAt;
      
      if (sessionAge > thirtyMinutesAgo) {
        console.log('🔄 Reactivating recently ended AI agent session:', {
          sessionId: session.id,
          endedAt: session.endedAt,
          canReactivate: true
        });
        
        // Reactivate the session
        await prisma.agentSession.update({
          where: { id: sessionId },
          data: {
            status: 'ACTIVE',
            lastUsed: new Date(),
            endedAt: null
          }
        });
      } else {
        console.log('❌ AI agent session ended too long ago, cannot reactivate:', {
          sessionId: session.id,
          endedAt: session.endedAt,
          sessionAge
        });
        throw createError('Session has expired and cannot be reactivated', 410, 'SESSION_EXPIRED');
      }
    }

    // Get conversation history
    const conversationHistory = session.conversation || [];

    // Send message to AI agent
    let agentResponse;
    try {
      console.log('💬 Sending message to AI agent:', {
        agentId: session.agentId,
        agentName: session.agentName,
        messageLength: message.length,
        conversationLength: conversationHistory.length,
      });
      
      agentResponse = await sendMessageToAgent(session.agentId, conversationHistory, message, env);
      
      console.log('✅ AI agent response received:', {
        responseLength: agentResponse.response.length,
        tokenUsage: agentResponse.tokenUsage,
      });
      
    } catch (agentError) {
      console.error('❌ AI Agent error:', {
        message: agentError.message,
        code: agentError.code,
        statusCode: agentError.statusCode,
      });
      throw agentError;
    }

    // Update conversation history
    const updatedConversation = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: agentResponse.response, timestamp: new Date().toISOString() },
    ];

    // Update session activity and conversation
    const currentTokenUsage = session.tokenUsage || { totalTokens: 0, promptTokens: 0, completionTokens: 0 };
    const updatedTokenUsage = {
      totalTokens: currentTokenUsage.totalTokens + agentResponse.tokenUsage.total_tokens,
      promptTokens: currentTokenUsage.promptTokens + agentResponse.tokenUsage.prompt_tokens,
      completionTokens: currentTokenUsage.completionTokens + agentResponse.tokenUsage.completion_tokens,
    };

    await prisma.agentSession.update({
      where: { id: sessionId },
      data: {
        conversation: updatedConversation,
        tokenUsage: updatedTokenUsage,
        messageCount: { increment: 2 }, // User message + agent response
        lastUsed: new Date(),
      }
    });

    // Create user message record
    const userMessageData = {
      sessionId: sessionId,
      messageText: message,
      messageType: 'USER',
      tokenCount: agentResponse.tokenUsage.prompt_tokens,
      createdAt: new Date(),
    };

    if (authInfo.isAuthenticated && authInfo.user) {
      userMessageData.userId = authInfo.user.id;
    } else if (anonymousSession) {
      userMessageData.anonymousSessionId = anonymousSession.id;
      // Increment free message usage for anonymous users
      await incrementFreeMessageUsage(anonymousSession.id, prisma);
    }

    // Create agent response message record
    const agentMessageData = {
      sessionId: sessionId,
      messageText: agentResponse.response,
      messageType: 'AGENT',
      tokenCount: agentResponse.tokenUsage.completion_tokens,
      processingTime: Math.round(Date.now() % 10000), // Simple processing time estimate
      metadata: {
        model: agentResponse.model,
        agentName: agentResponse.agentName,
        tokenUsage: agentResponse.tokenUsage,
      },
      createdAt: new Date(),
    };

    if (authInfo.isAuthenticated && authInfo.user) {
      agentMessageData.userId = authInfo.user.id;
    } else if (anonymousSession) {
      agentMessageData.anonymousSessionId = anonymousSession.id;
    }

    // Save both messages
    const [userMessage, agentMessage] = await Promise.all([
      prisma.chatMessage.create({ data: userMessageData }),
      prisma.chatMessage.create({ data: agentMessageData }),
    ]);

    // Get updated free message count for response
    let freeMessagesRemaining = null;
    if (anonymousSession) {
      const updatedAnonymousSession = await prisma.anonymousSession.findUnique({
        where: { id: anonymousSession.id }
      });
      freeMessagesRemaining = updatedAnonymousSession ? Math.max(0, 5 - updatedAnonymousSession.freeMessagesUsed) : 0;
    }

    console.log('✅ AI agent chat completed:', {
      sessionId,
      messageLength: message.length,
      responseLength: agentResponse.response.length,
      isAuthenticated: authInfo.isAuthenticated,
      freeMessagesRemaining,
      totalTokens: agentResponse.tokenUsage.total_tokens,
    });

    return new Response(JSON.stringify({
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
      tokenUsage: agentResponse.tokenUsage,
      agentName: agentResponse.agentName,
      isAuthenticated: authInfo.isAuthenticated,
      freeMessagesRemaining,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to chat with AI agent',
      code: error.code
    }), {
      status: error.statusCode || 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// POST /agents/sessions/:sessionId/stop - Stop AI agent session
export async function stopAgentSession(request, env, authInfo, anonymousSession, prisma, sessionId) {
  try {
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

    console.log('✅ AI agent session stopped:', {
      sessionId: updatedSession.id,
      agentId: updatedSession.agentId,
      duration: sessionDuration,
      messageCount: updatedSession.messageCount,
    });

    return new Response(JSON.stringify({
      success: true,
      session: {
        id: updatedSession.id,
        agentId: updatedSession.agentId,
        agentName: updatedSession.agentName,
        status: updatedSession.status,
        endedAt: updatedSession.endedAt,
        duration: updatedSession.duration,
        messageCount: updatedSession.messageCount,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to stop AI agent session',
      code: error.code
    }), {
      status: error.statusCode || 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// GET /agents/sessions/:sessionId/conversation - Get conversation history
export async function getConversationHistory(request, env, authInfo, anonymousSession, prisma, sessionId) {
  try {
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

    // Get conversation context
    const conversationContext = await getAgentConversationContext(
      session.agentId, 
      session.conversation || []
    );

    console.log('📄 AI agent conversation history retrieved:', {
      sessionId: session.id,
      agentId: session.agentId,
      messageCount: session.chatMessages.length,
      conversationLength: (session.conversation || []).length,
    });

    return new Response(JSON.stringify({
      success: true,
      session: {
        id: session.id,
        agentId: session.agentId,
        agentName: session.agentName,
        status: session.status,
        createdAt: session.createdAt,
        endedAt: session.endedAt,
        duration: session.duration,
        messageCount: session.messageCount,
        tokenUsage: session.tokenUsage,
      },
      conversation: session.conversation || [],
      messages: session.chatMessages,
      conversationContext,
      isAuthenticated: authInfo.isAuthenticated,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to get conversation history',
      code: error.code
    }), {
      status: error.statusCode || 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
} 