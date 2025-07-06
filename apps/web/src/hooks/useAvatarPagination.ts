import type { Avatar, PaginationMeta } from '@/components/avatar/types';
import { useCallback, useEffect, useRef, useState } from 'react';

// API Configuration - use environment variable or fallback to defaults
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  ((typeof window !== 'undefined' && window.location.origin.includes('localhost')) 
    ? "http://localhost:3000/api" 
    : "/api");

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔧 DEBUG Avatar - Environment variable:', process.env.NEXT_PUBLIC_API_URL);
  console.log('🔧 DEBUG Avatar - Final API baseUrl:', API_BASE_URL);
  console.log('🔧 DEBUG Avatar - Window origin:', window.location.origin);
}

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

  // Initialize refs with stable values - no conditional updates
  const limitRef = useRef(initialLimit)
  const hasInitialized = useRef(false)
  
  // Only set the ref once on mount
  if (!hasInitialized.current) {
    limitRef.current = initialLimit
    hasInitialized.current = true
  }

  // State
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [triggerReload, setTriggerReload] = useState(0)

  // Stable load function
  const loadAvatars = useCallback(async (page: number, limit: number, signal: AbortSignal) => {
    console.log('🔄 Loading avatars:', { page, limit })

    // Build API URL - use environment variable
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', limit.toString())
      
    const finalUrl = `${API_BASE_URL}/agents/public?${params.toString()}`
    console.log(`🔄 Trying API at: ${finalUrl}`)

      try {
      // Use minimal fetch options that work (no Content-Type header for GET requests)
        const response = await fetch(finalUrl, {
        method: 'GET',
        signal,
        // Only include Accept header, not Content-Type (which causes redirects)
          headers: {
          'Accept': 'application/json'
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
        console.error(`❌ API returned ${response.status}: ${errorText}`)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success && data.data && Array.isArray(data.data.agents)) {
          setAvatars(data.data.agents)
        setPagination(data.data.pagination || { 
          page: page, 
          totalPages: Math.ceil(data.data.agents.length / limit), 
          totalItems: data.data.agents.length 
        })
          console.log(`✅ Loaded ${data.data.agents.length} avatars`)
        setError(null) // Clear any previous errors
        } else {
          throw new Error(data.error || 'Invalid response format')
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('❌ Failed to load avatars:', err)
        throw err
      }
    }
  }, [])

  // Single effect with proper cleanup and debouncing
  useEffect(() => {
    const controller = new AbortController()
    let timeoutId: NodeJS.Timeout

    const performLoad = async () => {
      setLoading(true)
      setError(null)
      
      try {
        await loadAvatars(currentPage, limitRef.current, controller.signal)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setAvatars([])
          setPagination(null)
        }
      } finally {
        if (!controller.signal.aborted) {
        setLoading(false)
        }
      }
    }

    // Add a small delay to prevent rapid successive calls
    timeoutId = setTimeout(performLoad, 100)

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [currentPage, triggerReload, loadAvatars])

  // Actions
  const setPage = useCallback((page: number) => {
    console.log('📄 Setting page to:', page)
    setCurrentPage(page)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reload = useCallback(() => {
    console.log('🔄 Reloading avatars...')
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