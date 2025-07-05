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
    AgentPrompt,
    StorageResult,
    ValidationResult,
    generateTestPrompt,
    getStorageStatus,
    retrieveAgentPrompt,
    storeAgentPrompt,
    validateEducationalContent,
    verifyPromptIntegrity
} from '@/lib/api/zgStorage'
import {
    AlertTriangle,
    CheckCircle,
    Download,
    History,
    Shield,
    Upload
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface PromptManagerProps {
  agentId?: string
  onPromptStored?: (storedPrompt: StorageResult) => void
}

export function PromptManager({ agentId, onPromptStored }: PromptManagerProps) {
  const [prompt, setPrompt] = useState<Partial<AgentPrompt>>({
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
  const [storedPrompts, setStoredPrompts] = useState<StorageResult[]>([])
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [storageAvailable, setStorageAvailable] = useState(false)

  // Check 0G Storage availability on component mount
  useEffect(() => {
    const checkStorage = async () => {
      try {
        const status = await getStorageStatus()
        setStorageAvailable(status.serviceAvailable)
      } catch (err) {
        console.error('Failed to check storage status:', err)
        setStorageAvailable(false)
      }
    }
    checkStorage()
  }, [])

  // Validate prompt content in real-time
  useEffect(() => {
    if (prompt.systemPrompt && prompt.systemPrompt.length > 10) {
      const validateAsync = async () => {
        try {
          const result = await validateEducationalContent(prompt as AgentPrompt)
          setValidation(result)
        } catch (err) {
          console.error('Validation error:', err)
          setValidation(null)
        }
      }
      validateAsync()
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

      const fullPrompt: AgentPrompt = {
        ...prompt,
        createdAt: new Date().toISOString(),
        subjects: prompt.subjects || []
      } as AgentPrompt

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

  const handleVerifyPrompt = async (storedPrompt: StorageResult) => {
    try {
      setLoading(true)
      setError(null)
      
      const isValid = await verifyPromptIntegrity(prompt as AgentPrompt, storedPrompt.rootHash)
      
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

  const handleGenerateTestPrompt = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const testPrompt = await generateTestPrompt(prompt.agentId || 'test-agent')
      setPrompt(testPrompt)
      setSuccess('Test prompt generated successfully')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate test prompt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Alerts */}
      {!storageAvailable && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            0G Storage not available. Check your API configuration.
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
                    value={prompt.agentId || ''}
                    onChange={(e) => setPrompt({ ...prompt, agentId: e.target.value })}
                    placeholder="math-tutor-v1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    value={prompt.agentName || ''}
                    onChange={(e) => setPrompt({ ...prompt, agentName: e.target.value })}
                    placeholder="Math Tutor"
                  />
                </div>
              </div>

              {/* Educational Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="educationalLevel">Educational Level</Label>
                  <Select 
                    value={prompt.educationalLevel || ''} 
                    onValueChange={(value) => setPrompt({ ...prompt, educationalLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elementary">Elementary</SelectItem>
                      <SelectItem value="middle">Middle School</SelectItem>
                      <SelectItem value="high">High School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="safetyRating">Safety Rating</Label>
                  <Select 
                    value={prompt.safetyRating || ''} 
                    onValueChange={(value) => setPrompt({ ...prompt, safetyRating: value as 'safe' | 'reviewed' | 'pending' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safe">Safe</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={prompt.systemPrompt || ''}
                  onChange={(e) => setPrompt({ ...prompt, systemPrompt: e.target.value })}
                  placeholder="You are a helpful AI tutor..."
                  rows={8}
                />
              </div>

              {/* Subjects */}
              <div className="space-y-2">
                <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                <Input
                  id="subjects"
                  value={prompt.subjects?.join(', ') || ''}
                  onChange={(e) => setPrompt({ ...prompt, subjects: e.target.value.split(', ').filter(s => s.trim()) })}
                  placeholder="math, algebra, geometry"
                />
              </div>

              {/* Private Key */}
              <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key (for 0G Storage)</Label>
                <Input
                  id="privateKey"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Your private key for signing transactions"
                />
              </div>

              {/* Validation Results */}
              {validation && (
                <Alert variant={validation.isValid ? "default" : "destructive"}>
                  {validation.isValid ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertDescription>
                    {validation.isValid ? 'Content validation passed' : 'Content validation failed'}
                    {validation.issues.length > 0 && (
                      <ul className="mt-2 list-disc pl-5 space-y-1">
                        {validation.issues.map((issue, index) => (
                          <li key={index} className="text-sm">{issue}</li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleStorePrompt} 
                  disabled={loading || !validation?.isValid}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Store on 0G Storage
                </Button>
                <Button 
                  onClick={handleGenerateTestPrompt}
                  variant="outline"
                  disabled={loading}
                >
                  Generate Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* @ts-ignore */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Retrieve & Verify Prompts</CardTitle>
              <CardDescription>
                Fetch and verify AI tutor prompts from 0G Storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rootHash">Root Hash</Label>
                <div className="flex gap-2">
                  <Input
                    id="rootHash"
                    placeholder="Enter 0G Storage root hash"
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => {
                      const input = document.getElementById('rootHash') as HTMLInputElement
                      if (input?.value) {
                        handleRetrievePrompt(input.value)
                      }
                    }}
                    disabled={loading}
                  >
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
                Stored Prompts
              </CardTitle>
              <CardDescription>
                History of prompts stored on 0G Storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {storedPrompts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No stored prompts yet. Create and store your first prompt above.
                </div>
              ) : (
                <div className="space-y-4">
                  {storedPrompts.map((storedPrompt, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{storedPrompt.agentId}</h3>
                          <p className="text-sm text-gray-600">Version {storedPrompt.version}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVerifyPrompt(storedPrompt)}
                            disabled={loading}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Root Hash:</strong> {storedPrompt.rootHash}</p>
                        <p><strong>TX Hash:</strong> {storedPrompt.txHash}</p>
                        <p><strong>Uploaded:</strong> {new Date(storedPrompt.uploadedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={storedPrompt.verified ? "default" : "secondary"}>
                          {storedPrompt.verified ? "Verified" : "Unverified"}
                        </Badge>
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