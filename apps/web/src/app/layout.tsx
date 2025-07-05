import { AppSidebar } from '@/components/app-sidebar'
import { Navigation } from '@/components/navigation'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import AuthProviderWrapper from '@/contexts/AuthContext'
import { SessionProvider } from '@/contexts/SessionContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SparkMind',
  description: 'Connect with AI avatars in real-time conversations',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProviderWrapper>
            <SessionProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <Navigation />
                  {children}
                </SidebarInset>
              </SidebarProvider>
              <Toaster />
            </SessionProvider>
          </AuthProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
} 