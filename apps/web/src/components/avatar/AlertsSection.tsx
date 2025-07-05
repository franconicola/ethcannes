import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, ExternalLink, RefreshCw, Target, X } from 'lucide-react'

interface AlertsSectionProps {
  error: string | null
  avatarError: string | null
  hasReachedFreeLimit: boolean
  onClearError: () => void
  onClearAvatarError: () => void
  onLogin: () => void
  onDismissFreeLimit: () => void
}

export function AlertsSection({
  error,
  avatarError,
  hasReachedFreeLimit,
  onClearError,
  onClearAvatarError,
  onLogin,
  onDismissFreeLimit
}: AlertsSectionProps) {
  const handleRetryAvatars = () => {
    onClearAvatarError()
    window.location.reload()
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6 max-w-6xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={onClearError} className="ml-4">
              <X className="h-4 w-4" />
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {avatarError && (
        <Alert variant="destructive" className="mb-6 max-w-6xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>AI Tutor Loading Error</AlertTitle>
          <AlertDescription className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">Failed to load AI tutors:</p>
                <p className="text-sm text-muted-foreground mt-1">{avatarError}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onClearAvatarError} className="ml-4">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRetryAvatars}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
                              <Button variant="outline" size="sm" onClick={() => window.open('http://localhost:3000', '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Check API
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Troubleshooting tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Make sure your API server is running on port 8787</li>
                <li>Check your network connection</li>
                <li>Verify NEXT_PUBLIC_API_URL in your environment</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* @ts-ignore */}
      <Dialog open={hasReachedFreeLimit} onOpenChange={(open) => !open && onDismissFreeLimit()}>
        {/* @ts-ignore */}
        <DialogContent className="sm:max-w-md">
          {/* @ts-ignore */}
          <DialogHeader>
            {/* @ts-ignore */}
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Free Message Limit Reached
            </DialogTitle>
            {/* @ts-ignore */}
            <DialogDescription>
              You&apos;ve used all 5 free messages. Log in to continue chatting with unlimited messages and unlock premium features!
            </DialogDescription>
          </DialogHeader>
          {/* @ts-ignore */}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onDismissFreeLimit}>
              Maybe Later
            </Button>
            <Button onClick={onLogin} className="w-full sm:w-auto">
              Log In & Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 