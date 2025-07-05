import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';

// 0G Network Configuration
const RPC_URL = 'https://evmrpc-testnet.0g.ai/';
const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai';

// Initialize 0G storage client
let indexer = null;
let provider = null;

// Initialize 0G Storage
export function initializeZGStorage() {
  try {
    indexer = new Indexer(INDEXER_RPC);
    provider = new ethers.JsonRpcProvider(RPC_URL);
    
    console.log('✅ 0G Storage initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize 0G Storage:', error);
    return false;
  }
}

// Store AI agent system prompt on 0G Storage
export async function storeAgentPrompt(prompt, privateKey) {
  if (!indexer) {
    initializeZGStorage();
  }

  if (!indexer) {
    throw new Error('0G Storage not initialized');
  }

  try {
    // Create signer for this operation
    const signer = new ethers.Wallet(privateKey, provider);
    
    // Convert prompt to JSON and create file
    const promptData = JSON.stringify(prompt, null, 2);
    const promptBytes = new TextEncoder().encode(promptData);
    
    // Create ZgFile from data
    const file = await ZgFile.fromBytes(promptBytes, `agent-${prompt.agentId}-v${prompt.version}.json`);
    
    // Generate Merkle tree for verification
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr !== null) {
      await file.close();
      throw new Error(`Error generating Merkle tree: ${treeErr}`);
    }
    
    const rootHash = tree?.rootHash();
    if (!rootHash) {
      await file.close();
      throw new Error('Failed to generate root hash');
    }
    
    console.log(`📄 Storing prompt for agent ${prompt.agentId}:`, {
      rootHash,
      size: promptBytes.length,
      version: prompt.version
    });
    
    // Upload to 0G Storage
    const [tx, uploadErr] = await indexer.upload(file, RPC_URL, signer);
    await file.close();
    
    if (uploadErr !== null) {
      throw new Error(`Upload error: ${uploadErr}`);
    }
    
    console.log('✅ Agent prompt stored successfully!', {
      agentId: prompt.agentId,
      rootHash,
      txHash: tx
    });
    
    return {
      rootHash,
      txHash: tx,
      agentId: prompt.agentId,
      version: prompt.version,
      uploadedAt: new Date().toISOString(),
      verified: true
    };
    
  } catch (error) {
    console.error('❌ Failed to store agent prompt:', error);
    throw error;
  }
}

// Retrieve AI agent system prompt from 0G Storage
export async function retrieveAgentPrompt(rootHash) {
  if (!indexer) {
    initializeZGStorage();
  }

  if (!indexer) {
    throw new Error('0G Storage not initialized');
  }
  
  try {
    console.log(`📥 Retrieving prompt with hash: ${rootHash}`);
    
    // Create temporary file path for download
    const tempPath = `/tmp/prompt-${Date.now()}.json`;
    
    // Download from 0G Storage with verification
    const err = await indexer.download(rootHash, tempPath, true);
    if (err !== null) {
      throw new Error(`Download error: ${err}`);
    }
    
    // Read the downloaded file
    const fs = await import('fs/promises');
    const promptData = await fs.readFile(tempPath, 'utf-8');
    const prompt = JSON.parse(promptData);
    
    // Clean up temp file
    await fs.unlink(tempPath);
    
    console.log('✅ Prompt retrieved successfully');
    return prompt;
    
  } catch (error) {
    console.error('❌ Failed to retrieve agent prompt:', error);
    throw error;
  }
}

// Verify prompt integrity by comparing hashes
export async function verifyPromptIntegrity(prompt, expectedHash) {
  try {
    // Convert prompt to same format as stored
    const promptData = JSON.stringify(prompt, null, 2);
    const promptBytes = new TextEncoder().encode(promptData);
    
    // Create temporary file and calculate hash
    const file = await ZgFile.fromBytes(promptBytes, 'temp-verify.json');
    const [tree, treeErr] = await file.merkleTree();
    await file.close();
    
    if (treeErr !== null) {
      console.error('Error generating verification tree:', treeErr);
      return false;
    }
    
    const calculatedHash = tree?.rootHash();
    const isValid = calculatedHash === expectedHash;
    
    console.log('🔍 Prompt verification:', {
      expectedHash,
      calculatedHash,
      isValid
    });
    
    return isValid;
    
  } catch (error) {
    console.error('❌ Failed to verify prompt integrity:', error);
    return false;
  }
}

// Educational safety verification
export function validateEducationalContent(prompt) {
  const issues = [];
  
  // Check for age-appropriate content
  const inappropriateTerms = ['adult', 'violence', 'inappropriate', 'sexual', 'weapon'];
  const hasInappropriateContent = inappropriateTerms.some(term => 
    prompt.systemPrompt.toLowerCase().includes(term)
  );
  
  if (hasInappropriateContent) {
    issues.push('Contains potentially inappropriate content for educational use');
  }
  
  // Check for educational focus
  const educationalTerms = ['learn', 'teach', 'student', 'education', 'knowledge', 'study', 'explain'];
  const hasEducationalFocus = educationalTerms.some(term =>
    prompt.systemPrompt.toLowerCase().includes(term)
  );
  
  if (!hasEducationalFocus) {
    issues.push('Lacks clear educational focus');
  }
  
  // Check minimum length
  if (prompt.systemPrompt.length < 50) {
    issues.push('System prompt too short - needs more detailed instructions');
  }
  
  // Check for required fields
  if (!prompt.agentId || !prompt.agentName) {
    issues.push('Missing required agent identification');
  }
  
  if (!prompt.educationalLevel) {
    issues.push('Educational level not specified');
  }
  
  if (!prompt.subjects || prompt.subjects.length === 0) {
    issues.push('No subjects specified');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// Generate a test prompt for validation
export function generateTestPrompt(agentId) {
  return {
    agentId: agentId || 'test-agent',
    agentName: 'Test AI Tutor',
    systemPrompt: `You are a friendly and patient AI tutor designed to help students learn effectively.

Your role is to:
- Provide clear, age-appropriate explanations
- Encourage students when they face challenges  
- Use examples and analogies to make concepts understandable
- Ask guiding questions to help students think critically
- Maintain a positive and supportive learning environment
- Focus on building confidence and genuine understanding

Always prioritize student safety and educational value in all interactions.`,
    version: '1.0',
    createdAt: new Date().toISOString(),
    createdBy: 'test-system',
    educationalLevel: 'elementary',
    subjects: ['general', 'test'],
    safetyRating: 'pending'
  };
}

// Initialize on module load
initializeZGStorage(); 