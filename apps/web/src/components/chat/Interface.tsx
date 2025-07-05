import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { History, MessageCircle } from 'lucide-react'
import type { Avatar } from '../avatar/types'
import { VideoSection } from '../video/Section'
import { ChatControls } from './Controls'
import { CompactChatHistory } from './History'
import type {
  AnonymousSession,
  Session,
  User
} from './types'

interface ChatInterfaceProps {
  session: Session
  avatars: Avatar[]
  text: string
  setText: (text: string) => void
  speaking: boolean
  loading: boolean
  wsConnected: boolean
  hasReachedFreeLimit: boolean
  user: User | null
  anonymousSession: AnonymousSession | null
  isAuthenticated: boolean
  onSendText: () => void
  onCloseSession: () => void
  onLogin: () => void
}

export function ChatInterface({
  session,
  avatars,
  text,
  setText,
  speaking,
  loading,
  wsConnected,
  hasReachedFreeLimit,
  user,
  anonymousSession,
  isAuthenticated,
  onSendText,
  onCloseSession,
  onLogin
}: ChatInterfaceProps) {
  return (
    <div className="w-full px-4 lg:px-8">

      {/* Video Chat Interface - Enhanced Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[calc(100vh-16rem)]">
        {/* Video Section */}
        <div className="xl:col-span-2">
          <VideoSection
            session={session}
            avatars={avatars}
            wsConnected={wsConnected}
            speaking={speaking}
            loading={loading}
            onCloseSession={onCloseSession}
          />
        </div>

        {/* Enhanced Sidebar with Chat Controls and History */}
        <div className="xl:col-span-1">
          {/* @ts-ignore */}
          <Tabs defaultValue="chat" className="h-full">
            {/* @ts-ignore */}
            <TabsList className="grid w-full grid-cols-2">
              {/* @ts-ignore */}
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </TabsTrigger>
              {/* @ts-ignore */}
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>
            
            {/* @ts-ignore */}
            <TabsContent value="chat" className="mt-4 h-[calc(100%-3rem)]">
              <ChatControls
                text={text}
                setText={setText}
                speaking={speaking}
                loading={loading}
                hasReachedFreeLimit={hasReachedFreeLimit}
                onSendText={onSendText}
                onLogin={onLogin}
              />
            </TabsContent>
            
            {/* @ts-ignore */}
            <TabsContent value="history" className="mt-4 h-[calc(100%-3rem)]">
              <CompactChatHistory className="h-full" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 