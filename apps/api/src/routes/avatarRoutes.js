import { getAvailableAgents } from '../services/aiAgentService.js';
import { corsHeaders } from '../utils/cors.js';

// Helper function to parse pagination parameters
function parsePaginationParams(url) {
  const searchParams = new URL(url).searchParams;
  
  // Parse pagination parameters with defaults
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10))); // Default 12, max 100
  const offset = (page - 1) * limit;
  
  // Parse optional filters
  const search = searchParams.get('search')?.trim() || null;
  const personality = searchParams.get('personality')?.trim() || null; // Changed from gender
  const style = searchParams.get('style')?.trim() || null;
  
  return { page, limit, offset, search, personality, style };
}

// Helper function to filter agents
function filterAgents(agents, filters) {
  const { search, personality, style } = filters;
  
  return agents.filter(agent => {
    // Search filter - search in name and description
    if (search) {
      const searchLower = search.toLowerCase();
      const nameMatch = agent.name.toLowerCase().includes(searchLower);
      const descMatch = agent.description.toLowerCase().includes(searchLower);
      if (!nameMatch && !descMatch) {
        return false;
      }
    }
    
    // Personality filter (replaces gender filter)
    if (personality && agent.personality !== personality) {
      return false;
    }
    
    // Style filter
    if (style && agent.style !== style) {
      return false;
    }
    
    return true;
  });
}

// Helper function to create pagination metadata
function createPaginationMeta(totalCount, page, limit) {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
  };
}

// GET /agents/public - Get available AI agents with pagination (replaces /avatars/public)
export async function getPublicAgents(request, env, authInfo, anonymousSession, prisma) {
  try {
    // Parse pagination and filter parameters
    const { page, limit, offset, search, personality, style } = parsePaginationParams(request.url);
    
    console.log('📄 AI Agents pagination request:', {
      page,
      limit,
      offset,
      search: search || 'none',
      personality: personality || 'none',
      style: style || 'none',
      timestamp: new Date().toISOString()
    });

    // Fetch all AI agents
    const allAgents = await getAvailableAgents();
    
    // Apply filters
    const filteredAgents = filterAgents(allAgents, { search, personality, style });
    
    // Apply pagination
    const paginatedAgents = filteredAgents.slice(offset, offset + limit);
    
    // Create pagination metadata
    const pagination = createPaginationMeta(filteredAgents.length, page, limit);
    
    // Get unique filter options for frontend
    const filterOptions = {
      personalities: [...new Set(allAgents.map(a => a.personality).filter(Boolean))].sort(),
      styles: [...new Set(allAgents.map(a => a.style).filter(Boolean))].sort(),
    };

    console.log('✅ AI Agents paginated successfully:', {
      totalAgents: allAgents.length,
      filteredCount: filteredAgents.length,
      returnedCount: paginatedAgents.length,
      page,
      totalPages: pagination.totalPages
    });

    return new Response(JSON.stringify({
      success: true,
      agents: paginatedAgents, // Changed from avatars to agents
      pagination,
      filters: {
        search: search || null,
        personality: personality || null,
        style: style || null,
      },
      filterOptions,
      source: 'ai_agent_service'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
    
  } catch (error) {
    console.error('Failed to fetch AI agents:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch AI agents',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// GET /agents/status - Get AI agent service status (replaces /avatars/status)
export async function getAgentStatus(request, env, authInfo, anonymousSession, prisma) {
  try {
    // Count active agent sessions
    let activeSessionsCount = 0;
    let userStats = null;

    if (authInfo.isAuthenticated && authInfo.user) {
      // Get user's active sessions and stats
      const [activeSessions, user] = await Promise.all([
        prisma.agentSession.count({
          where: {
            userId: authInfo.user.id,
            status: 'ACTIVE'
          }
        }),
        prisma.user.findUnique({
          where: { id: authInfo.user.id },
          select: {
            agentSessionsCount: true,
            totalMessagesCount: true,
            credits: true,
            creditsUsed: true,
            subscriptionTier: true,
          }
        })
      ]);

      activeSessionsCount = activeSessions;
      userStats = user;
    } else if (anonymousSession) {
      // Get anonymous user's active sessions
      activeSessionsCount = await prisma.agentSession.count({
        where: {
          anonymousSessionId: anonymousSession.id,
          status: 'ACTIVE'
        }
      });
    }

    // Get total system stats (optional)
    const systemStats = {
      totalAvailableAgents: Object.keys((await import('../services/aiAgentService.js')).AI_AGENT_PERSONAS).length,
      timestamp: new Date().toISOString(),
    };

    console.log('📊 AI Agent status retrieved:', {
      isAuthenticated: authInfo.isAuthenticated,
      activeSessionsCount,
      hasUserStats: !!userStats,
      systemStats,
    });

    return new Response(JSON.stringify({
      success: true,
      status: {
        isAuthenticated: authInfo.isAuthenticated,
        activeSessionsCount,
        userStats,
        systemStats,
        freeMessagesRemaining: anonymousSession ? Math.max(0, 5 - (anonymousSession.freeMessagesUsed || 0)) : null,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Failed to get AI agent status:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get AI agent status',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
} 