import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
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
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold">No avatars found</h3>
          <p className="text-muted-foreground">
            We couldn't find any avatars matching your criteria. This might be due to:
          </p>
          <ul className="text-sm text-muted-foreground text-left space-y-1">
            <li>• API server not running</li>
            <li>• Network connectivity issues</li>
            <li>• Current filters are too restrictive</li>
          </ul>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/settings'}>
              Check Settings
            </Button>
          </div>
        </div>
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