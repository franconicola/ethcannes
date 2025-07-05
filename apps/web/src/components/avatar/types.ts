export interface Avatar {
  id: string
  name: string
  description: string
  image?: string
  preview_video?: string
  gender?: string
  style?: string
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
}

export interface FilterOptions {
  genders: string[]
  styles: string[]
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
  sessionLoading?: boolean
  selectedAvatarId?: string | null
  onStartChat: (avatarId: string) => void
}

export interface AvatarGridProps {
  avatars: Avatar[]
  loading: boolean
  hasReachedFreeLimit: boolean
  sessionLoading?: boolean
  selectedAvatarId?: string | null
  onStartChat: (avatarId: string) => void
  pagination?: PaginationMeta
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