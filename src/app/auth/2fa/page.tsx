"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Shield, Check, X, Key, Smartphone, Mail, Clock, RefreshCw, User, Lock, Settings, AlertCircle, CheckCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import BackButton from "@/components/ui/back-button"

export default function TwoFactorAuthPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState("totp")
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [backupCodes, setBackupCodes] = useState([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  type TrustedDevice = { id: string; name: string }
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([])
  const [newDeviceName, setNewDeviceName] = useState("")
  const { toast } = useToast()

  // Simulate countdown for TOTP
  useEffect(() => {
    if (is2FAEnabled && isAuthenticated) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [is2FAEnabled, isAuthenticated])

  const handleLogin = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/auth/2fa/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (data.requires2FA) {
          toast({
            title: "2FA Required",
            description: "Please complete your second factor authentication"
          })
        } else {
          setIsAuthenticated(true)
          setIs2FAEnabled(data.has2FA)
          toast({
            title: "Login Successful",
            description: "You are now authenticated"
          })
        }
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
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

  const handleEnable2FA = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: selectedMethod })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIs2FAEnabled(true)
        if (data.backupCodes) {
          setBackupCodes(data.backupCodes)
        }
        toast({
          title: "2FA Enabled",
          description: `${selectedMethod.toUpperCase()} authentication is now active`
        })
      } else {
        toast({
          title: "Setup Failed",
          description: data.error || "Failed to enable 2FA",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to setup 2FA",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVerifyCode = async (code: string) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, method: selectedMethod })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(true)
        toast({
          title: "Verification Successful",
          description: "You are now fully authenticated"
        })
      } else {
        toast({
          title: "Verification Failed",
          description: data.error || "Invalid code",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDisable2FA = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIs2FAEnabled(false)
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled"
        })
      } else {
        toast({
          title: "Disable Failed",
          description: data.error || "Failed to disable 2FA",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddTrustedDevice = async () => {
    if (!newDeviceName.trim()) return
    
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/auth/2fa/trusted-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceName: newDeviceName })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTrustedDevices([...trustedDevices, data.device])
        setNewDeviceName("")
        toast({
          title: "Device Added",
          description: "Trusted device has been added successfully"
        })
      } else {
        toast({
          title: "Add Failed",
          description: data.error || "Failed to add trusted device",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add trusted device",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveTrustedDevice = async (deviceId: string) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch(`/api/auth/2fa/trusted-device/${deviceId}`, {
        method: "DELETE"
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTrustedDevices(trustedDevices.filter(d => d.id !== deviceId))
        toast({
          title: "Device Removed",
          description: "Trusted device has been removed"
        })
      } else {
        toast({
          title: "Remove Failed",
          description: data.error || "Failed to remove trusted device",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove trusted device",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateBackupCodes = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/auth/2fa/backup-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setBackupCodes(data.codes)
        setShowBackupCodes(true)
        toast({
          title: "Backup Codes Generated",
          description: "New backup codes have been generated"
        })
      } else {
        toast({
          title: "Generation Failed",
          description: data.error || "Failed to generate backup codes",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate backup codes",
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
            <Shield className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">2FA Authentication</h1>
          </div>
          <p className="text-xl text-gray-600">Two-Factor Authentication Playground</p>
          <p className="text-lg text-gray-500 mt-2">Add an extra layer of security to your account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Authentication Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Authentication
                </CardTitle>
                <CardDescription>
                  Complete two-factor authentication to secure your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isAuthenticated ? (
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="verify">2FA Verify</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                          />
                        </div>
                        <Button 
                          onClick={handleLogin} 
                          disabled={isProcessing}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            <>
                              <User className="mr-2 h-4 w-4" />
                              Sign In
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="verify" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label>2FA Method</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {["totp", "sms", "email", "backup"].map((method) => (
                              <Button
                                key={method}
                                variant={selectedMethod === method ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedMethod(method)}
                                className="flex items-center gap-2"
                              >
                                {method === "totp" && <Smartphone className="h-4 w-4" />}
                                {method === "sms" && <Mail className="h-4 w-4" />}
                                {method === "email" && <Mail className="h-4 w-4" />}
                                {method === "backup" && <Key className="h-4 w-4" />}
                                {method.toUpperCase()}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        {selectedMethod === "totp" && (
                          <div>
                            <Label htmlFor="totp-code">TOTP Code</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="totp-code"
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                              />
                              <div className="text-sm text-gray-500 min-w-[60px]">
                                {timeLeft}s
                              </div>
                            </div>
                            <Progress value={(timeLeft / 30) * 100} className="mt-2" />
                          </div>
                        )}
                        
                        {selectedMethod === "sms" && (
                          <div>
                            <Label htmlFor="sms-code">SMS Code</Label>
                            <Input
                              id="sms-code"
                              type="text"
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                            />
                          </div>
                        )}
                        
                        {selectedMethod === "email" && (
                          <div>
                            <Label htmlFor="email-code">Email Code</Label>
                            <Input
                              id="email-code"
                              type="text"
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                            />
                          </div>
                        )}
                        
                        {selectedMethod === "backup" && (
                          <div>
                            <Label htmlFor="backup-code">Backup Code</Label>
                            <Input
                              id="backup-code"
                              type="text"
                              value={backupCode}
                              onChange={(e) => setBackupCode(e.target.value)}
                              placeholder="Enter 8-digit backup code"
                              maxLength={8}
                            />
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => {
                            const codeInput = document.getElementById(
                              selectedMethod === "totp" ? "totp-code" :
                              selectedMethod === "sms" ? "sms-code" :
                              selectedMethod === "email" ? "email-code" : "backup-code"
                            ) as HTMLInputElement
                            const code = codeInput?.value || backupCode
                            handleVerifyCode(code)
                          }}
                          disabled={isProcessing}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Verify Code
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="space-y-6">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        You are successfully authenticated with 2FA!
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">2FA Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span>Two-Factor Auth</span>
                            <Badge variant={is2FAEnabled ? "default" : "secondary"}>
                              {is2FAEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            {selectedMethod === "totp" && <Smartphone className="h-4 w-4" />}
                            {selectedMethod === "sms" && <Mail className="h-4 w-4" />}
                            {selectedMethod === "email" && <Mail className="h-4 w-4" />}
                            {selectedMethod === "backup" && <Key className="h-4 w-4" />}
                            <span className="capitalize">{selectedMethod}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setIsAuthenticated(false)
                        setIs2FAEnabled(false)
                        setUsername("")
                        setPassword("")
                        setBackupCode("")
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  2FA Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!is2FAEnabled ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Enable 2FA Method</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {["totp", "sms", "email"].map((method) => (
                          <Button
                            key={method}
                            variant={selectedMethod === method ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedMethod(method)}
                            className="flex items-center gap-2 justify-start"
                          >
                            {method === "totp" && <Smartphone className="h-4 w-4" />}
                            {method === "sms" && <Mail className="h-4 w-4" />}
                            {method === "email" && <Mail className="h-4 w-4" />}
                            <span className="capitalize">{method}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleEnable2FA}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Enabling...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          Enable 2FA
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        2FA is currently enabled with {selectedMethod} method
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      onClick={handleDisable2FA}
                      disabled={isProcessing}
                      variant="destructive"
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Disabling...
                        </>
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Disable 2FA
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Backup Codes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleGenerateBackupCodes}
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
                      Generate Backup Codes
                    </>
                  )}
                </Button>
                
                {showBackupCodes && backupCodes.length > 0 && (
                  <div className="space-y-2">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Save these backup codes in a safe place
                      </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="font-mono bg-gray-50 p-2 rounded">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Trusted Devices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Device name"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                  />
                  <Button 
                    onClick={handleAddTrustedDevice}
                    disabled={isProcessing || !newDeviceName.trim()}
                    size="sm"
                    className="w-full"
                  >
                    Add Device
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  {trustedDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{device.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTrustedDevice(device.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}