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
      
      // API fallback logic (similar to your existing code)
      const primaryApiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://sparkmind-api.workers.dev'
        : 'http://localhost:8787'
      
      const fallbackUrls = process.env.NODE_ENV === 'development' ? [
        "http://localhost:8787",
        "http://localhost:3000"
      ] : []
      
      const apiUrls = [primaryApiUrl, ...fallbackUrls]
      
      let response: Response | undefined
      let lastError: Error | undefined
      
      for (const baseUrl of apiUrls) {
        try {
          const fullUrl = url.replace(apiUrl, baseUrl + '/api')
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
          }
        } catch (err) {
          console.log(`❌ Failed to connect to: ${baseUrl}`, err)
          lastError = err as Error
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error('Unable to connect to avatar service')
      }

      const data: any = await response.json() // Use any to handle both success and error responses
      
      if (data.success && Array.isArray(data.avatars)) {
        setAvatars(data.avatars)
        setPagination(data.pagination)
        setFilterOptions(data.filterOptions)
        
        console.log(`✅ Loaded ${data.avatars.length} avatars (page ${data.pagination.page}/${data.pagination.totalPages})`)
      } else {
        throw new Error(data.error || data.message || 'Failed to load avatars')
      }
      
    } catch (err) {
      console.error('❌ Failed to load avatars:', err)
      setError(err instanceof Error ? err.message : 'Failed to load avatars')
      setAvatars([])
      setPagination(null)
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