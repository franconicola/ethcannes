// Main request handler - Edge-compatible version with Prisma
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { chatWithAgent, createAgentSession, getConversationHistory, stopAgentSession } from './routes/aiAgentRoutes.js';
import { getAuthMe } from './routes/authRoutes.js';
import { getAgentStatus, getPublicAgents } from './routes/avatarRoutes.js';
import { getPrompt, getStorageStatus, getTestPrompt, storePrompt, validatePrompt, verifyPrompt } from './routes/zgStorageRoutes.js';
import { validatePrivyToken } from './services/authService.js';
import { getOrCreateAnonymousSession } from './services/sessionService.js';
import { handleCORS, jsonWithCors } from './utils/cors.js';

export async function handleRequest(request, env) {
  // Handle CORS
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;

  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Remove /api prefix if present
  const cleanPath = path.startsWith('/api') ? path.slice(4) : path;

  try {
    // Health check - early return without initializing services
    if (cleanPath === '/health') {
      return jsonWithCors({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env.NODE_ENV || 'production'
      });
    }

    // Debug endpoint - check environment variables without initializing heavy services
    if (cleanPath === '/debug' && method === 'GET') {
      return jsonWithCors({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV || 'unknown',
        hasDatabase: !!env.DATABASE_URL,
        hasPrivyConfig: !!(env.PRIVY_APP_ID && env.PRIVY_APP_SECRET),
        hasJwtSecret: !!env.JWT_SECRET,
        hasOpenAIKey: !!env.OPENAI_API_KEY,
        path: cleanPath,
        method: method,
        note: 'Using Prisma with edge compatibility and AI Agents'
      });
    }

    // Agent routes that don't need database
    if (cleanPath === '/agents/public' && method === 'GET') {
      // No database needed for public agents - just fetch from AI service
      return await getPublicAgents(request, env, null, null, null);
    }

    if (cleanPath === '/agents/cache' && method === 'DELETE') {
      const { clearAIAgentCache } = await import('./services/aiAgentService.js');
      clearAIAgentCache();
      return jsonWithCors({
        success: true,
        message: 'AI agent cache cleared successfully'
      });
    }

    if (cleanPath === '/agents/debug' && method === 'GET') {
      try {
        const { getAIAgentConfig, AI_AGENT_PERSONAS } = await import('./services/aiAgentService.js');
        const config = getAIAgentConfig(env);
        
        const availableAgents = Object.keys(AI_AGENT_PERSONAS);
        
        return jsonWithCors({
          success: true,
          config: {
            model: config.model,
            maxTokens: config.maxTokens,
            temperature: config.temperature,
            hasApiKey: !!config.apiKey,
          },
          sample_agent: AI_AGENT_PERSONAS[availableAgents[0]] || null,
          total_agents: availableAgents.length,
          available_agents: availableAgents.slice(0, 3),
        });
      } catch (error) {
        return jsonWithCors({
          success: false,
          error: error.message
        }, 500);
      }
    }

    // Initialize Prisma with edge compatibility
    const prisma = new PrismaClient({
      datasourceUrl: env.DATABASE_URL,
    }).$extends(withAccelerate());

    // Parse authentication
    const authHeader = request.headers.get('Authorization');
    const authInfo = await validatePrivyToken(authHeader, env);

    // Parse anonymous session
    const anonymousSessionId = request.headers.get('X-Anonymous-Session-Id');
    const anonymousSession = await getOrCreateAnonymousSession(anonymousSessionId, prisma);

    if (cleanPath === '/agents/status' && method === 'GET') {
      return await getAgentStatus(request, env, authInfo, anonymousSession, prisma);
    }

    // Auth routes
    if (cleanPath === '/auth/me' && method === 'GET') {
      return await getAuthMe(request, env, authInfo, anonymousSession, prisma);
    }

    // 0G Storage routes
    if (cleanPath === '/0g-storage/status' && method === 'GET') {
      return await getStorageStatus(request, env, authInfo, anonymousSession, prisma);
    }

    if (cleanPath === '/0g-storage/prompts' && method === 'POST') {
      return await storePrompt(request, env, authInfo, anonymousSession, prisma);
    }

    if (cleanPath === '/0g-storage/prompts/verify' && method === 'POST') {
      return await verifyPrompt(request, env, authInfo, anonymousSession, prisma);
    }

    if (cleanPath === '/0g-storage/prompts/validate' && method === 'POST') {
      return await validatePrompt(request, env, authInfo, anonymousSession, prisma);
    }

    // 0G Storage dynamic routes
    const getPromptMatch = cleanPath.match(/^\/0g-storage\/prompts\/([^\/]+)$/);
    if (getPromptMatch && method === 'GET') {
      return await getPrompt(request, env, authInfo, anonymousSession, prisma);
    }

    const getTestPromptMatch = cleanPath.match(/^\/0g-storage\/prompts\/test\/([^\/]+)$/);
    if (getTestPromptMatch && method === 'GET') {
      return await getTestPrompt(request, env, authInfo, anonymousSession, prisma);
    }

    // AI Agent routes
    if (cleanPath === '/agents/sessions' && method === 'POST') {
      return await createAgentSession(request, env, authInfo, anonymousSession, prisma);
    }

    // Dynamic routes with regex matching
    const chatMatch = cleanPath.match(/^\/agents\/sessions\/([^\/]+)\/chat$/);
    if (chatMatch && method === 'POST') {
      const sessionId = chatMatch[1];
      return await chatWithAgent(request, env, authInfo, anonymousSession, prisma, sessionId);
    }

    const stopMatch = cleanPath.match(/^\/agents\/sessions\/([^\/]+)\/stop$/);
    if (stopMatch && method === 'POST') {
      const sessionId = stopMatch[1];
      return await stopAgentSession(request, env, authInfo, anonymousSession, prisma, sessionId);
    }

    const conversationMatch = cleanPath.match(/^\/agents\/sessions\/([^\/]+)\/conversation$/);
    if (conversationMatch && method === 'GET') {
      const sessionId = conversationMatch[1];
      return await getConversationHistory(request, env, authInfo, anonymousSession, prisma, sessionId);
    }

    return jsonWithCors({
      error: "Not Found",
      message: "The requested endpoint does not exist",
      availableEndpoints: [
        "GET /health",
        "GET /agents/public?page=1&limit=12&search=term&personality=professional&style=business",
        "GET /agents/status",
        "GET /auth/me",
        "POST /agents/sessions",
        "POST /agents/sessions/:sessionId/chat",
        "POST /agents/sessions/:sessionId/stop",
        "GET /agents/sessions/:sessionId/conversation",
        "GET /0g-storage/status",
        "POST /0g-storage/prompts",
        "GET /0g-storage/prompts/:rootHash",
        "POST /0g-storage/prompts/verify",
        "POST /0g-storage/prompts/validate",
        "GET /0g-storage/prompts/test/:agentId",
      ],
      paginationParams: {
        page: "Page number (default: 1)",
        limit: "Items per page (default: 12, max: 100)",
        search: "Search in agent names and descriptions",
        personality: "Filter by personality (professional, creative, analytical, etc.)",
        style: "Filter by style"
      }
    }, 404);

  } catch (error) {
    console.error('API Error:', error);
    return jsonWithCors({
      error: 'Internal Server Error',
      message: error.message,
      stack: env.NODE_ENV === 'development' ? error.stack : undefined,
    }, 500);
  }
} 