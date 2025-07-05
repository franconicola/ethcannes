export interface Avatar {
  id: string
  name: string
  description: string
  image?: string
  preview_video?: string
  gender?: string
  style?: string
  // 0G Storage integration for AI tutors
  promptHash?: string  // 0G Storage root hash for system prompt
  promptVersion?: string  // Version of the stored prompt
  educationalLevel?: 'elementary' | 'middle' | 'high' | 'adult'
  subjects?: string[]
  safetyRating?: 'safe' | 'reviewed' | 'pending'
  verifiedAt?: string  // Last verification timestamp
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number | null
  prevPage: number | null
}

export interface AvatarFilters {
  search: string | null
  gender: string | null
  style: string | null
  educationalLevel?: string | null
  safetyRating?: string | null
}

export interface FilterOptions {
  genders: string[]
  styles: string[]
  educationalLevels?: string[]
  safetyRatings?: string[]
}

export interface AvatarResponse {
  success: boolean
  avatars: Avatar[]
  pagination: PaginationMeta
  filters: AvatarFilters
  filterOptions: FilterOptions
  source: string
}

export interface AvatarCardProps {
  avatar: Avatar
  loading: boolean
  hasReachedFreeLimit: boolean
  sessionLoading: boolean
  selectedAvatarId: string | null
  onStartChat: (avatarId: string) => void
}

export interface AvatarGridProps {
  avatars: Avatar[]
  loading: boolean
  hasReachedFreeLimit: boolean
  sessionLoading: boolean
  selectedAvatarId: string | null
  onStartChat: (avatarId: string) => void
  pagination: PaginationMeta | null
  onPageChange: (page: number) => void
}

export interface AvatarLoadingSkeletonProps {
  count?: number
}

export interface PaginationProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  disabled?: boolean
}

export interface AvatarFiltersProps {
  filters: AvatarFilters
  filterOptions: FilterOptions
  onFiltersChange: (filters: Partial<AvatarFilters>) => void
  disabled?: boolean
}

export interface HeroSectionProps {
  isAuthenticated: boolean
  user: any | null
  anonymousSession: any | null
} 