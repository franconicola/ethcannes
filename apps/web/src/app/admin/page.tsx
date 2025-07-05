'use client'

import { PromptManager } from '@/components/admin/PromptManager'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { getStorageStatus, StorageStatus } from '@/lib/api/zgStorage'
import { AlertCircle, BookOpen, CheckCircle, Info, Settings, Shield, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

// Edge Runtime configuration for Cloudflare Pages
export const runtime = 'edge';

export default function AdminPage() {
  const { isAuthenticated, user } = useAuth()
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)

  // Check 0G Storage status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getStorageStatus()
        setStorageStatus(status)
      } catch (error) {
        console.error('Failed to get storage status:', error)
        setStorageStatus(null)
      } finally {
        setStatusLoading(false)
      }
    }
    checkStatus()
  }, [])

  // Mock agents data - in real app, this would come from your API
  const agents = [
    {
      id: 'math-tutor-elementary',
      name: 'Elementary Math Tutor',
      description: 'Specialized in basic arithmetic and number sense',
      educationalLevel: 'elementary',
      subjects: ['mathematics', 'arithmetic'],
      safetyRating: 'safe' as const,
      promptHash: '0x1234567890abcdef...',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'science-explorer',
      name: 'Science Explorer',
      description: 'Interactive science learning for curious minds',
      educationalLevel: 'middle',
      subjects: ['science', 'biology', 'chemistry'],
      safetyRating: 'reviewed' as const,
      promptHash: null,
      lastUpdated: '2024-01-10'
    },
    {
      id: 'reading-companion',
      name: 'Reading Companion',
      description: 'Helps develop reading comprehension and vocabulary',
      educationalLevel: 'elementary',
      subjects: ['reading', 'vocabulary', 'comprehension'],
      safetyRating: 'pending' as const,
      promptHash: '0xabcdef1234567890...',
      lastUpdated: '2024-01-12'
    }
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
            <CardDescription>
              Please sign in with administrator privileges to access the AI tutor management panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Tutor Administration</h1>
          <p className="text-muted-foreground">
            Manage educational AI system prompts with 0G Storage verification
          </p>
        </div>

        {/* 0G Storage Status Alert */}
        {!statusLoading && (
          <div className="mb-6">
            {storageStatus?.serviceAvailable ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  0G Storage is operational. Network: {storageStatus.network.rpcUrl}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  0G Storage is not available. Check your API connection.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Agents</p>
                  <p className="text-2xl font-bold">{agents.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified Safe</p>
                  <p className="text-2xl font-bold text-green-600">
                    {agents.filter(a => a.safetyRating === 'safe').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">0G Storage</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {storageStatus?.statistics?.totalStoredPrompts || 0}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {agents.filter(a => a.safetyRating === 'pending').length}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          {/* @ts-ignore */}
          <TabsList className="grid w-full grid-cols-3">
            {/* @ts-ignore */}
            <TabsTrigger value="overview">Agent Overview</TabsTrigger>
            {/* @ts-ignore */}
            <TabsTrigger value="prompt-manager">Prompt Manager</TabsTrigger>
            {/* @ts-ignore */}
            <TabsTrigger value="about">About 0G Integration</TabsTrigger>
          </TabsList>

          {/* @ts-ignore */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Tutor Agents</CardTitle>
                <CardDescription>
                  Monitor and manage your educational AI agents and their verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{agent.name}</h3>
                          <Badge 
                            variant={
                              agent.safetyRating === 'safe' ? 'default' : 
                              agent.safetyRating === 'reviewed' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {agent.safetyRating}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {agent.educationalLevel}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{agent.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Subjects:</span>
                          {agent.subjects.map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Updated: {agent.lastUpdated}</span>
                          {agent.promptHash && (
                            <span className="font-mono">
                              0G: {agent.promptHash.slice(0, 12)}...
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedAgent(agent.id)}
                          className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* @ts-ignore */}
          <TabsContent value="prompt-manager" className="space-y-6">
            <PromptManager 
              agentId={selectedAgent || undefined}
              onPromptStored={(storedPrompt) => {
                console.log('Prompt stored:', storedPrompt)
                // Could refresh the agents list here
              }}
            />
          </TabsContent>

          {/* @ts-ignore */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About 0G Storage Integration
                </CardTitle>
                <CardDescription>
                  Understanding how SparkMind uses 0G Storage for AI tutor verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">🔒 Immutable Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      All AI tutor system prompts are stored on 0G Storage, creating an immutable record 
                      that cannot be modified after deployment. This ensures transparency and trust in 
                      educational AI systems.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">🛡️ Educational Safety</h3>
                    <p className="text-sm text-muted-foreground">
                      Each prompt undergoes automated content validation to ensure age-appropriate, 
                      educational content. The validation results are stored alongside the prompt 
                      for complete transparency.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">⚡ Current Status</h3>
                    <div className="space-y-2">
                      {storageStatus ? (
                        <div className="text-sm">
                          <p><strong>Service Status:</strong> {storageStatus.serviceAvailable ? '✅ Available' : '❌ Unavailable'}</p>
                          <p><strong>Network:</strong> {storageStatus.network.rpcUrl}</p>
                          <p><strong>Total Stored Prompts:</strong> {storageStatus.statistics.totalStoredPrompts}</p>
                          <p><strong>Your Stored Prompts:</strong> {storageStatus.statistics.userStoredPrompts}</p>
                          <p><strong>Features:</strong> Store ✓, Retrieve ✓, Verify ✓, Validate ✓</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Loading 0G Storage status...</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">🔧 How It Works</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>1. <strong>Create:</strong> Design AI tutor prompts with educational focus</p>
                      <p>2. <strong>Validate:</strong> Automated safety and educational content checks</p>
                      <p>3. <strong>Store:</strong> Upload to 0G Storage with cryptographic verification</p>
                      <p>4. <strong>Verify:</strong> Anyone can verify prompt integrity using hash comparison</p>
                      <p>5. <strong>Deploy:</strong> Verified prompts power trusted AI tutors</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">📊 Benefits</h3>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Complete transparency in AI system behavior</li>
                      <li>Immutable audit trail for educational content</li>
                      <li>Cryptographic verification of prompt integrity</li>
                      <li>Decentralized storage resistant to censorship</li>
                      <li>Community-verifiable AI safety standards</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 