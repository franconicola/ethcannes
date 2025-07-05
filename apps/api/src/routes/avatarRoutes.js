import { getAvailableAgents } from '../services/aiAgentService.js';
import { jsonWithCors } from '../utils/cors.js';

// Helper function to parse pagination parameters
function parsePaginationParams(url) {
  const { searchParams } = new URL(url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  return { page, limit };
}

// GET /agents/public - Get available AI agents with pagination
export async function getPublicAgents(request, env, authInfo, anonymousSession, prisma) {
  try {
    const { page, limit } = parsePaginationParams(request.url);

    // Fetch all available agents without filtering, providing a fallback for agents
    const { agents = [], pagination } = await getAvailableAgents({ page, limit }, prisma);
    
    // --- New GIF Logic ---
    const availableGifs = ['mouse.gif']; // Add more GIF filenames here
    const getGifUrl = (filename) => {
      const baseUrl = new URL(request.url).origin;
      return `${baseUrl}/gifs/${filename}`;
    };

    const agentsWithGifs = agents.map(agent => ({
      ...agent,
      previewUrl: getGifUrl(availableGifs[Math.floor(Math.random() * availableGifs.length)]),
    }));
    // --- End GIF Logic ---

    return jsonWithCors({
      success: true,
      agents: agentsWithGifs,
      pagination,
      source: 'ai_agent_service'
    });
    
  } catch (error) {
    console.error('Failed to fetch AI agents:', error);
    return jsonWithCors({
      success: false,
      error: 'Failed to fetch agents. Please try again later.'
    }, 500);
  }
}

// GET /agent/:id/status - For checking agent readiness
export async function getAgentStatus(request, env, authInfo, anonymousSession, prisma) {
  try {
    const agentId = request.params.id;

    if (!agentId) {
      return jsonWithCors({ success: false, error: 'Agent ID is required' }, 400);
    }
    
    // For now, we assume agents are always ready.
    // In the future, this could check a database or another service.
    return jsonWithCors({
      success: true,
      agentId,
      isReady: true,
      status: 'available',
      message: 'Agent is ready for interaction.'
    });

  } catch (error) {
    console.error(`Error checking agent status for ID ${request.params.id}:`, error);
    return jsonWithCors({
      success: false,
      error: 'Failed to get agent status.'
    }, 500);
  }
} 