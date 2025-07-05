import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import Image from 'next/image'
import { useState } from 'react'
import type { VideoSectionProps } from './types'

export function VideoSection({
  session,
  avatars,
  wsConnected,
  speaking,
  loading,
  onCloseSession
}: VideoSectionProps) {
  const [imageError, setImageError] = useState(false)
  const [gifError, setGifError] = useState(false)
  
  const currentAvatar = avatars.find(a => a.id === session.agentId)

  const handleImageError = () => setImageError(true)
  const handleGifError = () => setGifError(true)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap">
          <CardTitle className="text-lg lg:text-xl">
            Chat with {currentAvatar?.name || 'AI Agent'}
          </CardTitle>
          <Button variant="outline" onClick={onCloseSession} disabled={loading}>
            End Session
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)] p-4">
        <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center relative overflow-hidden min-h-[400px]">
          
          {/* Avatar Display */}
          {currentAvatar && (currentAvatar.image || currentAvatar.gifUrl) && (
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Static Image - shown when not speaking */}
              {currentAvatar.image && !imageError && !speaking && (
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-2xl">
                  <Image
                    src={currentAvatar.image}
                    alt={currentAvatar.name}
                    width={320}
                    height={320}
                    className="object-cover w-full h-full transition-all duration-300"
                    onError={handleImageError}
                    priority
                  />
                </div>
              )}
              
              {/* Animated GIF - shown when speaking */}
              {currentAvatar.gifUrl && !gifError && speaking && (
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-2xl">
                  <Image
                    src={currentAvatar.gifUrl}
                    alt={`${currentAvatar.name} speaking`}
                    width={320}
                    height={320}
                    className="object-cover w-full h-full transition-all duration-300"
                    onError={handleGifError}
                    priority
                    unoptimized // Important for GIFs to maintain animation
                  />
                </div>
              )}
              
              {/* Overlay for speaking state */}
              {speaking && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-center">
                      <Loader 
                        variant="wave" 
                        size="sm" 
                        message="AI is speaking..." 
                        className="text-white [&>p]:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Fallback when no avatar images or errors */}
          {(!currentAvatar || (!currentAvatar.image && !currentAvatar.gifUrl) || (imageError && gifError)) && (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🤖</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {currentAvatar?.name || 'AI Agent'}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {currentAvatar?.description || 'AI-powered assistant ready to help with your questions and tasks.'}
                </p>
              </div>
            </div>
          )}
          
          {/* Status badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant={wsConnected ? "default" : "secondary"}>
              {wsConnected ? "Connected" : "Connecting..."}
            </Badge>
            {speaking && (
              <Badge variant="destructive" className="animate-pulse">
                🎙️ Speaking
              </Badge>
            )}
            {loading && (
              <Badge variant="outline">
                Processing...
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 