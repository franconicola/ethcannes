// Frontend API service for 0G Storage operations

// API Configuration - use environment variable or fallback to defaults
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.origin.includes('localhost')) 
    ? "http://localhost:3000/api" 
    : "/api",
};

export interface AgentPrompt {
  agentId: string;
  agentName: string;
  systemPrompt: string;
  version: string;
  createdAt: string;
  createdBy: string;
  educationalLevel: string;
  subjects: string[];
  safetyRating: 'safe' | 'reviewed' | 'pending';
}

export interface StorageResult {
  rootHash: string;
  txHash: string;
  agentId: string;
  version: string;
  uploadedAt: string;
  verified: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

export interface StorageStatus {
  serviceAvailable: boolean;
  network: {
    rpcUrl: string;
    indexerUrl: string;
  };
  statistics: {
    totalStoredPrompts: number;
    userStoredPrompts: number;
  };
  features: {
    storePrompts: boolean;
    retrievePrompts: boolean;
    verifyIntegrity: boolean;
    validateContent: boolean;
  };
  lastChecked: string;
}

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('privy:token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Helper function to get anonymous session headers
function getSessionHeaders(): Record<string, string> {
  const sessionId = localStorage.getItem('anonymous-session-id');
  return sessionId ? { 'X-Anonymous-Session-Id': sessionId } : {};
}

// Store an AI agent prompt on 0G Storage
export async function storeAgentPrompt(prompt: AgentPrompt, privateKey: string): Promise<StorageResult> {
  const response = await fetch(`${API_CONFIG.baseUrl}/0g-storage/prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...getSessionHeaders(),
    },
    body: JSON.stringify({
      prompt,
      privateKey,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to store prompt');
  }

  return data.data;
}

// Retrieve an AI agent prompt from 0G Storage
export async function retrieveAgentPrompt(rootHash: string): Promise<AgentPrompt> {
  const response = await fetch(`${API_CONFIG.baseUrl}/0g-storage/prompts/${rootHash}`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      ...getSessionHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve prompt');
  }

  return data.data;
}

// Verify prompt integrity
export async function verifyPromptIntegrity(prompt: AgentPrompt, expectedHash: string): Promise<boolean> {
  const response = await fetch(`${API_CONFIG.baseUrl}/0g-storage/prompts/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...getSessionHeaders(),
    },
    body: JSON.stringify({
      prompt,
      expectedHash,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify prompt');
  }

  return data.data.isValid;
}

// Validate educational content
export async function validateEducationalContent(prompt: AgentPrompt): Promise<ValidationResult> {
  const response = await fetch(`${API_CONFIG.baseUrl}/0g-storage/prompts/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...getSessionHeaders(),
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to validate content');
  }

  return {
    isValid: data.data.isValid,
    issues: data.data.issues || [],
  };
}

// Generate a test prompt for an agent
export async function generateTestPrompt(agentId: string): Promise<AgentPrompt> {
  const response = await fetch(`${API_CONFIG.baseUrl}/0g-storage/prompts/test/${agentId}`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      ...getSessionHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to generate test prompt');
  }

  return data.data;
}

// Get 0G Storage service status
export async function getStorageStatus(): Promise<StorageStatus> {
  const response = await fetch(`${API_CONFIG.baseUrl}/0g-storage/status`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      ...getSessionHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get storage status');
  }

  return data.data;
}

// Demo function to show how to use the storage system
export async function demonstrateStorageFlow(agentId: string, privateKey: string): Promise<void> {
  try {
    console.log('🚀 Starting 0G Storage demonstration...');

    // Step 1: Generate a test prompt
    console.log('1. Generating test prompt...');
    const testPrompt = await generateTestPrompt(agentId);
    console.log('✅ Test prompt generated:', testPrompt.agentName);

    // Step 2: Validate the content
    console.log('2. Validating educational content...');
    const validation = await validateEducationalContent(testPrompt);
    console.log('✅ Validation result:', validation.isValid ? 'PASSED' : 'FAILED');
    
    if (!validation.isValid) {
      console.log('❌ Validation issues:', validation.issues);
      return;
    }

    // Step 3: Store the prompt
    console.log('3. Storing prompt on 0G Storage...');
    const storageResult = await storeAgentPrompt(testPrompt, privateKey);
    console.log('✅ Prompt stored successfully!');
    console.log('   Root Hash:', storageResult.rootHash);
    console.log('   TX Hash:', storageResult.txHash);

    // Step 4: Retrieve the prompt
    console.log('4. Retrieving prompt from 0G Storage...');
    const retrievedPrompt = await retrieveAgentPrompt(storageResult.rootHash);
    console.log('✅ Prompt retrieved successfully!');

    // Step 5: Verify integrity
    console.log('5. Verifying prompt integrity...');
    const isValid = await verifyPromptIntegrity(retrievedPrompt, storageResult.rootHash);
    console.log('✅ Integrity verification:', isValid ? 'PASSED' : 'FAILED');

    console.log('🎉 0G Storage demonstration completed successfully!');

  } catch (error) {
    console.error('❌ Storage demonstration failed:', error);
    throw error;
  }
}

// Utility function to check if 0G Storage is available
export async function isStorageAvailable(): Promise<boolean> {
  try {
    const status = await getStorageStatus();
    return status.serviceAvailable;
  } catch (error) {
    console.error('Failed to check storage availability:', error);
    return false;
  }
} 