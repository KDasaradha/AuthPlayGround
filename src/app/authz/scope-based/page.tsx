"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Target,
  Shield,
  Key,
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  Play,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Settings,
  BookOpen,
  GitBranch,
  Activity,
  Database,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Crown,
  Zap,
  BarChart3,
  Package,
  CreditCard,
  FileText,
  Users,
  Mail,
  Calendar,
  MapPin,
  Camera,
  Mic,
  Printer
} from "lucide-react"
import BackButton from "@/components/ui/back-button"

interface Scope {
  id: string
  name: string
  description: string
  category: "identity" | "profile" | "contact" | "location" | "device" | "payment" | "content" | "admin" | "custom"
  permissions: string[]
  required: boolean
  sensitive: boolean
  expires_in?: number
  created_at: string
  updated_at: string
}

interface ClientApplication {
  id: string
  name: string
  description: string
  client_id: string
  client_secret?: string
  redirect_uris: string[]
  allowed_scopes: string[]
  default_scopes: string[]
  created_at: string
  updated_at: string
}

interface ScopeGrant {
  id: string
  user_id: string
  client_id: string
  scope: string
  granted_at: string
  expires_at?: string
  active: boolean
  permissions: string[]
}

interface AccessCheck {
  id: string
  user_id: string
  client_id: string
  requested_scopes: string[]
  granted_scopes: string[]
  resource: string
  action: string
  result: "allow" | "deny"
  reason: string
  evaluation_time: number
  timestamp: string
}

export default function ScopeBasedPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [scopes, setScopes] = useState<Scope[]>([])
  const [clients, setClients] = useState<ClientApplication[]>([])
  const [grants, setGrants] = useState<ScopeGrant[]>([])
  const [accessChecks, setAccessChecks] = useState<AccessCheck[]>([])
  const [selectedScope, setSelectedScope] = useState<Scope | null>(null)
  const [isCreateScopeDialogOpen, setIsCreateScopeDialogOpen] = useState(false)
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [showScopeCode, setShowScopeCode] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [newScope, setNewScope] = useState({
    name: "",
    description: "",
    category: "custom" as Scope["category"],
    permissions: [] as string[],
    required: false,
    sensitive: false,
    expires_in: undefined as number | undefined
  })

  const [newClient, setNewClient] = useState({
    name: "",
    description: "",
    redirect_uris: [] as string[],
    allowed_scopes: [] as string[],
    default_scopes: [] as string[]
  })

  const [testRequest, setTestRequest] = useState({
    user_id: "",
    client_id: "",
    requested_scopes: [] as string[],
    resource: "",
    action: ""
  })

  useEffect(() => {
    loadScopes()
    loadClients()
    loadGrants()
    loadAccessChecks()
  }, [])

  const loadScopes = async () => {
    try {
      const response = await fetch("/api/authz/scope-based/scopes")
      if (response.ok) {
        const data = await response.json()
        setScopes(data.scopes || [])
      }
    } catch (error) {
      console.error("Failed to load scopes:", error)
    }
  }

  const loadClients = async () => {
    try {
      const response = await fetch("/api/authz/scope-based/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error("Failed to load clients:", error)
    }
  }

  const loadGrants = async () => {
    try {
      const response = await fetch("/api/authz/scope-based/grants")
      if (response.ok) {
        const data = await response.json()
        setGrants(data.grants || [])
      }
    } catch (error) {
      console.error("Failed to load grants:", error)
    }
  }

  const loadAccessChecks = async () => {
    try {
      const response = await fetch("/api/authz/scope-based/checks")
      if (response.ok) {
        const data = await response.json()
        setAccessChecks(data.checks || [])
      }
    } catch (error) {
      console.error("Failed to load access checks:", error)
    }
  }

  const createScope = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/authz/scope-based/scopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScope)
      })

      if (response.ok) {
        await loadScopes()
        setIsCreateScopeDialogOpen(false)
        resetScopeForm()
      }
    } catch (error) {
      console.error("Failed to create scope:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createClient = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/authz/scope-based/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient)
      })

      if (response.ok) {
        await loadClients()
        setIsCreateClientDialogOpen(false)
        resetClientForm()
      }
    } catch (error) {
      console.error("Failed to create client:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testAccess = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/authz/scope-based/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testRequest)
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(data)
        await loadAccessChecks()
      }
    } catch (error) {
      console.error("Failed to test access:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteScope = async (scopeId: string) => {
    try {
      const response = await fetch(`/api/authz/scope-based/scopes/${scopeId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await loadScopes()
      }
    } catch (error) {
      console.error("Failed to delete scope:", error)
    }
  }

  const deleteClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/authz/scope-based/clients/${clientId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await loadClients()
      }
    } catch (error) {
      console.error("Failed to delete client:", error)
    }
  }

  const resetScopeForm = () => {
    setNewScope({
      name: "",
      description: "",
      category: "custom",
      permissions: [],
      required: false,
      sensitive: false,
      expires_in: undefined
    })
  }

  const resetClientForm = () => {
    setNewClient({
      name: "",
      description: "",
      redirect_uris: [],
      allowed_scopes: [],
      default_scopes: []
    })
  }

  const generateScopeCode = (scope: Scope) => {
    return `{
  "id": "${scope.id}",
  "name": "${scope.name}",
  "description": "${scope.description}",
  "category": "${scope.category}",
  "permissions": ${JSON.stringify(scope.permissions, null, 2)},
  "required": ${scope.required},
  "sensitive": ${scope.sensitive},
  "expires_in": ${scope.expires_in || 'null'},
  "created_at": "${scope.created_at}",
  "updated_at": "${scope.updated_at}"
}`
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "identity": return <User className="h-4 w-4" />
      case "profile": return <FileText className="h-4 w-4" />
      case "contact": return <Mail className="h-4 w-4" />
      case "location": return <MapPin className="h-4 w-4" />
      case "device": return <Camera className="h-4 w-4" />
      case "payment": return <CreditCard className="h-4 w-4" />
      case "content": return <FileText className="h-4 w-4" />
      case "admin": return <Shield className="h-4 w-4" />
      default: return <Key className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "identity": return "bg-blue-100 text-blue-800"
      case "profile": return "bg-green-100 text-green-800"
      case "contact": return "bg-purple-100 text-purple-800"
      case "location": return "bg-orange-100 text-orange-800"
      case "device": return "bg-pink-100 text-pink-800"
      case "payment": return "bg-red-100 text-red-800"
      case "content": return "bg-indigo-100 text-indigo-800"
      case "admin": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const availablePermissions = {
    identity: ["read:basic", "read:email", "read:phone", "verify:identity"],
    profile: ["read:profile", "write:profile", "read:avatar", "upload:avatar"],
    contact: ["read:contacts", "write:contacts", "import:contacts", "export:contacts"],
    location: ["read:location", "read:history", "track:location"],
    device: ["read:device", "access:camera", "access:microphone", "access:storage"],
    payment: ["read:payment", "process:payment", "read:cards", "manage:subscriptions"],
    content: ["read:content", "write:content", "delete:content", "publish:content"],
    admin: ["read:users", "write:users", "read:logs", "manage:system"],
    custom: []
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-teal-600 rounded-xl">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Scope-based Authorization</h1>
              <p className="text-slate-600 mt-1">Granular access control with OAuth2 scopes</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scopes">Scopes</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="logs">Access Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Scopes</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{scopes.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {scopes.filter(s => s.required).length} required
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Client Applications</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clients.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered applications
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Grants</CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{grants.filter(g => g.active).length}</div>
                  <p className="text-xs text-muted-foreground">
                    User authorizations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Access Checks</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accessChecks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Last 24 hours
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Scope Concepts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-teal-50 rounded-lg">
                    <h4 className="font-semibold text-teal-900 mb-2">OAuth2 Scopes</h4>
                    <p className="text-sm text-teal-800">
                      Scopes define the level of access that an application can request on behalf of a user.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Scope Categories</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Identity - User authentication data</li>
                      <li>• Profile - User profile information</li>
                      <li>• Contact - Contact and communication data</li>
                      <li>• Location - Geographic and location data</li>
                      <li>• Device - Device and hardware access</li>
                      <li>• Payment - Payment and billing information</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Permission Model</h4>
                    <p className="text-sm text-blue-800">
                      Each scope contains specific permissions that grant fine-grained access to resources.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Authorization Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-teal-600">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Scope Request</p>
                        <p className="text-xs text-muted-foreground">Client requests specific scopes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-teal-600">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">User Consent</p>
                        <p className="text-xs text-muted-foreground">User approves requested scopes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-teal-600">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Token Issuance</p>
                        <p className="text-xs text-muted-foreground">Access token with granted scopes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-teal-600">4</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Resource Access</p>
                        <p className="text-xs text-muted-foreground">API validates token scopes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scopes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Scope Management</h2>
              <Dialog open={isCreateScopeDialogOpen} onOpenChange={setIsCreateScopeDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Scope
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Scope</DialogTitle>
                    <DialogDescription>
                      Define a new OAuth2 scope with permissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scope-name">Scope Name</Label>
                        <Input
                          id="scope-name"
                          value={newScope.name}
                          onChange={(e) => setNewScope(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="read:profile"
                        />
                      </div>
                      <div>
                        <Label htmlFor="scope-category">Category</Label>
                        <Select value={newScope.category} onValueChange={(value: any) => setNewScope(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="identity">Identity</SelectItem>
                            <SelectItem value="profile">Profile</SelectItem>
                            <SelectItem value="contact">Contact</SelectItem>
                            <SelectItem value="location">Location</SelectItem>
                            <SelectItem value="device">Device</SelectItem>
                            <SelectItem value="payment">Payment</SelectItem>
                            <SelectItem value="content">Content</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="scope-description">Description</Label>
                      <Textarea
                        id="scope-description"
                        value={newScope.description}
                        onChange={(e) => setNewScope(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this scope allows access to..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scope-expires">Expires In (seconds)</Label>
                        <Input
                          id="scope-expires"
                          type="number"
                          value={newScope.expires_in || ""}
                          onChange={(e) => setNewScope(prev => ({
                            ...prev,
                            expires_in: e.target.value ? parseInt(e.target.value) : undefined
                          }))}
                          placeholder="3600 (1 hour)"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="scope-required"
                            checked={newScope.required}
                            onCheckedChange={(checked) => setNewScope(prev => ({ ...prev, required: checked }))}
                          />
                          <Label htmlFor="scope-required">Required</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="scope-sensitive"
                            checked={newScope.sensitive}
                            onCheckedChange={(checked) => setNewScope(prev => ({ ...prev, sensitive: checked }))}
                          />
                          <Label htmlFor="scope-sensitive">Sensitive</Label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Permissions</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {availablePermissions[newScope.category as keyof typeof availablePermissions]?.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`perm-${permission}`}
                              checked={newScope.permissions.includes(permission)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewScope(prev => ({
                                    ...prev,
                                    permissions: [...prev.permissions, permission]
                                  }))
                                } else {
                                  setNewScope(prev => ({
                                    ...prev,
                                    permissions: prev.permissions.filter(p => p !== permission)
                                  }))
                                }
                              }}
                            />
                            <Label htmlFor={`perm-${permission}`} className="text-sm">{permission}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateScopeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createScope} disabled={isLoading}>
                        Create Scope
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scopes.map((scope) => (
                <Card key={scope.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getCategoryIcon(scope.category)}
                          {scope.name}
                        </CardTitle>
                        <CardDescription>{scope.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(scope.category)}>
                          {scope.category}
                        </Badge>
                        {scope.required && <Badge variant="destructive">Required</Badge>}
                        {scope.sensitive && <Badge variant="outline">Sensitive</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {scope.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">{permission}</Badge>
                        ))}
                      </div>
                      {scope.expires_in && (
                        <div className="text-sm">
                          <span className="font-medium">Expires:</span> {scope.expires_in}s
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedScope(scope)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteScope(scope.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Client Applications</h2>
              <Dialog open={isCreateClientDialogOpen} onOpenChange={setIsCreateClientDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Client</DialogTitle>
                    <DialogDescription>
                      Register a new OAuth2 client application
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client-name">Client Name</Label>
                        <Input
                          id="client-name"
                          value={newClient.name}
                          onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="My Application"
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-description">Description</Label>
                        <Input
                          id="client-description"
                          value={newClient.description}
                          onChange={(e) => setNewClient(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Application description"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Redirect URIs</Label>
                      <div className="mt-2 space-y-2">
                        {newClient.redirect_uris.map((uri, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={uri}
                              onChange={(e) => {
                                const updated = [...newClient.redirect_uris]
                                updated[index] = e.target.value
                                setNewClient(prev => ({ ...prev, redirect_uris: updated }))
                              }}
                              placeholder="https://example.com/callback"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setNewClient(prev => ({
                                  ...prev,
                                  redirect_uris: prev.redirect_uris.filter((_, i) => i !== index)
                                }))
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setNewClient(prev => ({
                              ...prev,
                              redirect_uris: [...prev.redirect_uris, ""]
                            }))
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add URI
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Allowed Scopes</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {scopes.map((scope) => (
                          <div key={scope.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`scope-${scope.id}`}
                              checked={newClient.allowed_scopes.includes(scope.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewClient(prev => ({
                                    ...prev,
                                    allowed_scopes: [...prev.allowed_scopes, scope.name]
                                  }))
                                } else {
                                  setNewClient(prev => ({
                                    ...prev,
                                    allowed_scopes: prev.allowed_scopes.filter(s => s !== scope.name)
                                  }))
                                }
                              }}
                            />
                            <Label htmlFor={`scope-${scope.id}`} className="text-sm">{scope.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateClientDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createClient} disabled={isLoading}>
                        Create Client
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Card key={client.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {client.name}
                    </CardTitle>
                    <CardDescription>{client.description}</CardDescription>
                    <Badge variant="outline">Client ID: {client.client_id}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Redirect URIs:</span> {client.redirect_uris.length}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Allowed Scopes:</span> {client.allowed_scopes.length}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Default Scopes:</span> {client.default_scopes.length}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(client.client_id)
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteClient(client.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Scope-based Access Testing
                </CardTitle>
                <CardDescription>
                  Test OAuth2 scope validation and authorization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="test-user">User ID</Label>
                    <Input
                      id="test-user"
                      value={testRequest.user_id}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, user_id: e.target.value }))}
                      placeholder="user_123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-client">Client ID</Label>
                    <Select value={testRequest.client_id} onValueChange={(value) => setTestRequest(prev => ({ ...prev, client_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.client_id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="test-resource">Resource</Label>
                    <Input
                      id="test-resource"
                      value={testRequest.resource}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, resource: e.target.value }))}
                      placeholder="/api/user/profile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-action">Action</Label>
                    <Input
                      id="test-action"
                      value={testRequest.action}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, action: e.target.value }))}
                      placeholder="read, write, delete"
                    />
                  </div>
                </div>

                <div>
                  <Label>Requested Scopes</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {scopes.map((scope) => (
                      <div key={scope.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`test-scope-${scope.id}`}
                          checked={testRequest.requested_scopes.includes(scope.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTestRequest(prev => ({
                                ...prev,
                                requested_scopes: [...prev.requested_scopes, scope.name]
                              }))
                            } else {
                              setTestRequest(prev => ({
                                ...prev,
                                requested_scopes: prev.requested_scopes.filter(s => s !== scope.name)
                              }))
                            }
                          }}
                        />
                        <Label htmlFor={`test-scope-${scope.id}`} className="text-sm">{scope.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={testAccess} disabled={isLoading} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Test Access
                </Button>

                {testResult && (
                  <div className="space-y-4">
                    <Alert className={testResult.result === "allow" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Result:</span>
                          <Badge variant={testResult.result === "allow" ? "default" : "destructive"}>
                            {testResult.result.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Granted Scopes:</span> {testResult.granted_scopes?.join(", ") || "None"}
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Reason:</span> {testResult.reason}
                        </div>
                        <div className="mt-2">
                          <span className="font-medium">Evaluation Time:</span> {testResult.evaluation_time}ms
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Scope-based Access Logs
                </CardTitle>
                <CardDescription>
                  Recent scope validation checks and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Requested Scopes</TableHead>
                      <TableHead>Granted Scopes</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="text-sm">
                          {new Date(check.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">{check.user_id}</TableCell>
                        <TableCell className="text-sm">{check.client_id}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {check.requested_scopes.join(", ")}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {check.granted_scopes.join(", ")}
                        </TableCell>
                        <TableCell className="text-sm">{check.resource}</TableCell>
                        <TableCell className="text-sm">{check.action}</TableCell>
                        <TableCell>
                          <Badge variant={check.result === "allow" ? "default" : "destructive"}>
                            {check.result}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{check.evaluation_time}ms</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Scope Detail Dialog */}
        <Dialog open={!!selectedScope} onOpenChange={() => setSelectedScope(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Scope Details
              </DialogTitle>
              <DialogDescription>
                Complete scope configuration and permissions
              </DialogDescription>
            </DialogHeader>
            {selectedScope && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScopeCode(!showScopeCode)}
                  >
                    {showScopeCode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showScopeCode ? "Hide Code" : "Show Code"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generateScopeCode(selectedScope))
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                {showScopeCode ? (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{generateScopeCode(selectedScope)}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <p className="text-sm font-medium">{selectedScope.name}</p>
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Badge className={getCategoryColor(selectedScope.category)}>
                          {getCategoryIcon(selectedScope.category)}
                          {selectedScope.category}
                        </Badge>
                      </div>
                      <div>
                        <Label>Required</Label>
                        <Badge variant={selectedScope.required ? "destructive" : "secondary"}>
                          {selectedScope.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                      <div>
                        <Label>Sensitive</Label>
                        <Badge variant={selectedScope.sensitive ? "outline" : "secondary"}>
                          {selectedScope.sensitive ? "Sensitive" : "Non-sensitive"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-muted-foreground mt-2">{selectedScope.description}</p>
                    </div>

                    <div>
                      <Label>Permissions</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedScope.permissions.map((permission) => (
                          <Badge key={permission} variant="outline">{permission}</Badge>
                        ))}
                      </div>
                    </div>

                    {selectedScope.expires_in && (
                      <div>
                        <Label>Expires In</Label>
                        <p className="text-sm text-muted-foreground mt-2">{selectedScope.expires_in} seconds</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Created</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedScope.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label>Updated</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedScope.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}