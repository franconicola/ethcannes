'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function HumanitasPage() {
  const router = useRouter()

  const handleStartChat = () => {
    // Redirect to main chat with Health & Wellness Coach
    router.push('/chat?agent=health-coach')
  }

  return (
    <div className="h-screen bg-background">
      {/* Hero Section */}
      <div className="text-center py-4">
        <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          SparkMind AI - Health & Wellness Assistant
        </CardTitle>
        <CardDescription className="text-sm md:text-base text-muted-foreground">
          Connect with our AI Health & Wellness Coach
        </CardDescription>
      </div>

      {/* Updated Dr. Ann Avatar Section */}
      <Card className="mx-4 h-[calc(100vh-120px)] border-none shadow-lg">
        <CardHeader className="py-3">
          <div className="flex items-center justify-center gap-2">
            <CardTitle className="text-lg text-center">🩺 Health & Wellness Coach</CardTitle>
            <Badge variant="default" className="text-xs">AI Assistant</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-[calc(100%-80px)]">
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🏥</div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  AI Health & Wellness Coach
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Get personalized health and wellness guidance from our AI assistant. 
                  Ask questions about fitness, nutrition, mental health, and general wellness.
                </p>
                <Button 
                  onClick={handleStartChat}
                  className="mt-4"
                  size="lg"
                >
                  Start Health Chat
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 