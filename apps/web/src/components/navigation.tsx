'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useConnectWallet, usePrivy, useWallets } from '@privy-io/react-auth'
import { ChevronDown, CreditCard, LogOut, Settings, User } from 'lucide-react'
import Link from 'next/link'

export function Navigation() {
  const { isAuthenticated, login, logout, user } = useAuth()
  const { user: privyUser, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const { connectWallet } = useConnectWallet()

  // Helper function to extract proper initials from user name
  const getInitials = (user: any, privyUser: any) => {
    // Try displayName from our custom user object first
    if (user?.displayName) {
      const nameParts = user.displayName.trim().split(/\s+/)
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      }
      return nameParts[0][0].toUpperCase()
    }
    
    // Try email from our custom user object
    if (user?.email) {
      const emailName = user.email.split('@')[0]
      const emailParts = emailName.split(/[._]/)
      if (emailParts.length >= 2) {
        return (emailParts[0][0] + emailParts[1][0]).toUpperCase()
      }
      return emailParts[0][0].toUpperCase()
    }
    
    // Fall back to Privy user data if our user object is not available
    if (privyUser?.linkedAccounts) {
      // Look for email accounts first
      const emailAccount = privyUser.linkedAccounts.find((account: any) => account.type === 'email')
      if (emailAccount?.address) {
        const emailName = emailAccount.address.split('@')[0]
        const emailParts = emailName.split(/[._]/)
        if (emailParts.length >= 2) {
          return (emailParts[0][0] + emailParts[1][0]).toUpperCase()
        }
        return emailParts[0][0].toUpperCase()
      }
      
      // Look for social accounts with names
      const socialAccount = privyUser.linkedAccounts.find((account: any) => 
        account.type && ['google_oauth', 'twitter_oauth', 'discord_oauth', 'github_oauth'].includes(account.type)
      )
      if (socialAccount?.name) {
        const nameParts = socialAccount.name.trim().split(/\s+/)
        if (nameParts.length >= 2) {
          return (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        }
        return nameParts[0][0].toUpperCase()
      }
    }
    
    return 'U'
  }

  // Helper to get display name
  const getDisplayName = (user: any, privyUser: any) => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email
    
    // Fall back to Privy user data
    if (privyUser?.linkedAccounts) {
      const emailAccount = privyUser.linkedAccounts.find((account: any) => account.type === 'email')
      if (emailAccount?.address) return emailAccount.address
      
      const socialAccount = privyUser.linkedAccounts.find((account: any) => 
        account.type && ['google_oauth', 'twitter_oauth', 'discord_oauth', 'github_oauth'].includes(account.type)
      )
      if (socialAccount?.name) return socialAccount.name
    }
    
    return 'User'
  }

  // Helper to get wallet address
  const getWalletAddress = (user: any, privyUser: any) => {
    if (user?.walletAddress) return user.walletAddress
    
    // Fall back to Privy user data
    if (privyUser?.linkedAccounts) {
      const walletAccount = privyUser.linkedAccounts.find((account: any) => 
        account.type === 'wallet' || account.type === 'ethereum_wallet' || account.type === 'smart_wallet'
      )
      if (walletAccount?.address) return walletAccount.address
    }
    
    // Fall back to connected wallets from useWallets hook
    if (wallets.length > 0) {
      return wallets[0].address
    }
    
    return null
  }

  // Check if user has a connected wallet - use both our DB and Privy wallets
  const hasConnectedWallet = getWalletAddress(user, privyUser) !== null || wallets.length > 0

  // Handle wallet connection logic
  const handleWalletAction = () => {
    if (!authenticated) {
      // User not authenticated at all - need to login first
      login()
    } else if (!hasConnectedWallet) {
      // User authenticated but no wallet - connect wallet
      connectWallet()
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center py-4 lg:py-6">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="-ml-1" />
            <div className="hidden sm:block">
              <Link href="/" className="flex items-center gap-2 text-xl lg:text-2xl font-bold text-foreground">
                <span className="text-foreground">SparkMind</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Admin Link - Only for authenticated users */}
            {isAuthenticated && (
              <Link 
                href="/admin" 
                className="text-sm font-medium hover:underline underline-offset-4"
              >
                Admin
              </Link>
            )}
            
            <ThemeToggle />
            {!authenticated ? (
              <Button onClick={handleWalletAction} size="sm" className="text-xs lg:text-sm gap-2">
                <CreditCard className="h-4 w-4" />
                Connect Wallet
              </Button>
            ) : !hasConnectedWallet ? (
              <Button onClick={handleWalletAction} size="sm" className="text-xs lg:text-sm gap-2">
                <CreditCard className="h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              <DropdownMenu>
                {/* @ts-ignore */}
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 h-auto p-2">
                    {/* @ts-ignore */}
                    <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                      {/* @ts-ignore */}
                      <AvatarImage alt={getDisplayName(user, privyUser)} />
                      {/* @ts-ignore */}
                      <AvatarFallback className="text-xs lg:text-sm">
                        {getInitials(user, privyUser)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {hasConnectedWallet ? (
                          <>
                            {getWalletAddress(user, privyUser)?.slice(0, 6)}...{getWalletAddress(user, privyUser)?.slice(-4)}
                          </>
                        ) : (
                          getDisplayName(user, privyUser)
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {user?.subscriptionTier || 'FREE'}
                        </Badge>
                        {hasConnectedWallet && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">Connected</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                {/* @ts-ignore */}
                <DropdownMenuContent align="end" className="w-56">
                  {/* @ts-ignore */}
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  {hasConnectedWallet ? (
                    <>
                      {/* @ts-ignore */}
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-muted-foreground font-mono">
                            {getWalletAddress(user, privyUser)?.slice(0, 6)}...{getWalletAddress(user, privyUser)?.slice(-4)}
                          </span>
                        </div>
                      </DropdownMenuLabel>
                    </>
                  ) : (
                    <>
                      {/* @ts-ignore */}
                      <DropdownMenuLabel className="font-normal">
                        <span className="text-xs text-muted-foreground">
                          {getDisplayName(user, privyUser)}
                        </span>
                      </DropdownMenuLabel>
                    </>
                  )}
                  {/* @ts-ignore */}
                  <DropdownMenuSeparator />
                  {/* @ts-ignore */}
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {/* @ts-ignore */}
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {/* @ts-ignore */}
                  <DropdownMenuItem onClick={connectWallet}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Connect Another Wallet</span>
                  </DropdownMenuItem>
                  {/* @ts-ignore */}
                  <DropdownMenuSeparator />
                  {/* @ts-ignore */}
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 