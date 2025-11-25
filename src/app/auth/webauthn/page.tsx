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
  Fingerprint,
  Check,
  X,
  Key,
  Shield,
  Smartphone,
  Laptop,
  Usb,
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle,
  Settings,
  UserPlus,
  UserCheck,
  Eye,
  EyeOff,
  Monitor,
  Tablet
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function WebAuthnPage() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [challenge, setChallenge] = useState("")
  const [credentialId, setCredentialId] = useState("")
  const [publicKey, setPublicKey] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showKeys, setShowKeys] = useState(false)
  const [authenticatorType, setAuthenticatorType] = useState("platform")
  const [userVerification, setUserVerification] = useState("required")
  const [residentKey, setResidentKey] = useState("preferred")
  const [registeredCredentials, setRegisteredCredentials] = useState<Array<{ id: string; type: string; created: string }>>([])
  const [authenticatorInfo, setAuthenticatorInfo] = useState<{ type: string; backupEligible: boolean; transports?: string[]; userVerified: boolean } | null>(null)
  const { toast } = useToast()

  const authenticatorTypes = [
    { id: "platform", name: "Platform", icon: <Laptop className="h-4 w-4" />, description: "Built-in authenticator (Touch ID, Windows Hello)" },
    { id: "cross-platform", name: "Cross-Platform", icon: <Usb className="h-4 w-4" />, description: "USB security key (YubiKey, etc.)" }
  ]

  const verificationOptions = [
    { id: "required", name: "Required", description: "User verification is mandatory" },
    { id: "preferred", name: "Preferred", description: "User verification preferred but not required" },
    { id: "discouraged", name: "Discouraged", description: "User verification not required" }
  ]

  const residentKeyOptions = [
    { id: "required", name: "Required", description: "Must create resident key" },
    { id: "preferred", name: "Preferred", description: "Prefer resident key if supported" },
    { id: "discouraged", name: "Discouraged", description: "Don't create resident key" }
  ]

  const handleRegister = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/webauthn/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          displayName,
          authenticatorType,
          userVerification,
          residentKey
        })
      })

      const data = await response.json()

      if (data.success) {
        setChallenge(data.challenge)
        setCredentialId(data.credentialId)
        setPublicKey(data.publicKey)
        setIsRegistered(true)
        setRegisteredCredentials([...registeredCredentials, {
          id: data.credentialId,
          type: authenticatorType,
          created: new Date().toISOString()
        }])
        toast({
          title: "Registration Successful",
          description: "WebAuthn credential registered successfully"
        })
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "Failed to register credential",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register credential",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAuthenticate = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/webauthn/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          userVerification
        })
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        setAuthenticatorInfo(data.authenticatorInfo)
        toast({
          title: "Authentication Successful",
          description: "WebAuthn authentication completed"
        })
      } else {
        toast({
          title: "Authentication Failed",
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

  const handleRevokeCredential = async (credentialId: string) => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/webauthn/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId })
      })

      const data = await response.json()

      if (data.success) {
        setRegisteredCredentials(registeredCredentials.filter(c => c.id !== credentialId))
        toast({
          title: "Credential Revoked",
          description: "WebAuthn credential has been revoked"
        })
      } else {
        toast({
          title: "Revocation Failed",
          description: data.error || "Failed to revoke credential",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke credential",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const generateChallenge = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/auth/webauthn/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })

      const data = await response.json()

      if (data.success) {
        setChallenge(data.challenge)
        toast({
          title: "Challenge Generated",
          description: "New WebAuthn challenge created"
        })
      } else {
        toast({
          title: "Generation Failed",
          description: data.error || "Failed to generate challenge",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate challenge",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Fingerprint className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">WebAuthn (FIDO2)</h1>
          </div>
          <p className="text-xl text-gray-600">Passwordless Authentication Playground</p>
          <p className="text-lg text-gray-500 mt-2">Biometric and hardware-based authentication</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main WebAuthn Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  WebAuthn Authentication
                </CardTitle>
                <CardDescription>
                  Register and authenticate with biometric or hardware security keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="register" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="register">Register</TabsTrigger>
                    <TabsTrigger value="authenticate">Authenticate</TabsTrigger>
                    <TabsTrigger value="credentials">Credentials</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="register" className="space-y-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="display-name">Display Name</Label>
                          <Input
                            id="display-name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter display name"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Authenticator Type</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {authenticatorTypes.map((type) => (
                            <Button
                              key={type.id}
                              variant={authenticatorType === type.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setAuthenticatorType(type.id)}
                              className="flex items-center gap-2 justify-start"
                            >
                              {type.icon}
                              <div className="text-left">
                                <div className="font-medium">{type.name}</div>
                                <div className="text-xs text-gray-500">{type.description}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>User Verification</Label>
                          <div className="space-y-2 mt-2">
                            {verificationOptions.map((option) => (
                              <Button
                                key={option.id}
                                variant={userVerification === option.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setUserVerification(option.id)}
                                className="w-full justify-start"
                              >
                                <div className="text-left">
                                  <div className="font-medium">{option.name}</div>
                                  <div className="text-xs text-gray-500">{option.description}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>Resident Key</Label>
                          <div className="space-y-2 mt-2">
                            {residentKeyOptions.map((option) => (
                              <Button
                                key={option.id}
                                variant={residentKey === option.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setResidentKey(option.id)}
                                className="w-full justify-start"
                              >
                                <div className="text-left">
                                  <div className="font-medium">{option.name}</div>
                                  <div className="text-xs text-gray-500">{option.description}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleRegister}
                        disabled={isProcessing || !username || !displayName}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Register WebAuthn Credential
                          </>
                        )}
                      </Button>

                      {credentialId && (
                        <div className="space-y-4">
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Credential registered successfully! You can now use WebAuthn to authenticate.
                            </AlertDescription>
                          </Alert>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Credential ID</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={credentialId}
                                  readOnly
                                  type={showKeys ? "text" : "password"}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowKeys(!showKeys)}
                                >
                                  {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label>Challenge</Label>
                              <Input
                                value={challenge}
                                readOnly
                                type={showKeys ? "text" : "password"}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="authenticate" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="auth-username">Username</Label>
                        <Input
                          id="auth-username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter username"
                        />
                      </div>

                      <div>
                        <Label>User Verification</Label>
                        <div className="space-y-2 mt-2">
                          {verificationOptions.map((option) => (
                            <Button
                              key={option.id}
                              variant={userVerification === option.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setUserVerification(option.id)}
                              className="w-full justify-start"
                            >
                              <div className="text-left">
                                <div className="font-medium">{option.name}</div>
                                <div className="text-xs text-gray-500">{option.description}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          onClick={handleAuthenticate}
                          disabled={isProcessing || !username}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Authenticating...
                            </>
                          ) : (
                            <>
                              <Fingerprint className="mr-2 h-4 w-4" />
                              Authenticate with WebAuthn
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={generateChallenge}
                          disabled={isProcessing}
                          variant="outline"
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Generate Challenge
                            </>
                          )}
                        </Button>
                      </div>

                      {isAuthenticated && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Authentication successful! You are now logged in with WebAuthn.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="credentials" className="space-y-4">
                    <div className="space-y-4">
                      {registeredCredentials.length === 0 ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            No WebAuthn credentials registered yet. Register a credential to get started.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-3">
                          {registeredCredentials.map((credential) => (
                            <Card key={credential.id}>
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                      <Key className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">WebAuthn Credential</h3>
                                      <p className="text-sm text-gray-500">
                                        Type: {credential.type} • Created: {new Date(credential.created).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRevokeCredential(credential.id)}
                                    disabled={isProcessing}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Revoke
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          WebAuthn settings allow you to configure how biometric and hardware authentication works.
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Supported Platforms</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Laptop className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">Windows Hello</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">Touch ID / Face ID</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Usb className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">USB Security Keys</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">NFC Security Keys</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Security Features</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Phishing Resistance</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">No Passwords</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Hardware Backed</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Multi-Factor</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
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
                  <span>WebAuthn Status</span>
                  <Badge variant={isAuthenticated ? "default" : "secondary"}>
                    {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Credential Registered</span>
                  <Badge variant={isRegistered ? "default" : "secondary"}>
                    {isRegistered ? "Yes" : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Authenticator Type</span>
                  <span className="font-mono text-sm">{authenticatorType}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>User Verification</span>
                  <span className="font-mono text-sm">{userVerification}</span>
                </div>
              </CardContent>
            </Card>

            {authenticatorInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5" />
                    Authenticator Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{authenticatorInfo.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Backup Eligible:</span>
                      <span className="font-medium">{authenticatorInfo.backupEligible ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transports:</span>
                      <span className="font-medium">{authenticatorInfo.transports?.join(", ") || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UV Flag:</span>
                      <span className="font-medium">{authenticatorInfo.userVerified ? "Verified" : "Not Verified"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  WebAuthn Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Passwordless</p>
                      <p className="text-sm text-gray-600">No passwords to remember or steal</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Phishing Resistant</p>
                      <p className="text-sm text-gray-600">Credentials are bound to origin</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Multi-Factor</p>
                      <p className="text-sm text-gray-600">Something you have + something you are</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Hardware Backed</p>
                      <p className="text-sm text-gray-600">Secure element protection</p>
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
                      Always verify the origin before authenticating
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Use HTTPS for all WebAuthn operations
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Implement proper user verification flows
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