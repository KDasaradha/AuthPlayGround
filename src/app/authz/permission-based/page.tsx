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
  FileText,
  Check,
  X,
  Users,
  User,
  Shield,
  Key,
  UserPlus,
  UserCheck,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Plus,
  Minus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
  action: string
}

interface UserPermission {
  userId: string
  permissionId: string
  grantedBy: string
  grantedAt: string
  expiresAt?: string
}

interface User {
  id: string
  name: string
  email: string
  isActive: boolean
}

export default function PermissionBasedPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [newPermissionName, setNewPermissionName] = useState("")
  const [newPermissionDescription, setNewPermissionDescription] = useState("")
  const [newPermissionCategory, setNewPermissionCategory] = useState("")
  const [newPermissionResource, setNewPermissionResource] = useState("")
  const [newPermissionAction, setNewPermissionAction] = useState("")
  const [selectedUserForPermission, setSelectedUserForPermission] = useState("")
  const [selectedPermissionForUser, setSelectedPermissionForUser] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const { toast } = useToast()

  // Initialize with default data
  useEffect(() => {
    const defaultPermissions: Permission[] = [
      {
        id: "user.create",
        name: "Create User",
        description: "Create new user accounts",
        category: "User Management",
        resource: "user",
        action: "create"
      },
      {
        id: "user.read",
        name: "Read User",
        description: "View user information",
        category: "User Management",
        resource: "user",
        action: "read"
      },
      {
        id: "user.update",
        name: "Update User",
        description: "Update user information",
        category: "User Management",
        resource: "user",
        action: "update"
      },
      {
        id: "user.delete",
        name: "Delete User",
        description: "Delete user accounts",
        category: "User Management",
        resource: "user",
        action: "delete"
      },
      {
        id: "document.create",
        name: "Create Document",
        description: "Create new documents",
        category: "Document Management",
        resource: "document",
        action: "create"
      },
      {
        id: "document.read",
        name: "Read Document",
        description: "View documents",
        category: "Document Management",
        resource: "document",
        action: "read"
      },
      {
        id: "document.update",
        name: "Update Document",
        description: "Update documents",
        category: "Document Management",
        resource: "document",
        action: "update"
      },
      {
        id: "document.delete",
        name: "Delete Document",
        description: "Delete documents",
        category: "Document Management",
        resource: "document",
        action: "delete"
      },
      {
        id: "report.read",
        name: "Read Reports",
        description: "View reports",
        category: "Reporting",
        resource: "report",
        action: "read"
      },
      {
        id: "report.export",
        name: "Export Reports",
        description: "Export reports",
        category: "Reporting",
        resource: "report",
        action: "export"
      },
      {
        id: "system.config",
        name: "System Configuration",
        description: "Configure system settings",
        category: "System",
        resource: "system",
        action: "configure"
      },
      {
        id: "audit.read",
        name: "Read Audit Logs",
        description: "View audit logs",
        category: "Audit",
        resource: "audit",
        action: "read"
      }
    ]

    const defaultUsers: User[] = [
      { id: "1", name: "John Smith", email: "john@company.com", isActive: true },
      { id: "2", name: "Sarah Johnson", email: "sarah@company.com", isActive: true },
      { id: "3", name: "Mike Wilson", email: "mike@company.com", isActive: true },
      { id: "4", name: "Emily Davis", email: "emily@company.com", isActive: true },
      { id: "5", name: "Tom Brown", email: "tom@company.com", isActive: true },
      { id: "6", name: "Lisa Anderson", email: "lisa@company.com", isActive: true }
    ]

    const defaultUserPermissions: UserPermission[] = [
      { userId: "1", permissionId: "user.create", grantedBy: "admin", grantedAt: "2024-01-15T10:00:00Z" },
      { userId: "1", permissionId: "user.read", grantedBy: "admin", grantedAt: "2024-01-15T10:00:00Z" },
      { userId: "1", permissionId: "user.update", grantedBy: "admin", grantedAt: "2024-01-15T10:00:00Z" },
      { userId: "1", permissionId: "user.delete", grantedBy: "admin", grantedAt: "2024-01-15T10:00:00Z" },
      { userId: "2", permissionId: "user.read", grantedBy: "admin", grantedAt: "2024-01-16T10:00:00Z" },
      { userId: "2", permissionId: "user.update", grantedBy: "admin", grantedAt: "2024-01-16T10:00:00Z" },
      { userId: "3", permissionId: "document.create", grantedBy: "manager", grantedAt: "2024-01-17T10:00:00Z" },
      { userId: "3", permissionId: "document.read", grantedBy: "manager", grantedAt: "2024-01-17T10:00:00Z" },
      { userId: "4", permissionId: "document.read", grantedBy: "manager", grantedAt: "2024-01-18T10:00:00Z" },
      { userId: "5", permissionId: "report.read", grantedBy: "supervisor", grantedAt: "2024-01-19T10:00:00Z", expiresAt: "2024-12-31T23:59:59Z" }
    ]

    setPermissions(defaultPermissions)
    setUsers(defaultUsers)
    setUserPermissions(defaultUserPermissions)
  }, [])

  const handleCreatePermission = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/authz/permission-based/permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPermissionName,
          description: newPermissionDescription,
          category: newPermissionCategory,
          resource: newPermissionResource,
          action: newPermissionAction
        })
      })

      const data = await response.json()

      if (data.success) {
        const newPermission: Permission = {
          id: data.permission.id,
          name: newPermissionName,
          description: newPermissionDescription,
          category: newPermissionCategory,
          resource: newPermissionResource,
          action: newPermissionAction
        }
        setPermissions([...permissions, newPermission])
        setNewPermissionName("")
        setNewPermissionDescription("")
        setNewPermissionCategory("")
        setNewPermissionResource("")
        setNewPermissionAction("")
        toast({
          title: "Permission Created",
          description: "New permission has been created successfully"
        })
      } else {
        toast({
          title: "Creation Failed",
          description: data.error || "Failed to create permission",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create permission",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGrantPermission = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/authz/permission-based/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserForPermission,
          permissionId: selectedPermissionForUser,
          expiresAt: expiryDate || null
        })
      })

      const data = await response.json()

      if (data.success) {
        const newUserPermission: UserPermission = {
          userId: selectedUserForPermission,
          permissionId: selectedPermissionForUser,
          grantedBy: "current_user",
          grantedAt: new Date().toISOString(),
          expiresAt: expiryDate || undefined
        }
        setUserPermissions([...userPermissions, newUserPermission])
        setSelectedUserForPermission("")
        setSelectedPermissionForUser("")
        setExpiryDate("")
        toast({
          title: "Permission Granted",
          description: "Permission has been granted to user"
        })
      } else {
        toast({
          title: "Grant Failed",
          description: data.error || "Failed to grant permission",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to grant permission",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRevokePermission = async (userId: string, permissionId: string) => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/authz/permission-based/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, permissionId })
      })

      const data = await response.json()

      if (data.success) {
        setUserPermissions(userPermissions.filter(
          up => !(up.userId === userId && up.permissionId === permissionId)
        ))
        toast({
          title: "Permission Revoked",
          description: "Permission has been revoked from user"
        })
      } else {
        toast({
          title: "Revoke Failed",
          description: data.error || "Failed to revoke permission",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke permission",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCheckPermission = async (userId: string, permissionId: string) => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/authz/permission-based/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, permissionId })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Permission Check",
          description: data.hasPermission ? "Permission granted" : "Permission denied",
          variant: data.hasPermission ? "default" : "destructive"
        })
      } else {
        toast({
          title: "Check Failed",
          description: data.error || "Failed to check permission",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check permission",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getUserPermissions = (userId: string) => {
    return userPermissions.filter(up => up.userId === userId)
  }

  const getPermissionDetails = (permissionId: string) => {
    return permissions.find(p => p.id === permissionId)
  }

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {}
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = []
      }
      categories[permission.category].push(permission)
    })
    return categories
  }

  const permissionsByCategory = getPermissionsByCategory()

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FileText className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Permission-Based Authorization</h1>
          </div>
          <p className="text-xl text-gray-600">Direct Permission Assignment</p>
          <p className="text-lg text-gray-500 mt-2">Granular access control with individual permissions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Permission Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permission Management
                </CardTitle>
                <CardDescription>
                  Create, assign, and manage individual permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="permissions" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="assign">Assign</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="check">Check</TabsTrigger>
                  </TabsList>

                  <TabsContent value="permissions" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Permission Catalog</h3>
                        <Button
                          onClick={() => setSelectedPermission(null)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Permission
                        </Button>
                      </div>

                      {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                        <div key={category} className="space-y-2">
                          <h4 className="font-medium text-gray-700">{category}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryPermissions.map((permission) => (
                              <Card key={permission.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold">{permission.name}</h5>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setSelectedPermission(permission)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{permission.description}</p>
                                  <div className="flex gap-2">
                                    <Badge variant="outline">{permission.resource}</Badge>
                                    <Badge variant="outline">{permission.action}</Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="assign" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Grant Permission</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Select User</Label>
                          <select
                            value={selectedUserForPermission}
                            onChange={(e) => setSelectedUserForPermission(e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select a user</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label>Select Permission</Label>
                          <select
                            value={selectedPermissionForUser}
                            onChange={(e) => setSelectedPermissionForUser(e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select a permission</option>
                            {permissions.map((permission) => (
                              <option key={permission.id} value={permission.id}>
                                {permission.name} ({permission.category})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label>Expiry Date (Optional)</Label>
                        <Input
                          type="datetime-local"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                        />
                      </div>

                      <Button
                        onClick={handleGrantPermission}
                        disabled={isProcessing || !selectedUserForPermission || !selectedPermissionForUser}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Granting...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Grant Permission
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="users" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">User Permissions</h3>
                      <div className="space-y-3">
                        {users.map((user) => {
                          const userPerms = getUserPermissions(user.id)
                          return (
                            <Card key={user.id}>
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                      <User className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">{user.name}</h4>
                                      <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={user.isActive ? "default" : "secondary"}>
                                      {user.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                    <Badge variant="outline">{userPerms.length} permissions</Badge>
                                  </div>
                                </div>

                                {userPerms.length > 0 && (
                                  <div className="space-y-2">
                                    {userPerms.map((userPerm) => {
                                      const perm = getPermissionDetails(userPerm.permissionId)
                                      return (
                                        <div key={userPerm.permissionId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium">{perm?.name}</span>
                                            {userPerm.expiresAt && (
                                              <Badge variant="outline" className="text-xs">
                                                Expires: {new Date(userPerm.expiresAt).toLocaleDateString()}
                                              </Badge>
                                            )}
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRevokePermission(user.id, userPerm.permissionId)}
                                          >
                                            <Minus className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="check" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Check Permission</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Select User</Label>
                          <select
                            value={selectedUser?.id || ""}
                            onChange={(e) => setSelectedUser(users.find(u => u.id === e.target.value) || null)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select a user</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label>Select Permission</Label>
                          <select
                            value={selectedPermission?.id || ""}
                            onChange={(e) => setSelectedPermission(permissions.find(p => p.id === e.target.value) || null)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Select a permission</option>
                            {permissions.map((permission) => (
                              <option key={permission.id} value={permission.id}>
                                {permission.name} ({permission.category})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <Button
                        onClick={() => selectedUser && selectedPermission && handleCheckPermission(selectedUser.id, selectedPermission.id)}
                        disabled={isProcessing || !selectedUser || !selectedPermission}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Check Permission
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Permission-Based Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Granular Control</p>
                      <p className="text-sm text-gray-600">Individual permission assignment</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Flexible</p>
                      <p className="text-sm text-gray-600">Custom permission combinations</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Temporary Access</p>
                      <p className="text-sm text-gray-600">Time-bound permissions</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Auditable</p>
                      <p className="text-sm text-gray-600">Complete permission tracking</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedPermission && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Permission Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label>Name</Label>
                      <Input value={selectedPermission.name} readOnly />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input value={selectedPermission.description} readOnly />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input value={selectedPermission.category} readOnly />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Resource</Label>
                        <Input value={selectedPermission.resource} readOnly />
                      </div>
                      <div>
                        <Label>Action</Label>
                        <Input value={selectedPermission.action} readOnly />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Principle of least privilege enforced
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      No implicit permissions - everything is explicit
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Easy to audit and review access rights
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