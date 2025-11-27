"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Globe,
  Check,
  X,
  Key,
  Shield,
  ExternalLink,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Code,
  Settings,
  User,
  Lock,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import BackButton from "@/components/ui/back-button"

interface TokenInfo {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  tokenType?: string
  scope?: string
}

interface UserInfo {
  id: string
  name: string
  email: string
  provider: string
  verified: boolean
  scope: string
}

export default function OAuth2Page() {
  const [isConnected, setIsConnected] = useState(false)
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [redirectUri, setRedirectUri] = useState("")
  const [authCode, setAuthCode] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [refreshToken, setRefreshToken] = useState("")
  const [showSecret, setShowSecret] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState("google")
  const [scopes, setScopes] = useState(["profile", "email"])
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const { toast } = useToast()

  const providers = [
    { id: "google", name: "Google", icon: "🔍", color: "from-blue-500 to-blue-600" },
    { id: "github", name: "GitHub", icon: "🐙", color: "from-gray-700 to-gray-900" },
    { id: "microsoft", name: "Microsoft", icon: "🪟", color: "from-blue-600 to-blue-800" },
    { id: "facebook", name: "Facebook", icon: "📘", color: "from-blue-500 to-blue-700" }
  ]

  const availableScopes = [
    "profile", "email", "openid", "address", "phone",
    "read", "write", "admin", "offline_access"
  ]

  const handleGenerateCredentials = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/oauth2/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider })
      })

      const data = await response.json()

      if (data.success) {
        setClientId(data.clientId)
        setClientSecret(data.clientSecret)
        setRedirectUri(data.redirectUri)
        toast({
          title: "Credentials Generated",
          description: "OAuth2 credentials have been generated"
        })
      } else {
        toast({
          title: "Generation Failed",
          description: data.error || "Failed to generate credentials",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate credentials",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAuthorize = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/oauth2/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          redirectUri,
          scopes,
          provider: selectedProvider
        })
      })

      const data = await response.json()

      if (data.success) {
        setAuthCode(data.authCode)
        toast({
          title: "Authorization Successful",
          description: "Authorization code received"
        })
      } else {
        toast({
          title: "Authorization Failed",
          description: data.error || "Failed to authorize",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to authorize",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExchangeToken = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
          authCode,
          redirectUri,
          grantType: "authorization_code"
        })
      })

      const data = await response.json()

      if (data.success) {
        setAccessToken(data.accessToken)
        setRefreshToken(data.refreshToken)
        setTokenInfo(data.tokenInfo)
        setIsConnected(true)
        toast({
          title: "Token Exchange Successful",
          description: "Access token received"
        })
      } else {
        toast({
          title: "Token Exchange Failed",
          description: data.error || "Failed to exchange token",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to exchange token",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRefreshToken = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/oauth2/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
          refreshToken
        })
      })

      const data = await response.json()

      if (data.success) {
        setAccessToken(data.accessToken)
        setTokenInfo(data.tokenInfo)
        toast({
          title: "Token Refreshed",
          description: "Access token has been refreshed"
        })
      } else {
        toast({
          title: "Refresh Failed",
          description: data.error || "Failed to refresh token",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh token",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGetUserInfo = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/oauth2/userinfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setUserInfo(data.userInfo)
        toast({
          title: "User Info Retrieved",
          description: "User information has been fetched"
        })
      } else {
        toast({
          title: "Fetch Failed",
          description: data.error || "Failed to fetch user info",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user info",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRevokeToken = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/oauth2/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
          token: accessToken
        })
      })

      const data = await response.json()

      if (data.success) {
        setAccessToken("")
        setRefreshToken("")
        setTokenInfo(null)
        setUserInfo(null)
        setIsConnected(false)
        toast({
          title: "Token Revoked",
          description: "Access token has been revoked"
        })
      } else {
        toast({
          title: "Revoke Failed",
          description: data.error || "Failed to revoke token",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke token",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${type} copied to clipboard`
    })
  }

  const toggleScope = (scope: string) => {
    setScopes(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Globe className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">OAuth2 Authentication</h1>
          </div>
          <p className="text-xl text-gray-600">OAuth2 Authorization Framework Playground</p>
          <p className="text-lg text-gray-500 mt-2">Learn OAuth2 flow with interactive examples</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main OAuth2 Flow Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  OAuth2 Flow
                </CardTitle>
                <CardDescription>
                  Complete OAuth2 authorization code flow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="setup" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="setup">Setup</TabsTrigger>
                    <TabsTrigger value="authorize">Authorize</TabsTrigger>
                    <TabsTrigger value="token">Token</TabsTrigger>
                    <TabsTrigger value="access">Access</TabsTrigger>
                  </TabsList>

                  <TabsContent value="setup" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>OAuth Provider</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {providers.map((provider) => (
                            <Button
                              key={provider.id}
                              variant={selectedProvider === provider.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedProvider(provider.id)}
                              className="flex items-center gap-2"
                            >
                              <span>{provider.icon}</span>
                              {provider.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="client-id">Client ID</Label>
                          <div className="flex gap-2">
                            <Input
                              id="client-id"
                              value={clientId}
                              onChange={(e) => setClientId(e.target.value)}
                              placeholder="Enter client ID"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyToClipboard(clientId, "Client ID")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="client-secret">Client Secret</Label>
                          <div className="flex gap-2">
                            <Input
                              id="client-secret"
                              type={showSecret ? "text" : "password"}
                              value={clientSecret}
                              onChange={(e) => setClientSecret(e.target.value)}
                              placeholder="Enter client secret"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowSecret(!showSecret)}
                            >
                              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="redirect-uri">Redirect URI</Label>
                        <Input
                          id="redirect-uri"
                          value={redirectUri}
                          onChange={(e) => setRedirectUri(e.target.value)}
                          placeholder="https://yourapp.com/callback"
                        />
                      </div>

                      <div>
                        <Label>Scopes</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {availableScopes.map((scope) => (
                            <Button
                              key={scope}
                              variant={scopes.includes(scope) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleScope(scope)}
                            >
                              {scope}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleGenerateCredentials}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Key className="mr-2 h-4 w-4" />
                            Generate Credentials
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="authorize" className="space-y-4">
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Click authorize to simulate the OAuth2 authorization step
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Client ID</Label>
                          <Input value={clientId} readOnly />
                        </div>
                        <div>
                          <Label>Redirect URI</Label>
                          <Input value={redirectUri} readOnly />
                        </div>
                      </div>

                      <div>
                        <Label>Selected Scopes</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {scopes.map((scope) => (
                            <Badge key={scope} variant="secondary">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleAuthorize}
                        disabled={isProcessing || !clientId || !redirectUri}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Authorizing...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Authorize with {providers.find(p => p.id === selectedProvider)?.name}
                          </>
                        )}
                      </Button>

                      {authCode && (
                        <div className="space-y-2">
                          <Label>Authorization Code</Label>
                          <div className="flex gap-2">
                            <Input value={authCode} readOnly />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyToClipboard(authCode, "Authorization Code")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="token" className="space-y-4">
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Exchange authorization code for access token
                        </AlertDescription>
                      </Alert>

                      <div>
                        <Label>Authorization Code</Label>
                        <Input value={authCode} readOnly />
                      </div>

                      <Button
                        onClick={handleExchangeToken}
                        disabled={isProcessing || !authCode}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Exchanging...
                          </>
                        ) : (
                          <>
                            <Key className="mr-2 h-4 w-4" />
                            Exchange for Token
                          </>
                        )}
                      </Button>

                      {accessToken && (
                        <div className="space-y-4">
                          <div>
                            <Label>Access Token</Label>
                            <div className="flex gap-2">
                              <Input value={accessToken} readOnly type="password" />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyToClipboard(accessToken, "Access Token")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {refreshToken && (
                            <div>
                              <Label>Refresh Token</Label>
                              <div className="flex gap-2">
                                <Input value={refreshToken} readOnly type="password" />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyToClipboard(refreshToken, "Refresh Token")}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          <Button
                            onClick={handleRefreshToken}
                            disabled={isProcessing || !refreshToken}
                            variant="outline"
                            className="w-full"
                          >
                            {isProcessing ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Refreshing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh Token
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="access" className="space-y-4">
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Use access token to fetch user information
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          onClick={handleGetUserInfo}
                          disabled={isProcessing || !accessToken}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Fetching...
                            </>
                          ) : (
                            <>
                              <User className="mr-2 h-4 w-4" />
                              Get User Info
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={handleRevokeToken}
                          disabled={isProcessing || !accessToken}
                          variant="destructive"
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Revoking...
                            </>
                          ) : (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Revoke Token
                            </>
                          )}
                        </Button>
                      </div>

                      {userInfo && (
                        <div className="space-y-4">
                          <Label>User Information</Label>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="h-6 w-6 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">{userInfo.name}</p>
                                    <p className="text-sm text-gray-500">{userInfo.email}</p>
                                  </div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">ID:</span> {userInfo.id}
                                  </div>
                                  <div>
                                    <span className="font-medium">Provider:</span> {userInfo.provider}
                                  </div>
                                  <div>
                                    <span className="font-medium">Verified:</span> {userInfo.verified ? "Yes" : "No"}
                                  </div>
                                  <div>
                                    <span className="font-medium">Scope:</span> {userInfo.scope}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>OAuth2 Status</span>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Provider</span>
                    <span className="flex items-center gap-1">
                      {providers.find(p => p.id === selectedProvider)?.icon}
                      {providers.find(p => p.id === selectedProvider)?.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Client ID</span>
                    <span className="text-sm font-mono truncate max-w-[100px]">
                      {clientId || "Not set"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Access Token</span>
                    <span className="text-sm font-mono truncate max-w-[100px]">
                      {accessToken ? "••••••••" : "None"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Refresh Token</span>
                    <span className="text-sm font-mono truncate max-w-[100px]">
                      {refreshToken ? "••••••••" : "None"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  OAuth2 Flow Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${clientId ? 'bg-green-500' : 'bg-gray-300'}`}>
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Register App</p>
                      <p className="text-sm text-gray-500">Get client credentials</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${authCode ? 'bg-green-500' : 'bg-gray-300'}`}>
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Authorize</p>
                      <p className="text-sm text-gray-500">Get authorization code</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${accessToken ? 'bg-green-500' : 'bg-gray-300'}`}>
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Exchange Token</p>
                      <p className="text-sm text-gray-500">Code for access token</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${userInfo ? 'bg-green-500' : 'bg-gray-300'}`}>
                      4
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Access Resources</p>
                      <p className="text-sm text-gray-500">Use token to get data</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Grant Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">Authorization Code</p>
                    <p className="text-sm text-blue-700">Most secure, recommended for web apps</p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">Client Credentials</p>
                    <p className="text-sm text-green-700">For service-to-service communication</p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900">Refresh Token</p>
                    <p className="text-sm text-purple-700">Get new access tokens</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}