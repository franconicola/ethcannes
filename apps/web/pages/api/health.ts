// Health check endpoint
import { NextApiRequest, NextApiResponse } from 'next';
import {
    createErrorResponse,
    createSuccessResponse,
    handleCORS
} from '../../lib/api/middleware';
import { ApiResponse, HealthResponse } from '../../lib/api/types';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<HealthResponse>>
): Promise<void> {
  // Handle CORS
  if (handleCORS(req, res)) return;

  if (req.method === 'GET') {
    const healthData: HealthResponse = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      platform: 'vercel'
    };

    res.status(200).json(createSuccessResponse(healthData));
  } else {
    const errorData = createErrorResponse('Method not allowed');
    res.status(405).json(errorData);
  }
} 