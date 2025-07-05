import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { VideoSectionProps } from './types'

export function VideoSection({
  session,
  avatars,
  wsConnected,
  speaking,
  loading,
  onCloseSession
}: VideoSectionProps) {
  const currentAvatar = avatars.find(a => a.id === session.agentId)

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
        <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">🤖</div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {currentAvatar?.name || 'AI Agent'}
              </h3>
              <p className="text-muted-foreground max-w-md">
                AI-powered assistant ready to help with your questions and tasks.
              </p>
              <div className="flex gap-2 justify-center mt-4">
                <Badge variant={wsConnected ? "default" : "secondary"}>
                  {wsConnected ? "Connected" : "Connecting..."}
                </Badge>
                {speaking && (
                  <Badge variant="outline">
                    Speaking
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 