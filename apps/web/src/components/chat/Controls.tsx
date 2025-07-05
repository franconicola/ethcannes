'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Lock, Send } from 'lucide-react'
import type { ChatControlsProps } from './types'

export function ChatControls({ 
  text, 
  setText, 
  speaking, 
  loading, 
  hasReachedFreeLimit, 
  onSendText, 
  onLogin 
}: ChatControlsProps) {
  const handleSendClick = () => {
    console.log('💬 ChatControls: Send button clicked', {
      textLength: text.length,
      speaking,
      loading,
      hasReachedFreeLimit
    })
    onSendText()
  }

  if (hasReachedFreeLimit) {
    return (
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg text-center">
        <div className="space-y-2">
          <span className="text-2xl">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
          </span>
          <h3 className="font-medium text-sm">Free Limit Reached</h3>
          <p className="text-xs text-muted-foreground">
            You&apos;ve reached your free message limit. Sign in to continue chatting with avatars.
          </p>
        </div>
        <Button onClick={onLogin} size="sm" className="w-full">
          Sign In to Continue
        </Button>
      </div>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Send Message</CardTitle>
        <CardDescription>
          Type your message and the avatar will speak it aloud
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-full space-y-6">
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            {/* @ts-ignore */}
            <Label htmlFor="message-input">Your Message</Label>
            <Textarea
              id="message-input"
              placeholder="Enter text for avatar to speak..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={speaking || loading}
              className="min-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                  e.preventDefault()
                  if (text.trim() && !speaking && !loading) {
                    handleSendClick()
                  }
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
          
          <Button
            onClick={handleSendClick}
            disabled={!text.trim() || speaking || loading}
            className="w-full"
            size="lg"
          >
            <Send className="mr-2 h-4 w-4" />
                         {speaking ? "Avatar Speaking..." : 
              loading ? (
                <div className="flex items-center gap-2">
                  <Loader variant="dots" size="sm" message="" />
                  <span>Sending...</span>
                </div>
              ) : 
              "Send Message"}
          </Button>
          
          {speaking && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-3">
                <div className="text-center">
                  <Loader 
                    variant="wave" 
                    size="md" 
                    message="Avatar is speaking..." 
                    className="text-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 