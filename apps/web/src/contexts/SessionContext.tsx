'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'

// API Configuration
const API_CONFIG = {
  baseUrl: (typeof window !== 'undefined' && window.location.origin.includes('localhost')) 
    ? "http://localhost:3000/api" 
    : "/api",
}

export interface AIAgentSession {
  sessionId: string
  agentId: string
  agentName: string
  isAuthenticated: boolean
  freeMessagesRemaining?: number
  conversation: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
    timestamp?: string
  }>
  // LiveKit specific data (if still needed for audio/video)
  token?: string
  wsUrl?: string
  agentSessionId?: string
}

interface SessionContextType {
  session: AIAgentSession | null
  loading: boolean
  error: string | null
  chatting: boolean
  speaking: boolean  // Add for backwards compatibility
  wsConnected: boolean  // Add WebSocket connection state
  navigating: boolean  // Add navigation state
  freeLimitExceeded: boolean  // Add free limit state
  createSession: (agentId: string) => Promise<AIAgentSession>
  sendMessage: (message: string) => Promise<void>
  sendText: (message: string) => Promise<void>  // Add alias for sendMessage
  stopSession: () => Promise<void>
  closeSession: () => Promise<void>  // Add alias for stopSession
  clearError: () => void
  resetSession: () => void
  dismissFreeLimitModal: () => void  // Add free limit modal dismiss
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AIAgentSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatting, setChatting] = useState(false)
  const [navigating, setNavigating] = useState(false)  // Add navigation state
  const [freeLimitExceeded, setFreeLimitExceeded] = useState(false)  // Add free limit state
  const sessionCreationInProgress = useRef<boolean>(false)
  const sessionRef = useRef<AIAgentSession | null>(null)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { user: privyUser, getAccessToken } = usePrivy()

  // Anonymous session management
  const getOrCreateAnonymousSessionId = useCallback(() => {
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem('anonymous-session-id')
    if (stored) {
      return stored
    }
    
    // Create new anonymous session ID
    const newId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('anonymous-session-id', newId)
    return newId
  }, [])

  // Update ref whenever session changes
  useEffect(() => {
    sessionRef.current = session
  }, [session])

  // Enhanced error handling function
  const handleError = (err: any, context: string) => {
    console.error(`❌ ${context}:`, err)
    
    const errorMessage = err instanceof Error ? err.message : String(err)
    
    if (errorMessage.includes('Free limit exceeded') || 
        errorMessage.includes('maximum number of messages') ||
        errorMessage.includes('Please log in to continue')) {
      console.log('🚫 Free limit exceeded detected, showing modal')
      setFreeLimitExceeded(true)
      // Don't set this as a regular error since we're showing a modal
      return
    }
    
    setError(errorMessage)
  }

  // Clear any existing errors
  const clearError = () => {
    setError(null)
    setFreeLimitExceeded(false)
  }

  // Dismiss free limit modal
  const dismissFreeLimitModal = () => {
    setFreeLimitExceeded(false)
  }

  // Make request to backend (supports both authenticated and anonymous users)
  const makeRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    }

    // Add auth token if available
    if (isAuthenticated) {
      try {
        const authToken = await getAccessToken()
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`
        }
      } catch (error) {
        console.log('Could not get access token:', error)
      }
    } else {
      // For anonymous users, add the stored backend session ID
      const backendSessionId = localStorage.getItem('backend-anonymous-session-id')
      if (backendSessionId) {
        headers['X-Anonymous-Session-Id'] = backendSessionId
      }
    }
    
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }, [isAuthenticated, getAccessToken])

  // Create new session
  const createSession = async (agentId: string): Promise<AIAgentSession> => {
    if (sessionCreationInProgress.current) {
      console.warn('⚠️ Session creation already in progress, skipping...')
      throw new Error('Session creation already in progress')
    }

    try {
      sessionCreationInProgress.current = true
      setLoading(true)
      setError(null)

      console.log('🚀 Creating new agent session...', { 
        agentId, 
        isAuthenticated,
        timestamp: new Date().toISOString()
      })

      console.log('🔄 Using AI Agent endpoint with proper tracking')
      // Use the AI agent endpoint that supports both authenticated and anonymous users
      const response = await makeRequest('/agents/sessions', {
        method: 'POST',
        body: JSON.stringify({
          agentId
        }),
      })

      console.log('📡 Backend response received:', {
        success: response.success,
        hasSession: !!response.session,
        sessionId: response.session?.id,
        isAuthenticated: response.session?.isAuthenticated,
        freeMessagesRemaining: response.session?.freeMessagesRemaining,
        fullResponse: response,
        timestamp: new Date().toISOString()
      })

      if (!response.success) {
        console.error('❌ Backend returned unsuccessful response:', response.message)
        throw new Error(response.message || 'Failed to create session')
      }

      if (!response.session) {
        console.error('❌ Backend response missing session data:', response)
        throw new Error('Session data not found in response')
      }

      const sessionData = response.session
      console.log('📊 Session data received:', {
        id: sessionData.id,
        agentId: sessionData.agentId,
        agentName: sessionData.agentName,
        hasSessionToken: !!sessionData.token,
        hasWsUrl: !!sessionData.wsUrl,
        isAuthenticated: sessionData.isAuthenticated,
        freeMessagesRemaining: sessionData.freeMessagesRemaining,
        wsUrl: sessionData.wsUrl,
        timestamp: new Date().toISOString()
      })

      if (!sessionData || !sessionData.id) {
        console.error('❌ Session data invalid or missing required id field:', {
          sessionData,
          hasSessionData: !!sessionData,
          sessionDataType: typeof sessionData,
          sessionDataKeys: sessionData ? Object.keys(sessionData) : null
        })
        throw new Error('Session ID not found in response data')
      }

      const newSession: AIAgentSession = {
        sessionId: sessionData.id,
        agentId: sessionData.agentId,
        agentName: sessionData.agentName,
        isAuthenticated: sessionData.isAuthenticated,
        freeMessagesRemaining: sessionData.freeMessagesRemaining,
        conversation: sessionData.conversation,
        token: sessionData.token,
        wsUrl: sessionData.wsUrl,
        agentSessionId: sessionData.agentSessionId,
      }

      // Store the backend's anonymousSessionId for future requests (if anonymous user)
      if (!isAuthenticated && response.anonymousSessionId) {
        console.log('💾 Storing backend anonymousSessionId for future requests:', response.anonymousSessionId)
        localStorage.setItem('backend-anonymous-session-id', response.anonymousSessionId)
      }

      console.log('✅ Agent session created successfully:', {
        sessionId: newSession.sessionId,
        agentId: newSession.agentId,
        agentName: newSession.agentName,
        isAuthenticated: newSession.isAuthenticated,
        freeMessagesRemaining: newSession.freeMessagesRemaining,
        hasWebSocketUrl: !!newSession.wsUrl,
        hasAccessToken: !!newSession.token,
        timestamp: new Date().toISOString()
      })

      setSession(newSession)
      setChatting(false)
      
      console.log('🧭 Navigating to session page:', `/${newSession.sessionId}`)
      // Set navigating state and navigate to session page
      setNavigating(true)
      router.push(`/${newSession.sessionId}`)
      
      // Clear the navigating state after navigation
      setTimeout(() => {
        setNavigating(false)
        setChatting(false)
      }, 2000)
      
      return newSession
    } catch (err) {
      console.error('❌ Session creation failed:', {
        error: err instanceof Error ? err.message : String(err),
        agentId,
        isAuthenticated,
        timestamp: new Date().toISOString(),
        stack: err instanceof Error ? err.stack : undefined
      })
      
      // Handle the error appropriately
      handleError(err, 'Session creation')
      throw err
    } finally {
      sessionCreationInProgress.current = false
      setLoading(false)
      console.log('🏁 Session creation process completed')
    }
  }

  // Send message to agent using backend API (supports both authenticated and anonymous users)
  const sendMessage = async (message: string): Promise<void> => {
    if (!session) {
      throw new Error('No active session')
    }

    console.log('💬 Starting to send message to agent:', {
      message,
      sessionId: session.sessionId,
      agentId: session.agentId,
      isAuthenticated: session.isAuthenticated,
      freeMessagesRemaining: session.freeMessagesRemaining,
      timestamp: new Date().toISOString()
    })

    try {
      setChatting(true)
      setError(null)

      console.log('💬 Using AI Agent chat endpoint with proper tracking')
      // Use the AI agent chat endpoint that supports both authenticated and anonymous users
      const response = await makeRequest(`/agents/sessions/${session.sessionId}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          message,
        }),
      })
      
      console.log('💬 Backend response:', {
        success: response.success,
        hasMessage: !!response.message,
        isAuthenticated: response.isAuthenticated,
        freeMessagesRemaining: response.freeMessagesRemaining,
        timestamp: new Date().toISOString()
      })

      if (!response.success) {
        throw new Error(response.message || 'Failed to send message')
      }

      // Update session with latest free message count
      if (typeof response.freeMessagesRemaining === 'number') {
        setSession(prev => prev ? {
          ...prev,
          freeMessagesRemaining: response.freeMessagesRemaining
        } : null)
      }

      console.log('✅ Message sent successfully to agent:', {
        sessionId: session.sessionId,
        messageLength: message.length,
        isAuthenticated: response.isAuthenticated,
        freeMessagesRemaining: response.freeMessagesRemaining,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('❌ Failed to send message to agent:', {
        error: err instanceof Error ? err.message : String(err),
        sessionId: session.sessionId,
        messageLength: message.length,
        timestamp: new Date().toISOString(),
        stack: err instanceof Error ? err.stack : undefined
      })
      
      // Handle the error appropriately
      handleError(err, 'Message sending')
      throw err
    } finally {
      // Wait a bit to see response before clearing chatting state
      setTimeout(() => {
        setChatting(false)
      }, 2000)
    }
  }

  // Stop session
  const stopSession = useCallback(async (): Promise<void> => {
    if (!session) {
      return
    }

    console.log('🔒 Stopping agent session:', session.sessionId)

    try {
      setLoading(true)
      setError(null)

      // Call backend to properly end the session
      console.log('🔒 Calling backend to end session:', session.sessionId)
      try {
        // Try to end the session through the AI agent endpoint (handles both authenticated and anonymous)
        const response = await makeRequest(`/agents/sessions/${session.sessionId}/stop`, {
          method: 'POST',
        })
        
        console.log('🔒 Session ended on backend:', response.success)
      } catch (endError) {
        console.warn('⚠️ Failed to end session on backend, continuing with cleanup:', endError)
        // Continue with local cleanup even if backend call fails
      }

      // Reset session state immediately to prevent multiple stop attempts
      setSession(null)
      setChatting(false)

      // Clear stored backend anonymous session ID
      localStorage.removeItem('backend-anonymous-session-id')
      console.log('🧹 Cleared stored backend anonymousSessionId')

      // Navigate back to home
      router.push('/')

      console.log('✅ Session stopped successfully')

    } catch (err) {
      console.error("❌ Error stopping session:", err)
      // Still ensure session state is reset
      setSession(null)
      setChatting(false)
    } finally {
      setLoading(false)
    }
  }, [session, router, makeRequest])

  // Auto-cleanup on unmount
  useEffect(() => {
    const cleanup = async () => {
      if (sessionRef.current) {
        console.log('Component unmounting, cleaning up session')
        
        // Create cleanup logic directly here to avoid dependency issues
        try {
          console.log('🔒 Calling backend to end session:', sessionRef.current.sessionId)
          try {
            // Try to end the session through the AI agent endpoint
            const response = await makeRequest(`/agents/sessions/${sessionRef.current.sessionId}/stop`, {
              method: 'POST',
            })
            console.log('🔒 Session ended on backend:', response.success)
          } catch (endError) {
            console.warn('⚠️ Failed to end session on backend, continuing with cleanup:', endError)
          }
          // Clear stored backend anonymous session ID
          localStorage.removeItem('backend-anonymous-session-id')
          console.log('✅ Session cleanup completed on unmount')
        } catch (err) {
          console.error("❌ Error during unmount cleanup:", err)
        }
      }
    }

    return () => {
      cleanup()
    }
  }, [makeRequest]) // Add makeRequest dependency

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (sessionRef.current) {
        console.log('Page unloading, cleaning up session')
        
        // Create cleanup logic directly here to avoid dependency issues
        try {
          console.log('🔒 Calling backend to end session:', sessionRef.current.sessionId)
          try {
            // Try to end the session through the AI agent endpoint
            const response = await makeRequest(`/agents/sessions/${sessionRef.current.sessionId}/stop`, {
              method: 'POST',
            })
            console.log('🔒 Session ended on backend:', response.success)
          } catch (endError) {
            console.warn('⚠️ Failed to end session on backend, continuing with cleanup:', endError)
          }
          // Clear stored backend anonymous session ID
          localStorage.removeItem('backend-anonymous-session-id')
          console.log('✅ Session cleanup completed on page unload')
        } catch (err) {
          console.error("❌ Error during page unload cleanup:", err)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [makeRequest]) // Add makeRequest dependency

  const contextValue: SessionContextType = {
    session,
    loading,
    error,
    chatting,
    speaking: chatting,  // Use chatting state for speaking
    wsConnected: !!session,  // Connected if we have an active session
    navigating,
    freeLimitExceeded,
    createSession,
    sendMessage,
    sendText: sendMessage,  // Alias for backwards compatibility
    stopSession,
    closeSession: stopSession,  // Alias for backwards compatibility
    clearError,
    resetSession: () => setSession(null),
    dismissFreeLimitModal,
  }

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
} 