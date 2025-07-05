// API endpoint to manage agent root hashes for 0G Storage
import { NextApiRequest, NextApiResponse } from 'next';
import {
    createErrorResponse,
    createSuccessResponse,
    handleCORS,
    validateMethod
} from '../../../../lib/api/middleware';
import { clearPromptCache, updateAgentRootHash } from '../../../../lib/api/services/aiAgentService';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
): Promise<void> {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  // Allow GET and PUT methods
  if (!validateMethod(req, res, ['GET', 'PUT'])) return;

  const { agentId } = req.query;
  
  if (!agentId || typeof agentId !== 'string') {
    return res.status(400).json(createErrorResponse('Agent ID is required'));
  }

  try {
    if (req.method === 'PUT') {
      // Update agent root hash
      const { rootHash } = req.body;
      
      if (!rootHash || typeof rootHash !== 'string') {
        return res.status(400).json(createErrorResponse('Root hash is required'));
      }

      console.log(`🔗 API: Updating root hash for agent ${agentId}: ${rootHash}`);
      
      // Update the agent's root hash
      updateAgentRootHash(agentId, rootHash);
      
      // Clear the prompt cache to force re-fetch from 0G Storage
      clearPromptCache(agentId);
      
      console.log(`✅ API: Successfully updated root hash for agent: ${agentId}`);
      
      res.status(200).json(createSuccessResponse({ 
        message: 'Root hash updated successfully',
        agentId,
        rootHash
      }));
      
    } else if (req.method === 'GET') {
      // Get current root hash for agent
      // This would require importing the AI_AGENT_PERSONAS
      // For now, return a placeholder response
      console.log(`📋 API: Getting root hash for agent: ${agentId}`);
      
      res.status(200).json(createSuccessResponse({ 
        agentId,
        rootHash: null, // Would get from AI_AGENT_PERSONAS[agentId].rootHash
        message: 'Root hash retrieval not implemented yet'
      }));
    }
    
  } catch (error) {
    console.error('❌ API: Failed to manage agent root hash:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to manage root hash';
    res.status(500).json(createErrorResponse(errorMessage));
  }
} 