import type { Avatar, AvatarFilters, FilterOptions, PaginationMeta } from '@/components/avatar/types'
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
  filters: AvatarFilters
  filterOptions: FilterOptions
  
  // State
  loading: boolean
  error: string | null
  
  // Actions
  setPage: (page: number) => void
  setFilters: (filters: Partial<AvatarFilters>) => void
  clearError: () => void
  reload: () => void
}

export function useAvatarPagination(options: UseAvatarPaginationOptions = {}): UseAvatarPaginationReturn {
  const {
    initialPage = 1,
    initialLimit = 12,
    apiUrl = '/api'
  } = options

  // State
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [filters, setFiltersState] = useState<AvatarFilters>({
    search: null,
    gender: null,
    style: null,
  })
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    genders: [],
    styles: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Build API URL with parameters
  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams()
    params.set('page', currentPage.toString())
    params.set('limit', initialLimit.toString())
    
    if (filters.search) {
      params.set('search', filters.search)
    }
    if (filters.gender) {
      params.set('gender', filters.gender)
    }
    if (filters.style) {
      params.set('style', filters.style)
    }
    
    return `${apiUrl}/avatars/public?${params.toString()}`
  }, [apiUrl, currentPage, initialLimit, filters.search, filters.gender, filters.style])

  // Load avatars from API
  const loadAvatars = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Loading avatars:', {
        page: currentPage,
        limit: initialLimit,
        filters: { search: filters.search, gender: filters.gender, style: filters.style }
      })

      const url = buildApiUrl()
      
      // Enhanced API fallback logic with better error handling
      const primaryApiUrl = process.env.NEXT_PUBLIC_API_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://sparkmind-api.workers.dev/api'
          : 'http://localhost:8787/api')
      
      const fallbackUrls = process.env.NODE_ENV === 'development' ? [
        "http://localhost:8787/api",
        "http://localhost:3000/api"
      ] : ["https://sparkmind-api.workers.dev/api"]
      
      const apiUrls = [primaryApiUrl, ...fallbackUrls]
      
      let response: Response | undefined
      let lastError: Error | undefined
      let attemptedUrls: string[] = []
      
      for (const baseUrl of apiUrls) {
        try {
          const fullUrl = url.replace(apiUrl, baseUrl)
          attemptedUrls.push(fullUrl)
          console.log(`🔄 Trying API at: ${fullUrl}`)
          
          response = await fetch(fullUrl, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(15000)
          })
          
          if (response.ok) {
            console.log(`✅ API responded from: ${baseUrl}`)
            break
          } else {
            console.log(`❌ API ${baseUrl} returned ${response.status}: ${response.statusText}`)
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
        } catch (err) {
          console.log(`❌ Failed to connect to: ${baseUrl}`, err)
          lastError = err as Error
        }
      }

      if (!response || !response.ok) {
        const errorMessage = lastError?.message || 'Unable to connect to avatar service'
        console.error('❌ All API attempts failed:', attemptedUrls)
        throw new Error(`${errorMessage}. Tried: ${attemptedUrls.join(', ')}`)
      }

      const data: any = await response.json()
      
      if (data.success && Array.isArray(data.avatars)) {
        setAvatars(data.avatars)
        setPagination(data.pagination || { page: 1, totalPages: 1, totalItems: data.avatars.length })
        setFilterOptions(data.filterOptions || { genders: [], styles: [] })
        
        console.log(`✅ Loaded ${data.avatars.length} avatars (page ${data.pagination?.page || 1}/${data.pagination?.totalPages || 1})`)
        
        // If no avatars loaded, show a helpful message
        if (data.avatars.length === 0) {
          console.log('ℹ️ No avatars found with current filters')
        }
      } else {
        console.error('❌ Invalid response format:', data)
        throw new Error(data.error || data.message || 'Invalid response format from avatar service')
      }
      
    } catch (err) {
      console.error('❌ Failed to load avatars:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load avatars'
      setError(errorMessage)
      setAvatars([])
      setPagination(null)
      setFilterOptions({ genders: [], styles: [] })
    } finally {
      setLoading(false)
    }
  }, [buildApiUrl, currentPage, initialLimit, filters.search, filters.gender, filters.style, apiUrl])

  // Load avatars when dependencies change
  useEffect(() => {
    loadAvatars()
  }, [loadAvatars])

  const isInitialLoad = useRef(true)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }
    
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [filters.search, filters.gender, filters.style, currentPage])

  // Actions
  const setPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const setFilters = useCallback((newFilters: Partial<AvatarFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reload = useCallback(() => {
    loadAvatars()
  }, [loadAvatars])

  return {
    // Data
    avatars,
    pagination,
    filters,
    filterOptions,
    
    // State
    loading,
    error,
    
    // Actions
    setPage,
    setFilters,
    clearError,
    reload,
  }
} 