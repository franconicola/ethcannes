'use client'

import { AlertsSection, AvatarFilters, AvatarGrid, HeroSection } from '@/components/avatar'
import { Loader } from '@/components/ui/loader'
import { useAuth } from '@/contexts/AuthContext'
import { useSession } from '@/contexts/SessionContext'
import { useAvatarPagination } from '@/hooks/useAvatarPagination'
import { useCallback } from 'react'

export default function HomePage() {
  // Auth context
  const { isAuthenticated, user, login, isLoading: authLoading } = useAuth()

  // Session context
  const {
    loading: sessionLoading,
    navigating,
    error,
    freeLimitExceeded,
    clearError,
    dismissFreeLimitModal,
    createSession,
  } = useSession()

  // Avatar pagination hook
  const {
    avatars,
    pagination,
    filters,
    filterOptions,
    loading: loadingAvatars,
    error: avatarError,
    setPage,
    setFilters,
    clearError: clearAvatarError,
    reload: reloadAvatars,
  } = useAvatarPagination({
    initialLimit: 12, // Show 12 avatars per page
  })

  // Event handlers
  const handleStartChat = async (avatarId: string) => {
    try {
      console.log('🚀 Starting chat with avatar:', avatarId)
      await createSession(avatarId)
      // Navigation to session page is handled automatically in SessionContext
    } catch (err) {
      console.error("❌ Failed to create session:", err)
    }
  }

  const handlePageChange = (page: number) => {
    console.log('📄 Changing to page:', page)
    setPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFiltersChange = useCallback((newFilters: any) => {
    console.log('🔍 Filters changed:', newFilters)
    setFilters(newFilters)
  }, [setFilters])

  const handleClearAvatarError = () => {
    clearAvatarError()
  }

  const handleDismissFreeLimit = () => {
    dismissFreeLimitModal()
    console.log('🚫 User dismissed free limit modal')
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader 
          variant="orbit" 
          size="lg" 
          message="Initializing avatars..." 
          className="space-y-6"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Loading Overlay */}
      {navigating && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center text-white space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">Starting Avatar Session</p>
              <p className="text-sm text-white/80">Please wait while we initialize your conversation...</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full">
        {/* Alerts Section */}
        <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-6 lg:py-8">
          <AlertsSection
            error={error}
            avatarError={avatarError}
            hasReachedFreeLimit={freeLimitExceeded}
            onClearError={clearError}
            onClearAvatarError={handleClearAvatarError}
            onLogin={login}
            onDismissFreeLimit={handleDismissFreeLimit}
          />

          {/* Hero Section */}
          <HeroSection
            isAuthenticated={isAuthenticated}
            user={user}
            anonymousSession={null}
          />
        </div>

        {/* Filters */}
        <AvatarFilters
          filters={filters}
          filterOptions={filterOptions}
          onFiltersChange={handleFiltersChange}
          disabled={loadingAvatars || sessionLoading}
        />

        {/* Avatar Grid with Pagination */}
        <AvatarGrid
          avatars={avatars}
          loading={loadingAvatars}
          hasReachedFreeLimit={freeLimitExceeded}
          sessionLoading={sessionLoading}
          selectedAvatarId={null} // Could track this if needed
          onStartChat={handleStartChat}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  )
} 