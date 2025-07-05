// TypeScript type definitions for the SparkMind API

import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

// Environment variables interface
export interface EnvVars {
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
  OPENAI_MODEL?: string;
  OPENAI_MAX_TOKENS?: string;
  OPENAI_TEMPERATURE?: string;
  PRIVY_APP_ID: string;
  PRIVY_APP_SECRET: string;
  JWT_SECRET: string;
  NODE_ENV?: string;
}

// Authentication types
export interface AuthInfo {
  isAuthenticated: boolean;
  user?: {
    id: string;
    privyUserId: string;
    email?: string;
    displayName?: string;
    walletAddress?: string;
  };
}

// Anonymous session types
export interface AnonymousSession {
  id: string;
  sessionIdentifier: string;
  freeMessagesUsed: number;
  createdAt: Date;
  lastUsed: Date;
}

// Agent session types
export interface AgentSession {
  id: string;
  userId?: string;
  anonymousSessionId?: string;
  agentId: string;
  agentName: string;
  status: 'ACTIVE' | 'ENDED';
  createdAt: Date;
  endedAt?: Date;
  lastUsed: Date;
  conversation?: ConversationMessage[];
  messageCount: number;
  duration?: number;
  tokenUsage?: number;
}

// Conversation message types
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

// Chat message types
export interface ChatMessage {
  id: string;
  sessionId: string;
  userId?: string;
  anonymousSessionId?: string;
  messageText: string;
  messageType: 'USER' | 'AGENT';
  createdAt: Date;
  tokenCount?: number;
  processingTime?: number;
  creditsUsed: number;
}

// AI Agent types
export interface AIAgent {
  id: string;
  name: string;
  description: string;
  personality: string;
  style: string;
  previewUrl?: string;
  systemPrompt?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  personality?: string;
  style?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Request types
export interface CreateAgentSessionRequest {
  agentId: string;
  initialMessage?: string;
}

export interface ChatRequest {
  message: string;
}

export interface StopSessionRequest {
  sessionId: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface HealthResponse {
  status: 'OK';
  timestamp: string;
  version: string;
  environment: string;
  platform: string;
}

export interface DebugResponse {
  status: 'OK';
  timestamp: string;
  environment: string;
  hasDatabase: boolean;
  hasPrivyConfig: boolean;
  hasJwtSecret: boolean;
  hasOpenAIKey: boolean;
  platform: string;
  note: string;
}

export interface AuthMeResponse {
  success: boolean;
  user?: AuthInfo['user'];
  isAuthenticated: boolean;
}

export interface PublicAgentsResponse {
  success: boolean;
  agents: AIAgent[];
  pagination: PaginationResult<AIAgent>['pagination'];
  source: string;
}

export interface CreateSessionResponse {
  success: boolean;
  session: {
    id: string;
    agentId: string;
    status: string;
    createdAt: Date;
    messageCount: number;
    tokenUsage: number;
  };
}

export interface ChatResponse {
  success: boolean;
  userMessage: {
    id: string;
    messageText: string;
    messageType: string;
    createdAt: Date;
  };
  agentMessage: {
    id: string;
    messageText: string;
    messageType: string;
    createdAt: Date;
  };
  tokenUsage: { total: number };
  agentName: string;
  isAuthenticated: boolean;
  freeMessagesRemaining: number;
}

export interface StopSessionResponse {
  success: boolean;
  session: {
    id: string;
    agentId: string;
    status: string;
    endedAt: Date;
    duration: number;
    messageCount: number;
  };
}

export interface ConversationResponse {
  success: boolean;
  session: {
    id: string;
    agentId: string;
    status: string;
    createdAt: Date;
    endedAt?: Date;
    duration?: number;
    messageCount: number;
    tokenUsage: number;
  };
  conversation: ConversationMessage[];
  messages: ChatMessage[];
  isAuthenticated: boolean;
}

// Extended API request/response types
export interface ApiRequest extends NextApiRequest {
  headers: NextApiRequest['headers'] & {
    'x-anonymous-session-id'?: string;
  };
}

export interface ApiHandler<T = any> {
  (req: ApiRequest, res: NextApiResponse<ApiResponse<T>>): Promise<void>;
}

// Middleware types
export interface MiddlewareContext {
  env: EnvVars;
  prisma: PrismaClient;
  authInfo: AuthInfo;
  anonymousSession: AnonymousSession | null;
}

// Error types
export interface APIError extends Error {
  statusCode?: number;
  code?: string;
}

// Database types (extending Prisma types)
export type User = {
  id: string;
  privyUserId: string;
  walletAddress?: string;
  email?: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
  credits: number;
  totalMessagesCount: number;
  lastActiveAt?: Date;
};

// 0G Storage types
export interface ZGStorageRequest {
  agentId: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface ZGStorageResponse {
  success: boolean;
  rootHash?: string;
  txHash?: string;
  error?: string;
}

// Token usage types
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// AI Agent configuration types
export interface AIAgentConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
} 