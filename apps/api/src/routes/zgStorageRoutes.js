import {
    generateTestPrompt,
    retrieveAgentPrompt,
    storeAgentPrompt,
    validateEducationalContent,
    verifyPromptIntegrity
} from '../services/zgStorageService.js';
import { corsHeaders } from '../utils/cors.js';

// POST /0g-storage/prompts - Store a new AI agent prompt
export async function storePrompt(request, env, authInfo, anonymousSession, prisma) {
  try {
    // Check authentication
    if (!authInfo.isAuthenticated) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Authentication required',
        message: 'Only authenticated users can store prompts'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await request.json();
    const { prompt, privateKey } = body;

    // Validate required fields
    if (!prompt || !privateKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields',
        message: 'Both prompt and privateKey are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Validate educational content
    const validation = validateEducationalContent(prompt);
    if (!validation.isValid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content validation failed',
        message: 'Prompt failed educational safety validation',
        issues: validation.issues
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Add user info to prompt
    const enrichedPrompt = {
      ...prompt,
      createdBy: authInfo.user.email || authInfo.user.id,
      createdAt: new Date().toISOString()
    };

    console.log('🔐 Storing prompt for agent:', {
      agentId: prompt.agentId,
      agentName: prompt.agentName,
      userId: authInfo.user.id,
      educationalLevel: prompt.educationalLevel
    });

    // Store on 0G Storage
    const result = await storeAgentPrompt(enrichedPrompt, privateKey);

    // Optional: Store reference in database
    try {
      await prisma.agentPrompt.create({
        data: {
          agentId: result.agentId,
          version: result.version,
          rootHash: result.rootHash,
          txHash: result.txHash,
          educationalLevel: prompt.educationalLevel,
          subjects: prompt.subjects,
          safetyRating: prompt.safetyRating || 'pending',
          createdBy: authInfo.user.id,
          createdAt: new Date(result.uploadedAt)
        }
      });
    } catch (dbError) {
      console.warn('Failed to store prompt reference in database:', dbError);
      // Continue anyway since the main storage succeeded
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
      message: 'Prompt stored successfully on 0G Storage'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ Failed to store prompt:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Storage failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// GET /0g-storage/prompts/:rootHash - Retrieve a prompt by hash
export async function getPrompt(request, env, authInfo, anonymousSession, prisma) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const rootHash = pathParts[pathParts.length - 1];

    if (!rootHash || rootHash === 'prompts') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing root hash',
        message: 'Root hash parameter is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('📥 Retrieving prompt with hash:', rootHash);

    // Retrieve from 0G Storage
    const prompt = await retrieveAgentPrompt(rootHash);

    return new Response(JSON.stringify({
      success: true,
      data: prompt,
      message: 'Prompt retrieved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ Failed to retrieve prompt:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Retrieval failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// POST /0g-storage/prompts/verify - Verify prompt integrity
export async function verifyPrompt(request, env, authInfo, anonymousSession, prisma) {
  try {
    const body = await request.json();
    const { prompt, expectedHash } = body;

    if (!prompt || !expectedHash) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields',
        message: 'Both prompt and expectedHash are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('🔍 Verifying prompt integrity for:', prompt.agentId);

    // Verify integrity
    const isValid = await verifyPromptIntegrity(prompt, expectedHash);

    return new Response(JSON.stringify({
      success: true,
      data: {
        isValid,
        prompt: prompt.agentId,
        expectedHash,
        verifiedAt: new Date().toISOString()
      },
      message: isValid ? 'Prompt integrity verified' : 'Prompt integrity verification failed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ Failed to verify prompt:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Verification failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// POST /0g-storage/prompts/validate - Validate educational content
export async function validatePrompt(request, env, authInfo, anonymousSession, prisma) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing prompt',
        message: 'Prompt object is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('📋 Validating educational content for:', prompt.agentId);

    // Validate content
    const validation = validateEducationalContent(prompt);

    return new Response(JSON.stringify({
      success: true,
      data: {
        isValid: validation.isValid,
        issues: validation.issues,
        prompt: prompt.agentId,
        validatedAt: new Date().toISOString()
      },
      message: validation.isValid ? 'Content validation passed' : 'Content validation failed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ Failed to validate prompt:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Validation failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// GET /0g-storage/prompts/test/:agentId - Generate test prompt
export async function getTestPrompt(request, env, authInfo, anonymousSession, prisma) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const agentId = pathParts[pathParts.length - 1];

    console.log('🧪 Generating test prompt for agent:', agentId);

    // Generate test prompt
    const testPrompt = generateTestPrompt(agentId);

    return new Response(JSON.stringify({
      success: true,
      data: testPrompt,
      message: 'Test prompt generated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ Failed to generate test prompt:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Test prompt generation failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// GET /0g-storage/status - Get 0G Storage service status
export async function getStorageStatus(request, env, authInfo, anonymousSession, prisma) {
  try {
    // Try to get stored prompts count from database
    let storedPromptsCount = 0;
    let userPromptsCount = 0;

    try {
      [storedPromptsCount, userPromptsCount] = await Promise.all([
        prisma.agentPrompt.count(),
        authInfo.isAuthenticated ? 
          prisma.agentPrompt.count({ where: { createdBy: authInfo.user.id } }) : 
          Promise.resolve(0)
      ]);
    } catch (dbError) {
      console.warn('Database query failed for storage status:', dbError);
    }

    const status = {
      serviceAvailable: true,
      network: {
        rpcUrl: 'https://evmrpc-testnet.0g.ai/',
        indexerUrl: 'https://indexer-storage-testnet-turbo.0g.ai'
      },
      statistics: {
        totalStoredPrompts: storedPromptsCount,
        userStoredPrompts: userPromptsCount
      },
      features: {
        storePrompts: true,
        retrievePrompts: true,
        verifyIntegrity: true,
        validateContent: true
      },
      lastChecked: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      data: status,
      message: '0G Storage service is operational'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ Failed to get storage status:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Status check failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
} 