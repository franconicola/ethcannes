'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { Separator } from '@/components/ui/separator'
import { useAuth, type ChatMessage } from '@/contexts/AuthContext'
import { CreditCard, Folder, Lock, MessageCircle, Search, User } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface ChatHistoryProps {
  compact?: boolean
  className?: string
}

export default function ChatHistory({ compact = false, className }: ChatHistoryProps) {
  const { getChatHistory, searchMessages, isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })

  const loadHistory = useCallback(async (page = 1) => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const history = await getChatHistory({ page, limit: compact ? 10 : 20 })
      setMessages(history.messages)
      setPagination({
        page: history.page,
        pages: history.pages,
        total: history.total,
      })
    } catch (error) {
      console.error('Failed to load chat history:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, getChatHistory, compact])

  const handleSearch = async () => {
    if (!searchQuery.trim() || !isAuthenticated) return

    try {
      setIsSearching(true)
      const results = await searchMessages(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory()
    }
  }, [isAuthenticated, loadHistory])

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Please log in to view your chat history.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayMessages = searchResults.length > 0 ? searchResults : messages

  return (
    <Card className={className}>
      <CardHeader className={compact ? 'pb-3' : undefined}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5" />
          Chat History
          {pagination.total > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pagination.total}
            </Badge>
          )}
        </CardTitle>
        
        {/* Search */}
        <div className="flex gap-2 mt-3">
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={!searchQuery.trim() || isSearching}
            size="sm"
          >
            <Search className="h-4 w-4" />
          </Button>
          {searchResults.length > 0 && (
            <Button onClick={clearSearch} variant="outline" size="sm">
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className={`overflow-y-auto ${compact ? "h-[400px]" : "h-[500px]"}`}>
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <Loader 
                  variant="wave" 
                  size="md" 
                  message="Loading your conversations..." 
                />
              </div>
            ) : displayMessages.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                  {searchQuery ? (
                    <Search className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <MessageCircle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? 'No messages found matching your search.' : 'Start a conversation to see your chat history here!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayMessages.map((message, index) => (
                  <div key={message.id}>
                    <div className="p-3 bg-card border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.messageType === 'USER' ? 'You' : 'AI Tutor'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </span>
                            {message.creditsUsed && message.creditsUsed > 0 && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                {message.creditsUsed}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-foreground break-words leading-relaxed">
                            {message.messageText}
                          </p>
                          
                          {message.session && compact && (
                            <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                              <Folder className="h-3 w-3" />
                              {message.session.sessionTitle || 'Untitled Session'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Add separator between different sessions */}
                    {index < displayMessages.length - 1 && 
                     message.session?.id !== displayMessages[index + 1]?.session?.id && (
                      // @ts-ignore
                      <Separator className="my-3" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && !searchResults.length && (
          <div className="p-4 border-t">
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadHistory(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">
                {pagination.page} / {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadHistory(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Also export a compact version for easy use
export function CompactChatHistory({ className }: { className?: string }) {
  return <ChatHistory compact={true} className={className} />
} 