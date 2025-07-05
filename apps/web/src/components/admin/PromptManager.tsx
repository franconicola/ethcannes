'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
    AIAgentPrompt,
    StoredPrompt,
    initializeZGStorage,
    retrieveAgentPrompt,
    storeAgentPrompt,
    validateEducationalContent,
    verifyPromptIntegrity
} from '@/lib/storage'
import {
    AlertTriangle,
    CheckCircle,
    Download,
    ExternalLink,
    History,
    Shield,
    Upload
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface PromptManagerProps {
  agentId?: string
  onPromptStored?: (storedPrompt: StoredPrompt) => void
}

export function PromptManager({ agentId, onPromptStored }: PromptManagerProps) {
  const [prompt, setPrompt] = useState<Partial<AIAgentPrompt>>({
    agentId: agentId || '',
    agentName: '',
    systemPrompt: '',
    version: '1.0',
    createdBy: 'admin',
    educationalLevel: 'elementary',
    subjects: [],
    safetyRating: 'pending'
  })
  
  const [privateKey, setPrivateKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [storedPrompts, setStoredPrompts] = useState<StoredPrompt[]>([])
  const [validation, setValidation] = useState<{ isValid: boolean; issues: string[] } | null>(null)
  const [zgInitialized, setZgInitialized] = useState(false)

  // Initialize 0G Storage on component mount
  useEffect(() => {
    const initialized = initializeZGStorage()
    setZgInitialized(initialized)
  }, [])

  // Validate prompt content in real-time
  useEffect(() => {
    if (prompt.systemPrompt && prompt.systemPrompt.length > 10) {
      const result = validateEducationalContent(prompt as AIAgentPrompt)
      setValidation(result)
    } else {
      setValidation(null)
    }
  }, [prompt])

  const handleStorePrompt = async () => {
    if (!privateKey.trim()) {
      setError('Private key is required for 0G Storage operations')
      return
    }

    if (!prompt.systemPrompt?.trim()) {
      setError('System prompt is required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const fullPrompt: AIAgentPrompt = {
        ...prompt,
        createdAt: new Date().toISOString(),
        subjects: prompt.subjects || []
      } as AIAgentPrompt

      const storedPrompt = await storeAgentPrompt(fullPrompt, privateKey)
      
      setSuccess(`Prompt stored successfully! Hash: ${storedPrompt.rootHash}`)
      setStoredPrompts(prev => [storedPrompt, ...prev])
      
      if (onPromptStored) {
        onPromptStored(storedPrompt)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store prompt')
    } finally {
      setLoading(false)
    }
  }

  const handleRetrievePrompt = async (rootHash: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const retrievedPrompt = await retrieveAgentPrompt(rootHash)
      setPrompt(retrievedPrompt)
      setSuccess(`Prompt retrieved successfully from 0G Storage`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve prompt')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPrompt = async (storedPrompt: StoredPrompt) => {
    try {
      setLoading(true)
      setError(null)
      
      const isValid = await verifyPromptIntegrity(prompt as AIAgentPrompt, storedPrompt.rootHash)
      
      if (isValid) {
        setSuccess('Prompt integrity verified ✓')
      } else {
        setError('Prompt integrity verification failed - content may have been modified')
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify prompt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Alerts */}
      {!zgInitialized && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            0G Storage not initialized. Check your configuration.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="create" className="w-full">
        {/* @ts-ignore */}
        <TabsList className="grid w-full grid-cols-3">
          {/* @ts-ignore */}
          <TabsTrigger value="create">Create Prompt</TabsTrigger>
          {/* @ts-ignore */}
          <TabsTrigger value="manage">Manage</TabsTrigger>
          {/* @ts-ignore */}
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* @ts-ignore */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Create AI Tutor Prompt
              </CardTitle>
              <CardDescription>
                Design and store educational AI system prompts on 0G Storage for immutable verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agentId">Agent ID</Label>
                  <Input
                    id="agentId"
                    value={prompt.agentId}
                    onChange={(e) => setPrompt(prev => ({ ...prev, agentId: e.target.value }))}
                    placeholder="agent-math-tutor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    value={prompt.agentName}
                    onChange={(e) => setPrompt(prev => ({ ...prev, agentName: e.target.value }))}
                    placeholder="Math Tutor"
                  />
                </div>
              </div>

              {/* Educational Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="educationalLevel">Educational Level</Label>
                  {/* @ts-ignore */}
                  <Select value={prompt.educationalLevel} onValueChange={(value) => setPrompt(prev => ({ ...prev, educationalLevel: value as any }))}>
                    {/* @ts-ignore */}
                    <SelectTrigger>
                      {/* @ts-ignore */}
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    {/* @ts-ignore */}
                    <SelectContent>
                      {/* @ts-ignore */}
                      <SelectItem value="elementary">Elementary</SelectItem>
                      {/* @ts-ignore */}
                      <SelectItem value="middle">Middle School</SelectItem>
                      {/* @ts-ignore */}
                      <SelectItem value="high">High School</SelectItem>
                      {/* @ts-ignore */}
                      <SelectItem value="adult">Adult</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                  <Input
                    id="subjects"
                    value={prompt.subjects?.join(', ') || ''}
                    onChange={(e) => setPrompt(prev => ({ 
                      ...prev, 
                      subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="mathematics, algebra, geometry"
                  />
                </div>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={prompt.systemPrompt}
                  onChange={(e) => setPrompt(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="You are a friendly AI tutor specialized in elementary mathematics..."
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              {/* Validation Results */}
              {validation && (
                <div className="space-y-2">
                  <Label>Content Validation</Label>
                  <div className={`p-3 rounded-lg border ${validation.isValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validation.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="font-medium text-sm">
                        {validation.isValid ? 'Content Approved' : 'Issues Found'}
                      </span>
                    </div>
                    {validation.issues.length > 0 && (
                      <ul className="text-sm space-y-1">
                        {validation.issues.map((issue, index) => (
                          <li key={index} className="text-yellow-700">• {issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Private Key */}
              <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key (for 0G Storage)</Label>
                <Input
                  id="privateKey"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Your Ethereum private key"
                />
                <p className="text-xs text-muted-foreground">
                  Required for uploading to 0G Storage. Never share your private key.
                </p>
              </div>

              <Button 
                onClick={handleStorePrompt} 
                disabled={loading || !zgInitialized || !validation?.isValid}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Storing on 0G Storage...' : 'Store Prompt on 0G Storage'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* @ts-ignore */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Retrieve & Verify Prompts
              </CardTitle>
              <CardDescription>
                Retrieve stored prompts from 0G Storage and verify their integrity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="retrieveHash">0G Storage Hash</Label>
                <div className="flex gap-2">
                  <Input
                    id="retrieveHash"
                    placeholder="0x1234...abcd"
                    className="font-mono"
                  />
                  <Button onClick={() => handleRetrievePrompt('mock-hash')}>
                    <Download className="h-4 w-4 mr-2" />
                    Retrieve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* @ts-ignore */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Prompt History
              </CardTitle>
              <CardDescription>
                View all stored prompt versions for this agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {storedPrompts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No prompts stored yet. Create and store your first prompt above.
                </p>
              ) : (
                <div className="space-y-3">
                  {storedPrompts.map((storedPrompt) => (
                    <div key={storedPrompt.rootHash} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">v{storedPrompt.version}</Badge>
                          <span className="font-mono text-sm">
                            {storedPrompt.rootHash.slice(0, 12)}...{storedPrompt.rootHash.slice(-8)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(storedPrompt.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyPrompt(storedPrompt)}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://0g-explorer.com/hash/${storedPrompt.rootHash}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 