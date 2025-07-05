export interface Avatar {
  id: string
  name: string
  description: string
  previewUrl?: string
  style?: string
  personality?: string
}

export interface PaginationMeta {
  page: number
  totalPages: number
  totalItems: number
  limit?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
  nextPage?: number | null
  prevPage?: number | null
}

export interface AvatarCardProps {
  avatar: Avatar
  loading: boolean
  isSelected: boolean
  onStartChat: (id: string) => void
  hasReachedFreeLimit: boolean
}

export interface AvatarGridProps {
  avatars: Avatar[]
  loading: boolean
  hasReachedFreeLimit: boolean
  sessionLoading: boolean
  selectedAvatarId: string | null
  onStartChat: (id:string) => void
  pagination: PaginationMeta | null
  onPageChange: (page: number) => void
}

export interface HeroSectionProps {
  isAuthenticated: boolean
  user: any
  anonymousSession: any
}

export interface AlertsSectionProps {
  error: string | null
  avatarError: string | null
  hasReachedFreeLimit: boolean
  onClearError: () => void
  onClearAvatarError: () => void
  onLogin: () => void
  onDismissFreeLimit: () => void
} 