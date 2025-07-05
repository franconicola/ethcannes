// API endpoint to check 0G Storage status
import { getStorageStatus } from '@/lib/storage';
import { NextApiRequest, NextApiResponse } from 'next';
import {
    createErrorResponse,
    createSuccessResponse,
    handleCORS,
    validateMethod
} from '../../../lib/api/middleware';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
): Promise<void> {
  // Handle CORS
  if (handleCORS(req, res)) return;
  
  // Only allow GET method
  if (!validateMethod(req, res, ['GET'])) return;

  try {
    console.log('📊 API: Checking 0G Storage status...');
    
    // Get storage status
    const status = await getStorageStatus();
    
    console.log('✅ API: Successfully retrieved storage status');
    
    res.status(200).json(createSuccessResponse({ data: status }));
    
  } catch (error) {
    console.error('❌ API: Failed to get storage status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get storage status';
    res.status(500).json(createErrorResponse(errorMessage));
  }
} 