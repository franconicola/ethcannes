import type { AIAgentSession } from '@/contexts/SessionContext'

export type Session = AIAgentSession

export interface User {
  id: string
  email?: string
  subscriptionTier: 'FREE' | 'PREMIUM' | 'ENTERPRISE'
  displayName?: string
}

export interface AnonymousSession {
  freeMessagesRemaining: number
  canUseFreeMessages: boolean
}

export interface ChatControlsProps {
  text: string
  setText: (text: string) => void
  speaking: boolean
  loading: boolean
  hasReachedFreeLimit: boolean
  onSendText: () => void
  onLogin: () => void
}

export interface ChatInterfaceProps {
  session: Session
  avatars: any[]
  text: string
  setText: (text: string) => void
  speaking: boolean
  loading: boolean
  wsConnected: boolean
  hasReachedFreeLimit: boolean
  user: User | null
  anonymousSession?: AnonymousSession | null
  isAuthenticated: boolean
  onSendText: () => void
  onCloseSession: () => void
  onLogin: () => void
} 