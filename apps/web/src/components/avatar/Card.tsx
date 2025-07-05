'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import Image from 'next/image'
import { VideoPreview } from '../video/Preview'
import type { AvatarCardProps } from './types'

export function AvatarCard({ 
  avatar, 
  loading, 
  hasReachedFreeLimit, 
  sessionLoading,
  selectedAvatarId,
  onStartChat 
}: AvatarCardProps) {
  const isDisabled = loading || hasReachedFreeLimit
  const isCurrentlyLoading = sessionLoading && selectedAvatarId === avatar.id

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group overflow-hidden relative ${
        isDisabled || isCurrentlyLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={() => !isDisabled && !isCurrentlyLoading && onStartChat(avatar.id)}
    >
      {/* Loading overlay for specific avatar */}
      {isCurrentlyLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
          <Loader 
            variant="dots" 
            size="md" 
            message="Starting session..." 
            className="text-white [&>p]:text-white"
          />
        </div>
      )}

      <div className="relative w-full h-72 sm:h-80 lg:h-[28rem] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center overflow-hidden">
        {/* Static image - shown by default */}
        {avatar.image && (
          <Image 
            src={avatar.image} 
            alt={avatar.name}
            fill
            className="object-cover transition-all duration-300 group-hover:opacity-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Video preview - only shown on hover */}
        {avatar.preview_video && (
          <VideoPreview
            src={avatar.preview_video}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300 opacity-0 group-hover:opacity-100"
          />
        )}
        
        {/* Fallback content */}
        {!avatar.image && !avatar.preview_video && (
          <div className="flex items-center justify-center text-primary-foreground">
            {/* @ts-ignore */}
            <Avatar className="w-16 h-16 lg:w-20 lg:h-20">
              {/* @ts-ignore */}
              <AvatarFallback className="text-xl lg:text-2xl font-bold bg-white/20 text-primary-foreground">
                {avatar.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      
      <CardContent className="p-3 lg:p-4">
        <CardTitle className="text-sm mb-2 flex items-center gap-2">
          {avatar.name}
          {isCurrentlyLoading && (
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          )}
        </CardTitle>
        {/* <CardDescription className="text-xs line-clamp-2 mb-3">
          {avatar.description}
        </CardDescription> */}
        {loading && (
          <Badge variant="secondary" className="text-xs">
            Starting...
          </Badge>
        )}
        {hasReachedFreeLimit && (
          <Badge variant="outline" className="text-xs">
            Login required
          </Badge>
        )}
      </CardContent>
    </Card>
  )
} 