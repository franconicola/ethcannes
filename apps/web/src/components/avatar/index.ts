// Avatar Components
export { AlertsSection } from './AlertsSection'
export { AvatarCard } from './Card'
export { AvatarFilters } from './Filters'
export { AvatarGrid } from './Grid'
export { HeroSection } from './HeroSection'
export { AvatarLoadingSkeleton } from './LoadingSkeleton'
export { AvatarPagination } from './Pagination'

// Types
export type {
  Avatar,
  AvatarCardProps, AvatarFiltersProps, AvatarFilters as AvatarFiltersType, AvatarGridProps,
  AvatarLoadingSkeletonProps, AvatarResponse, FilterOptions, PaginationMeta, PaginationProps
} from './types'

// Legacy Component exports (keep for backwards compatibility)
export { AlertsSection as AvatarAlertsSection } from './AlertsSection'
export { HeroSection as AvatarHeroSection } from './HeroSection'

// Type exports
export type {
  ChatControlsProps, ChatInterfaceProps
} from '../chat/types'
export type { VideoSectionProps } from '../video/types'

