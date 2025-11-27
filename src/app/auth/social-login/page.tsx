"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Check,
  X,
  User,
  Mail,
  Globe,
  Github,
  Chrome,
  Shield,
  ExternalLink,
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle,
  Settings,
  UserPlus,
  UserCheck,
  Link,
  Eye,
  EyeOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import BackButton from "@/components/ui/back-button"

export default function SocialLoginPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState("google")
  const [userInfo, setUserInfo] = useState<{
    name: string
    email: string
    provider: string
    id: string
    verified: boolean
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [redirectUri, setRedirectUri] = useState("")
  const [connectedProviders, setConnectedProviders] = useState<string[]>([])
  const { toast } = useToast()

  const socialProviders = [
    {
      id: "google",
      name: "Google",
      icon: <Chrome className="h-5 w-5" />,
      color: "from-blue-500 to-blue-600",
      description: "Sign in with Google account",
      scopes: ["profile", "email", "openid"]
    },
    {
      id: "github",
      name: "GitHub",
      icon: <Github className="h-5 w-5" />,
      color: "from-gray-700 to-gray-900",
      description: "Sign in with GitHub account",
      scopes: ["user", "user:email"]
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Users className="h-5 w-5" />,
      color: "from-blue-600 to-blue-800",
      description: "Sign in with Facebook account",
      scopes: ["email", "public_profile"]
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: <Globe className="h-5 w-5" />,
      color: "from-sky-400 to-sky-600",
      description: "Sign in with X (Twitter) account",
      scopes: ["users.read", "tweet.read"]
    },
    {
      id: "microsoft",
      name: "Microsoft",
      icon: <Shield className="h-5 w-5" />,
      color: "from-green-500 to-green-700",
      description: "Sign in with Microsoft account",
      scopes: ["profile", "email", "openid"]
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <User className="h-5 w-5" />,
      color: "from-blue-500 to-blue-700",
      description: "Sign in with LinkedIn account",
      scopes: ["profile", "email"]
    }
  ]

  const handleConfigureProvider = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/social-login/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider, redirectUri })
      })

      const data = await response.json()

      if (data.success) {
        setApiKey(data.apiKey)
        toast({
          title: "Provider Configured",
          description: `${selectedProvider} has been configured successfully`
        })
      } else {
        toast({
          title: "Configuration Failed",
          description: data.error || "Failed to configure provider",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to configure provider",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSocialLogin = async (providerId: string) => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/social-login/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerId })
      })

      const data = await response.json()

      if (data.success) {
        setUserInfo(data.userInfo)
        setIsConnected(true)
        setConnectedProviders([...connectedProviders, providerId])
        toast({
          title: "Login Successful",
          description: `Successfully authenticated with ${providerId}`
        })
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Failed to authenticate",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to authenticate",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDisconnect = async (providerId: string) => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/social-login/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerId })
      })

      const data = await response.json()

      if (data.success) {
        setConnectedProviders(connectedProviders.filter(p => p !== providerId))
        if (connectedProviders.length === 1) {
          setIsConnected(false)
          setUserInfo(null)
        }
        toast({
          title: "Disconnected",
          description: `Successfully disconnected from ${providerId}`
        })
      } else {
        toast({
          title: "Disconnect Failed",
          description: data.error || "Failed to disconnect",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLinkAccount = async (providerId: string) => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/social-login/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerId })
      })

      const data = await response.json()

      if (data.success) {
        setConnectedProviders([...connectedProviders, providerId])
        toast({
          title: "Account Linked",
          description: `Successfully linked ${providerId} account`
        })
      } else {
        toast({
          title: "Linking Failed",
          description: data.error || "Failed to link account",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to link account",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Users className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Social Login</h1>
          </div>
          <p className="text-xl text-gray-600">Social Authentication Playground</p>
          <p className="text-lg text-gray-500 mt-2">Connect with popular social platforms</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Social Login Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Social Authentication
                </CardTitle>
                <CardDescription>
                  Sign in or link accounts with social providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="providers" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="providers">Providers</TabsTrigger>
                    <TabsTrigger value="configure">Configure</TabsTrigger>
                    <TabsTrigger value="linked">Linked Accounts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="providers" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {socialProviders.map((provider) => (
                        <Card key={provider.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-linear-to-r ${provider.color} text-white`}>
                                  {provider.icon}
                                </div>
                                <div>
                                  <h3 className="font-semibold">{provider.name}</h3>
                                  <p className="text-sm text-gray-500">{provider.description}</p>
                                </div>
                              </div>
                              {connectedProviders.includes(provider.id) && (
                                <Badge variant="default">Connected</Badge>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="text-sm text-gray-600">
                                <strong>Scopes:</strong> {provider.scopes.join(", ")}
                              </div>

                              {connectedProviders.includes(provider.id) ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDisconnect(provider.id)}
                                    disabled={isProcessing}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Disconnect
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSocialLogin(provider.id)}
                                    disabled={isProcessing}
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Switch
                                  </Button>
                                </div>
                              ) : isConnected ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleLinkAccount(provider.id)}
                                  disabled={isProcessing}
                                  className="w-full"
                                >
                                  <Link className="h-4 w-4 mr-2" />
                                  Link Account
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleSocialLogin(provider.id)}
                                  disabled={isProcessing}
                                  className="w-full"
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Sign in with {provider.name}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="configure" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Select Provider</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {socialProviders.map((provider) => (
                            <Button
                              key={provider.id}
                              variant={selectedProvider === provider.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedProvider(provider.id)}
                              className="flex items-center gap-2"
                            >
                              {provider.icon}
                              {provider.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="redirect-uri">Redirect URI</Label>
                        <Input
                          id="redirect-uri"
                          value={redirectUri}
                          onChange={(e) => setRedirectUri(e.target.value)}
                          placeholder="https://yourapp.com/auth/callback"
                        />
                      </div>

                      <div>
                        <Label htmlFor="api-key">API Key / Client ID</Label>
                        <div className="flex gap-2">
                          <Input
                            id="api-key"
                            type={showApiKey ? "text" : "password"}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter API key or client ID"
                            readOnly
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={handleConfigureProvider}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Configuring...
                          </>
                        ) : (
                          <>
                            <Settings className="mr-2 h-4 w-4" />
                            Configure {socialProviders.find(p => p.id === selectedProvider)?.name}
                          </>
                        )}
                      </Button>

                      {apiKey && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Provider configured successfully! You can now use social login with {selectedProvider}.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="linked" className="space-y-4">
                    <div className="space-y-4">
                      {connectedProviders.length === 0 ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No social accounts linked yet. Sign in with a social provider to get started.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-3">
                          {connectedProviders.map((providerId) => {
                            const provider = socialProviders.find(p => p.id === providerId)
                            if (!provider) return null
                            return (
                              <Card key={providerId}>
                                <CardContent className="pt-6">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg bg-linear-to-r ${provider.color} text-white`}>
                                        {provider.icon}
                                      </div>
                                      <div>
                                        <h3 className="font-semibold">{provider.name}</h3>
                                        <p className="text-sm text-gray-500">Connected account</p>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDisconnect(providerId)}
                                      disabled={isProcessing}
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Disconnect
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
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
                  <UserCheck className="h-5 w-5" />
                  Authentication Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Social Login Status</span>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Linked Accounts</span>
                  <span className="font-mono">{connectedProviders.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Primary Provider</span>
                  <span className="font-mono">
                    {userInfo?.provider || "None"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {userInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{userInfo.name}</p>
                      <p className="text-sm text-gray-500">{userInfo.email}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span className="font-medium">{userInfo.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ID:</span>
                      <span className="font-mono text-xs">{userInfo.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified:</span>
                      <span className="font-medium">{userInfo.verified ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Social Login Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">No Password Required</p>
                      <p className="text-sm text-gray-600">Users don't need to remember another password</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Enhanced Security</p>
                      <p className="text-sm text-gray-600">Leverage provider's security measures</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Quick Onboarding</p>
                      <p className="text-sm text-gray-600">Reduce signup friction significantly</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Profile Data</p>
                      <p className="text-sm text-gray-600">Access verified user information</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Considerations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Always validate the state parameter to prevent CSRF attacks
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Use HTTPS for all OAuth redirects
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Store tokens securely and implement proper expiration
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}