import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AvatarLoadingSkeletonProps } from './types'

export function AvatarLoadingSkeleton({ count = 8 }: AvatarLoadingSkeletonProps) {
  return (
    <div className="px-4 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 lg:gap-8 max-w-none mx-auto">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-40 sm:h-48 lg:h-52 xl:h-48 w-full" />
            <CardContent className="p-3 lg:p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 