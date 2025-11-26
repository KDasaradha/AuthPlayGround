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
  Building, 
  Check, 
  X, 
  Key, 
  Shield, 
  FileText, 
  Globe,
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle,
  Settings,
  Upload,
  Download,
  Eye,
  EyeOff,
  Link,
  Code,
  Lock,
  UserCheck
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SAMLPage() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [spEntityId, setSpEntityId] = useState("")
  const [idpEntityId, setIdpEntityId] = useState("")
  const [acsUrl, setAcsUrl] = useState("")
  const [sloUrl, setSloUrl] = useState("")
  const [certificate, setCertificate] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [samlRequest, setSamlRequest] = useState("")
  const [samlResponse, setSamlResponse] = useState("")
  const [showCertificate, setShowCertificate] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState("okta")
  const [attributes, setAttributes] = useState<string[]>([])
  const [userInfo, setUserInfo] = useState(null)
  const { toast } = useToast()

  const samlProviders = [
    { id: "okta", name: "Okta", icon: "🔐", description: "Enterprise identity provider" },
    { id: "azure", name: "Azure AD", icon: "☁️", description: "Microsoft cloud identity" },
    { id: "adfs", name: "AD FS", icon: "🪟", description: "Active Directory Federation Services" },
    { id: "shibboleth", name: "Shibboleth", icon: "🎓", description: "Academic identity federation" },
    { id: "ping", name: "Ping Identity", icon: "🏓", description: "Enterprise IAM solution" },
    { id: "auth0", name: "Auth0", icon: "🔑", description: "Identity platform" }
  ]

  const samlAttributes = [
    { name: "email", friendlyName: "Email Address", required: true },
    { name: "firstName", friendlyName: "First Name", required: true },
    { name: "lastName", friendlyName: "Last Name", required: true },
    { name: "department", friendlyName: "Department", required: false },
    { name: "role", friendlyName: "Role", required: false },
    { name: "groups", friendlyName: "Groups", required: false }
  ]

  const handleConfigureSAML = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/auth/saml/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          spEntityId,
          idpEntityId,
          acsUrl,
          sloUrl,
          certificate,
          privateKey,
          attributes
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsConfigured(true)
        toast({
          title: "SAML Configured",
          description: "SAML configuration has been saved"
        })
      } else {
        toast({
          title: "Configuration Failed",
          description: data.error || "Failed to configure SAML",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to configure SAML",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateSAMLRequest = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/auth/saml/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spEntityId,
          acsUrl,
          attributes
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSamlRequest(data.samlRequest)
        toast({
          title: "SAML Request Generated",
          description: "Authentication request has been created"
        })
      } else {
        toast({
          title: "Generation Failed",
          description: data.error || "Failed to generate SAML request",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate SAML request",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProcessSAMLResponse = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/auth/saml/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          samlResponse,
          certificate
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(true)
        setUserInfo(data.userInfo)
        setAttributes(data.attributes)
        toast({
          title: "Authentication Successful",
          description: "SAML response processed successfully"
        })
      } else {
        toast({
          title: "Authentication Failed",
          description: data.error || "Failed to process SAML response",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process SAML response",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInitiateSLO = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/auth/saml/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spEntityId,
          sloUrl
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(false)
        setUserInfo(null)
        toast({
          title: "Logout Successful",
          description: "SAML Single Logout completed"
        })
      } else {
        toast({
          title: "Logout Failed",
          description: data.error || "Failed to process SLO",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process SLO",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateMetadata = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/auth/saml/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spEntityId,
          acsUrl,
          sloUrl,
          certificate
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Download metadata file
        const blob = new Blob([data.metadata], { type: 'application/xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'saml-metadata.xml'
        a.click()
        URL.revokeObjectURL(url)
        
        toast({
          title: "Metadata Generated",
          description: "SAML metadata file downloaded"
        })
      } else {
        toast({
          title: "Generation Failed",
          description: data.error || "Failed to generate metadata",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate metadata",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleAttribute = (attrName: string) => {
    setAttributes(prev => 
      prev.includes(attrName) 
        ? prev.filter(a => a !== attrName)
        : [...prev, attrName]
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Building className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">SAML Authentication</h1>
          </div>
          <p className="text-xl text-gray-600">Security Assertion Markup Language</p>
          <p className="text-lg text-gray-500 mt-2">Enterprise Single Sign-On (SSO)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main SAML Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  SAML Configuration
                </CardTitle>
                <CardDescription>
                  Configure and test SAML authentication with enterprise providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="configure" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="configure">Configure</TabsTrigger>
                    <TabsTrigger value="request">Request</TabsTrigger>
                    <TabsTrigger value="response">Response</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="configure" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Identity Provider</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {samlProviders.map((provider) => (
                            <Button
                              key={provider.id}
                              variant={selectedProvider === provider.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedProvider(provider.id)}
                              className="flex items-center gap-2"
                            >
                              <span>{provider.icon}</span>
                              <div className="text-left">
                                <div className="font-medium">{provider.name}</div>
                                <div className="text-xs text-gray-500">{provider.description}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sp-entity-id">SP Entity ID</Label>
                          <Input
                            id="sp-entity-id"
                            value={spEntityId}
                            onChange={(e) => setSpEntityId(e.target.value)}
                            placeholder="https://yourapp.com/saml"
                          />
                        </div>
                        <div>
                          <Label htmlFor="idp-entity-id">IdP Entity ID</Label>
                          <Input
                            id="idp-entity-id"
                            value={idpEntityId}
                            onChange={(e) => setIdpEntityId(e.target.value)}
                            placeholder="https://idp.example.com"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="acs-url">ACS URL</Label>
                          <Input
                            id="acs-url"
                            value={acsUrl}
                            onChange={(e) => setAcsUrl(e.target.value)}
                            placeholder="https://yourapp.com/saml/acs"
                          />
                        </div>
                        <div>
                          <Label htmlFor="slo-url">SLO URL</Label>
                          <Input
                            id="slo-url"
                            value={sloUrl}
                            onChange={(e) => setSloUrl(e.target.value)}
                            placeholder="https://yourapp.com/saml/slo"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="certificate">X.509 Certificate</Label>
                        <div className="flex gap-2">
                          <Input
                            id="certificate"
                            type={showCertificate ? "text" : "password"}
                            value={certificate}
                            onChange={(e) => setCertificate(e.target.value)}
                            placeholder="-----BEGIN CERTIFICATE-----"
                            className="font-mono text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowCertificate(!showCertificate)}
                          >
                            {showCertificate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="private-key">Private Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="private-key"
                            type={showPrivateKey ? "text" : "password"}
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            placeholder="-----BEGIN PRIVATE KEY-----"
                            className="font-mono text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                          >
                            {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>SAML Attributes</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {samlAttributes.map((attr) => (
                            <Button
                              key={attr.name}
                              variant={attributes.includes(attr.name) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleAttribute(attr.name)}
                              className="flex items-center gap-2 justify-start"
                            >
                              {attr.required && <span className="text-red-500">*</span>}
                              <span>{attr.friendlyName}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleConfigureSAML}
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
                            Configure SAML
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="request" className="space-y-4">
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Generate a SAML authentication request to send to the Identity Provider
                        </AlertDescription>
                      </Alert>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          onClick={handleGenerateSAMLRequest}
                          disabled={isProcessing || !spEntityId || !acsUrl}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <FileText className="mr-2 h-4 w-4" />
                              Generate SAML Request
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          onClick={() => {
                            if (samlRequest) {
                              navigator.clipboard.writeText(samlRequest)
                              toast({
                                title: "Copied",
                                description: "SAML request copied to clipboard"
                              })
                            }
                          }}
                          disabled={!samlRequest}
                          variant="outline"
                          className="w-full"
                        >
                          <Link className="mr-2 h-4 w-4" />
                          Copy Request
                        </Button>
                      </div>
                      
                      {samlRequest && (
                        <div className="space-y-2">
                          <Label>SAML Request (Base64)</Label>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                              {samlRequest}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="response" className="space-y-4">
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Process a SAML response received from the Identity Provider
                        </AlertDescription>
                      </Alert>
                      
                      <div>
                        <Label htmlFor="saml-response">SAML Response</Label>
                        <textarea
                          id="saml-response"
                          value={samlResponse}
                          onChange={(e) => setSamlResponse(e.target.value)}
                          placeholder="Paste SAML response here..."
                          className="w-full h-32 p-3 border rounded-md font-mono text-sm"
                        />
                      </div>
                      
                      <Button 
                        onClick={handleProcessSAMLResponse}
                        disabled={isProcessing || !samlResponse}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Process SAML Response
                          </>
                        )}
                      </Button>
                      
                      {isAuthenticated && userInfo && (
                        <div className="space-y-4">
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              SAML authentication successful! User attributes extracted.
                            </AlertDescription>
                          </Alert>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">User Attributes</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {Object.entries(userInfo).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="font-medium">{key}:</span>
                                    <span className="font-mono text-sm">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="metadata" className="space-y-4">
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Generate SAML metadata XML file for your Service Provider
                        </AlertDescription>
                      </Alert>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          onClick={handleGenerateMetadata}
                          disabled={isProcessing || !spEntityId || !acsUrl}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Generate Metadata
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          onClick={() => {
                            window.open('/saml-metadata.xml', '_blank')
                          }}
                          disabled={!spEntityId}
                          variant="outline"
                          className="w-full"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview Metadata
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Metadata Information</h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Entity ID:</strong> {spEntityId || "Not configured"}</div>
                          <div><strong>ACS URL:</strong> {acsUrl || "Not configured"}</div>
                          <div><strong>SLO URL:</strong> {sloUrl || "Not configured"}</div>
                          <div><strong>Attributes:</strong> {attributes.length} selected</div>
                        </div>
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
                  <span>SAML Status</span>
                  <Badge variant={isAuthenticated ? "default" : "secondary"}>
                    {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Configuration</span>
                  <Badge variant={isConfigured ? "default" : "secondary"}>
                    {isConfigured ? "Configured" : "Not Configured"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Provider</span>
                  <span className="font-mono text-sm">{selectedProvider}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Attributes</span>
                  <span className="font-mono text-sm">{attributes.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  SAML Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Single Sign-On</p>
                      <p className="text-sm text-gray-600">One login for multiple applications</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Enterprise Ready</p>
                      <p className="text-sm text-gray-600">Integrates with corporate IdPs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Standardized</p>
                      <p className="text-sm text-gray-600">Industry-standard protocol</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Secure</p>
                      <p className="text-sm text-gray-600">XML-based security assertions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  SAML Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">1</div>
                    <span>User accesses SP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">2</div>
                    <span>SP generates SAML request</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">3</div>
                    <span>Redirect to IdP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">4</div>
                    <span>IdP authenticates user</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">5</div>
                    <span>IdP returns SAML response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">6</div>
                    <span>SP validates response</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Session Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleInitiateSLO}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Single Logout (SLO)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}