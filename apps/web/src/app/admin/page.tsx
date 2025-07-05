'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, Info, Settings, Shield, Users } from 'lucide-react'
import { useState } from 'react'

// Edge Runtime configuration for Cloudflare Pages
export const runtime = 'edge';

export default function AdminPage() {
  const { isAuthenticated, user } = useAuth()
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

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
                    {agents.filter(a => a.promptHash).length}
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
                          Manage Prompt
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
            {selectedAgent ? (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Managing prompts for agent: <strong>{selectedAgent}</strong>
                  </AlertDescription>
                </Alert>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      0G Storage Integration
                    </CardTitle>
                    <CardDescription>
                      AI Tutor prompt management with decentralized storage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        0G Storage integration is currently being optimized for Edge Runtime compatibility. 
                        Full functionality will be available in server-side environments.
                      </AlertDescription>
                    </Alert>
                    <div className="mt-6 space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Planned Features</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Store AI system prompts on decentralized storage</li>
                          <li>• Verify prompt integrity with cryptographic hashes</li>
                          <li>• Educational content safety validation</li>
                          <li>• Immutable audit trail for AI behavior</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Current Status</h4>
                        <Badge variant="outline">
                          Building Edge Runtime compatibility
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select an Agent</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose an AI tutor agent from the overview tab to manage its system prompts
                  </p>
                  <button
                    onClick={() => setSelectedAgent('new-agent')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Create New Agent
                  </button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* @ts-ignore */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  0G Storage Integration for Educational AI
                </CardTitle>
                <CardDescription>
                  Understanding how decentralized storage ensures AI tutor safety and transparency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">🔒 Why 0G Storage for AI Tutors?</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Immutability:</strong> System prompts cannot be tampered with once stored</li>
                      <li>• <strong>Transparency:</strong> Parents and educators can verify AI instructions</li>
                      <li>• <strong>Decentralization:</strong> No single point of control or failure</li>
                      <li>• <strong>Audit Trail:</strong> Complete history of prompt changes over time</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">🎯 Educational Safety Features</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Content Validation:</strong> Automated screening for age-appropriate content</li>
                      <li>• <strong>Educational Focus:</strong> Ensures prompts maintain learning objectives</li>
                      <li>• <strong>Safety Ratings:</strong> Three-tier approval system (pending → reviewed → safe)</li>
                      <li>• <strong>Version Control:</strong> Track changes and rollback if needed</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">⚡ How It Works</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li>1. <strong>Create Prompt:</strong> Design AI tutor behavior and educational goals</li>
                      <li>2. <strong>Validate Content:</strong> Automated safety and educational content checks</li>
                      <li>3. <strong>Store on 0G:</strong> Upload to decentralized storage with cryptographic hash</li>
                      <li>4. <strong>Deploy Agent:</strong> AI tutor uses verified prompt from 0G Storage</li>
                      <li>5. <strong>Continuous Verification:</strong> Regular integrity checks ensure no tampering</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">🚀 Getting Started</h4>
                    <p className="text-sm text-blue-800">
                      To begin using 0G Storage for your AI tutors, you&apos;ll need an Ethereum wallet and some testnet tokens. 
                      The system guides you through creating educational prompts, validating content safety, and storing 
                      them immutably on the 0G network.
                    </p>
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