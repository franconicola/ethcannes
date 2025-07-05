'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import Image from 'next/image'
import { useState } from 'react'
import type { AvatarCardProps } from './types'
import { VerificationBadge } from './VerificationBadge'

export function AvatarCard({ 
  avatar, 
  loading, 
  hasReachedFreeLimit, 
  sessionLoading,
  selectedAvatarId,
  onStartChat 
}: AvatarCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [gifLoading, setGifLoading] = useState(true)
  const [gifError, setGifError] = useState(false)
  const isDisabled = loading || hasReachedFreeLimit
  const isCurrentlyLoading = sessionLoading && selectedAvatarId === avatar.id

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  const handleGifLoad = () => {
    setGifLoading(false)
    setGifError(false)
  }

  const handleGifError = () => {
    setGifLoading(false)
    setGifError(true)
  }

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
        {/* Image loading state */}
        {imageLoading && avatar.image && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <Loader variant="dots" size="sm" />
          </div>
        )}
        
        {/* Static placeholder image - shown by default */}
        {avatar.image && !imageError && (
          <Image 
            src={avatar.image} 
            alt={avatar.name}
            fill
            className="object-cover transition-all duration-300 group-hover:opacity-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={false}
          />
        )}
        
        {/* Animated GIF - only shown on hover */}
        {avatar.gifUrl && !gifError && (
          <Image
            src={avatar.gifUrl}
            alt={`${avatar.name} animated`}
            fill
            className="object-cover transition-all duration-300 opacity-0 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={handleGifLoad}
            onError={handleGifError}
            priority={false}
            unoptimized // Important for GIFs to maintain animation
          />
        )}
        
        {/* Fallback content - shown when no image/gif or both failed to load */}
        {(!avatar.image || imageError) && (!avatar.gifUrl || gifError) && (
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

        {/* Loading/Error indicators */}
        {(imageError || gifError) && (
          <div className="absolute top-2 right-2 text-xs text-white bg-red-500/80 px-2 py-1 rounded">
            {imageError && gifError ? 'Media failed to load' : 'Some media failed'}
          </div>
        )}

        {/* Hover hint */}
        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          🎬 Hover for animation
        </div>
      </div>
      
      <CardContent className="p-3 lg:p-4">
        <CardTitle className="text-sm mb-2 flex items-center gap-2 justify-between">
          <span>{avatar.name}</span>
          <div className="flex items-center gap-1">
            {isCurrentlyLoading && (
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            )}
            <VerificationBadge avatar={avatar} />
          </div>
        </CardTitle>
        
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {avatar.description || 'AI-powered avatar ready to chat'}
        </p>
        
        {/* Educational Level and Subjects */}
        {(avatar.educationalLevel || avatar.subjects) && (
          <div className="mb-3 space-y-1">
            {avatar.educationalLevel && (
              <Badge variant="outline" className="text-xs mr-1">
                {avatar.educationalLevel}
              </Badge>
            )}
            {avatar.subjects && avatar.subjects.slice(0, 2).map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs mr-1">
                {subject}
              </Badge>
            ))}
            {avatar.subjects && avatar.subjects.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{avatar.subjects.length - 2} more
              </Badge>
            )}
          </div>
        )}
        
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