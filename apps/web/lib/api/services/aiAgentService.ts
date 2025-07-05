// AI Agent service
import { PrismaClient } from '@prisma/client';
import {
    AIAgent,
    AIAgentConfig,
    EnvVars,
    TokenUsage
} from '../types';

// AI Agent Personas Configuration
export const AI_AGENT_PERSONAS: Record<string, AIAgent> = {
  'professional-advisor': {
    id: 'professional-advisor',
    name: 'Professional Advisor',
    description: 'Expert business and career guidance with strategic insights',
    personality: 'professional',
    style: 'formal',
    systemPrompt: 'You are a professional business advisor with extensive experience in strategy, leadership, and career development. Provide clear, actionable advice with a focus on practical implementation.'
  },
  'creative-mentor': {
    id: 'creative-mentor',
    name: 'Creative Mentor',
    description: 'Inspiring creativity and artistic expression',
    personality: 'creative',
    style: 'inspiring',
    systemPrompt: 'You are a creative mentor who helps unlock artistic potential and innovative thinking. Encourage experimentation, provide constructive feedback, and inspire bold creative choices.'
  },
  'technical-expert': {
    id: 'technical-expert',
    name: 'Technical Expert',
    description: 'Deep technical knowledge and problem-solving expertise',
    personality: 'analytical',
    style: 'technical',
    systemPrompt: 'You are a technical expert with deep knowledge across multiple domains. Provide precise, well-reasoned solutions with clear explanations of technical concepts.'
  },
  'wellness-coach': {
    id: 'wellness-coach',
    name: 'Wellness Coach',
    description: 'Holistic health and wellness guidance for mind and body',
    personality: 'supportive',
    style: 'encouraging',
    systemPrompt: 'You are a wellness coach focused on holistic health. Provide gentle, supportive guidance for physical, mental, and emotional well-being with practical, sustainable advice.'
  },
  'learning-companion': {
    id: 'learning-companion',
    name: 'Learning Companion',
    description: 'Patient teacher and study partner for all subjects',
    personality: 'patient',
    style: 'educational',
    systemPrompt: 'You are a patient learning companion who adapts to different learning styles. Break down complex topics, provide engaging explanations, and encourage curiosity and growth.'
  },
  'financial-advisor': {
    id: 'financial-advisor',
    name: 'Financial Advisor',
    description: 'Smart money management and investment guidance',
    personality: 'analytical',
    style: 'practical',
    systemPrompt: 'You are a knowledgeable financial advisor who helps with budgeting, investing, and financial planning. Provide clear, responsible advice tailored to individual financial situations.'
  }
};

// Cache for agent responses (simple in-memory cache)
let agentCache: Map<string, any> = new Map();

// Get AI Agent configuration from environment
export function getAIAgentConfig(env: EnvVars): AIAgentConfig {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  return {
    apiKey: env.OPENAI_API_KEY,
    baseUrl: 'https://api.openai.com/v1',
    model: env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(env.OPENAI_MAX_TOKENS || '1000'),
    temperature: parseFloat(env.OPENAI_TEMPERATURE || '0.7'),
  };
}

// Get available AI agents (mock implementation)
export async function getAvailableAgents(): Promise<AIAgent[]> {
  // Return static list of available agents
  return Object.values(AI_AGENT_PERSONAS).map(agent => ({
    ...agent,
    previewUrl: undefined // Will be set by the API endpoint
  }));
}

// Get agent by ID
export function getAgentById(agentId: string): AIAgent | null {
  return AI_AGENT_PERSONAS[agentId] || null;
}

// Validate agent ID
export function isValidAgentId(agentId: string): boolean {
  return agentId in AI_AGENT_PERSONAS;
}

// Generate AI response (mock implementation)
export async function generateAIResponse(
  agentId: string,
  message: string,
  conversation: Array<{role: string; content: string}> = [],
  config: AIAgentConfig
): Promise<{
  response: string;
  tokenUsage: TokenUsage;
  agentName: string;
}> {
  const agent = getAgentById(agentId);
  if (!agent) {
    throw new Error(`Agent with ID ${agentId} not found`);
  }

  // Mock AI response for now
  // In a real implementation, you would call the OpenAI API here
  const response = `[${agent.name}]: Thank you for your message: "${message}". This is a mock response. In a production environment, this would connect to the OpenAI API using the provided configuration.`;
  
  const tokenUsage: TokenUsage = {
    promptTokens: Math.floor(message.length / 4),
    completionTokens: Math.floor(response.length / 4),
    totalTokens: Math.floor((message.length + response.length) / 4)
  };

  return {
    response,
    tokenUsage,
    agentName: agent.name
  };
}

// Get conversation context for an agent
export function getAgentConversationContext(
  agentId: string,
  conversation: Array<{role: string; content: string}>
): {
  systemPrompt: string;
  conversationLength: number;
  lastMessages: Array<{role: string; content: string}>;
} {
  const agent = getAgentById(agentId);
  const systemPrompt = agent?.systemPrompt || 'You are a helpful AI assistant.';
  
  // Get last 10 messages for context
  const lastMessages = conversation.slice(-10);
  
  return {
    systemPrompt,
    conversationLength: conversation.length,
    lastMessages
  };
}

// Cache management
export function clearAIAgentCache(): void {
  agentCache.clear();
}

export function getCachedResponse(key: string): any {
  return agentCache.get(key);
}

export function setCachedResponse(key: string, value: any, ttlMinutes: number = 15): void {
  // Simple TTL implementation
  setTimeout(() => {
    agentCache.delete(key);
  }, ttlMinutes * 60 * 1000);
  
  agentCache.set(key, value);
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

// Search agents by criteria
export function searchAgents(
  query: string,
  personality?: string,
  style?: string
): AIAgent[] {
  const agents = Object.values(AI_AGENT_PERSONAS);
  
  return agents.filter(agent => {
    // Text search
    const matchesQuery = !query || 
      agent.name.toLowerCase().includes(query.toLowerCase()) ||
      agent.description.toLowerCase().includes(query.toLowerCase());
    
    // Personality filter
    const matchesPersonality = !personality || agent.personality === personality;
    
    // Style filter
    const matchesStyle = !style || agent.style === style;
    
    return matchesQuery && matchesPersonality && matchesStyle;
  });
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