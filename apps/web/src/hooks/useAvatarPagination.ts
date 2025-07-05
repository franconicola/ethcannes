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
  const { initialPage = 1, initialLimit = 12, apiUrl = '/api' } = options

  // State
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Build API URL with parameters
  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams()
    params.set('page', currentPage.toString())
    params.set('limit', initialLimit.toString())
    return `${apiUrl}/agents/public?${params.toString()}`
  }, [apiUrl, currentPage, initialLimit])

  const loadAvatars = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Loading avatars:', {
        page: currentPage,
        limit: initialLimit,
      })

      const primaryApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
      const finalUrl = buildApiUrl().replace(apiUrl, primaryApiUrl)
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
    [currentPage, initialLimit, apiUrl],
  )

  useEffect(() => {
    const controller = new AbortController()
    loadAvatars(controller.signal)

    return () => {
      controller.abort()
    }
  }, [loadAvatars])

  // Actions
  const setPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reload = useCallback(() => {
    const controller = new AbortController()
    loadAvatars(controller.signal)
  }, [loadAvatars])

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