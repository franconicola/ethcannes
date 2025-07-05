'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPreviewProps {
  src: string
  className: string
}

export function VideoPreview({ src, className }: VideoPreviewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || hasError) return

    const playVideo = async () => {
      if (isHovered && canPlay) {
        try {
          if (video.paused) {
            video.currentTime = 0
            await video.play()
          }
        } catch (error) {
          // Silently handle play errors including AbortError
        }
      }
    }

    const pauseVideo = () => {
      if (!isHovered) {
        try {
          if (!video.paused) {
            video.pause()
          }
        } catch (error) {
          // Silently handle pause errors
        }
      }
    }

    if (isHovered && canPlay) {
      const timeoutId = setTimeout(playVideo, 150) // Small delay to prevent conflicts
      return () => clearTimeout(timeoutId)
    } else {
      pauseVideo()
    }
  }, [isHovered, canPlay, hasError])

  const handleMouseEnter = () => {
    if (!hasError) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleCanPlay = () => {
    setCanPlay(true)
  }

  const handleError = () => {
    setHasError(true)
    setCanPlay(false)
  }

  // Don't render if there's an error
  if (hasError) {
    return null
  }

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onCanPlay={handleCanPlay}
      onError={handleError}
    />
  )
} 