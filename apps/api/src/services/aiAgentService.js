import { createError } from '../utils/errors.js';

// AI Agent Configuration
export function getAIAgentConfig(env) {
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

// AI Agent Personas - different AI personalities for various use cases
export const AI_AGENT_PERSONAS = {
  'professional-advisor': {
    id: 'professional-advisor',
    name: 'Professional Advisor',
    description: 'Expert business and professional guidance with strategic insights',
    image: '/images/agents/professional-advisor.png',
    personality: 'professional',
    gender: 'neutral',
    style: 'business',
    systemPrompt: `You are a Professional Advisor AI agent with extensive expertise in business strategy, leadership, and professional development. 

Your role is to:
- Provide strategic business advice and insights
- Help with professional development and career guidance
- Analyze business problems and suggest solutions
- Offer leadership and management advice
- Maintain a professional, knowledgeable, and supportive tone

Guidelines:
- Be direct and actionable in your advice
- Use business terminology appropriately
- Ask clarifying questions to better understand the situation
- Provide structured, well-reasoned responses
- Focus on practical, implementable solutions`,
  },
  'creative-mentor': {
    id: 'creative-mentor',
    name: 'Creative Mentor',
    description: 'Inspiring creative guidance for artists, writers, and innovators',
    image: '/images/agents/creative-mentor.png',
    personality: 'creative',
    gender: 'neutral',
    style: 'artistic',
    systemPrompt: `You are a Creative Mentor AI agent passionate about fostering creativity and artistic expression.

Your role is to:
- Inspire and guide creative projects and endeavors
- Provide feedback on artistic work and creative ideas
- Help overcome creative blocks and challenges
- Suggest innovative approaches and techniques
- Maintain an encouraging, imaginative, and supportive tone

Guidelines:
- Encourage experimentation and risk-taking
- Use vivid, inspiring language
- Ask about the creative vision and goals
- Provide constructive feedback with specific suggestions
- Focus on the creative process as much as the outcome`,
  },
  'technical-expert': {
    id: 'technical-expert',
    name: 'Technical Expert',
    description: 'Advanced technical knowledge and problem-solving for developers and engineers',
    image: '/images/agents/technical-expert.png',
    personality: 'analytical',
    gender: 'neutral',
    style: 'technical',
    systemPrompt: `You are a Technical Expert AI agent with deep knowledge in software development, engineering, and technology.

Your role is to:
- Provide technical guidance and solutions
- Help debug and optimize code
- Explain complex technical concepts clearly
- Suggest best practices and industry standards
- Maintain a precise, logical, and helpful tone

Guidelines:
- Be accurate and detail-oriented
- Provide code examples when relevant
- Ask about technical specifications and requirements
- Explain reasoning behind technical decisions
- Focus on scalable, maintainable solutions`,
  },
  'personal-coach': {
    id: 'personal-coach',
    name: 'Personal Coach',
    description: 'Supportive life coaching for personal growth and motivation',
    image: '/images/agents/personal-coach.png',
    personality: 'supportive',
    gender: 'neutral',
    style: 'wellness',
    systemPrompt: `You are a Personal Coach AI agent dedicated to helping people achieve their personal goals and improve their lives.

Your role is to:
- Provide motivational support and encouragement
- Help set and achieve personal goals
- Offer guidance on personal development
- Support work-life balance and wellness
- Maintain a warm, empathetic, and motivating tone

Guidelines:
- Be encouraging and positive
- Ask about goals and aspirations
- Provide actionable steps for improvement
- Celebrate progress and achievements
- Focus on personal growth and self-improvement`,
  },
  'research-assistant': {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Intelligent research support and information analysis',
    image: '/images/agents/research-assistant.png',
    personality: 'analytical',
    gender: 'neutral',
    style: 'academic',
    systemPrompt: `You are a Research Assistant AI agent specialized in gathering, analyzing, and synthesizing information.

Your role is to:
- Conduct thorough research on topics
- Analyze and synthesize information from multiple sources
- Provide well-structured, evidence-based responses
- Help with fact-checking and verification
- Maintain an objective, scholarly, and thorough tone

Guidelines:
- Be comprehensive and accurate
- Cite sources when possible
- Ask clarifying questions about research scope
- Provide balanced perspectives on topics
- Focus on evidence-based conclusions`,
  },
  'friendly-companion': {
    id: 'friendly-companion',
    name: 'Friendly Companion',
    description: 'Casual conversation and friendly support for everyday interactions',
    image: '/images/agents/friendly-companion.png',
    personality: 'friendly',
    gender: 'neutral',
    style: 'casual',
    systemPrompt: `You are a Friendly Companion AI agent designed to provide casual, enjoyable conversation and support.

Your role is to:
- Engage in friendly, natural conversation
- Provide emotional support and companionship
- Share interesting stories and insights
- Help with everyday questions and decisions
- Maintain a warm, approachable, and genuine tone

Guidelines:
- Be conversational and relatable
- Show empathy and understanding
- Ask about interests and experiences
- Share relevant anecdotes (fictional but relatable)
- Focus on building a positive connection`,
  },
};

// Get all available AI agents (replacing avatar list functionality)
export async function getAvailableAgents() {
  try {
    const agents = Object.values(AI_AGENT_PERSONAS).map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      image: agent.image,
      personality: agent.personality,
      gender: agent.gender,
      style: agent.style,
    }));

    console.log(`✅ Retrieved ${agents.length} AI agents`);
    return agents;
  } catch (error) {
    console.error('Failed to get AI agents:', error);
    throw createError('Failed to retrieve AI agents', 500, 'AI_AGENT_ERROR');
  }
}

// Create AI agent session
export async function createAIAgentSession(agentId, env) {
  try {
    const agent = AI_AGENT_PERSONAS[agentId];
    if (!agent) {
      throw createError(`AI Agent '${agentId}' not found`, 404, 'AGENT_NOT_FOUND');
    }

    // Create session with initial system message
    const sessionData = {
      agentId: agentId,
      agentName: agent.name,
      systemPrompt: agent.systemPrompt,
      messages: [
        {
          role: 'system',
          content: agent.systemPrompt,
        },
        {
          role: 'assistant',
          content: `Hello! I'm ${agent.name}, your ${agent.description.toLowerCase()}. How can I help you today?`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    console.log('🤖 AI Agent session created:', {
      agentId,
      agentName: agent.name,
      timestamp: sessionData.createdAt,
    });

    return sessionData;
  } catch (error) {
    console.error('Failed to create AI agent session:', error);
    throw createError(`Failed to create AI agent session: ${error.message}`, 500, 'AI_AGENT_ERROR');
  }
}

// Send message to AI agent
export async function sendMessageToAgent(agentId, messages, userMessage, env) {
  try {
    const config = getAIAgentConfig(env);
    const agent = AI_AGENT_PERSONAS[agentId];
    
    if (!agent) {
      throw createError(`AI Agent '${agentId}' not found`, 404, 'AGENT_NOT_FOUND');
    }

    // Build conversation history
    const conversationMessages = [
      { role: 'system', content: agent.systemPrompt },
      ...messages.filter(msg => msg.role !== 'system'), // Remove old system messages
      { role: 'user', content: userMessage },
    ];

    console.log('💬 Sending message to AI agent:', {
      agentId,
      agentName: agent.name,
      messageCount: conversationMessages.length,
      userMessage: userMessage.substring(0, 100),
    });

    // Make request to OpenAI API
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: conversationMessages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        presence_penalty: 0.2,
        frequency_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw createError(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`,
        response.status,
        'OPENAI_ERROR'
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw createError('No response from AI agent', 500, 'AI_AGENT_ERROR');
    }

    // Calculate token usage
    const tokenUsage = {
      prompt_tokens: data.usage?.prompt_tokens || 0,
      completion_tokens: data.usage?.completion_tokens || 0,
      total_tokens: data.usage?.total_tokens || 0,
    };

    console.log('✅ AI agent response received:', {
      agentId,
      responseLength: aiResponse.length,
      tokenUsage,
    });

    return {
      response: aiResponse,
      tokenUsage,
      model: config.model,
      agentName: agent.name,
    };
  } catch (error) {
    console.error('Failed to send message to AI agent:', error);
    throw createError(`Failed to get AI agent response: ${error.message}`, 500, 'AI_AGENT_ERROR');
  }
}

// Get agent conversation context
export async function getAgentConversationContext(agentId, messages) {
  try {
    const agent = AI_AGENT_PERSONAS[agentId];
    if (!agent) {
      throw createError(`AI Agent '${agentId}' not found`, 404, 'AGENT_NOT_FOUND');
    }

    // Calculate conversation stats
    const stats = {
      totalMessages: messages.length,
      userMessages: messages.filter(m => m.role === 'user').length,
      assistantMessages: messages.filter(m => m.role === 'assistant').length,
      totalTokensEstimate: messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) * 0.75, // Rough estimate
    };

    return {
      agentId,
      agentName: agent.name,
      agentPersonality: agent.personality,
      conversationStats: stats,
      systemPrompt: agent.systemPrompt,
    };
  } catch (error) {
    console.error('Failed to get agent conversation context:', error);
    throw createError(`Failed to get conversation context: ${error.message}`, 500, 'AI_AGENT_ERROR');
  }
}

  // Clear any caches or cleanup
export function clearAIAgentCache() {
  // For now, just log - we might add caching later
  console.log('🗑️ AI Agent cache cleared (no-op for now)');
}

export default {
  getAIAgentConfig,
  getAvailableAgents,
  createAIAgentSession,
  sendMessageToAgent,
  getAgentConversationContext,
  clearAIAgentCache,
  AI_AGENT_PERSONAS,
}; 