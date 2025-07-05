// Public agents endpoint
import { getPrismaClient, handleCORS, jsonResponse, validateMethod } from '../../../lib/api/middleware.js';
import { getAvailableAgents } from '../../../lib/api/services/aiAgentService.js';

// Helper function to parse pagination parameters
function parsePaginationParams(req) {
  const { page = '1', limit = '12' } = req.query;
  return { 
    page: parseInt(page, 10), 
    limit: parseInt(limit, 10) 
  };
}

export default async function handler(req, res) {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  // Only allow GET method
  if (!validateMethod(req, res, ['GET'])) return;

  try {
    const { page, limit } = parsePaginationParams(req);
    const prisma = getPrismaClient();

    // Fetch all available agents without filtering, providing a fallback for agents
    const { agents = [], pagination } = await getAvailableAgents({ page, limit }, prisma);
    
    // --- New GIF Logic ---
    const availableGifs = ['mouse.gif']; // Add more GIF filenames here
    const getGifUrl = (filename) => {
      const baseUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
      return `${baseUrl}/gifs/${filename}`;
    };

    const agentsWithGifs = agents.map(agent => ({
      ...agent,
      previewUrl: getGifUrl(availableGifs[Math.floor(Math.random() * availableGifs.length)]),
    }));
    // --- End GIF Logic ---

    jsonResponse(res, {
      success: true,
      agents: agentsWithGifs,
      pagination,
      source: 'ai_agent_service'
    });
    
  } catch (error) {
    console.error('Failed to fetch AI agents:', error);
    jsonResponse(res, {
      success: false,
      error: 'Failed to fetch agents. Please try again later.'
    }, 500);
  }
} 