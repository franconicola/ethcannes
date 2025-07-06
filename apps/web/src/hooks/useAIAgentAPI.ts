import { usePrivy } from '@privy-io/react-auth';
import { useCallback, useEffect, useRef, useState } from 'react';

// API Configuration - use environment variable or fallback to defaults
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 
    ((typeof window !== 'undefined' && window.location.origin.includes('localhost')) 
      ? "http://localhost:3000/api" 
      : "/api"),
};

export interface AIAgentSession {
  sessionId: string;
  agentId: string;
  agentName: string;
  conversation: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }>;
  isAuthenticated: boolean;
  freeMessagesRemaining?: number;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  image: string;
  personality: string;
  style: string;
}

export interface ChatMessage {
  id: string;
  messageText: string;
  messageType: 'USER' | 'AGENT';
  createdAt: string;
}

export interface ChatResponse {
  success: boolean;
  userMessage: ChatMessage;
  agentMessage: ChatMessage;
  tokenUsage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  agentName: string;
  isAuthenticated: boolean;
  freeMessagesRemaining?: number;
}

export const useAIAgentAPI = () => {
  const [session, setSession] = useState<AIAgentSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatting, setChatting] = useState(false);
  const sessionCreationInProgress = useRef<boolean>(false);
  const sessionRef = useRef<AIAgentSession | null>(null);

  // Get auth from Privy directly
  const { user: privyUser, getAccessToken } = usePrivy();
  const isAuthenticated = !!privyUser;

  // Update ref whenever session changes
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Clear any existing errors
  const clearError = () => setError(null);

  // Make request to backend (supports both authenticated and anonymous users)
  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (isAuthenticated) {
      try {
        const authToken = await getAccessToken();
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }
      } catch (error) {
        console.log('Could not get access token:', error);
      }
    }
    
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      
      // Handle specific error cases
      if (response.status === 503 && errorData.message?.includes('worker mode')) {
        throw new Error('API running in limited mode. Some features may be unavailable.');
      } else if (response.status === 404 && errorData.availableEndpoints) {
        throw new Error(`Endpoint not available. Try: ${errorData.availableEndpoints.join(', ')}`);
      }
      
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Get available AI agents
  const getAvailableAgents = async (): Promise<AIAgent[]> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching available AI agents...');

      const response = await makeRequest('/agents/public');

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch AI agents');
      }

      console.log('Available AI agents fetched successfully:', response.data.agents.length);
      return response.data.agents;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AI agents';
      console.error('Failed to fetch AI agents:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create and start AI agent session
  const createSession = async (agentId: string): Promise<AIAgentSession> => {
    if (sessionCreationInProgress.current) {
      throw new Error('Session creation is already in progress');
    }

    if (session && session.agentId === agentId) {
      console.log('AI agent session already exists for this agent, returning existing session');
      return session;
    }

    try {
      sessionCreationInProgress.current = true;
      setLoading(true);
      setError(null);

      console.log('Creating new AI agent session...', { agentId, isAuthenticated });

      const response = await makeRequest('/agents/sessions', {
        method: 'POST',
        body: JSON.stringify({
          agentId
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create AI agent session');
      }

      const sessionData = response.session;
      const newSession: AIAgentSession = {
        sessionId: sessionData.id,
        agentId: sessionData.agentId,
        agentName: sessionData.agentName,
        conversation: sessionData.conversation || [],
        isAuthenticated: sessionData.isAuthenticated,
        freeMessagesRemaining: sessionData.freeMessagesRemaining,
      };

      console.log('AI agent session created successfully:', newSession.sessionId);
      setSession(newSession);
      return newSession;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create AI agent session';
      console.error('AI agent session creation failed:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      sessionCreationInProgress.current = false;
      setLoading(false);
    }
  };

  // Send message to AI agent
  const sendMessage = async (message: string): Promise<ChatResponse> => {
    if (!session) {
      throw new Error('No active AI agent session');
    }

    try {
      setChatting(true);
      setError(null);

      console.log('Sending message to AI agent:', {
        sessionId: session.sessionId,
        agentName: session.agentName,
        messageLength: message.length,
      });

      const response = await makeRequest(`/agents/sessions/${session.sessionId}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          message
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to send message to AI agent');
      }

      // Update session conversation
      const updatedConversation = [
        ...session.conversation,
        {
          role: 'user' as const,
          content: message,
          timestamp: response.userMessage.createdAt,
        },
        {
          role: 'assistant' as const,
          content: response.agentMessage.messageText,
          timestamp: response.agentMessage.createdAt,
        },
      ];

      const updatedSession: AIAgentSession = {
        ...session,
        conversation: updatedConversation,
        freeMessagesRemaining: response.freeMessagesRemaining,
      };

      setSession(updatedSession);

      console.log('AI agent response received:', {
        responseLength: response.agentMessage.messageText.length,
        totalTokens: response.tokenUsage.total_tokens,
      });

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      console.error('Failed to send message to AI agent:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setChatting(false);
    }
  };

  // Stop AI agent session
  const stopSession = async (): Promise<void> => {
    if (!session) {
      console.log('No active AI agent session to stop');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Stopping AI agent session:', session.sessionId);

      const response = await makeRequest(`/agents/sessions/${session.sessionId}/stop`, {
        method: 'POST',
      });

      if (!response.success) {
        console.warn('Failed to stop AI agent session:', response.message);
        // Continue anyway to clear local session
      }

      setSession(null);
      console.log('AI agent session stopped successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop AI agent session';
      console.error('Failed to stop AI agent session:', errorMessage);
      setError(errorMessage);
      // Still clear the session locally
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  // Get conversation history
  const getConversationHistory = async (sessionId?: string): Promise<any> => {
    const targetSessionId = sessionId || session?.sessionId;
    if (!targetSessionId) {
      throw new Error('No session ID provided');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching conversation history:', targetSessionId);

      const response = await makeRequest(`/agents/sessions/${targetSessionId}/conversation`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to get conversation history');
      }

      console.log('Conversation history retrieved:', {
        sessionId: response.session.id,
        messageCount: response.messages.length,
        conversationLength: response.conversation.length,
      });

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get conversation history';
      console.error('Failed to get conversation history:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset session (clear current session)
  const resetSession = useCallback(() => {
    setSession(null);
    setError(null);
    console.log('AI agent session reset');
  }, []);

  return {
    // State
    session,
    loading,
    error,
    chatting,
    isAuthenticated,

    // Actions
    getAvailableAgents,
    createSession,
    sendMessage,
    stopSession,
    getConversationHistory,
    resetSession,
    clearError,

    // Computed properties
    hasActiveSession: !!session,
    canSendMessage: !!session && !chatting,
    conversationLength: session?.conversation.length || 0,
    agentName: session?.agentName,
  };
}; 