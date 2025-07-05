// AI Agent service
import { PrismaClient } from '@prisma/client';
import {
    AIAgent
} from '../types';

// Simple interface for AI agent prompts
interface AIAgentPrompt {
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

// AI Agent Personas Configuration with optional 0G Storage root hashes
export const AI_AGENT_PERSONAS: Record<string, AIAgent & { rootHash?: string }> = {
  'professional-advisor': {
    id: 'professional-advisor',
    name: 'Professional Advisor',
    description: 'Expert business and career guidance with strategic insights',
    personality: 'professional',
    style: 'formal',
    systemPrompt: 'You are a professional business advisor with extensive experience in strategy, leadership, and career development. Your responses are structured, evidence-based, and focused on practical solutions. You provide strategic insights while maintaining a professional tone.',
    // Optional 0G Storage root hash - can be set later
    rootHash: undefined
  },
  'creative-mentor': {
    id: 'creative-mentor',
    name: 'Creative Mentor',
    description: 'Inspiring creativity and artistic expression with personalized guidance',
    personality: 'creative',
    style: 'encouraging',
    systemPrompt: 'You are a creative mentor who inspires artistic expression and innovative thinking. Your responses are enthusiastic, supportive, and designed to unlock creative potential. You provide personalized guidance for various creative endeavors.',
    rootHash: undefined
  },
  'technical-expert': {
    id: 'technical-expert',
    name: 'Technical Expert',
    description: 'Deep technical knowledge and problem-solving expertise',
    personality: 'analytical',
    style: 'precise',
    systemPrompt: 'You are a technical expert with deep knowledge across various domains. Your responses are precise, well-structured, and focus on solving complex technical problems. You provide detailed explanations and practical solutions.',
    rootHash: undefined
  },
  'wellness-coach': {
    id: 'wellness-coach',
    name: 'Wellness Coach',
    description: 'Holistic wellness and personal development guidance',
    personality: 'caring',
    style: 'supportive',
    systemPrompt: 'You are a wellness coach focused on holistic health and personal development. Your responses are caring, supportive, and designed to promote overall well-being. You provide guidance on mental, physical, and emotional health.',
    rootHash: undefined
  },
  'learning-companion': {
    id: 'learning-companion',
    name: 'Learning Companion',
    description: 'Personalized educational support and learning facilitation',
    personality: 'patient',
    style: 'educational',
    systemPrompt: 'You are a learning companion who facilitates personalized education and skill development. Your responses are patient, clear, and adapted to different learning styles. You help break down complex topics into manageable parts.',
    rootHash: undefined
  },
  'mindfulness-guide': {
    id: 'mindfulness-guide',
    name: 'Mindfulness Guide',
    description: 'Meditation and mindfulness practice guidance',
    personality: 'calm',
    style: 'peaceful',
    systemPrompt: 'You are a mindfulness guide who helps people develop meditation and mindfulness practices. Your responses are calm, peaceful, and designed to promote inner awareness and tranquility. You provide practical guidance for mindfulness techniques.',
    rootHash: undefined
  }
};

// Cached prompts from 0G Storage
const promptCache = new Map<string, AIAgentPrompt>();

// Get available AI agents
export const getAvailableAgents = async (): Promise<AIAgent[]> => {
  try {
    console.log('🔄 Getting available AI agents...');
    
    // Return the static agent configuration
    const agents = Object.values(AI_AGENT_PERSONAS);
    
    console.log(`✅ Found ${agents.length} available agents`);
    return agents;
  } catch (error) {
    console.error('❌ Error getting available agents:', error);
    // Return empty array as fallback
    return [];
  }
};

// Get agent by ID
export const getAgentById = async (agentId: string): Promise<AIAgent | null> => {
  try {
    console.log(`🔄 Getting agent by ID: ${agentId}`);
    
    const agent = AI_AGENT_PERSONAS[agentId];
    if (!agent) {
      console.warn(`⚠️ Agent not found: ${agentId}`);
      return null;
    }
    
    console.log(`✅ Found agent: ${agent.name}`);
    return agent;
  } catch (error) {
    console.error(`❌ Error getting agent ${agentId}:`, error);
    return null;
  }
};

// Get system prompt for an agent (with 0G Storage fallback)
export const getAgentSystemPrompt = async (agentId: string): Promise<string> => {
  try {
    console.log(`🔄 Getting system prompt for agent: ${agentId}`);
    
    const agent = AI_AGENT_PERSONAS[agentId];
    if (!agent) {
      console.warn(`⚠️ Agent not found: ${agentId}`);
      return 'You are a helpful AI assistant.';
    }
    
    // If agent has a root hash, try to retrieve from 0G Storage
    if (agent.rootHash) {
      try {
        console.log(`📥 Attempting to retrieve prompt from 0G Storage: ${agent.rootHash}`);
        
        // Try to load storage module dynamically
        const storageModule = await import('@/lib/storage');
        const storedPrompt = await storageModule.retrieveAgentPrompt(agent.rootHash);
        
        if (storedPrompt && storedPrompt.systemPrompt) {
          console.log(`✅ Retrieved prompt from 0G Storage for agent: ${agentId}`);
          return storedPrompt.systemPrompt;
        }
      } catch (storageError) {
        console.warn(`⚠️ Failed to retrieve from 0G Storage, using fallback: ${storageError}`);
      }
    }
    
    // Use the default system prompt
    console.log(`✅ Using default system prompt for agent: ${agentId}`);
    return agent.systemPrompt || 'You are a helpful AI assistant.';
  } catch (error) {
    console.error(`❌ Error getting system prompt for ${agentId}:`, error);
    return 'You are a helpful AI assistant.';
  }
};

// Update agent root hash (for 0G Storage integration)
export const updateAgentRootHash = async (agentId: string, rootHash: string): Promise<boolean> => {
  try {
    console.log(`🔄 Updating root hash for agent ${agentId}: ${rootHash}`);
    
    const agent = AI_AGENT_PERSONAS[agentId];
    if (!agent) {
      console.warn(`⚠️ Agent not found: ${agentId}`);
      return false;
    }
    
    // Update the root hash
    agent.rootHash = rootHash;
    
    console.log(`✅ Updated root hash for agent: ${agentId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating root hash for ${agentId}:`, error);
    return false;
  }
};

// Clear prompt cache
export const clearPromptCache = (): void => {
  promptCache.clear();
  console.log('🗑️ Cleared prompt cache');
};

// Get agent configuration (removed - type mismatch)

// Validate agent exists
export const validateAgent = async (agentId: string): Promise<boolean> => {
  try {
    const agent = await getAgentById(agentId);
    return agent !== null;
  } catch (error) {
    console.error(`❌ Error validating agent ${agentId}:`, error);
    return false;
  }
};

// Get all agent IDs
export const getAgentIds = (): string[] => {
  return Object.keys(AI_AGENT_PERSONAS);
};

// Get agents by personality type
export const getAgentsByPersonality = async (personality: string): Promise<AIAgent[]> => {
  try {
    const allAgents = await getAvailableAgents();
    return allAgents.filter(agent => agent.personality === personality);
  } catch (error) {
    console.error(`❌ Error getting agents by personality ${personality}:`, error);
    return [];
  }
};

// Get agents by style
export const getAgentsByStyle = async (style: string): Promise<AIAgent[]> => {
  try {
    const allAgents = await getAvailableAgents();
    return allAgents.filter(agent => agent.style === style);
  } catch (error) {
    console.error(`❌ Error getting agents by style ${style}:`, error);
    return [];
  }
};

// Search agents
export const searchAgents = async (query: string): Promise<AIAgent[]> => {
  try {
    const allAgents = await getAvailableAgents();
    const searchTerm = query.toLowerCase();
    
    return allAgents.filter(agent => 
      agent.name.toLowerCase().includes(searchTerm) ||
      agent.description.toLowerCase().includes(searchTerm) ||
      agent.personality.toLowerCase().includes(searchTerm) ||
      agent.style.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error(`❌ Error searching agents with query ${query}:`, error);
    return [];
  }
};

// Get conversation context for an agent with 0G Storage prompt
export async function getAgentConversationContext(
  agentId: string,
  conversation: Array<{role: string; content: string}>
): Promise<{
  systemPrompt: string;
  conversationLength: number;
  lastMessages: Array<{role: string; content: string}>;
}> {
  try {
    // Get the system prompt from 0G Storage or fallback
    const systemPrompt = await getAgentSystemPrompt(agentId);
    
    // Get last 10 messages for context
    const lastMessages = conversation.slice(-10);
    
    return {
      systemPrompt,
      conversationLength: conversation.length,
      lastMessages
    };
  } catch (error) {
    console.error('Error getting conversation context:', error);
    // Fallback to default prompt
    const agent = await getAgentById(agentId);
    const systemPrompt = agent?.systemPrompt || 'You are a helpful AI assistant.';
    
    return {
      systemPrompt,
      conversationLength: conversation.length,
      lastMessages: conversation.slice(-10)
    };
  }
}

// Get agent statistics
export async function getAgentStatistics(
  prisma: PrismaClient
): Promise<{
  totalSessions: number;
  activeSessions: number;
  totalMessages: number;
  averageSessionLength: number;
  popularAgents: Array<{agentId: string; sessionCount: number}>;
}> {
  try {
    const [
      totalSessions,
      activeSessions,
      totalMessages,
      sessionsByAgent
    ] = await Promise.all([
      prisma.agentSession.count(),
      prisma.agentSession.count({ where: { status: 'ACTIVE' } }),
      prisma.chatMessage.count(),
      prisma.agentSession.groupBy({
        by: ['agentId'],
        _count: { agentId: true },
        orderBy: { _count: { agentId: 'desc' } },
        take: 5
      })
    ]);

    const sessionDurations = await prisma.agentSession.findMany({
      where: { 
        status: 'ENDED',
        duration: { not: null }
      },
      select: { duration: true }
    });

    const averageSessionLength = sessionDurations.length > 0
      ? sessionDurations.reduce((sum, session) => sum + (session.duration || 0), 0) / sessionDurations.length
      : 0;

    const popularAgents = sessionsByAgent.map(agent => ({
      agentId: agent.agentId,
      sessionCount: agent._count.agentId
    }));

    return {
      totalSessions,
      activeSessions,
      totalMessages,
      averageSessionLength,
      popularAgents
    };
  } catch (error) {
    console.error('Error getting agent statistics:', error);
    return {
      totalSessions: 0,
      activeSessions: 0,
      totalMessages: 0,
      averageSessionLength: 0,
      popularAgents: []
    };
  }
}

// Get agent capabilities
export function getAgentCapabilities(agentId: string): string[] {
  const agent = getAgentById(agentId);
  if (!agent) return [];
  
  // Return capabilities based on agent type
  const capabilities: Record<string, string[]> = {
    'professional-advisor': ['business-strategy', 'career-planning', 'leadership', 'decision-making'],
    'creative-mentor': ['creative-writing', 'art-direction', 'brainstorming', 'inspiration'],
    'technical-expert': ['coding', 'architecture', 'debugging', 'best-practices'],
    'wellness-coach': ['health-planning', 'stress-management', 'mindfulness', 'exercise'],
    'learning-companion': ['tutoring', 'study-planning', 'concept-explanation', 'skill-development'],
    'financial-advisor': ['budgeting', 'investing', 'financial-planning', 'risk-assessment']
  };
  
  return capabilities[agentId] || ['general-assistance'];
} 