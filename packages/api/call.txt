"use client"

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Loader2, Key, Copy, AlertCircle, Eye, EyeOff, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { client } from '@/lib/client'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useLoading } from '@/contexts/LoadingContext'

interface ApiKey {
  id: string
  key: string
  name: string
  createdAt: Date
  lastUsedAt: Date
}

export default function ApiKeySettings() {
  const [keyName, setKeyName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const { setIsLoading, setLoadingMessage, renderSkeleton } = useLoading()

  // Fetch current API key
  const { 
    data: apiKeyResponse, 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['currentApiKey'],
    queryFn: async () => {
      const response = await client.apiKey.getCurrentKey.$get()
      const data = await response.json()
      return data as { data: ApiKey | null }
    }
  })

  // Set global loading state when this component is loading
  useEffect(() => {
    if (isLoading) {
      setLoadingMessage('Loading API Key settings...')
    }
    setIsLoading(isLoading)
  }, [isLoading, setIsLoading, setLoadingMessage])

  const apiKey = apiKeyResponse?.data

  // Create new API key
  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await client.apiKey.create.$post({ name })
      const data = await response.json()
      return data
    },
    onSuccess: () => {
      toast.success('API key created successfully')
      setKeyName('')
      setIsCreating(false)
      refetch()
    },
    onError: () => {
      toast.error('Failed to create API key')
      setIsCreating(false)
    }
  })

  // Revoke API key
  const revokeKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await client.apiKey.revoke.$post()
      const data = await response.json()
      return data
    },
    onSuccess: () => {
      toast.success('API key revoked successfully')
      refetch()
    },
    onError: () => {
      toast.error('Failed to revoke API key')
    }
  })

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyName.trim()) {
      toast.error('Please enter a key name')
      return
    }
    setIsCreating(true)
    createKeyMutation.mutate(keyName)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('API key copied to clipboard')
  }

  // Remove the local loading UI code
  // if (isLoading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
  //       <Loader2 className="h-6 w-6 text-zinc-400 animate-spin" />
  //       <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
  //         Loading API key information...
  //       </p>
  //     </div>
  //   )
  // }

  // Render the content based on loading state
  const renderContent = () => {
    if (isLoading) {
      return renderSkeleton('card', 1);
    }

    return (
      <>
        <Alert variant="destructive" className="bg-background dark:bg-background border-zinc-200 dark:border-zinc-900">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700 dark:text-red-500">
            API keys provide full access to your account. Keep them secure and never share them with anyone.
          </AlertDescription>
        </Alert>

        {apiKey ? (
          <Card className="border-zinc-200 dark:border-zinc-800  min-h-[250px] w-full shadow-none">
            <CardHeader className="pb-3 pt-4 px-5 flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-zinc-900 dark:text-white text-sm flex items-center gap-2">
                  <Key className="h-4 w-4 text-zinc-500" />
                  {apiKey.name}
                </CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
                  Created on {new Date(apiKey.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"

                onClick={() => revokeKeyMutation.mutate()}
                disabled={revokeKeyMutation.isPending}
                className="h-8 text-xs bg-red-600 hover:bg-red-700 cursor-pointer text-white dark:bg-red-600 dark:text-white dark:hover:bg-red-700"
              >
                {revokeKeyMutation.isPending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  'Revoke Key'
                )}
              </Button>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-zinc-100 dark:bg-zinc-950/20 rounded-lg text-sm ">
                    {showKey ? apiKey.key : '••••••••••••••••'}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowKey(!showKey)}
                    className="bg-zinc-100 dark:bg-zinc-800"
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(apiKey.key)}
                    className="bg-zinc-100 dark:bg-zinc-800"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Separator />
                <div className="text-xs text-muted-foreground">
                  Last used: {apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleString() : 'Never'}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-zinc-200 dark:border-zinc-800  min-h-[250px] shadow-none">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-zinc-900 dark:text-white text-sm">
                Create New API Key
              </CardTitle>
              <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
                Generate a new API key for programmatic access
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter key name (e.g., Production API Key)"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-zinc-500 hover:bg-zinc-800 cursor-pointer text-white dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-950"
                  disabled={isCreating || !keyName.trim()}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  return (
    <div className="w-full mx-auto">
      <div className="w-full space-y-4 pr-4">
        <header className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg ">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                API Key Management
              </h2>
              <Badge variant="destructive" className="ml-2 flex items-center text-white dark:bg-red-950 bg-red-500 gap-1">
                <Terminal className="h-3.5 w-3.5" />
                API Access
              </Badge>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Manage your API keys for programmatic access to your account
          </p>
        </header>

        {renderContent()}
      </div>
    </div>
  )
}