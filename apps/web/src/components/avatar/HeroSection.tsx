import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { AnonymousSession, User } from '../chat/types'

interface HeroSectionProps {
  isAuthenticated: boolean
  user: User | null
  anonymousSession?: AnonymousSession | null
}

export function HeroSection({ isAuthenticated, user, anonymousSession }: HeroSectionProps) {
  return (
    <div className="text-center">
      {/* Hero Section */}
      <Card className="mb-6 lg:mb-8 mx-4 lg:mx-8 border-none shadow-none bg-transparent">
        <CardHeader className="space-y-4 py-6">
          <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Choose Your AI Tutor
          </CardTitle>
          <CardDescription className="text-lg md:text-xl max-w-4xl mx-auto text-muted-foreground">
            {isAuthenticated 
                            ? "Select an AI tutor to start your conversation."
              : anonymousSession
              ? `Try our AI tutors for free! You have ${anonymousSession.freeMessagesRemaining} free messages remaining.`
              : "Try our AI tutors for free! Start chatting with AI tutors and discover amazing conversations."
            }
          </CardDescription>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <div className="h-2 w-2 rounded-full bg-accent"></div>
            <div className="h-2 w-2 rounded-full bg-secondary"></div>
          </div>
        </CardHeader>
      </Card>
      {/* @ts-ignore */}
      <Separator className="mb-8 max-w-6xl mx-auto" />
    </div>
  )
} 