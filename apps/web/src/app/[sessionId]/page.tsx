'use client'

import { AlertsSection } from '@/components/avatar/AlertsSection';
import { ChatInterface } from '@/components/chat/Interface';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/contexts/SessionContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Edge Runtime configuration for Cloudflare Pages
export const runtime = 'nodejs';

interface Avatar {
  id: string
  name: string
  description: string
  image?: string
  preview_video?: string
}

export default function SessionPage() {
  const [text, setText] = useState("")
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [loadingAvatars, setLoadingAvatars] = useState(true)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  // Auth state
  const { user, isAuthenticated, isLoading: authLoading, login } = useAuth()
  
  // Session state
  const { 
    session, 
    loading, 
    error, 
    speaking, 
    wsConnected, 
    navigating,
    freeLimitExceeded,
    sendText, 
    closeSession, 
    clearError,
    dismissFreeLimitModal
  } = useSession()

  // Load avatars from the public API (no auth required)
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        setLoadingAvatars(true)
        setAvatarError(null)
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
        const response = await fetch(`${apiUrl}/agents/public`)
        if (!response.ok) {
          throw new Error(`Failed to load avatars: ${response.statusText}`)
        }
        
        const data = await response.json()
        if (data.success && data.data && data.data.agents) {
          setAvatars(data.data.agents)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Failed to load avatars:', err)
        setAvatarError(err instanceof Error ? err.message : 'Failed to load avatars')
        setAvatars([])
      } finally {
        setLoadingAvatars(false)
      }
    }

    loadAvatars()
  }, [])

  // Check if we have a valid session that matches the URL sessionId
  useEffect(() => {

    if (!authLoading && !loading) {
      if (!session || session.sessionId !== sessionId) {
        // No session or session doesn't match URL, redirect to home
        router.replace('/')
      } else {

      }
    }
  }, [session, sessionId, authLoading, loading, router])

  // Clear navigating state when this page loads
  useEffect(() => {
    if (session && session.sessionId === sessionId) {
      console.log('🏠 SessionPage: Successfully loaded, clearing navigation state')
      // The navigating state will be cleared by the timeout in SessionContext
    }
  }, [session, sessionId])

  // Event handlers
  const handleSendText = async () => {
    if (!text.trim()) {
      console.log('💬 HandleSendText: Empty text, ignoring')
      return
    }
    
    console.log('💬 HandleSendText: Starting to send message:', {
      text,
      textLength: text.length,
      sessionId: session?.sessionId,
      speaking,
      timestamp: new Date().toISOString()
    })
    
    try {
      await sendText(text)
      console.log('💬 HandleSendText: Message sent successfully, clearing input')
      setText("") // Clear input after sending
    } catch (err) {
      console.error('💬 HandleSendText: Failed to send text:', {
        error: err instanceof Error ? err.message : String(err),
        text,
        sessionId: session?.sessionId,
        timestamp: new Date().toISOString(),
        stack: err instanceof Error ? err.stack : undefined
      })
    }
  }

  const handleCloseSession = async () => {
    try {
      await closeSession()
      // Navigation back to home is handled automatically in SessionContext
    } catch (err) {
      console.error("Failed to close session:", err)
    }
  }

  const handleClearAvatarError = () => {
    setAvatarError(null)
  }

  const handleDismissFreeLimit = () => {
    dismissFreeLimitModal()
    console.log('🚫 User dismissed free limit modal')
  }

  // Handle connection state updates from VideoStream component
  const handleConnectionChange = (connected: boolean) => {
    // We could update the SessionContext here if needed
    // For now, VideoStream manages its own connection state
  }

  // Show loading while auth or session is initializing
  if (authLoading || loading || !session) {

    const loadingMessage = authLoading ? 'Authenticating...' : 
                          loading ? 'Loading session...' : 
                          'Initializing...'
    
    const loaderVariant = authLoading ? 'pulse' :
                         loading ? 'orbit' : 
                         'dots'

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader 
          variant={loaderVariant}
          size="lg" 
          message={loadingMessage} 
          className="space-y-6"
        />
      </div>
    )
  }

  // Use the new freeLimitExceeded state
  const hasReachedFreeLimit = freeLimitExceeded

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="px-2 sm:px-4 lg:px-6 xl:px-8 py-6 lg:py-8 w-full">
        {/* Alerts Section */}
        <AlertsSection
          error={error}
          avatarError={avatarError}
          hasReachedFreeLimit={hasReachedFreeLimit}
          onClearError={clearError}
          onClearAvatarError={handleClearAvatarError}
          onLogin={login}
          onDismissFreeLimit={handleDismissFreeLimit}
        />

        {/* Chat Interface */}
        <ChatInterface
          session={session}
          avatars={avatars}
          text={text}
          setText={setText}
          speaking={speaking}
          loading={loading}
          wsConnected={wsConnected}
          hasReachedFreeLimit={hasReachedFreeLimit}
          user={user}
          anonymousSession={null}
          isAuthenticated={isAuthenticated}
          onSendText={handleSendText}
          onCloseSession={handleCloseSession}
          onLogin={login}
        />
      </main>
    </div>
  )
} 
