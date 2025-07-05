import type { Avatar, PaginationMeta } from '@/components/avatar/types'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAvatarPaginationOptions {
  initialPage?: number
  initialLimit?: number
  apiUrl?: string
}

interface UseAvatarPaginationReturn {
  // Data
  avatars: Avatar[]
  pagination: PaginationMeta | null

  // State
  loading: boolean
  error: string | null

  // Actions
  setPage: (page: number) => void
  clearError: () => void
  reload: () => void
}

export function useAvatarPagination(options: UseAvatarPaginationOptions = {}): UseAvatarPaginationReturn {
  const { initialPage = 1, initialLimit = 12 } = options

  // Use ref to stabilize initialLimit and prevent infinite loops
  const limitRef = useRef(initialLimit)
  
  // Only update ref if the value actually changes
  if (limitRef.current !== initialLimit) {
    limitRef.current = initialLimit
  }

  // State
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [triggerReload, setTriggerReload] = useState(0)

  // Single effect to handle all loading - only depend on stable values
  useEffect(() => {
    const controller = new AbortController()
    
    const loadAvatars = async () => {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Loading avatars:', { page: currentPage, limit: limitRef.current })

      // Build API URL directly to avoid circular dependencies
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', limitRef.current.toString())
      
      const primaryApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
      const finalUrl = `${primaryApiUrl}/agents/public?${params.toString()}`
      console.log(`🔄 Trying API at: ${finalUrl}`)

      try {
        const response = await fetch(finalUrl, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ API ${primaryApiUrl} returned ${response.status}: ${errorText}`)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success && data.data && Array.isArray(data.data.agents)) {
          setAvatars(data.data.agents)
          setPagination(data.data.pagination || { page: 1, totalPages: 1, totalItems: data.data.agents.length })
          console.log(`✅ Loaded ${data.data.agents.length} avatars`)
        } else {
          throw new Error(data.error || 'Invalid response format')
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('❌ Failed to load avatars:', err)
          setError(err.message)
          setAvatars([])
          setPagination(null)
        }
      } finally {
        setLoading(false)
      }
    }

    loadAvatars()

    return () => {
      controller.abort()
    }
  }, [currentPage, triggerReload]) // Only depend on currentPage and triggerReload

  // Actions
  const setPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reload = useCallback(() => {
    setTriggerReload(prev => prev + 1)
  }, [])

  return {
    // Data
    avatars,
    pagination,

    // State
    loading,
    error,

    // Actions
    setPage,
    clearError,
    reload,
  }
} 