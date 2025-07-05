'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { usePrivy } from '@privy-io/react-auth'
import { AlertCircle, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CreditStats {
  currentBalance: number
  totalUsed: number
  dailyLimit: number
  dailyUsed: number
  lastResetDate: string
  nextResetDate: string
}

interface ApiResponse {
  success: boolean
  credits?: CreditStats
  error?: string
}

export default function CreditsDisplay() {
  const { isAuthenticated, user } = useAuth()
  const { getAccessToken } = usePrivy()
  const [credits, setCredits] = useState<CreditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  useEffect(() => {
    const fetchCredits = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get the access token for authentication
        const token = await getAccessToken()
        if (!token) {
          throw new Error('No access token available')
        }

        // Fetch from credits API endpoint
        const response = await fetch(`${API_BASE}/credits`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ApiResponse = await response.json()
        
        if (data.success && data.credits) {
          setCredits(data.credits)
        } else {
          throw new Error(data.error || 'Failed to fetch credits')
        }
      } catch (err) {
        console.error('Failed to fetch credits:', err)
        setError(err instanceof Error ? err.message : 'Failed to load credits')
        
        // Fallback to user data if available
        if (user?.credits) {
          const lastResetDate = user.credits.lastReset 
            ? (user.credits.lastReset instanceof Date 
                ? user.credits.lastReset.toISOString() 
                : typeof user.credits.lastReset === 'string' 
                  ? user.credits.lastReset 
                  : new Date(user.credits.lastReset).toISOString())
            : new Date().toISOString()

          setCredits({
            currentBalance: user.credits.currentBalance || 0,
            totalUsed: user.credits.totalUsed || 0,
            dailyLimit: user.credits.dailyLimit || 10,
            dailyUsed: Math.max(0, (user.credits.dailyLimit || 10) - (user.credits.currentBalance || 0)),
            lastResetDate: lastResetDate,
            nextResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          })
          setError(null) // Clear error if we have fallback data
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
  }, [isAuthenticated, user, getAccessToken, API_BASE])

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !credits) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load credits</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!credits) {
    return null
  }

  const dailyProgress = (credits.dailyUsed / credits.dailyLimit) * 100
  const isNearLimit = dailyProgress >= 80
  const isAtLimit = credits.dailyUsed >= credits.dailyLimit

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Balance */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Current Balance</span>
            <span className="text-2xl font-bold">{credits.currentBalance}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Total used: {credits.totalUsed} credits
          </p>
        </div>

        {/* Daily Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Daily Usage</span>
            <span className="text-sm">
              {credits.dailyUsed} / {credits.dailyLimit}
            </span>
          </div>
          <div className={`h-2 w-full rounded-full ${isNearLimit ? 'bg-accent/20' : 'bg-primary/20'}`}>
            <div 
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(dailyProgress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Resets: {formatDate(credits.nextResetDate)}</span>
            <span>{Math.round(dailyProgress)}%</span>
          </div>
        </div>

        {/* Warning */}
        {isAtLimit && (
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">No credits remaining. Your daily limit will reset tomorrow.</p>
              </div>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-accent mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-accent">You&apos;re approaching your daily limit</p>
                <p className="text-accent/80">
                  {credits.dailyLimit - credits.dailyUsed} credits remaining until reset
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade suggestion for free users */}
        {user?.subscriptionTier === 'FREE' && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-sm">
              <p className="font-medium text-primary">Want more credits?</p>
              <p className="text-muted-foreground text-xs mt-1">
                Upgrade to get unlimited daily conversations
              </p>
              <Button size="sm" className="mt-2">
                Upgrade Now
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 