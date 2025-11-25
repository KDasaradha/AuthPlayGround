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
  Building2,
  Users,
  Shield,
  Settings,
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
  BookOpen,
  GitBranch,
  Activity,
  Database,
  Globe,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Crown,
  Zap,
  BarChart3,
  Package,
  CreditCard
} from "lucide-react"
import BackButton from "@/components/ui/back-button"

interface Tenant {
  id: string
  name: string
  domain: string
  subdomain: string
  status: "active" | "inactive" | "suspended"
  plan: "free" | "basic" | "premium" | "enterprise"
  settings: TenantSettings
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

interface TenantSettings {
  allow_custom_domains: boolean
  allow_sso: boolean
  allow_api_access: boolean
  max_users: number
  max_storage: number
  features: string[]
  restrictions: Record<string, any>
}

interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  email: string
  role: "owner" | "admin" | "member" | "viewer"
  permissions: string[]
  status: "active" | "inactive" | "pending"
  created_at: string
  last_login: string
}

interface TenantResource {
  id: string
  tenant_id: string
  name: string
  type: "database" | "storage" | "api" | "service" | "application"
  resource_id: string
  permissions: Record<string, string[]>
  created_at: string
  updated_at: string
}

interface AccessCheck {
  id: string
  tenant_id: string
  user_id: string
  resource: string
  action: string
  result: "allow" | "deny"
  reason: string
  evaluation_time: number
  timestamp: string
}

export default function MultiTenantPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([])
  const [tenantResources, setTenantResources] = useState<TenantResource[]>([])
  const [accessChecks, setAccessChecks] = useState<AccessCheck[]>([])
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [showTenantCode, setShowTenantCode] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [newTenant, setNewTenant] = useState({
    name: "",
    domain: "",
    subdomain: "",
    plan: "basic" as "free" | "basic" | "premium" | "enterprise",
    settings: {
      allow_custom_domains: false,
      allow_sso: false,
      allow_api_access: true,
      max_users: 10,
      max_storage: 1024,
      features: ["basic_features"],
      restrictions: {}
    }
  })

  const [testRequest, setTestRequest] = useState({
    tenant_id: "",
    user_id: "",
    resource: "",
    action: ""
  })

  useEffect(() => {
    loadTenants()
    loadTenantUsers()
    loadTenantResources()
    loadAccessChecks()
  }, [])

  const loadTenants = async () => {
    try {
      const response = await fetch("/api/authz/multi-tenant/tenants")
      if (response.ok) {
        const data = await response.json()
        setTenants(data.tenants || [])
      }
    } catch (error) {
      console.error("Failed to load tenants:", error)
    }
  }

  const loadTenantUsers = async () => {
    try {
      const response = await fetch("/api/authz/multi-tenant/users")
      if (response.ok) {
        const data = await response.json()
        setTenantUsers(data.users || [])
      }
    } catch (error) {
      console.error("Failed to load tenant users:", error)
    }
  }

  const loadTenantResources = async () => {
    try {
      const response = await fetch("/api/authz/multi-tenant/resources")
      if (response.ok) {
        const data = await response.json()
        setTenantResources(data.resources || [])
      }
    } catch (error) {
      console.error("Failed to load tenant resources:", error)
    }
  }

  const loadAccessChecks = async () => {
    try {
      const response = await fetch("/api/authz/multi-tenant/checks")
      if (response.ok) {
        const data = await response.json()
        setAccessChecks(data.checks || [])
      }
    } catch (error) {
      console.error("Failed to load access checks:", error)
    }
  }

  const createTenant = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/authz/multi-tenant/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTenant)
      })

      if (response.ok) {
        await loadTenants()
        setIsCreateDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Failed to create tenant:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testAccess = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/authz/multi-tenant/check", {
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

  const deleteTenant = async (tenantId: string) => {
    try {
      const response = await fetch(`/api/authz/multi-tenant/tenants/${tenantId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await loadTenants()
      }
    } catch (error) {
      console.error("Failed to delete tenant:", error)
    }
  }

  const toggleTenant = async (tenantId: string, status: "active" | "inactive") => {
    try {
      const response = await fetch(`/api/authz/multi-tenant/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await loadTenants()
      }
    } catch (error) {
      console.error("Failed to toggle tenant:", error)
    }
  }

  const resetForm = () => {
    setNewTenant({
      name: "",
      domain: "",
      subdomain: "",
      plan: "basic",
      settings: {
        allow_custom_domains: false,
        allow_sso: false,
        allow_api_access: true,
        max_users: 10,
        max_storage: 1024,
        features: ["basic_features"],
        restrictions: {}
      }
    })
  }

  const generateTenantCode = (tenant: Tenant) => {
    return `{
  "id": "${tenant.id}",
  "name": "${tenant.name}",
  "domain": "${tenant.domain}",
  "subdomain": "${tenant.subdomain}",
  "status": "${tenant.status}",
  "plan": "${tenant.plan}",
  "settings": ${JSON.stringify(tenant.settings, null, 2)},
  "created_at": "${tenant.created_at}",
  "updated_at": "${tenant.updated_at}",
  "metadata": ${JSON.stringify(tenant.metadata, null, 2)}
}`
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "free": return <Package className="h-4 w-4" />
      case "basic": return <Zap className="h-4 w-4" />
      case "premium": return <Crown className="h-4 w-4" />
      case "enterprise": return <Building2 className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "free": return "bg-gray-100 text-gray-800"
      case "basic": return "bg-blue-100 text-blue-800"
      case "premium": return "bg-purple-100 text-purple-800"
      case "enterprise": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "suspended": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-orange-600 rounded-xl">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Multi-tenant Authorization</h1>
              <p className="text-slate-600 mt-1">Secure tenant isolation and resource management</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="logs">Access Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tenants.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {tenants.filter(t => t.status === "active").length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tenant Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tenantUsers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all tenants
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resources</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tenantResources.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Tenant resources
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
                    Multi-tenant Concepts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Tenant Isolation</h4>
                    <p className="text-sm text-orange-800">
                      Each tenant has completely isolated data, resources, and user management.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Plan-Based Access</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Free tier with basic features</li>
                      <li>• Basic tier with enhanced capabilities</li>
                      <li>• Premium tier with advanced features</li>
                      <li>• Enterprise tier with full access</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Resource Management</h4>
                    <p className="text-sm text-blue-800">
                      Tenants can manage their own resources within plan limits and quotas.
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
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-orange-600">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Tenant Identification</p>
                        <p className="text-xs text-muted-foreground">Identify tenant from domain or subdomain</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-orange-600">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Plan Validation</p>
                        <p className="text-xs text-muted-foreground">Check tenant plan and limits</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-orange-600">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">User Authorization</p>
                        <p className="text-xs text-muted-foreground">Validate user within tenant context</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-orange-600">4</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Resource Access</p>
                        <p className="text-xs text-muted-foreground">Grant access to tenant resources</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tenants" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tenant Management</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tenant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Tenant</DialogTitle>
                    <DialogDescription>
                      Set up a new tenant with configuration and limits
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tenant-name">Tenant Name</Label>
                        <Input
                          id="tenant-name"
                          value={newTenant.name}
                          onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Acme Corporation"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tenant-plan">Plan</Label>
                        <Select value={newTenant.plan} onValueChange={(value: any) => setNewTenant(prev => ({ ...prev, plan: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tenant-domain">Domain</Label>
                        <Input
                          id="tenant-domain"
                          value={newTenant.domain}
                          onChange={(e) => setNewTenant(prev => ({ ...prev, domain: e.target.value }))}
                          placeholder="acme.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tenant-subdomain">Subdomain</Label>
                        <Input
                          id="tenant-subdomain"
                          value={newTenant.subdomain}
                          onChange={(e) => setNewTenant(prev => ({ ...prev, subdomain: e.target.value }))}
                          placeholder="acme.app.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Tenant Settings</Label>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="allow-custom-domains"
                            checked={newTenant.settings.allow_custom_domains}
                            onCheckedChange={(checked) => setNewTenant(prev => ({
                              ...prev,
                              settings: { ...prev.settings, allow_custom_domains: checked }
                            }))}
                          />
                          <Label htmlFor="allow-custom-domains">Allow Custom Domains</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="allow-sso"
                            checked={newTenant.settings.allow_sso}
                            onCheckedChange={(checked) => setNewTenant(prev => ({
                              ...prev,
                              settings: { ...prev.settings, allow_sso: checked }
                            }))}
                          />
                          <Label htmlFor="allow-sso">Allow SSO</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="allow-api-access"
                            checked={newTenant.settings.allow_api_access}
                            onCheckedChange={(checked) => setNewTenant(prev => ({
                              ...prev,
                              settings: { ...prev.settings, allow_api_access: checked }
                            }))}
                          />
                          <Label htmlFor="allow-api-access">Allow API Access</Label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max-users">Max Users</Label>
                        <Input
                          id="max-users"
                          type="number"
                          value={newTenant.settings.max_users}
                          onChange={(e) => setNewTenant(prev => ({
                            ...prev,
                            settings: { ...prev.settings, max_users: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-storage">Max Storage (MB)</Label>
                        <Input
                          id="max-storage"
                          type="number"
                          value={newTenant.settings.max_storage}
                          onChange={(e) => setNewTenant(prev => ({
                            ...prev,
                            settings: { ...prev.settings, max_storage: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createTenant} disabled={isLoading}>
                        Create Tenant
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((tenant) => (
                <Card key={tenant.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {tenant.name}
                        </CardTitle>
                        <CardDescription>{tenant.domain}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPlanColor(tenant.plan)}>
                          {getPlanIcon(tenant.plan)}
                          {tenant.plan}
                        </Badge>
                        <Badge className={getStatusColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">Subdomain:</span> {tenant.subdomain}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Max Users:</span> {tenant.settings.max_users}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Max Storage:</span> {tenant.settings.max_storage}MB
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tenant.settings.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">{feature}</Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedTenant(tenant)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTenant(tenant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Switch
                          checked={tenant.status === "active"}
                          onCheckedChange={(checked) => toggleTenant(tenant.id, checked ? "active" : "inactive")}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenantResources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      {resource.name}
                    </CardTitle>
                    <CardDescription>Resource ID: {resource.resource_id}</CardDescription>
                    <Badge variant="outline">{resource.type}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Tenant:</span> {resource.tenant_id}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Type:</span> {resource.type}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Permissions:</span>
                        <div className="mt-1 space-y-1">
                          {Object.entries(resource.permissions).map(([role, perms]) => (
                            <div key={role} className="text-xs">
                              <Badge variant="outline" className="mr-1">{role}</Badge>
                              {perms.join(", ")}
                            </div>
                          ))}
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
                  Multi-tenant Access Testing
                </CardTitle>
                <CardDescription>
                  Test tenant isolation and user access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="test-tenant">Tenant ID</Label>
                    <Select value={testRequest.tenant_id} onValueChange={(value) => setTestRequest(prev => ({ ...prev, tenant_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="test-user">User ID</Label>
                    <Select value={testRequest.user_id} onValueChange={(value) => setTestRequest(prev => ({ ...prev, user_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenantUsers.map((user) => (
                          <SelectItem key={user.id} value={user.user_id}>
                            {user.email} ({user.role})
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
                      placeholder="database://users"
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
                  Multi-tenant Access Logs
                </CardTitle>
                <CardDescription>
                  Recent access checks across all tenants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="text-sm">
                          {new Date(check.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">{check.tenant_id}</TableCell>
                        <TableCell className="text-sm">{check.user_id}</TableCell>
                        <TableCell className="text-sm">{check.resource}</TableCell>
                        <TableCell className="text-sm">{check.action}</TableCell>
                        <TableCell>
                          <Badge variant={check.result === "allow" ? "default" : "destructive"}>
                            {check.result}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{check.reason}</TableCell>
                        <TableCell className="text-sm">{check.evaluation_time}ms</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tenant Detail Dialog */}
        <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Tenant Details
              </DialogTitle>
              <DialogDescription>
                Complete tenant configuration and settings
              </DialogDescription>
            </DialogHeader>
            {selectedTenant && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTenantCode(!showTenantCode)}
                  >
                    {showTenantCode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showTenantCode ? "Hide Code" : "Show Code"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generateTenantCode(selectedTenant))
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                {showTenantCode ? (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{generateTenantCode(selectedTenant)}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <p className="text-sm font-medium">{selectedTenant.name}</p>
                      </div>
                      <div>
                        <Label>Domain</Label>
                        <p className="text-sm font-medium">{selectedTenant.domain}</p>
                      </div>
                      <div>
                        <Label>Subdomain</Label>
                        <p className="text-sm font-medium">{selectedTenant.subdomain}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge className={getStatusColor(selectedTenant.status)}>
                          {selectedTenant.status}
                        </Badge>
                      </div>
                      <div>
                        <Label>Plan</Label>
                        <Badge className={getPlanColor(selectedTenant.plan)}>
                          {getPlanIcon(selectedTenant.plan)}
                          {selectedTenant.plan}
                        </Badge>
                      </div>
                      <div>
                        <Label>Tenant ID</Label>
                        <p className="text-sm font-mono">{selectedTenant.id}</p>
                      </div>
                    </div>

                    <div>
                      <Label>Settings</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Custom Domains:</span>
                          <Badge variant={selectedTenant.settings.allow_custom_domains ? "default" : "secondary"}>
                            {selectedTenant.settings.allow_custom_domains ? "Allowed" : "Not Allowed"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">SSO:</span>
                          <Badge variant={selectedTenant.settings.allow_sso ? "default" : "secondary"}>
                            {selectedTenant.settings.allow_sso ? "Allowed" : "Not Allowed"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">API Access:</span>
                          <Badge variant={selectedTenant.settings.allow_api_access ? "default" : "secondary"}>
                            {selectedTenant.settings.allow_api_access ? "Allowed" : "Not Allowed"}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Max Users:</span> {selectedTenant.settings.max_users}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Max Storage:</span> {selectedTenant.settings.max_storage}MB
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Features</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTenant.settings.features.map((feature) => (
                          <Badge key={feature} variant="outline">{feature}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Created</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedTenant.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label>Updated</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedTenant.updated_at).toLocaleString()}
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