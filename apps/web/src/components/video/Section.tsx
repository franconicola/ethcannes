import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VideoStream } from '@/components/VideoStream'
import type { VideoSectionProps } from './types'

export function VideoSection({
  session,
  avatars,
  wsConnected,
  speaking,
  loading,
  onCloseSession
}: VideoSectionProps) {
  const currentAvatar = avatars.find(a => a.id === session.avatarId)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap">
          <CardTitle className="text-lg lg:text-xl">
            Chat with {currentAvatar?.name}
          </CardTitle>
          <Button variant="outline" onClick={onCloseSession} disabled={loading}>
            End Session
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)] p-4">
        <VideoStream 
          session={session}
          className="w-full h-full rounded-lg"
        />
      </CardContent>
    </Card>
  )
} 