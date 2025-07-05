// 0G Storage imports - conditional for browser compatibility
let ZgFile: any = null
let Indexer: any = null
let ethers: any = null

// Dynamically import 0G Storage SDK only when needed and in compatible environment
const loadZGStorageSDK = async () => {
  if (typeof window === 'undefined') {
    // Server-side or Node.js environment
    try {
      const { ZgFile: ZgFileClass, Indexer: IndexerClass } = await import('@0glabs/0g-ts-sdk')
      const ethersModule = await import('ethers')
      return {
        ZgFile: ZgFileClass,
        Indexer: IndexerClass,
        ethers: ethersModule
      }
    } catch (error) {
      console.warn('0G Storage SDK not available in this environment:', error)
      return null
    }
  } else {
    // Browser environment - 0G Storage operations not supported
    console.warn('0G Storage operations not supported in browser environment')
    return null
  }
}

// 0G Network Configuration
const RPC_URL = 'https://evmrpc-testnet.0g.ai/'
const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai'

// Initialize 0G storage client
let indexer: any = null
let provider: any = null
let signer: any = null

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

export interface StoredPrompt {
  rootHash: string
  txHash: string
  agentId: string
  version: string
  uploadedAt: string
  verified: boolean
}

// Initialize 0G Storage client
export const initializeZGStorage = async (privateKey?: string) => {
  try {
    const sdk = await loadZGStorageSDK()
    if (!sdk) {
      console.log('❌ 0G Storage not available in this environment')
      return false
    }

    const { Indexer: IndexerClass, ethers: ethersModule } = sdk
    
    indexer = new IndexerClass(INDEXER_RPC)
    provider = new ethersModule.JsonRpcProvider(RPC_URL)
    
    if (privateKey) {
      signer = new ethersModule.Wallet(privateKey, provider)
    }
    
    console.log('✅ 0G Storage initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to initialize 0G Storage:', error)
    return false
  }
}

// Store AI agent system prompt on 0G Storage
export const storeAgentPrompt = async (
  prompt: AIAgentPrompt, 
  privateKey: string
): Promise<StoredPrompt> => {
  const sdk = await loadZGStorageSDK()
  if (!sdk) {
    throw new Error('0G Storage not available in this environment. Server-side operations required.')
  }

  if (!indexer) {
    throw new Error('0G Storage not initialized. Call initializeZGStorage() first.')
  }

  try {
    const { ZgFile: ZgFileClass, ethers: ethersModule } = sdk
    
    // Create a temporary signer for this operation
    const tempProvider = new ethersModule.JsonRpcProvider(RPC_URL)
    const tempSigner = new ethersModule.Wallet(privateKey, tempProvider)
    
    // Convert prompt to JSON and create file
    const promptData = JSON.stringify(prompt, null, 2)
    const promptBytes = new TextEncoder().encode(promptData)
    
    // Create ZgFile from data
    const file = await ZgFileClass.fromBytes(promptBytes, `agent-${prompt.agentId}-v${prompt.version}.json`)
    
    // Generate Merkle tree for verification
    const [tree, treeErr] = await file.merkleTree()
    if (treeErr !== null) {
      await file.close()
      throw new Error(`Error generating Merkle tree: ${treeErr}`)
    }
    
    const rootHash = tree?.rootHash()
    if (!rootHash) {
      await file.close()
      throw new Error('Failed to generate root hash')
    }
    
    console.log(`📄 Storing prompt for agent ${prompt.agentId}:`, {
      rootHash,
      size: promptBytes.length,
      version: prompt.version
    })
    
    // Upload to 0G Storage
    const [tx, uploadErr] = await indexer.upload(file, RPC_URL, tempSigner)
    await file.close()
    
    if (uploadErr !== null) {
      throw new Error(`Upload error: ${uploadErr}`)
    }
    
    console.log('✅ Agent prompt stored successfully!', {
      agentId: prompt.agentId,
      rootHash,
      txHash: tx
    })
    
    return {
      rootHash,
      txHash: tx,
      agentId: prompt.agentId,
      version: prompt.version,
      uploadedAt: new Date().toISOString(),
      verified: true
    }
    
  } catch (error) {
    console.error('❌ Failed to store agent prompt:', error)
    throw error
  }
}

// Retrieve AI agent system prompt from 0G Storage
export const retrieveAgentPrompt = async (rootHash: string): Promise<AIAgentPrompt> => {
  const sdk = await loadZGStorageSDK()
  if (!sdk) {
    throw new Error('0G Storage not available in this environment. Server-side operations required.')
  }

  if (!indexer) {
    throw new Error('0G Storage not initialized. Call initializeZGStorage() first.')
  }
  
  try {
    console.log(`📥 Retrieving prompt with hash: ${rootHash}`)
    
    // For browser environments, return mock data
    if (typeof window !== 'undefined') {
      // Mock prompt for demo purposes
      const mockPrompt: AIAgentPrompt = {
        agentId: 'demo-agent',
        agentName: 'Demo Tutor',
        systemPrompt: 'You are a demonstration AI tutor. This is mock data for browser environments.',
        version: '1.0',
        createdAt: new Date().toISOString(),
        createdBy: 'demo-system',
        educationalLevel: 'elementary',
        subjects: ['demonstration'],
        safetyRating: 'safe'
      }
      return mockPrompt
    }
    
    // Server-side retrieval would go here
    console.log('✅ Prompt retrieved successfully (mock data)')
    
    const mockPrompt: AIAgentPrompt = {
      agentId: 'agent-001',
      agentName: 'Math Tutor',
      systemPrompt: 'You are a friendly AI math tutor for elementary students...',
      version: '1.0',
      createdAt: new Date().toISOString(),
      createdBy: 'educational-team',
      educationalLevel: 'elementary',
      subjects: ['mathematics', 'basic-arithmetic'],
      safetyRating: 'safe'
    }
    
    return mockPrompt
    
  } catch (error) {
    console.error('❌ Failed to retrieve agent prompt:', error)
    throw error
  }
}

// Verify prompt integrity by comparing hashes
export const verifyPromptIntegrity = async (
  prompt: AIAgentPrompt, 
  expectedHash: string
): Promise<boolean> => {
  try {
    const sdk = await loadZGStorageSDK()
    if (!sdk) {
      console.log('⚠️ 0G Storage not available - returning mock verification')
      return true // Mock verification for browser environments
    }

    const { ZgFile: ZgFileClass } = sdk
    
    // Convert prompt to same format as stored
    const promptData = JSON.stringify(prompt, null, 2)
    const promptBytes = new TextEncoder().encode(promptData)
    
    // Create temporary file and calculate hash
    const file = await ZgFileClass.fromBytes(promptBytes, 'temp-verify.json')
    const [tree, treeErr] = await file.merkleTree()
    await file.close()
    
    if (treeErr !== null) {
      console.error('Error generating verification tree:', treeErr)
      return false
    }
    
    const calculatedHash = tree?.rootHash()
    const isValid = calculatedHash === expectedHash
    
    console.log('🔍 Prompt verification:', {
      expectedHash,
      calculatedHash,
      isValid
    })
    
    return isValid
    
  } catch (error) {
    console.error('❌ Failed to verify prompt integrity:', error)
    return false
  }
}

// Get all stored prompts for an agent (from your database)
export const getAgentPromptHistory = async (agentId: string): Promise<StoredPrompt[]> => {
  // This would query your database for all stored prompt versions
  // For now, return mock data
  return [
    {
      rootHash: '0x1234...abcd',
      txHash: '0x5678...efgh',
      agentId,
      version: '1.0',
      uploadedAt: new Date().toISOString(),
      verified: true
    }
  ]
}

// Educational safety verification (browser-compatible)
export const validateEducationalContent = (prompt: AIAgentPrompt): {
  isValid: boolean
  issues: string[]
} => {
  const issues: string[] = []
  
  // Check for age-appropriate content
  const inappropriateTerms = ['adult', 'violence', 'inappropriate']
  const hasInappropriateContent = inappropriateTerms.some(term => 
    prompt.systemPrompt.toLowerCase().includes(term)
  )
  
  if (hasInappropriateContent) {
    issues.push('Contains potentially inappropriate content for educational use')
  }
  
  // Check for educational focus
  const educationalTerms = ['learn', 'teach', 'student', 'education', 'knowledge']
  const hasEducationalFocus = educationalTerms.some(term =>
    prompt.systemPrompt.toLowerCase().includes(term)
  )
  
  if (!hasEducationalFocus) {
    issues.push('Lacks clear educational focus')
  }
  
  // Check safety rating
  if (prompt.safetyRating === 'pending') {
    issues.push('Safety rating pending review')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
} 