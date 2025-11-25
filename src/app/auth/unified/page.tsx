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
  UserPlus,
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
  Printer,
  Fingerprint,
  Smartphone,
  Monitor,
  Globe2,
  ShieldCheck,
  UserCheck,
  KeyRound,
  LogIn,
  LogOut,
  UserPlus as UserPlusIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MessageSquare,
  Clock,
  History,
  Cog,
  Network,
  Cloud,
  Server,
  CheckSquare,
  Square,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  MoreHorizontal,
  MoreVertical
} from "lucide-react"
import BackButton from "@/components/ui/back-button"

interface AuthMethod {
  id: string
  name: string
  type: "jwt" | "session" | "oauth2" | "webauthn" | "passwordless" | "totp" | "sms_otp" | "email_otp" | "magic_link" | "api_keys"
  description: string
  enabled: boolean
  required: boolean
  priority: number
  config: Record<string, any>
  icon: string
  color: string
}

interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone?: string
  avatar?: string
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
  last_login?: string
  auth_methods: string[]
  roles: string[]
  permissions: string[]
  metadata: Record<string, any>
}

interface AuthSession {
  id: string
  user_id: string
  auth_method: string
  client_info: {
    ip: string
    user_agent: string
    device: string
    browser: string
    os: string
  }
  created_at: string
  expires_at: string
  active: boolean
  last_activity: string
}

interface AuthAttempt {
  id: string
  user_id?: string
  email?: string
  auth_method: string
  result: "success" | "failure" | "blocked"
  reason: string
  ip: string
  user_agent: string
  timestamp: string
  metadata: Record<string, any>
}

export default function UnifiedAuthPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [sessions, setSessions] = useState<AuthSession[]>([])
  const [attempts, setAttempts] = useState<AuthAttempt[]>([])
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreateMethodDialogOpen, setIsCreateMethodDialogOpen] = useState(false)
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [showMethodCode, setShowMethodCode] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [newMethod, setNewMethod] = useState({
    name: "",
    type: "jwt" as AuthMethod["type"],
    description: "",
    enabled: true,
    required: false,
    priority: 100,
    config: {}
  })

  const [newUser, setNewUser] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    auth_methods: [],
    roles: [],
    permissions: []
  })

  const [testRequest, setTestRequest] = useState({
    email: "",
    password: "",
    auth_method: "",
    remember_me: false
  })

  useEffect(() => {
    loadAuthMethods()
    loadUsers()
    loadSessions()
    loadAttempts()
  }, [])

  const loadAuthMethods = async () => {
    try {
      const response = await fetch("/api/auth/unified/methods")
      if (response.ok) {
        const data = await response.json()
        setAuthMethods(data.methods || [])
      }
    } catch (error) {
      console.error("Failed to load auth methods:", error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/auth/unified/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Failed to load users:", error)
    }
  }

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/auth/unified/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error("Failed to load sessions:", error)
    }
  }

  const loadAttempts = async () => {
    try {
      const response = await fetch("/api/auth/unified/attempts")
      if (response.ok) {
        const data = await response.json()
        setAttempts(data.attempts || [])
      }
    } catch (error) {
      console.error("Failed to load attempts:", error)
    }
  }

  const createAuthMethod = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/unified/methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMethod)
      })

      if (response.ok) {
        await loadAuthMethods()
        setIsCreateMethodDialogOpen(false)
        resetMethodForm()
      }
    } catch (error) {
      console.error("Failed to create auth method:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createUser = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/unified/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        await loadUsers()
        setIsCreateUserDialogOpen(false)
        resetUserForm()
      }
    } catch (error) {
      console.error("Failed to create user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAuthMethod = async (methodId: string) => {
    try {
      const response = await fetch(`/api/auth/unified/methods/${methodId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await loadAuthMethods()
      }
    } catch (error) {
      console.error("Failed to delete auth method:", error)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/auth/unified/users/${userId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await loadUsers()
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const toggleAuthMethod = async (methodId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/auth/unified/methods/${methodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        await loadAuthMethods()
      }
    } catch (error) {
      console.error("Failed to toggle auth method:", error)
    }
  }

  const resetMethodForm = () => {
    setNewMethod({
      name: "",
      type: "jwt",
      description: "",
      enabled: true,
      required: false,
      priority: 100,
      config: {}
    })
  }

  const resetUserForm = () => {
    setNewUser({
      email: "",
      username: "",
      first_name: "",
      last_name: "",
      phone: "",
      auth_methods: [],
      roles: [],
      permissions: []
    })
  }

  const generateMethodCode = (method: AuthMethod) => {
    return `{
  "id": "${method.id}",
  "name": "${method.name}",
  "type": "${method.type}",
  "description": "${method.description}",
  "enabled": ${method.enabled},
  "required": ${method.required},
  "priority": ${method.priority},
  "config": ${JSON.stringify(method.config, null, 2)},
  "icon": "${method.icon}",
  "color": "${method.color}"
}`
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "jwt": return <Key className="h-4 w-4" />
      case "session": return <Monitor className="h-4 w-4" />
      case "oauth2": return <Globe2 className="h-4 w-4" />
      case "webauthn": return <Fingerprint className="h-4 w-4" />
      case "passwordless": return <Smartphone className="h-4 w-4" />
      case "totp": return <Clock className="h-4 w-4" />
      case "sms_otp": return <PhoneIcon className="h-4 w-4" />
      case "email_otp": return <MailIcon className="h-4 w-4" />
      case "magic_link": return <MessageSquare className="h-4 w-4" />
      case "api_keys": return <KeyRound className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getMethodColor = (type: string) => {
    switch (type) {
      case "jwt": return "bg-blue-100 text-blue-800"
      case "session": return "bg-green-100 text-green-800"
      case "oauth2": return "bg-purple-100 text-purple-800"
      case "webauthn": return "bg-orange-100 text-orange-800"
      case "passwordless": return "bg-pink-100 text-pink-800"
      case "totp": return "bg-indigo-100 text-indigo-800"
      case "sms_otp": return "bg-yellow-100 text-yellow-800"
      case "email_otp": return "bg-cyan-100 text-cyan-800"
      case "magic_link": return "bg-teal-100 text-teal-800"
      case "api_keys": return "bg-gray-100 text-gray-800"
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

  const getResultColor = (result: string) => {
    switch (result) {
      case "success": return "bg-green-100 text-green-800"
      case "failure": return "bg-red-100 text-red-800"
      case "blocked": return "bg-orange-100 text-orange-800"
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
            <div className="p-3 bg-indigo-600 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Unified Authentication System</h1>
              <p className="text-slate-600 mt-1">Comprehensive authentication management platform</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="methods">Auth Methods</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Auth Methods</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{authMethods.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {authMethods.filter(m => m.enabled).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {users.filter(u => u.status === "active").length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.filter(s => s.active).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Current sessions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Attempts</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{attempts.length}</div>
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
                    Unified Auth Concepts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 mb-2">Multi-Method Support</h4>
                    <p className="text-sm text-indigo-800">
                      Support for multiple authentication methods with flexible configuration.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Adaptive Authentication</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Risk-based authentication</li>
                      <li>• Step-up authentication</li>
                      <li>• Context-aware security</li>
                      <li>• Device fingerprinting</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Centralized Management</h4>
                    <p className="text-sm text-blue-800">
                      Single interface for managing all authentication methods and user access.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Authentication Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-600">1</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Method Selection</p>
                        <p className="text-xs text-muted-foreground">Choose authentication method</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-600">2</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Identity Verification</p>
                        <p className="text-xs text-muted-foreground">Verify user credentials</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-600">3</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Session Creation</p>
                        <p className="text-xs text-muted-foreground">Create authenticated session</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-indigo-600">4</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Access Grant</p>
                        <p className="text-xs text-muted-foreground">Grant access to resources</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="methods" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Authentication Methods</h2>
              <Dialog open={isCreateMethodDialogOpen} onOpenChange={setIsCreateMethodDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Authentication Method</DialogTitle>
                    <DialogDescription>
                      Configure a new authentication method
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="method-name">Method Name</Label>
                        <Input
                          id="method-name"
                          value={newMethod.name}
                          onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="JWT Authentication"
                        />
                      </div>
                      <div>
                        <Label htmlFor="method-type">Method Type</Label>
                        <Select value={newMethod.type} onValueChange={(value: any) => setNewMethod(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jwt">JWT</SelectItem>
                            <SelectItem value="session">Session</SelectItem>
                            <SelectItem value="oauth2">OAuth2</SelectItem>
                            <SelectItem value="webauthn">WebAuthn</SelectItem>
                            <SelectItem value="passwordless">Passwordless</SelectItem>
                            <SelectItem value="totp">TOTP</SelectItem>
                            <SelectItem value="sms_otp">SMS OTP</SelectItem>
                            <SelectItem value="email_otp">Email OTP</SelectItem>
                            <SelectItem value="magic_link">Magic Link</SelectItem>
                            <SelectItem value="api_keys">API Keys</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="method-description">Description</Label>
                      <Textarea
                        id="method-description"
                        value={newMethod.description}
                        onChange={(e) => setNewMethod(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this authentication method..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="method-priority">Priority</Label>
                        <Input
                          id="method-priority"
                          type="number"
                          value={newMethod.priority}
                          onChange={(e) => setNewMethod(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                          placeholder="100"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="method-enabled"
                          checked={newMethod.enabled}
                          onCheckedChange={(checked) => setNewMethod(prev => ({ ...prev, enabled: checked }))}
                        />
                        <Label htmlFor="method-enabled">Enabled</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="method-required"
                          checked={newMethod.required}
                          onCheckedChange={(checked) => setNewMethod(prev => ({ ...prev, required: checked }))}
                        />
                        <Label htmlFor="method-required">Required</Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateMethodDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createAuthMethod} disabled={isLoading}>
                        Add Method
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authMethods.map((method) => (
                <Card key={method.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getMethodIcon(method.type)}
                          {method.name}
                        </CardTitle>
                        <CardDescription>{method.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getMethodColor(method.type)}>
                          {method.type}
                        </Badge>
                        {method.required && <Badge variant="destructive">Required</Badge>}
                        <Badge variant={method.enabled ? "default" : "secondary"}>
                          {method.enabled ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">Priority:</span> {method.priority}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedMethod(method)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteAuthMethod(method.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Switch
                          checked={method.enabled}
                          onCheckedChange={(checked) => toggleAuthMethod(method.id, checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="user-email">Email</Label>
                        <Input
                          id="user-email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="user@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="user-username">Username</Label>
                        <Input
                          id="user-username"
                          value={newUser.username}
                          onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="user-first-name">First Name</Label>
                        <Input
                          id="user-first-name"
                          value={newUser.first_name}
                          onChange={(e) => setNewUser(prev => ({ ...prev, first_name: e.target.value }))}
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="user-last-name">Last Name</Label>
                        <Input
                          id="user-last-name"
                          value={newUser.last_name}
                          onChange={(e) => setNewUser(prev => ({ ...prev, last_name: e.target.value }))}
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="user-phone">Phone</Label>
                      <Input
                        id="user-phone"
                        value={newUser.phone}
                        onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createUser} disabled={isLoading}>
                        Create User
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {user.first_name} {user.last_name}
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">Username:</span> {user.username}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Auth Methods:</span> {user.auth_methods.length}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Roles:</span> {user.roles.join(", ")}
                      </div>
                      {user.last_login && (
                        <div className="text-sm">
                          <span className="font-medium">Last Login:</span> {new Date(user.last_login).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteUser(user.id)}
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

          <TabsContent value="sessions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Active Sessions</h2>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>
                  Monitor and manage user sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Auth Method</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="text-sm">{session.user_id}</TableCell>
                        <TableCell className="text-sm">{session.auth_method}</TableCell>
                        <TableCell className="text-sm">{session.client_info.device}</TableCell>
                        <TableCell className="text-sm">{session.client_info.ip}</TableCell>
                        <TableCell className="text-sm">{new Date(session.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{new Date(session.expires_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={session.active ? "default" : "secondary"}>
                            {session.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              // Revoke session logic
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Authentication Activity</h2>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Authentication Attempts</CardTitle>
                <CardDescription>
                  Monitor authentication attempts and security events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Device</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="text-sm">{new Date(attempt.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{attempt.user_id || attempt.email || "Unknown"}</TableCell>
                        <TableCell className="text-sm">{attempt.auth_method}</TableCell>
                        <TableCell>
                          <Badge className={getResultColor(attempt.result)}>
                            {attempt.result}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{attempt.reason}</TableCell>
                        <TableCell className="text-sm">{attempt.ip}</TableCell>
                        <TableCell className="text-sm">{attempt.user_agent}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Auth Method Detail Dialog */}
        <Dialog open={!!selectedMethod} onOpenChange={() => setSelectedMethod(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Method Details
              </DialogTitle>
              <DialogDescription>
                Complete authentication method configuration
              </DialogDescription>
            </DialogHeader>
            {selectedMethod && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMethodCode(!showMethodCode)}
                  >
                    {showMethodCode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showMethodCode ? "Hide Code" : "Show Code"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generateMethodCode(selectedMethod))
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                {showMethodCode ? (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      <code>{generateMethodCode(selectedMethod)}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <p className="text-sm font-medium">{selectedMethod.name}</p>
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Badge className={getMethodColor(selectedMethod.type)}>
                          {getMethodIcon(selectedMethod.type)}
                          {selectedMethod.type}
                        </Badge>
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <p className="text-sm font-medium">{selectedMethod.priority}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="flex gap-2">
                          <Badge variant={selectedMethod.enabled ? "default" : "secondary"}>
                            {selectedMethod.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          {selectedMethod.required && <Badge variant="destructive">Required</Badge>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-muted-foreground mt-2">{selectedMethod.description}</p>
                    </div>

                    <div>
                      <Label>Configuration</Label>
                      <div className="bg-slate-100 p-4 rounded-lg mt-2">
                        <pre className="text-sm">
                          <code>{JSON.stringify(selectedMethod.config, null, 2)}</code>
                        </pre>
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