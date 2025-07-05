// Public agents endpoint
import { NextApiRequest, NextApiResponse } from 'next';
import {
  createSuccessResponse,
  getPrismaClient,
  handleCORS,
  validateMethod
} from '../../../lib/api/middleware';
import { getAvailableAgents } from '../../../lib/api/services/aiAgentService';
import { AIAgent, ApiResponse, PaginationParams, PublicAgentsResponse } from '../../../lib/api/types';

// Force Node.js runtime (required for Prisma)
export const runtime = 'nodejs';

// Helper function to parse pagination parameters
function parsePaginationParams(req: NextApiRequest): PaginationParams {
  const { page = '1', limit = '12', search, personality, style } = req.query;
  return { 
    page: parseInt(page as string, 10), 
    limit: parseInt(limit as string, 10),
    search: search as string | undefined,
    personality: personality as string | undefined,
    style: style as string | undefined
  };
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<PublicAgentsResponse>>
): Promise<void> {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  // Only allow GET method
  if (!validateMethod(req, res, ['GET'])) return;

  try {
    const paginationParams: PaginationParams = parsePaginationParams(req);
    const prisma = getPrismaClient();

    // Fetch all available agents without filtering, providing a fallback for agents
    const allAgents = await getAvailableAgents();
    const agents = Array.isArray(allAgents) ? allAgents : [];
    
    // Create pagination object
    const total = agents.length;
    const startIndex = (paginationParams.page - 1) * paginationParams.limit;
    const endIndex = startIndex + paginationParams.limit;
    const paginatedAgents = agents.slice(startIndex, endIndex);
    
    const pagination = {
      page: paginationParams.page,
      limit: paginationParams.limit,
      total,
      pages: Math.ceil(total / paginationParams.limit),
      hasNext: endIndex < total,
      hasPrev: paginationParams.page > 1
    };
    
    // Agent to image/GIF mapping
    const agentMediaMapping: Record<string, { image: string; gif: string }> = {
      'professional-advisor': { image: 'crocodile.png', gif: 'crocodile.gif' },
      'creative-mentor': { image: 'brain.svg', gif: 'mouse.gif' },
      'technical-expert': { image: 'robot.svg', gif: 'turtle.gif' },
      'wellness-coach': { image: 'mouse.png', gif: 'crocodile.gif' },
      'learning-companion': { image: 'brain.svg', gif: 'mouse.gif' },
      'mindfulness-guide': { image: 'robot.svg', gif: 'turtle.gif' }
    };

    // Helper function to get media URLs
    const getMediaUrl = (filename: string, type: 'images' | 'gifs'): string => {
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers.host;
      return `${protocol}://${host}/${type}/${filename}`;
    };

    const agentsWithMedia: AIAgent[] = paginatedAgents.map((agent: any) => {
      const mediaConfig = agentMediaMapping[agent.id] || { image: 'mouse.png', gif: 'mouse.gif' };
      return {
        ...agent,
        image: getMediaUrl(mediaConfig.image, 'images'),
        gifUrl: getMediaUrl(mediaConfig.gif, 'gifs'),
        previewUrl: getMediaUrl(mediaConfig.gif, 'gifs'), // Keep for backward compatibility
      };
    });

    const responseData: PublicAgentsResponse = {
      success: true,
      agents: agentsWithMedia,
      pagination,
      source: 'ai_agent_service'
    };

    res.status(200).json(createSuccessResponse(responseData));
    
  } catch (error) {
    console.error('Failed to fetch AI agents:', error);
    const errorData = {
      success: false,
      error: 'Failed to fetch agents. Please try again later.'
    } as ApiResponse;
    res.status(500).json(errorData);
  }
} 