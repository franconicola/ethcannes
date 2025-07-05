// @ts-nocheck
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader } from '@/components/ui/loader'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { usePrivy } from '@privy-io/react-auth'
import { AlertCircle, AlertTriangle, Clock, CreditCard, Lock, MessageCircle, Trash2, TrashIcon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface AvatarSession {
  id: string
  avatarId: string
  sessionTitle?: string
  sessionSummary?: string
  status: string
  createdAt: string
  duration?: number
  messageCount: number
  creditsUsed?: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface DeleteModalState {
  isOpen: boolean
  type: 'single' | 'bulk' | null
  sessionId?: string
  sessionTitle?: string
  endedSessionsCount?: number
}

export default function SessionsPage() {
  const { isAuthenticated, login } = useAuth()
  const { getAccessToken } = usePrivy()
  const [sessions, setSessions] = useState<AvatarSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })
  const [deletingSession, setDeletingSession] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: null
  })

  const loadSessions = useCallback(async (page = 1) => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      setError(null)
      
      const token = await getAccessToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/users/sessions?page=${page}&limit=${pagination.limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSessions(data.sessions)
        setPagination(data.pagination)
      } else {
        throw new Error(data.message || 'Failed to load sessions')
      }
    } catch (err) {
      console.error('Failed to load sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, pagination.limit, getAccessToken])

  const deleteSession = useCallback(async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    setDeleteModal({
      isOpen: true,
      type: 'single',
      sessionId,
      sessionTitle: session?.sessionTitle || `Session ${sessionId.slice(0, 8)}`
    })
  }, [sessions])

  const confirmDeleteSession = useCallback(async () => {
    const { sessionId } = deleteModal
    if (!sessionId) return

    try {
      setDeletingSession(sessionId)
      
      const token = await getAccessToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        // Remove the deleted session from the local state
        setSessions(prev => prev.filter(session => session.id !== sessionId))
        // Optionally reload to get updated pagination
        await loadSessions(pagination.page)
        setDeleteModal({ isOpen: false, type: null })
      } else {
        throw new Error(data.message || 'Failed to delete session')
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete session')
    } finally {
      setDeletingSession(null)
    }
  }, [deleteModal, getAccessToken, loadSessions, pagination.page])

  const bulkDeleteEndedSessions = useCallback(async () => {
    const endedSessions = sessions.filter(s => s.status === 'ENDED')
    if (endedSessions.length === 0) {
      alert('No ended sessions to delete.')
      return
    }

    setDeleteModal({
      isOpen: true,
      type: 'bulk',
      endedSessionsCount: endedSessions.length
    })
  }, [sessions])

  const confirmBulkDelete = useCallback(async () => {
    try {
      setBulkDeleting(true)
      
      const token = await getAccessToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/sessions/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'ENDED'
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        // Show success message using a simple alert for now
        alert(`Successfully deleted ${data.deletedCount} ended sessions.`)
        // Reload sessions
        await loadSessions(1) // Go back to first page
        setDeleteModal({ isOpen: false, type: null })
      } else {
        throw new Error(data.message || 'Failed to delete sessions')
      }
    } catch (err) {
      console.error('Failed to bulk delete sessions:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete sessions')
    } finally {
      setBulkDeleting(false)
    }
  }, [getAccessToken, loadSessions])

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, loadSessions])

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A'
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}m ${seconds}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Your Sessions</h1>
              <p className="text-muted-foreground">
                View and manage your previous AI tutor conversations.
              </p>
            </div>
            
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Sign in to view your sessions</h3>
                    <p className="text-muted-foreground text-sm">
                      Please log in to access your conversation history and previous AI tutor sessions.
                    </p>
                  </div>
                  <Button onClick={login} className="mt-4">
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Your Sessions</h1>
              <p className="text-muted-foreground">
                View and continue your previous AI tutor conversations.
              </p>
            </div>
            {sessions.length > 0 && sessions.some(s => s.status === 'ENDED') && (
              <Button
                variant="destructive"
                size="sm"
                onClick={bulkDeleteEndedSessions}
                disabled={bulkDeleting}
                className="flex items-center gap-2"
              >
                {bulkDeleting ? (
                  <Loader variant="orbit" size="sm" />
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
                Delete All Ended Sessions
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader 
                variant="orbit" 
                size="lg" 
                message="Loading your sessions..." 
              />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-destructive">Error loading sessions</h3>
                    <p className="text-muted-foreground text-sm">{error}</p>
                  </div>
                  <Button onClick={() => loadSessions()} variant="outline">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No sessions yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Start a conversation with an AI tutor to see your sessions here.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/">Start a Conversation</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Sessions Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg line-clamp-1">
                            {session.sessionTitle || `Session ${session.id.slice(0, 8)}`}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {formatDate(session.createdAt)}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={session.status === 'ACTIVE' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {session.sessionSummary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {session.sessionSummary}
                        </p>
                      )}
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {session.messageCount || 0} messages
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(session.duration)}
                        </span>
                      </div>
                      
                      {session.creditsUsed && session.creditsUsed > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CreditCard className="h-3 w-3" />
                          <span>{session.creditsUsed} credits used</span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/${session.id}`}>
                            {session.status === 'ACTIVE' ? 'Continue' : 'View'}
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSession(session.id)}
                          disabled={deletingSession === session.id}
                          className="flex items-center gap-1"
                        >
                          {deletingSession === session.id ? (
                            <Loader variant="orbit" size="sm" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => loadSessions(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => loadSessions(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal({ isOpen: false, type: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {deleteModal.type === 'single' ? 'Delete Session' : 'Delete All Ended Sessions'}
            </DialogTitle>
            <DialogDescription>
              {deleteModal.type === 'single' ? (
                <>
                  Are you sure you want to delete <strong>{deleteModal.sessionTitle}</strong>? 
                  This action cannot be undone and will permanently remove all messages and data associated with this session.
                </>
              ) : (
                <>
                  Are you sure you want to delete all <strong>{deleteModal.endedSessionsCount} ended sessions</strong>? 
                  This action cannot be undone and will permanently remove all messages and data from these sessions.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteModal({ isOpen: false, type: null })}
              disabled={deletingSession !== null || bulkDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteModal.type === 'single' ? confirmDeleteSession : confirmBulkDelete}
              disabled={deletingSession !== null || bulkDeleting}
              className="flex items-center gap-2"
            >
              {(deletingSession !== null || bulkDeleting) ? (
                <>
                  <Loader variant="orbit" size="sm" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {deleteModal.type === 'single' ? 'Delete Session' : `Delete ${deleteModal.endedSessionsCount} Sessions`}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 