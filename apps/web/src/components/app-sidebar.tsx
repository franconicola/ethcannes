'use client'

import { Badge } from '@/components/ui/badge'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { Home, MessageCircle, Settings, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigationItems = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
  {
    title: 'Sessions',
    url: '/sessions',
    icon: MessageCircle,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-3 px-3 py-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 min-w-[2rem] min-h-[2rem]">
            <Image
              src="/logo.svg" 
              alt="SparkMind Logo" 
              width={32}
              height={32}
              className="h-8 w-8 object-contain shrink-0 min-w-[2rem] min-h-[2rem] group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
              priority
            />
          </div>
          <span className="font-semibold group-data-[collapsible=icon]:hidden text-foreground">
            SparkMind
          </span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <IconComponent size={16} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        {isAuthenticated && user ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip={`${user.displayName || user.email}`}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <User size={16} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.displayName || user.email}
                  </span>
                  <span className="truncate text-xs">
                    <Badge className="text-xs">
                      {user.subscriptionTier || 'FREE'}
                    </Badge>
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <div className="p-2 text-center">
            <span className="text-xs text-muted-foreground">Not signed in</span>
          </div>
        )}
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
} 