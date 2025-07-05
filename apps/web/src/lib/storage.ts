// 0G Storage integration for AI Agent prompts
'use client'

// Conditional imports to prevent server-side issues
let ethers: any = null
let ZgFile: any = null
let Indexer: any = null

// Dynamic imports for browser environment
const loadDependencies = async () => {
  if (typeof window !== 'undefined' && !ethers) {
    try {
      ethers = await import('ethers')
      const zgSdk = await import('@0glabs/0g-ts-sdk')
      ZgFile = zgSdk.ZgFile
      Indexer = zgSdk.Indexer
    } catch (error) {
      console.warn('Failed to load 0G Storage dependencies:', error)
    }
  }
}

// 0G Network Configuration
const RPC_URL = 'https://evmrpc-testnet.0g.ai/'
const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai'

// Initialize provider and indexer
let indexer: any = null
let provider: any = null

export interface AIAgentPrompt {
  agentId: string
  agentName: string
  systemPrompt: string
  version: string
  createdAt: string
  createdBy: string
  educationalLevel: 'elementary' | 'middle' | 'high' | 'adult'
  subjects: string[]
  safetyRating: 'safe' | 'reviewed' | 'pending'
}

export interface StorageResult {
  success: boolean
  rootHash: string
  txHash: string
  agentId: string
  version: string
  storageUrl: string
  createdAt: string
}

export interface StorageStatus {
  serviceAvailable: boolean
  networkStatus: 'connected' | 'disconnected' | 'error'
  lastSync: string
  statistics: {
    totalStoredPrompts: number
    totalAgents: number
    storageUsed: string
    availableSpace: string
  }
}

export interface ValidationResult {
  isValid: boolean
  issues: string[]
  safetyScore: number
}

export interface StoredPrompt {
  rootHash: string
  txHash: string
  agentId: string
  version: string
  uploadedAt: string
  verified: boolean
}

// Initialize 0G Storage connection
export const initializeZGStorage = async (): Promise<boolean> => {
  try {
    await loadDependencies()
    
    if (!ethers || !Indexer) {
      console.warn('0G Storage dependencies not available')
      return false
    }
    
    console.log('🚀 Initializing 0G Storage connection...')
    
    // Initialize provider
    provider = new ethers.JsonRpcProvider(RPC_URL)
    
    // Initialize indexer
    indexer = new Indexer(INDEXER_RPC)
    
    console.log('✅ 0G Storage initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to initialize 0G Storage:', error)
    return false
  }
}

// Check if 0G Storage is available
export const checkZGStorageAvailability = async (): Promise<boolean> => {
  try {
    if (!indexer) {
      const initialized = await initializeZGStorage()
      if (!initialized) return false
    }
    
    if (!indexer) {
      return false
    }
    
    // Test connection by trying to select nodes
    const [nodes, err] = await indexer.selectNodes(1)
    if (err !== null) {
      console.error('0G Storage not available:', err)
      return false
    }
    
    return nodes.length > 0
  } catch (error) {
    console.error('Failed to check 0G Storage availability:', error)
    return false
  }
}

// Store AI agent system prompt on 0G Storage
export const storeAgentPrompt = async (
  prompt: AIAgentPrompt, 
  privateKey: string
): Promise<StorageResult> => {
  try {
    console.log(`📤 Storing prompt for agent: ${prompt.agentId}`)
    
    if (!indexer) {
      const initialized = await initializeZGStorage()
      if (!initialized) {
        throw new Error('0G Storage not initialized')
      }
    }
    
    if (!provider || !indexer || !ethers || !ZgFile) {
      throw new Error('0G Storage dependencies not available')
    }
    
    // Create signer
    const signer = new ethers.Wallet(privateKey, provider)
    
    // Convert prompt to JSON and create file
    const promptData = JSON.stringify(prompt, null, 2)
    
    // Create file handle for 0G Storage
    const tempFile = await createTemporaryFile(promptData, `${prompt.agentId}-v${prompt.version}.json`)
    const file = new ZgFile(tempFile)
    
    // Generate Merkle tree
    const [tree, treeErr] = await file.merkleTree()
    if (treeErr !== null) {
      await file.close()
      throw new Error(`Error generating Merkle tree: ${treeErr}`)
    }
    
    const rootHash = tree?.rootHash()
    console.log(`📋 Generated root hash: ${rootHash}`)
    
    // Upload to 0G Storage
    const [tx, uploadErr] = await indexer.upload(file, RPC_URL, signer)
    if (uploadErr !== null) {
      await file.close()
      throw new Error(`Upload error: ${uploadErr}`)
    }
    
    console.log(`✅ Prompt stored successfully! TX: ${tx}`)
    
    // Clean up
    await file.close()
    
    return {
      success: true,
      rootHash: rootHash || '',
      txHash: tx || '',
      agentId: prompt.agentId,
      version: prompt.version,
      storageUrl: `${INDEXER_RPC}/file/${rootHash}`,
      createdAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('❌ Failed to store agent prompt:', error)
    throw error
  }
}

// Helper function to create temporary file handle
const createTemporaryFile = async (data: string, filename: string): Promise<any> => {
  if (typeof window !== 'undefined') {
    // Browser environment - create a file-like object
    const blob = new Blob([data], { type: 'application/json' })
    return {
      name: filename,
      size: blob.size,
      type: blob.type,
      arrayBuffer: () => blob.arrayBuffer(),
      stream: () => blob.stream(),
      text: () => blob.text()
    }
  } else {
    // Node.js environment - create actual file
    const fs = await import('fs')
    const path = await import('path')
    const os = await import('os')
    
    const tempPath = path.join(os.tmpdir(), filename)
    await fs.promises.writeFile(tempPath, data)
    
    return {
      name: filename,
      path: tempPath,
      size: Buffer.byteLength(data),
      type: 'application/json'
    }
  }
}

// Retrieve AI agent system prompt from 0G Storage
export const retrieveAgentPrompt = async (rootHash: string): Promise<AIAgentPrompt> => {
  try {
    console.log(`📥 Retrieving prompt with hash: ${rootHash}`)
    
    if (!indexer) {
      const initialized = await initializeZGStorage()
      if (!initialized) {
        throw new Error('0G Storage not initialized')
      }
    }
    
    if (!indexer) {
      throw new Error('0G Storage not initialized')
    }
    
    // For browser environments, we need to handle downloads differently
    if (typeof window !== 'undefined') {
      // In browser, attempt to download file
      try {
        // Try to download the file content directly
        const response = await fetch(`${INDEXER_RPC}/file/${rootHash}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status}`)
        }
        
        const promptData = await response.text()
        const prompt: AIAgentPrompt = JSON.parse(promptData)
        
        console.log(`✅ Prompt retrieved successfully for agent: ${prompt.agentId}`)
        return prompt
      } catch (fetchError) {
        console.warn('Direct fetch failed, trying indexer download:', fetchError)
        throw fetchError
      }
    }
    
    // Server-side download to temporary file
    const tempPath = `/tmp/agent-prompt-${Date.now()}-${rootHash}.json`
    
    // Download from 0G Storage with proof verification
    const downloadErr = await indexer.download(rootHash, tempPath, true)
    if (downloadErr !== null) {
      throw new Error(`Download error: ${downloadErr}`)
    }
    
    // Read the downloaded file
    const fs = await import('fs')
    const promptData = await fs.promises.readFile(tempPath, 'utf-8')
    const prompt: AIAgentPrompt = JSON.parse(promptData)
    
    // Clean up temporary file
    await fs.promises.unlink(tempPath).catch(() => {
      // Ignore cleanup errors
    })
    
    console.log(`✅ Prompt retrieved successfully for agent: ${prompt.agentId}`)
    return prompt
  } catch (error) {
    console.error('❌ Failed to retrieve agent prompt:', error)
    
    // Return fallback prompt if retrieval fails
    console.log('🔄 Returning fallback prompt due to retrieval failure')
    return {
      agentId: 'fallback-agent',
      agentName: 'Fallback Agent',
      systemPrompt: 'You are a helpful AI assistant. This is a fallback prompt used when the original prompt cannot be retrieved from 0G Storage.',
      version: '1.0',
      createdAt: new Date().toISOString(),
      createdBy: 'system-fallback',
      educationalLevel: 'elementary',
      subjects: ['general'],
      safetyRating: 'safe'
    }
  }
}

// Get storage status and statistics
export const getStorageStatus = async (): Promise<StorageStatus> => {
  try {
    const isAvailable = await checkZGStorageAvailability()
    
    return {
      serviceAvailable: isAvailable,
      networkStatus: isAvailable ? 'connected' : 'disconnected',
      lastSync: new Date().toISOString(),
      statistics: {
        totalStoredPrompts: 0, // This would need to be tracked separately
        totalAgents: 6, // Based on the current AI_AGENT_PERSONAS
        storageUsed: '0 MB',
        availableSpace: 'Unlimited'
      }
    }
  } catch (error) {
    console.error('Failed to get storage status:', error)
    return {
      serviceAvailable: false,
      networkStatus: 'error',
      lastSync: new Date().toISOString(),
      statistics: {
        totalStoredPrompts: 0,
        totalAgents: 0,
        storageUsed: '0 MB',
        availableSpace: 'Unknown'
      }
    }
  }
}

// Generate a test prompt for a given agent
export const generateTestPrompt = async (agentId: string): Promise<AIAgentPrompt> => {
  return {
    agentId,
    agentName: `Test Agent ${agentId}`,
    systemPrompt: `You are a test AI agent (${agentId}) designed for educational purposes. This is a sample prompt for testing the 0G Storage integration. You should provide helpful, safe, and educational responses appropriate for your target audience.`,
    version: '1.0',
    createdAt: new Date().toISOString(),
    createdBy: 'test-system',
    educationalLevel: 'elementary',
    subjects: ['testing', 'demonstration'],
    safetyRating: 'safe'
  }
}

// Simplified functions for basic usage without full 0G Storage integration
export const createFallbackPrompt = (agentId: string): AIAgentPrompt => {
  return {
    agentId,
    agentName: `${agentId} Agent`,
    systemPrompt: `You are a helpful AI assistant for ${agentId}. Provide educational and helpful responses.`,
    version: '1.0',
    createdAt: new Date().toISOString(),
    createdBy: 'system-fallback',
    educationalLevel: 'elementary',
    subjects: ['general'],
    safetyRating: 'safe'
  }
}

// Simple storage check that doesn't require full initialization
export const isStorageAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!ethers && !!ZgFile && !!Indexer
}

// Initialize storage on first use
loadDependencies().catch(console.warn)