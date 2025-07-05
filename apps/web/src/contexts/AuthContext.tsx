'use client'

import { initializeWalletSetup } from '@/lib/wallet-setup'
import { PrivyProvider, useLogin, useLogout, usePrivy } from '@privy-io/react-auth'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

// Types
export interface User {
  id: string
  privyUserId: string
  email?: string
  walletAddress?: string
  displayName?: string
  subscriptionTier: 'FREE' | 'PREMIUM' | 'ENTERPRISE'
  avatarSessionsCount: number
  createdAt: string
  updatedAt: string
  credits?: {
    currentBalance: number
    totalUsed: number
    totalGranted: number
    dailyLimit: number
    messageCost: number
    lastReset: Date | null
  }
}

export interface ChatMessage {
  id: string
  messageText: string
  messageType: 'USER' | 'AVATAR'
  createdAt: string
  creditsUsed?: number
  session?: {
    id: string
    avatarId: string
    sessionTitle: string
    createdAt: string
  }
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  login: () => void
  logout: () => void
  refreshUser: () => Promise<void>
  // Credit functions
  refreshCredits: () => Promise<void>
  checkCredits: (amount: number) => Promise<boolean>
  // Chat history functions
  getChatHistory: (options?: {
    page?: number
    limit?: number
    sessionId?: string
    dateFrom?: string
    dateTo?: string
  }) => Promise<{
    messages: ChatMessage[]
    total: number
    page: number
    pages: number
  }>
  searchMessages: (query: string) => Promise<ChatMessage[]>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user: privyUser, getAccessToken } = usePrivy()
  const { login: privyLogin } = useLogin()
  const { logout: privyLogout } = useLogout()
  
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

  // Fetch user data from our API
  const fetchUser = useCallback(async () => {
    if (!authenticated || !privyUser) {
      setUser(null)
      setIsLoading(false)
      setAuthError(null)
      return
    }

    try {
      const token = await getAccessToken()
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000)
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setAuthError(null)
        console.log('✅ User fetched successfully:', data.user?.email)
      } else if (response.status === 503) {
        // Handle worker mode gracefully
        const errorData = await response.json().catch(() => ({}))
        console.warn('⚠️ API running in limited worker mode:', errorData.message)
        setUser(null)
        setAuthError('Limited mode: Authentication features unavailable')
      } else if (response.status === 404) {
        // Handle missing endpoint gracefully
        console.warn('⚠️ Auth endpoint not available, but allowing UI access')
        setUser(null)
        setAuthError('Authentication service unavailable')
      } else {
        // Don't block UI for other API errors
        const errorData = await response.json().catch(() => ({}))
        console.warn('⚠️ Failed to fetch user data, but allowing UI access')
        setUser(null)
        setAuthError(errorData.message || `API Error: ${response.status}`)
      }
    } catch (error) {
      // Don't block UI for network errors - user can still browse  
      console.warn('⚠️ Network error fetching user, but allowing UI access:', error)
      setUser(null)
      setAuthError(error instanceof Error ? error.message : 'Network error')
    } finally {
      setIsLoading(false)
    }
  }, [authenticated, privyUser, getAccessToken, API_BASE])

  // Always finish loading after timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ Auth loading timeout - forcing UI to show')
        setIsLoading(false)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [isLoading])

  // Main auth effect
  useEffect(() => {
    console.log('🔄 Auth effect triggered:', { ready, authenticated })
    
    if (ready) {
      if (authenticated && privyUser) {
        console.log('🔐 Authenticated user detected, fetching data...')
        fetchUser()
      } else {
        console.log('👤 Anonymous user, setting up guest access...')
        setUser(null)
        setIsLoading(false)
        setAuthError(null)
      }
    }
  }, [ready, authenticated, privyUser, fetchUser])

  // Refresh credits data - separate from user fetching
  const refreshCredits = async () => {
    if (!authenticated || !privyUser || !user) return

    try {
      const token = await getAccessToken()
      const response = await fetch(`${API_BASE}/credits/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(prev => prev ? { ...prev, credits: data.summary } : null)
      }
    } catch (error) {
      console.error('Error refreshing credits:', error)
      // Don't block UI for credit errors
    }
  }

  // Check if user has enough credits - non-blocking
  const checkCredits = async (amount: number): Promise<boolean> => {
    if (!authenticated || !privyUser) return false

    try {
      const token = await getAccessToken()
      const response = await fetch(`${API_BASE}/credits/check?amount=${amount}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.hasEnoughCredits
      }
    } catch (error) {
      console.error('Error checking credits:', error)
    }
    return false
  }

  // Get chat history - graceful error handling
  const getChatHistory = async (options: {
    page?: number
    limit?: number
    sessionId?: string
    dateFrom?: string
    dateTo?: string
  } = {}) => {
    if (!authenticated || !privyUser) {
      throw new Error('Not authenticated')
    }

    try {
      const token = await getAccessToken()
      const queryParams = new URLSearchParams()
      
      if (options.page) queryParams.append('page', options.page.toString())
      if (options.limit) queryParams.append('limit', options.limit.toString())
      if (options.sessionId) queryParams.append('sessionId', options.sessionId)
      if (options.dateFrom) queryParams.append('dateFrom', options.dateFrom)
      if (options.dateTo) queryParams.append('dateTo', options.dateTo)

      const response = await fetch(`${API_BASE}/sessions/history?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return {
          messages: data.messages,
          total: data.total,
          page: data.page,
          pages: data.pages,
        }
      }
      throw new Error('Failed to fetch chat history')
    } catch (error) {
      console.error('Error fetching chat history:', error)
      throw error
    }
  }

  // Search messages - graceful error handling
  const searchMessages = async (query: string): Promise<ChatMessage[]> => {
    if (!authenticated || !privyUser) {
      throw new Error('Not authenticated')
    }

    try {
      const token = await getAccessToken()
      const response = await fetch(`${API_BASE}/sessions/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.results
      }
      throw new Error('Failed to search messages')
    } catch (error) {
      console.error('Error searching messages:', error)
      throw error
    }
  }

  const login = () => {
    setAuthError(null)
    privyLogin()
  }

  const logout = () => {
    privyLogout()
    setUser(null)
    setAuthError(null)
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: authenticated && !!user,
    isLoading,
    authError,
    login,
    logout,
    refreshUser,
    refreshCredits,
    checkCredits,
    getChatHistory,
    searchMessages,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock AuthProvider for SSR/SSG
function MockAuthProvider({ children }: { children: ReactNode }) {
  const mockValue: AuthContextType = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    authError: null,
    login: async () => {},
    logout: async () => {},
    refreshUser: async () => {},
    refreshCredits: async () => {},
    checkCredits: async () => false,
    getChatHistory: async () => ({
      messages: [],
      total: 0,
      page: 1,
      pages: 1,
    }),
    searchMessages: async () => [],
  }

  return (
    <AuthContext.Provider value={mockValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default function AuthProviderWrapper({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  
  // Only initialize Privy on the client side
  useEffect(() => {
    // Initialize wallet setup first to prevent MetaMask conflicts
    initializeWalletSetup()
    setIsClient(true)
  }, [])
  
  // During SSR/SSG, provide a mock auth context
  if (!isClient) {
    return (
      <MockAuthProvider>
        <div suppressHydrationWarning>{children}</div>
      </MockAuthProvider>
    )
  }
  
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  
  // Handle missing Privy App ID (only on client side)
  if (!appId) {
    return (
      <MockAuthProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-6 p-8 border rounded-lg max-w-2xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">⚠️ Privy Configuration Required</h2>
              <p className="text-muted-foreground">
                To enable wallet connectivity, you need to configure your Privy App ID.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-2">Quick Setup:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://console.privy.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://console.privy.io/</a></li>
                  <li>Create a new app or select an existing one</li>
                  <li>Copy your App ID from the dashboard</li>
                  <li>Create <code className="bg-muted px-2 py-1 rounded">apps/web/.env.local</code> with:</li>
                </ol>
              </div>
              
              <div className="text-xs text-left bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap">{`# apps/web/.env.local
NEXT_PUBLIC_PRIVY_APP_ID="your-app-id-here"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"`}</pre>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>After creating the file, restart your development server:</p>
                <code className="bg-muted px-2 py-1 rounded mt-1 block">npm run dev</code>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> You can still browse AI tutors without wallet connectivity.
              </p>
            </div>
          </div>
        </div>
      </MockAuthProvider>
    )
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#0094FF',
        },
        // Add wallet connectors with better MetaMask handling
        supportedChains: [
          {
            id: 1,
            name: 'Ethereum',
            network: 'mainnet',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://eth-mainnet.g.alchemy.com/v2/demo'] } },
          },
          {
            id: 137,
            name: 'Polygon',
            network: 'polygon',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: { default: { http: ['https://polygon-rpc.com'] } },
          },
        ],
        // Configure wallet connectors to avoid conflicts
        walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
      }}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </PrivyProvider>
  )
} 