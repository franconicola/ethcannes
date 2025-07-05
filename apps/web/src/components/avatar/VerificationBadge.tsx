import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Clock, ExternalLink, Shield, ShieldCheck, ShieldX } from 'lucide-react'
import { Avatar } from './types'

interface VerificationBadgeProps {
  avatar: Avatar
  onVerifyPrompt?: () => void
}

export function VerificationBadge({ avatar, onVerifyPrompt }: VerificationBadgeProps) {
  const getVerificationStatus = () => {
    if (!avatar.promptHash) {
      return {
        icon: ShieldX,
        color: 'destructive' as const,
        label: 'Not Verified',
        description: 'System prompt not stored on decentralized storage'
      }
    }

    switch (avatar.safetyRating) {
      case 'safe':
        return {
          icon: ShieldCheck,
          color: 'default' as const,
          label: 'Verified Safe',
          description: 'System prompt verified and stored on 0G Storage'
        }
      case 'reviewed':
        return {
          icon: Shield,
          color: 'secondary' as const,
          label: 'Under Review',
          description: 'System prompt reviewed, stored on 0G Storage'
        }
      case 'pending':
        return {
          icon: Clock,
          color: 'outline' as const,
          label: 'Pending Review',
          description: 'System prompt stored, awaiting safety review'
        }
      default:
        return {
          icon: ShieldX,
          color: 'destructive' as const,
          label: 'Unknown',
          description: 'Safety status unknown'
        }
    }
  }

  const status = getVerificationStatus()
  const Icon = status.icon

  return (
    <Dialog>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1 h-auto">
          <Badge variant={status.color} className="flex items-center gap-1 text-xs">
            <Icon className="h-3 w-3" />
            {status.label}
          </Badge>
        </Button>
      </DialogTrigger>
      {/* @ts-ignore */}
      <DialogContent className="sm:max-w-md">
        {/* @ts-ignore */}
        <DialogHeader>
          {/* @ts-ignore */}
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            AI Tutor Verification
          </DialogTitle>
          {/* @ts-ignore */}
          <DialogDescription>
            Educational AI safety and prompt integrity verification
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <p className="text-muted-foreground">{status.label}</p>
            </div>
            <div>
              <span className="font-medium">Level:</span>
              <p className="text-muted-foreground capitalize">
                {avatar.educationalLevel || 'Not specified'}
              </p>
            </div>
          </div>

          {avatar.subjects && avatar.subjects.length > 0 && (
            <div>
              <span className="font-medium text-sm">Subjects:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {avatar.subjects.map((subject) => (
                  <Badge key={subject} variant="outline" className="text-xs">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="font-medium text-sm">0G Storage Details:</span>
            {avatar.promptHash ? (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono">
                    {avatar.promptHash.slice(0, 12)}...{avatar.promptHash.slice(-8)}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://0g-explorer.com/hash/${avatar.promptHash}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Version: {avatar.promptVersion || '1.0'}
                  {avatar.verifiedAt && (
                    <span className="ml-2">
                      • Verified: {new Date(avatar.verifiedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  System prompt not yet stored on decentralized storage.
                </p>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="mb-2">
              <strong>What this means:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>System prompts define how AI tutors behave</li>
              <li>0G Storage ensures prompts cannot be tampered with</li>
              <li>Educational content is reviewed for age-appropriateness</li>
              <li>Parents can verify AI tutor instructions are safe</li>
            </ul>
          </div>

          {onVerifyPrompt && (
            <Button onClick={onVerifyPrompt} className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Verify Current Prompt
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 