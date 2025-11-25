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
  Shield,
  List,
  Users,
  FileText,
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
  User,
  Folder,
  Database,
  Globe,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"
import BackButton from "@/components/ui/back-button"

interface AccessControlEntry {
  id: string
  principal_type: "user" | "group" | "role"
  principal_id: string
  principal_name: string
  resource_type: "file" | "directory" | "api" | "database" | "service"
  resource_id: string
  resource_name: string
  permissions: string[]
  permission_type: "allow" | "deny"
  inherited: boolean
  enabled: boolean
  created_at: string
  updated_at: string
  description?: string
}

interface Resource {
  id: string
  name: string
  type: "file" | "directory" | "api" | "database" | "service"
  path: string
  parent_id?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

interface Principal {
  id: string
  name: string
  type: "user" | "group" | "role"
  description?: string
  members?: string[] // For groups
  permissions?: string[] // For roles
}

interface AccessCheck {
  id: string
  principal_id: string
  resource_id: string
  permission: string
  result: "allow" | "deny"
  matched_aces: string[]
  evaluation_time: number
  timestamp: string
}

export default function ACLPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [aces, setAces] = useState<AccessControlEntry[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [principals, setPrincipals] = useState<Principal[]>([])
  const [accessChecks, setAccessChecks] = useState<AccessCheck[]>([])
  const [selectedAce, setSelectedAce] = useState<AccessControlEntry | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [showAclCode, setShowAclCode] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [newAce, setNewAce] = useState({
    principal_type: "user" as "user" | "group" | "role",
    principal_id: "",
    resource_type: "file" as "file" | "directory" | "api" | "database" | "service",
    resource_id: "",
    permissions: [] as string[],
    permission_type: "allow" as "allow" | "deny",
    inherited: false,
    enabled: true,
    description: ""
  })

  const [testRequest, setTestRequest] = useState({
    principal_id: "",
    resource_id: "",
    permission: ""
  })

  useEffect(() => {
    loadAces()
    loadResources()
    loadPrincipals()
    loadAccessChecks()
  }, [])

  const loadAces = async () => {
    try {
      const response = await fetch("/api/authz/acl/entries")
      if (response.ok) {
        const data = await response.json()
        setAces(data.aces || [])
      }
    } catch (error) {
      console.error("Failed to load ACEs:", error)
    }
  }

  const loadResources = async () => {
    try {
      const response = await fetch("/api/authz/acl/resources")
      if (response.ok) {
        const data = await response.json()
        setResources(data.resources || [])
      }
    } catch (error) {
      console.error("Failed to load resources:", error)
    }
  }

  const loadPrincipals = async () => {
    try {
      const response = await fetch("/api/authz/acl/principals")
      if (response.ok) {
        const data = await response.json()
        setPrincipals(data.principals || [])
      }
    } catch (error) {
      console.error("Failed to load principals:", error)
    }
  }

  const loadAccessChecks = async () => {
    try {
      const response = await fetch("/api/authz/acl/checks")
      if (response.ok) {
        const data = await response.json()
        setAccessChecks(data.checks || [])
      }
    } catch (error) {
      console.error("Failed to load access checks:", error)
    }
  }

  const createAce = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/authz/acl/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAce)
      })

      if (response.ok) {
        await loadAces()
        setIsCreateDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Failed to create ACE:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const testAccess = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/authz/acl/check", {
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

  const deleteAce = async (aceId: string) => {
    try {
      const response = await fetch(`/api/authz/acl/entries/${aceId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await loadAces()
      }
    } catch (error) {
      console.error("Failed to delete ACE:", error)
    }
  }

  const toggleAce = async (aceId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/authz/acl/entries/${aceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        await loadAces()
      }
    } catch (error) {
      console.error("Failed to toggle ACE:", error)
    }
  }

  const resetForm = () => {
    setNewAce({
      principal_type: "user",
      principal_id: "",
      resource_type: "file",
      resource_id: "",
      permissions: [],
      permission_type: "allow",
      inherited: false,
      enabled: true,
      description: ""
    })
  }

  const generateAclCode = (ace: AccessControlEntry) => {
    return `{
  "id": "${ace.id}",
  "principal": {
    "type": "${ace.principal_type}",
    "id": "${ace.principal_id}",
    "name": "${ace.principal_name}"
  },
  "resource": {
    "type": "${ace.resource_type}",
    "id": "${ace.resource_id}",
    "name": "${ace.resource_name}"
  },
  "permissions": ${JSON.stringify(ace.permissions, null, 2)},
  "type": "${ace.permission_type}",
  "inherited": ${ace.inherited},
  "enabled": ${ace.enabled},
  "description": "${ace.description || ''}",
  "created_at": "${ace.created_at}",
  "updated_at": "${ace.updated_at}"
}`
  }

  const getPrincipalIcon = (type: string) => {
    switch (type) {
      case "user": return <User className="h-4 w-4" />
      case "group": return <Users className="h-4 w-4" />
      case "role": return <Shield className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "file": return <FileText className="h-4 w-4" />
      case "directory": return <Folder className="h-4 w-4" />
      case "api": return <Globe className="h-4 w-4" />
      case "database": return <Database className="h-4 w-4" />
      case "service": return <Settings className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const availablePermissions = {
    file: ["read", "write", "delete", "execute", "append"],
    directory: ["read", "write", "delete", "create", "list"],
    api: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    database: ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP"],
    service: ["read", "write", "execute", "admin"]
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-600 rounded-xl">
              <List className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Access Control Lists (ACL)</h1>
              <p className="text-slate-600 mt-1">Fine-grained access control with explicit permissions</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="entries">ACL Entries</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="logs">Access Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total ACL Entries</CardTitle>
                  <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aces.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {aces.filter(ace => ace.enabled).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Allow Entries</CardTitle>
                  <Unlock className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {aces.filter(ace => ace.permission_type === "allow").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Granting access
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Deny Entries</CardTitle>
                  <Lock className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {aces.filter(ace => ace.permission_type === "deny").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Restricting access
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resources</CardTitle>
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resources.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Protected resources
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    ACL Concepts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Access Control Entries</h4>
                    <p className="text-sm text-purple-800">
                      ACLs consist of Access Control Entries (ACEs) that define who can access what and how.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Principal Types</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Users - Individual user accounts</li>
                      <li>• Groups - Collections of users</li>
                      <li>• Roles - Permission-based roles</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Permission Model</h4>
                    <p className="text-sm text-blue-800">
                      Each ACE specifies allow/deny permissions for specific principals on resources.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    ACL Evaluation Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Collect ACEs</p>
                        <p className="text-xs text-muted-foreground">Gather all applicable ACEs for principal/resource</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Order by Priority</p>
                        <p className="text-xs text-muted-foreground">Deny entries take precedence over allow</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Check Permissions</p>
                        <p className="text-xs text-muted-foreground">Verify requested permission in ACEs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">4</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Apply Decision</p>
                        <p className="text-xs text-muted-foreground">Return allow/deny based on evaluation</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="entries" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Access Control Entries</h2>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create ACE
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Access Control Entry</DialogTitle>
                    <DialogDescription>
                      Define access permissions for a principal on a resource
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="principal-type">Principal Type</Label>
                        <Select value={newAce.principal_type} onValueChange={(value: any) => setNewAce(prev => ({ ...prev, principal_type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="group">Group</SelectItem>
                            <SelectItem value="role">Role</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="principal-id">Principal ID</Label>
                        <Input
                          id="principal-id"
                          value={newAce.principal_id}
                          onChange={(e) => setNewAce(prev => ({ ...prev, principal_id: e.target.value }))}
                          placeholder="user_123"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="resource-type">Resource Type</Label>
                        <Select value={newAce.resource_type} onValueChange={(value: any) => setNewAce(prev => ({ ...prev, resource_type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="file">File</SelectItem>
                            <SelectItem value="directory">Directory</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="resource-id">Resource ID</Label>
                        <Input
                          id="resource-id"
                          value={newAce.resource_id}
                          onChange={(e) => setNewAce(prev => ({ ...prev, resource_id: e.target.value }))}
                          placeholder="/path/to/resource"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="permission-type">Permission Type</Label>
                        <Select value={newAce.permission_type} onValueChange={(value: any) => setNewAce(prev => ({ ...prev, permission_type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="allow">Allow</SelectItem>
                            <SelectItem value="deny">Deny</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="ace-inherited"
                          checked={newAce.inherited}
                          onCheckedChange={(checked) => setNewAce(prev => ({ ...prev, inherited: checked }))}
                        />
                        <Label htmlFor="ace-inherited">Inherited</Label>
                        <Switch
                          id="ace-enabled"
                          checked={newAce.enabled}
                          onCheckedChange={(checked) => setNewAce(prev => ({ ...prev, enabled: checked }))}
                        />
                        <Label htmlFor="ace-enabled">Enabled</Label>
                      </div>
                    </div>

                    <div>
                      <Label>Permissions</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {availablePermissions[newAce.resource_type as keyof typeof availablePermissions]?.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`perm-${permission}`}
                              checked={newAce.permissions.includes(permission)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewAce(prev => ({
                                    ...prev,
                                    permissions: [...prev.permissions, permission]
                                  }))
                                } else {
                                  setNewAce(prev => ({
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

                    <div>
                      <Label htmlFor="ace-description">Description</Label>
                      <Textarea
                        id="ace-description"
                        value={newAce.description}
                        onChange={(e) => setNewAce(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional description for this ACE..."
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createAce} disabled={isLoading}>
                        Create ACE
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {aces.map((ace) => (
                <Card key={ace.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getPrincipalIcon(ace.principal_type)}
                          {ace.principal_name}
                          <span className="text-sm font-normal text-muted-foreground">→</span>
                          {getResourceIcon(ace.resource_type)}
                          {ace.resource_name}
                        </CardTitle>
                        <CardDescription>{ace.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ace.permission_type === "allow" ? "default" : "destructive"}>
                          {ace.permission_type}
                        </Badge>
                        {ace.inherited && <Badge variant="outline">Inherited</Badge>}
                        <Badge variant={ace.enabled ? "default" : "secondary"}>
                          {ace.enabled ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={ace.enabled}
                          onCheckedChange={(checked) => toggleAce(ace.id, checked)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedAce(ace)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAce(ace.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium">Permissions:</span>
                        {ace.permissions.map((permission) => (
                          <Badge key={permission} variant="outline">{permission}</Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(ace.created_at).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      {resource.name}
                    </CardTitle>
                    <CardDescription>{resource.path}</CardDescription>
                    <Badge variant="outline">{resource.type}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Type:</span> {resource.type}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Path:</span> {resource.path}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">ACEs:</span> {aces.filter(ace => ace.resource_id === resource.id).length}
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
                  Access Testing
                </CardTitle>
                <CardDescription>
                  Test ACL permissions for different principals and resources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="test-principal">Principal ID</Label>
                    <Select value={testRequest.principal_id} onValueChange={(value) => setTestRequest(prev => ({ ...prev, principal_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select principal" />
                      </SelectTrigger>
                      <SelectContent>
                        {principals.map((principal) => (
                          <SelectItem key={principal.id} value={principal.id}>
                            {principal.name} ({principal.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="test-resource">Resource ID</Label>
                    <Select value={testRequest.resource_id} onValueChange={(value) => setTestRequest(prev => ({ ...prev, resource_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource" />
                      </SelectTrigger>
                      <SelectContent>
                        {resources.map((resource) => (
                          <SelectItem key={resource.id} value={resource.id}>
                            {resource.name} ({resource.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="test-permission">Permission</Label>
                    <Input
                      id="test-permission"
                      value={testRequest.permission}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, permission: e.target.value }))}
                      placeholder="read, write, GET, etc."
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
                          <span className="font-medium">Matched ACEs:</span>
                          <ul className="mt-1 space-y-1">
                            {testResult.matched_aces.map((aceId: string) => (
                              <li key={aceId} className="text-sm">• {aceId}</li>
                            ))}
                          </ul>
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
                  Access Check Logs
                </CardTitle>
                <CardDescription>
                  Recent access control checks and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Permission</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Matched ACEs</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="text-sm">
                          {new Date(check.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">{check.principal_id}</TableCell>
                        <TableCell className="text-sm">{check.resource_id}</TableCell>
                        <TableCell className="text-sm">{check.permission}</TableCell>
                        <TableCell>
                          <Badge variant={check.result === "allow" ? "default" : "destructive"}>
                            {check.result}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {check.matched_aces.length > 0 ? (
                            <div className="space-y-1">
                              {check.matched_aces.map((aceId) => (
                                <div key={aceId} className="text-xs">{aceId}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
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

        {/* ACE Detail Dialog */}
        <Dialog open={!!selectedAce} onOpenChange={() => setSelectedAce(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Access Control Entry Details
              </DialogTitle>
              <DialogDescription>
                Complete ACE configuration and code representation
              </DialogDescription>
            </DialogHeader>
            {selectedAce && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAclCode(!showAclCode)}
                  >
                    {showAclCode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showAclCode ? "Hide Code" : "Show Code"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generateAclCode(selectedAce))
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                {showAclCode ? (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{generateAclCode(selectedAce)}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Principal</Label>
                        <div className="flex items-center gap-2 mt-2">
                          {getPrincipalIcon(selectedAce.principal_type)}
                          <Badge variant="outline">{selectedAce.principal_type}</Badge>
                          <span className="text-sm">{selectedAce.principal_name}</span>
                        </div>
                      </div>
                      <div>
                        <Label>Resource</Label>
                        <div className="flex items-center gap-2 mt-2">
                          {getResourceIcon(selectedAce.resource_type)}
                          <Badge variant="outline">{selectedAce.resource_type}</Badge>
                          <span className="text-sm">{selectedAce.resource_name}</span>
                        </div>
                      </div>
                      <div>
                        <Label>Permission Type</Label>
                        <Badge variant={selectedAce.permission_type === "allow" ? "default" : "destructive"} className="mt-2">
                          {selectedAce.permission_type}
                        </Badge>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={selectedAce.enabled ? "default" : "secondary"}>
                            {selectedAce.enabled ? "Active" : "Inactive"}
                          </Badge>
                          {selectedAce.inherited && <Badge variant="outline">Inherited</Badge>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Permissions</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedAce.permissions.map((permission) => (
                          <Badge key={permission} variant="outline">{permission}</Badge>
                        ))}
                      </div>
                    </div>

                    {selectedAce.description && (
                      <div>
                        <Label>Description</Label>
                        <p className="text-sm text-muted-foreground mt-2">{selectedAce.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Created</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedAce.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label>Updated</Label>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedAce.updated_at).toLocaleString()}
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