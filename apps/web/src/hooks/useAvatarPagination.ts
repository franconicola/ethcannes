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
    
    return `${apiUrl}/agents/public?${params.toString()}`
  }, [apiUrl, currentPage, initialLimit, filters.search, filters.gender, filters.style])

  const loadAvatars = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    const attemptedUrls: string[] = [];

    console.log('🔄 Loading avatars:', {
      page: currentPage,
      limit: initialLimit,
      filters: { search: filters.search, gender: filters.gender, style: filters.style }
    });

    const primaryApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const finalUrl = buildApiUrl().replace(apiUrl, primaryApiUrl);
    attemptedUrls.push(finalUrl);
    console.log(`🔄 Trying API at: ${finalUrl}`);
    
    try {
      const response = await fetch(finalUrl, {
        signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API ${primaryApiUrl} returned ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.agents)) {
        setAvatars(data.agents);
        setPagination(data.pagination || { page: 1, totalPages: 1, totalItems: data.agents.length });
        setFilterOptions(data.filterOptions || { genders: [], styles: [] });
        console.log(`✅ Loaded ${data.agents.length} avatars`);
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('❌ Failed to load avatars:', err);
        setError(err.message);
        setAvatars([]);
        setPagination(null);
        setFilterOptions({ genders: [], styles: [] });
      }
    } finally {
      setLoading(false);
    }
  }, [buildApiUrl, apiUrl, currentPage, initialLimit, filters.search, filters.gender, filters.style]);

  useEffect(() => {
    const controller = new AbortController();
    loadAvatars(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadAvatars]);

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
    setCurrentPage(1); // Reset page to 1 on filter change
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reload = useCallback(() => {
    const controller = new AbortController();
    loadAvatars(controller.signal);
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