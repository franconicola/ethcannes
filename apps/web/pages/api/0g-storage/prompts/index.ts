// API endpoint to store AI agent prompts on 0G Storage
import { storeAgentPrompt, validateEducationalContent } from '@/lib/storage';
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
  
  // Only allow POST method
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const { prompt, privateKey } = req.body;
    
    if (!prompt || !privateKey) {
      return res.status(400).json(createErrorResponse('Prompt and private key are required'));
    }

    console.log(`📤 API: Storing prompt for agent: ${prompt.agentId}`);
    
    // Validate the educational content first
    const validation = await validateEducationalContent(prompt);
    if (!validation.isValid) {
      return res.status(400).json(createErrorResponse(`Prompt validation failed: ${validation.issues.join(', ')}`));
    }
    
    // Store prompt on 0G Storage
    const result = await storeAgentPrompt(prompt, privateKey);
    
    console.log(`✅ API: Successfully stored prompt for agent: ${prompt.agentId}`);
    
    res.status(200).json(createSuccessResponse({ data: result }));
    
  } catch (error) {
    console.error('❌ API: Failed to store agent prompt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to store prompt';
    res.status(500).json(createErrorResponse(errorMessage));
  }
} 