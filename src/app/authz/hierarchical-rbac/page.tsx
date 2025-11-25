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
  GitBranch, 
  Check, 
  X, 
  Users, 
  User, 
  Shield, 
  Crown,
  UserPlus,
  UserCheck,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle,
  Key,
  Lock,
  Unlock,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Edit,
  Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Role {
  id: string
  name: string
  description: string
  level: number
  parent?: string
  permissions: string[]
  userCount: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export default function HierarchicalRBACPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPermissionDetails, setShowPermissionDetails] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")
  const [newRoleParent, setNewRoleParent] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const { toast } = useToast()

  // Initialize with default data
  useEffect(() => {
    const defaultRoles: Role[] = [
      {
        id: "super_admin",
        name: "Super Admin",
        description: "Full system access",
        level: 0,
        permissions: ["*"],
        userCount: 2
      },
      {
        id: "admin",
        name: "Admin",
        description: "Administrative access",
        level: 1,
        parent: "super_admin",
        permissions: ["users.read", "users.write", "roles.read", "roles.write", "system.config"],
        userCount: 5
      },
      {
        id: "manager",
        name: "Manager",
        description: "Team management access",
        level: 2,
        parent: "admin",
        permissions: ["users.read", "team.read", "team.write", "reports.read"],
        userCount: 12
      },
      {
        id: "supervisor",
        name: "Supervisor",
        description: "Supervisory access",
        level: 3,
        parent: "manager",
        permissions: ["users.read", "team.read", "reports.read"],
        userCount: 8
      },
      {
        id: "employee",
        name: "Employee",
        description: "Basic employee access",
        level: 4,
        parent: "supervisor",
        permissions: ["profile.read", "profile.write"],
        userCount: 45
      },
      {
        id: "guest",
        name: "Guest",
        description: "Limited guest access",
        level: 5,
        parent: "employee",
        permissions: ["profile.read"],
        userCount: 3
      }
    ]

    const defaultUsers: User[] = [
      { id: "1", name: "John Smith", email: "john@company.com", role: "super_admin", isActive: true },
      { id: "2", name: "Sarah Johnson", email: "sarah@company.com", role: "admin", isActive: true },
      { id: "3", name: "Mike Wilson", email: "mike@company.com", role: "manager", isActive: true },
      { id: "4", name: "Emily Davis", email: "emily@company.com", role: "supervisor", isActive: true },
      { id: "5", name: "Tom Brown", email: "tom@company.com", role: "employee", isActive: true },
      { id: "6", name: "Lisa Anderson", email: "lisa@company.com", role: "guest", isActive: true }
    ]

    const defaultPermissions: Permission[] = [
      { id: "users.read", name: "Read Users", description: "View user information", category: "User Management" },
      { id: "users.write", name: "Write Users", description: "Create and edit users", category: "User Management" },
      { id: "roles.read", name: "Read Roles", description: "View role information", category: "Role Management" },
      { id: "roles.write", name: "Write Roles", description: "Create and edit roles", category: "Role Management" },
      { id: "team.read", name: "Read Team", description: "View team information", category: "Team Management" },
      { id: "team.write", name: "Write Team", description: "Manage team members", category: "Team Management" },
      { id: "reports.read", name: "Read Reports", description: "View reports", category: "Reporting" },
      { id: "system.config", name: "System Config", description: "Configure system settings", category: "System" },
      { id: "profile.read", name: "Read Profile", description: "View own profile", category: "Personal" },
      { id: "profile.write", name: "Write Profile", description: "Edit own profile", category: "Personal" }
    ]

    setRoles(defaultRoles)
    setUsers(defaultUsers)
    setPermissions(defaultPermissions)
  }, [])

  const handleCreateRole = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/authz/hierarchical-rbac/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDescription,
          parent: newRoleParent,
          permissions: selectedPermissions
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newRole: Role = {
          id: data.role.id,
          name: newRoleName,
          description: newRoleDescription,
          level: data.role.level,
          parent: newRoleParent,
          permissions: selectedPermissions,
          userCount: 0
        }
        setRoles([...roles, newRole])
        setNewRoleName("")
        setNewRoleDescription("")
        setNewRoleParent("")
        setSelectedPermissions([])
        toast({
          title: "Role Created",
          description: "New role has been created successfully"
        })
      } else {
        toast({
          title: "Creation Failed",
          description: data.error || "Failed to create role",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAssignRole = async (userId: string, roleId: string) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/authz/hierarchical-rbac/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: roleId } : user
        ))
        toast({
          title: "Role Assigned",
          description: "User role has been updated"
        })
      } else {
        toast({
          title: "Assignment Failed",
          description: data.error || "Failed to assign role",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCheckPermission = async (userId: string, permission: string) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/authz/hierarchical-rbac/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, permission })
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

  const getRoleHierarchy = () => {
    const hierarchy: Role[] = []
    const visited = new Set<string>()
    
    const buildHierarchy = (role: Role, level: number = 0) => {
      if (visited.has(role.id)) return
      visited.add(role.id)
      
      hierarchy.push({ ...role, level })
      
      const children = roles.filter(r => r.parent === role.id)
      children.forEach(child => buildHierarchy(child, level + 1))
    }
    
    const rootRoles = roles.filter(r => !r.parent)
    rootRoles.forEach(role => buildHierarchy(role))
    
    return hierarchy
  }

  const getEffectivePermissions = (roleId: string): string[] => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return []
    
    let permissions = [...role.permissions]
    let currentRole = role
    
    // Inherit permissions from parent roles
    while (currentRole.parent) {
      const parentRole = roles.find(r => r.id === currentRole.parent)
      if (parentRole) {
        permissions = [...permissions, ...parentRole.permissions]
        currentRole = parentRole
      } else {
        break
      }
    }
    
    return [...new Set(permissions)]
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    )
  }

  const roleHierarchy = getRoleHierarchy()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <GitBranch className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Hierarchical RBAC</h1>
          </div>
          <p className="text-xl text-gray-600">Role-Based Access Control</p>
          <p className="text-lg text-gray-500 mt-2">Multi-level role hierarchy with inheritance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main RBAC Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Hierarchy Management
                </CardTitle>
                <CardDescription>
                  Manage roles, users, and permissions in a hierarchical structure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="hierarchy" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="hierarchy" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Role Hierarchy</h3>
                      <div className="space-y-2">
                        {roleHierarchy.map((role) => (
                          <div 
                            key={role.id} 
                            className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow"
                            style={{ marginLeft: `${role.level * 24}px` }}
                          >
                            <div className="flex items-center gap-2">
                              {role.level === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                              {role.level > 0 && <ArrowDown className="h-4 w-4 text-gray-400" />}
                              <div className={`p-2 rounded-lg ${
                                role.level === 0 ? 'bg-yellow-100' :
                                role.level === 1 ? 'bg-red-100' :
                                role.level === 2 ? 'bg-blue-100' :
                                role.level === 3 ? 'bg-green-100' :
                                'bg-gray-100'
                              }`}>
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{role.name}</h4>
                                <p className="text-sm text-gray-500">{role.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                              <Badge variant="outline">{role.userCount} users</Badge>
                              <Badge variant="outline">{role.permissions.length} perms</Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedRole(role)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="roles" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Role Management</h3>
                        <Button
                          onClick={() => setSelectedRole(null)}
                          variant="outline"
                          size="sm"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Role
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {roles.map((role) => (
                          <Card key={role.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    role.level === 0 ? 'bg-yellow-100' :
                                    role.level === 1 ? 'bg-red-100' :
                                    role.level === 2 ? 'bg-blue-100' :
                                    role.level === 3 ? 'bg-green-100' :
                                    'bg-gray-100'
                                  }`}>
                                    <Users className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{role.name}</h4>
                                    <p className="text-sm text-gray-500">{role.description}</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedRole(role)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Level:</span>
                                  <span className="font-medium">{role.level}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Parent:</span>
                                  <span className="font-medium">
                                    {role.parent ? roles.find(r => r.id === role.parent)?.name : 'None'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Users:</span>
                                  <span className="font-medium">{role.userCount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Permissions:</span>
                                  <span className="font-medium">{role.permissions.length}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="users" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">User Management</h3>
                      <div className="space-y-2">
                        {users.map((user) => {
                          const userRole = roles.find(r => r.id === user.role)
                          return (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
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
                                <Badge variant="outline">{userRole?.name}</Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="permissions" className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Permission Catalog</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {permissions.map((permission) => (
                          <Card key={permission.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{permission.name}</h4>
                                <Badge variant="outline">{permission.category}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{permission.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
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
                  RBAC Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Role Hierarchy</p>
                      <p className="text-sm text-gray-600">Multi-level role structure</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Permission Inheritance</p>
                      <p className="text-sm text-gray-600">Child roles inherit parent permissions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Least Privilege</p>
                      <p className="text-sm text-gray-600">Users get minimum required access</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Scalable</p>
                      <p className="text-sm text-gray-600">Easy to add new roles and permissions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedRole && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Role Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label>Role Name</Label>
                      <Input value={selectedRole.name} readOnly />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input value={selectedRole.description} readOnly />
                    </div>
                    <div>
                      <Label>Level</Label>
                      <Input value={selectedRole.level.toString()} readOnly />
                    </div>
                    <div>
                      <Label>Effective Permissions</Label>
                      <div className="space-y-1 mt-2">
                        {getEffectivePermissions(selectedRole.id).map((perm) => (
                          <div key={perm} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-sm">{perm}</span>
                          </div>
                        ))}
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
                      Hierarchical RBAC prevents privilege escalation
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Clear separation of duties and responsibilities
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Easy to audit and review access patterns
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