'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Code,
  BookOpen,
  Play,
  Users,
  Shield,
  Settings
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Resource {
  id: string
  name: string
  requiredPermission: string
}

export default function RBACPage() {
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedResource, setSelectedResource] = useState<string>('')
  const [selectedAction, setSelectedAction] = useState<string>('read')
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for simulation
  const users: User[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice@company.com', role: 'admin' },
    { id: '2', name: 'Bob Smith', email: 'bob@company.com', role: 'manager' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@company.com', role: 'user' },
    { id: '4', name: 'Diana Prince', email: 'diana@company.com', role: 'viewer' }
  ]

  const resources: Resource[] = [
    { id: '1', name: 'User Management', requiredPermission: 'users:write' },
    { id: '2', name: 'Financial Reports', requiredPermission: 'reports:read' },
    { id: '3', name: 'System Settings', requiredPermission: 'settings:write' },
    { id: '4', name: 'Dashboard', requiredPermission: 'dashboard:read' },
    { id: '5', name: 'API Configuration', requiredPermission: 'api:write' }
  ]

  const actions = [
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
    { value: 'delete', label: 'Delete' },
    { value: 'admin', label: 'Admin' }
  ]

  const handleCheckPermission = async () => {
    if (!selectedUser || !selectedResource || !selectedAction) {
      setResult({ success: false, message: 'Please select user, resource, and action' })
      return
    }

    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/authz/rbac/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          resourceId: selectedResource,
          action: selectedAction
        }),
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const frontendCode = `// RBAC Implementation in Frontend
class RBAC {
  constructor() {
    this.userRoles = new Map(); // userId -> roleId
    this.rolePermissions = new Map(); // roleId -> permissions[]
    this.users = new Map(); // userId -> user data
    this.roles = new Map(); // roleId -> role data
  }

  // Check if user has permission for a specific action on resource
  hasPermission(userId, resource, action) {
    const user = this.users.get(userId);
    if (!user) return false;

    const roleId = user.roleId;
    const permissions = this.rolePermissions.get(roleId) || [];
    
    const requiredPermission = \`\${resource}:\${action}\`;
    return permissions.includes(requiredPermission);
  }

  // Get all permissions for a user
  getUserPermissions(userId) {
    const user = this.users.get(userId);
    if (!user) return [];

    const roleId = user.roleId;
    return this.rolePermissions.get(roleId) || [];
  }

  // Check access and throw error if denied
  checkAccess(userId, resource, action) {
    if (!this.hasPermission(userId, resource, action)) {
      throw new Error(\`Access denied: \${action} on \${resource}\`);
    }
  }

  // UI component for conditional rendering
  ProtectedComponent({ userId, resource, action, children, fallback }) {
    const hasAccess = this.hasPermission(userId, resource, action);
    return hasAccess ? children : fallback || null;
  }
}

// Usage in React component
const rbac = new RBAC();

function UserManagement({ currentUser }) {
  const canManageUsers = rbac.hasPermission(currentUser.id, 'users', 'write');
  
  return (
    <div>
      <h2>User Management</h2>
      {canManageUsers && (
        <button onClick={() => setShowCreateUser(true)}>
          Create New User
        </button>
      )}
      <UserList />
    </div>
  );
}

// HOC for protecting routes
function withRBAC(WrappedComponent, requiredResource, requiredAction) {
  return function ProtectedComponent(props) {
    const { user } = props;
    
    if (!rbac.hasPermission(user.id, requiredResource, requiredAction)) {
      return <AccessDenied />;
    }
    
    return <WrappedComponent {...props} />;
  };
}

// Usage
const ProtectedUserManagement = withRBAC(UserManagement, 'users', 'write');`

  const backendCode = `// FastAPI RBAC Implementation
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List, Dict, Set
import databases
from sqlalchemy import create_engine, Table, Column, String, Integer, ForeignKey

app = FastAPI()

# Database models (simplified)
class User(BaseModel):
    id: str
    name: str
    email: str
    role_id: str

class Role(BaseModel):
    id: str
    name: str
    description: str

class Permission(BaseModel):
    id: str
    name: str
    resource: str
    action: str

# RBAC Service
class RBACService:
    def __init__(self):
        self.user_roles: Dict[str, str] = {}  # user_id -> role_id
        self.role_permissions: Dict[str, Set[str]] = {}  # role_id -> permissions
        self.users: Dict[str, User] = {}
        self.roles: Dict[str, Role] = {}
        
        # Initialize with sample data
        self._initialize_data()
    
    def _initialize_data(self):
        # Sample roles and permissions
        admin_permissions = {
            "users:read", "users:write", "users:delete",
            "reports:read", "reports:write",
            "settings:read", "settings:write",
            "dashboard:read", "api:write"
        }
        
        manager_permissions = {
            "users:read", "users:write",
            "reports:read", "reports:write",
            "dashboard:read"
        }
        
        user_permissions = {
            "dashboard:read"
        }
        
        viewer_permissions = {
            "dashboard:read"
        }
        
        self.role_permissions = {
            "admin": admin_permissions,
            "manager": manager_permissions,
            "user": user_permissions,
            "viewer": viewer_permissions
        }
        
        # Sample users
        self.users = {
            "1": User(id="1", name="Alice", email="alice@company.com", role_id="admin"),
            "2": User(id="2", name="Bob", email="bob@company.com", role_id="manager"),
            "3": User(id="3", name="Charlie", email="charlie@company.com", role_id="user"),
            "4": User(id="4", name="Diana", email="diana@company.com", role_id="viewer")
        }
    
    def has_permission(self, user_id: str, resource: str, action: str) -> bool:
        """Check if user has permission for specific action on resource"""
        user = self.users.get(user_id)
        if not user:
            return False
        
        role_id = user.role_id
        permissions = self.role_permissions.get(role_id, set())
        required_permission = f"{resource}:{action}"
        
        return required_permission in permissions
    
    def get_user_permissions(self, user_id: str) -> List[str]:
        """Get all permissions for a user"""
        user = self.users.get(user_id)
        if not user:
            return []
        
        role_id = user.role_id
        return list(self.role_permissions.get(role_id, set()))
    
    def check_access(self, user_id: str, resource: str, action: str):
        """Check access and raise exception if denied"""
        if not self.has_permission(user_id, resource, action):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: {action} on {resource}"
            )

# Dependency for checking permissions
rbac_service = RBACService()

def require_permission(resource: str, action: str):
    def dependency(user_id: str):
        rbac_service.check_access(user_id, resource, action)
        return user_id
    return dependency

# API endpoints
@app.post("/authz/check")
async def check_permission(
    user_id: str,
    resource: str,
    action: str
):
    """Check if user has permission"""
    has_access = rbac_service.has_permission(user_id, resource, action)
    
    return {
        "success": True,
        "has_access": has_access,
        "user_id": user_id,
        "resource": resource,
        "action": action,
        "permissions": rbac_service.get_user_permissions(user_id)
    }

@app.get("/users")
async def get_users(
    user_id: str = Depends(require_permission("users", "read"))
):
    """Get all users - requires users:read permission"""
    return list(rbac_service.users.values())

@app.post("/users")
async def create_user(
    user_data: dict,
    user_id: str = Depends(require_permission("users", "write"))
):
    """Create user - requires users:write permission"""
    # Implementation here
    return {"message": "User created successfully"}

@app.delete("/users/{target_user_id}")
async def delete_user(
    target_user_id: str,
    user_id: str = Depends(require_permission("users", "delete"))
):
    """Delete user - requires users:delete permission"""
    # Implementation here
    return {"message": "User deleted successfully"}`

  const flowDiagram = `\`\`\`mermaid
sequenceDiagram
    participant Client
    participant API
    participant RBAC Service
    participant Database
    
    Client->>API: Request protected resource
    API->>RBAC Service: Check permission(user, resource, action)
    RBAC Service->>Database: Get user role
    Database->>RBAC Service: Return role
    RBAC Service->>Database: Get role permissions
    Database->>RBAC Service: Return permissions
    RBAC Service->>RBAC Service: Check if required permission exists
    alt Permission granted
        RBAC Service->>API: Permission granted
        API->>Client: Return protected data
    else Permission denied
        RBAC Service->>API: Permission denied
        API->>Client: 403 Forbidden
    end
\`\`\``

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-500 text-white rounded-lg">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Role-Based Access Control (RBAC)
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Authorization model based on user roles and permissions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
          <Badge variant="outline">Role-Based</Badge>
          <Badge variant="outline">Enterprise Standard</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flow">Flow</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="explanation">Explanation</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  What It Is
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  RBAC is an authorization model that restricts system access to authorized users based on their roles within an organization. 
                  Users are assigned roles, and roles are assigned permissions, creating a hierarchical access control system.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Why It's Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-slate-600 dark:text-slate-400 space-y-2">
                  <li>• Simplified permission management</li>
                  <li>• Scalable to large organizations</li>
                  <li>• Clear separation of duties</li>
                  <li>• Easy to audit and compliance</li>
                  <li>• Reduces administrative overhead</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Real-World Use Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Enterprise Applications</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Large organizations use RBAC for managing access to internal systems and data
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Healthcare Systems</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Hospitals use RBAC to control access to patient records and medical systems
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Financial Services</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Banks implement RBAC for transaction processing and customer data access
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Best Practice:</strong> Implement the principle of least privilege by giving users only the minimum permissions necessary to perform their job functions.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RBAC Authorization Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{flowDiagram}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Tab */}
        <TabsContent value="code" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Frontend (Next.js)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{frontendCode}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Backend (FastAPI)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{backendCode}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                RBAC Permission Simulator
              </CardTitle>
              <CardDescription>
                Test role-based access control with different users and resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="user">Select User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.role}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="resource">Select Resource</Label>
                  <Select value={selectedResource} onValueChange={setSelectedResource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          <div>
                            <div className="font-medium">{resource.name}</div>
                            <div className="text-sm text-slate-500">{resource.requiredPermission}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="action">Select Action</Label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCheckPermission} 
                disabled={isLoading || !selectedUser || !selectedResource || !selectedAction}
                className="w-full"
              >
                {isLoading ? 'Checking...' : 'Check Permission'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {result && (
                <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                      {result.message}
                      {result.details && (
                        <div className="mt-2 text-sm">
                          <strong>User Permissions:</strong> {result.details.permissions?.join(', ') || 'None'}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {/* Role Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      User Roles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="h-5 w-5" />
                      Role Permissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded">
                        <div className="font-medium mb-2">Admin</div>
                        <div className="text-sm text-slate-600">Full access to all resources</div>
                      </div>
                      <div className="p-3 border rounded">
                        <div className="font-medium mb-2">Manager</div>
                        <div className="text-sm text-slate-600">Users (read/write), Reports, Dashboard</div>
                      </div>
                      <div className="p-3 border rounded">
                        <div className="font-medium mb-2">User</div>
                        <div className="text-sm text-slate-600">Dashboard access only</div>
                      </div>
                      <div className="p-3 border rounded">
                        <div className="font-medium mb-2">Viewer</div>
                        <div className="text-sm text-slate-600">Read-only dashboard access</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explanation Tab */}
        <TabsContent value="explanation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RBAC Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">1. Users</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Individual entities that need access to system resources. Each user is assigned one or more roles.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">2. Roles</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Job functions within an organization with defined levels of authority (e.g., Admin, Manager, User, Viewer).
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Permissions</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Specific authorizations to perform operations on resources (e.g., users:read, reports:write, settings:delete).
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">4. Resources</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  System objects that need protection (e.g., user data, financial reports, system settings).
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">5. Role-Permission Assignment</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Mapping that defines which permissions are associated with each role.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">6. User-Role Assignment</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Mapping that assigns roles to users, determining their access rights.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>RBAC Benefits and Considerations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Benefits</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Simplified administration</li>
                    <li>• Consistent permission enforcement</li>
                    <li>• Easy to audit and review</li>
                    <li>• Scalable to large organizations</li>
                    <li>• Clear separation of duties</li>
                    <li>• Reduced permission errors</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-600 mb-2">Considerations</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Role explosion in complex systems</li>
                    <li>• May be too rigid for some use cases</li>
                    <li>• Regular role reviews needed</li>
                    <li>• Potential for permission creep</li>
                    <li>• Complex role hierarchies</li>
                    <li>• Careful initial design required</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <h4 className="font-semibold mb-2">Principle of Least Privilege</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Grant users only the minimum permissions necessary to perform their job functions.
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950">
                  <h4 className="font-semibold mb-2">Role Naming Conventions</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Use clear, descriptive role names that reflect job functions and responsibilities.
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <h4 className="font-semibold mb-2">Regular Audits</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Periodically review and audit role assignments and permissions to ensure they remain appropriate.
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950">
                  <h4 className="font-semibold mb-2">Separation of Duties</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Ensure that critical operations require multiple users with different roles to complete.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}