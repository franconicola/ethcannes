import type { Avatar, PaginationMeta } from '@/components/avatar/types'
import { useCallback, useEffect, useState } from 'react'

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

  // State
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)

  const loadAvatars = useCallback(
    async (signal: AbortSignal, page: number, limit: number) => {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Loading avatars:', { page, limit })

      // Build API URL directly to avoid circular dependencies
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', limit.toString())
      
      const primaryApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
      const finalUrl = `${primaryApiUrl}/agents/public?${params.toString()}`
      console.log(`🔄 Trying API at: ${finalUrl}`)

      try {
        const response = await fetch(finalUrl, {
          signal,
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
    },
    [], // No dependencies to prevent infinite loops
  )

  useEffect(() => {
    const controller = new AbortController()
    loadAvatars(controller.signal, currentPage, initialLimit)

    return () => {
      controller.abort()
    }
  }, [loadAvatars, currentPage, initialLimit])

  // Actions
  const setPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reload = useCallback(() => {
    const controller = new AbortController()
    loadAvatars(controller.signal, currentPage, initialLimit)
  }, [loadAvatars, currentPage, initialLimit])

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