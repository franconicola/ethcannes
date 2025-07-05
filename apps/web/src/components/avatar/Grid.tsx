import { Button } from '@/components/ui/button'
import { AvatarCard } from './Card'
import { AvatarLoadingSkeleton } from './LoadingSkeleton'
import { AvatarPagination } from './Pagination'
import type { AvatarGridProps } from './types'

export function AvatarGrid({ 
  avatars, 
  loading, 
  hasReachedFreeLimit, 
  sessionLoading,
  selectedAvatarId,
  onStartChat,
  pagination,
  onPageChange
}: AvatarGridProps) {
  // Show loading skeleton
  if (loading) {
    return <AvatarLoadingSkeleton />
  }

  // Show empty state
  if (avatars.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No avatars found</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  // Show avatar grid with pagination
  return (
    <div>
      {/* Avatar Grid */}
      <div className="px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8 max-w-none mx-auto">
          {avatars.map((avatar) => (
            <AvatarCard
              key={avatar.id}
              avatar={avatar}
              loading={loading}
              hasReachedFreeLimit={hasReachedFreeLimit}
              sessionLoading={sessionLoading}
              selectedAvatarId={selectedAvatarId}
              onStartChat={onStartChat}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <AvatarPagination
          pagination={pagination}
          onPageChange={onPageChange}
          disabled={loading || sessionLoading}
        />
      )}
    </div>
  )
} 