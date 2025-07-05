'use client'

import CreditsDisplay from '@/components/CreditsDisplay'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { CreditCard, History, Lock, Settings as SettingsIcon, User } from 'lucide-react'

export default function SettingsPage() {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-4">
              Please log in to view settings
            </p>
            <Button className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                  <p className="text-2xl font-bold">{user?.subscriptionTier || 'Free'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <History className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                  <p className="text-2xl font-bold">{user?.avatarSessionsCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Credits</p>
                  <p className="text-2xl font-bold">{user?.credits?.currentBalance || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credits Display */}
        <CreditsDisplay />

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info */}
            <div>
              <h3 className="font-medium mb-4">User Information</h3>
              <div className="space-y-3">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.email || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label>User ID</Label>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    {user?.id || 'Not available'}
                  </p>
                </div>
                <div>
                  <Label>Wallet Address</Label>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Not connected'}
                  </p>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="font-medium mb-4">Account Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={handleLogout} 
                  variant="destructive"
                  className="w-full"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 