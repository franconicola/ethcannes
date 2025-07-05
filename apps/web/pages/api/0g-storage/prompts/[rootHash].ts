// API endpoint to retrieve AI agent prompts from 0G Storage
import { retrieveAgentPrompt } from '@/lib/storage';
import { NextApiRequest, NextApiResponse } from 'next';
import {
    createErrorResponse,
    createSuccessResponse,
    handleCORS,
    validateMethod
} from '../../../../lib/api/middleware';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
): Promise<void> {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  // Only allow GET method
  if (!validateMethod(req, res, ['GET'])) return;

  try {
    const { rootHash } = req.query;
    
    if (!rootHash || typeof rootHash !== 'string') {
      return res.status(400).json(createErrorResponse('Root hash is required'));
    }

    console.log(`📥 API: Retrieving prompt with hash: ${rootHash}`);
    
    // Retrieve prompt from 0G Storage
    const prompt = await retrieveAgentPrompt(rootHash);
    
    console.log(`✅ API: Successfully retrieved prompt for agent: ${prompt.agentId}`);
    
    res.status(200).json(createSuccessResponse({ data: prompt }));
    
  } catch (error) {
    console.error('❌ API: Failed to retrieve agent prompt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve prompt';
    res.status(500).json(createErrorResponse(errorMessage));
  }
} 