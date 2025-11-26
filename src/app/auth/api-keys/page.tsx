import { useState, useEffect } from "react"
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
  Key,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Code,
  BookOpen,
  Play,
  RefreshCw,
  Copy,
  Trash2,
  Shield,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  createdAt: string
  expiresAt?: string
  lastUsedAt?: string
}

export default function ApiKeysPage() {
  const [apiKeyName, setApiKeyName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [apiKey, setApiKey] = useState('')
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const [showToken, setShowToken] = useState(false)

  const availablePermissions = [
    'read:users',
    'write:users',
    'delete:users',
    'read:products',
    'write:products',
    'delete:products',
    'read:orders',
    'write:orders',
    'admin:all'
  ]

  const handleGenerateKey = async () => {
    if (!apiKeyName || selectedPermissions.length === 0) {
      setResult({ success: false, message: 'API key name and permissions are required' })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/auth/api-keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: apiKeyName,
          permissions: selectedPermissions
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setApiKey(data.data.key)
        setApiKeys(prev => [data.data, ...prev])
        setApiKeyName('')
        setSelectedPermissions([])
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidateKey = async () => {
    if (!apiKey) {
      setResult({ success: false, message: 'Please enter an API key to validate' })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/auth/api-keys/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch('/api/auth/api-keys/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId }),
      })

      const data = await response.json()
      if (data.success) {
        setApiKeys(prev => prev.filter(key => key.id !== keyId))
      }
    } catch (error) {
      console.error('Delete API key error:', error)
    }
  }

  const frontendCode = `// API Key Authentication with Next.js
class ApiKeyAuth {
  constructor() {
    this.apiKeys = JSON.parse(localStorage.getItem('api_keys') || '[]');
  }

  // Generate new API key
  async generateApiKey(name, permissions) {
    try {
      const response = await fetch('/api/auth/api-keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        'Authorization': \`Bearer \${this.getAuthToken()}\`
        },
        body: JSON.stringify({ name, permissions })
      });

      const data = await response.json();
      
      if (data.success) {
        this.apiKeys.push(data.data);
        this.saveApiKeys();
        return data.data;
      }
      
      throw new Error(data.message || 'API key generation failed');
    } catch (error) {
      console.error('API key generation error:', error);
      throw error;
    }
  }

  // Make authenticated request with API key
  async makeAuthenticatedRequest(url, options = {}) {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error('No API key available');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-API-Key': apiKey
        }
      });

      if (response.status === 401) {
        throw new Error('API key invalid or expired');
      }

      return response;
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }

  // Get API key for specific service
  getApiKey(service = null) {
    if (service) {
      return this.apiKeys.find(key => key.name === service)?.key || null;
    }
    return this.apiKeys[0]?.key || null;
  }

  // Get auth token (from session or other auth method)
  getAuthToken() {
    return localStorage.getItem('auth_token') || null;
  }

  // Save API keys to localStorage
  saveApiKeys() {
    localStorage.setItem('api_keys', JSON.stringify(this.apiKeys));
  }

  // Delete API key
  async deleteApiKey(keyId) {
    try {
      const response = await fetch('/api/auth/api-keys/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.getAuthToken()}\`
        },
        body: JSON.stringify({ keyId })
      });

      const data = await response.json();
      
      if (data.success) {
        this.apiKeys = this.apiKeys.filter(key => key.id !== keyId);
        this.saveApiKeys();
        return data;
      }
      
      throw new Error(data.message || 'API key deletion failed');
    } catch (error) {
      console.error('Delete API key error:', error);
      throw error;
    }
  }

  // Get all API keys
  getApiKeys() {
    return this.apiKeys;
  }
}

// Usage in React component
const apiKeyAuth = new ApiKeyAuth();

function ApiKeyManager() {
  const [keyName, setKeyName] = useState('');
  const [permissions, setPermissions] = useState([]);

  const handleGenerateKey = async () => {
    try {
      const newKey = await apiKeyAuth.generateApiKey(keyName, permissions);
      alert(\`API key "\${newKey.name}" generated successfully!\`);
      setKeyName('');
      setPermissions([]);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={keyName}
        onChange={(e) => setKeyName(e.target.value)}
        placeholder="API Key Name"
      />
      <select multiple value={permissions} onChange={(e) => setPermissions(Array.from(e.target.selectedOptions))}>
        <option value="read:users">Read Users</option>
        <option value="write:users">Write Users</option>
        <option value="admin:all">Admin Access</option>
      </select>
      <button onClick={handleGenerateKey}>
        Generate API Key
      </button>
    </div>
  );
}

// HOC for API key protected routes
function withApiKeyAuth(WrappedComponent, requiredPermissions = []) {
  return function ProtectedComponent(props) {
    const apiKey = apiKeyAuth.getApiKey();
    
    if (!apiKey) {
      return <div>API key required</div>;
    }
    
    // Check permissions (would need server-side validation)
    // This is simplified - in reality, you'd validate permissions server-side
    
    return <WrappedComponent {...props} />;
  };
}`

  const backendCode = `// FastAPI API Key Authentication
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import List, Optional

app = FastAPI()

# API Key security
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# Mock user database
users_db = {
    "admin": {
        "id": 1,
        "username": "admin",
        "hashed_password": hashlib.sha256("password123".encode()).hexdigest(),
        "email": "admin@example.com"
    }
}

# API Key storage (in production, use database)
api_keys = {}

class ApiKeyRequest(BaseModel):
    name: str
    permissions: List[str]

class ApiKey(BaseModel):
    id: str
    name: str
    key: str
    permissions: List[str]
    created_at: datetime
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    user_id: int

def generate_api_key(user_id: int, name: str, permissions: List[str]) -> str:
    """Generate a secure API key"""
    key = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=365)  # 1 year expiry
    
    api_keys[key] = {
        "user_id": user_id,
        "name": name,
        "permissions": permissions,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
        "last_used_at": None
    }
    
    return key

def validate_api_key(api_key: str) -> dict:
    """Validate API key and return user data"""
    if api_key not in api_keys:
        return None
    
    key_data = api_keys[api_key]
    
    # Check if key expired
    if key_data["expires_at"] and key_data["expires_at"] < datetime.utcnow():
        return None
    
    # Update last used time
    key_data["last_used_at"] = datetime.utcnow()
    
    return key_data

def get_current_user_from_api_key(request: Request):
    """Get current user from API key"""
    api_key = request.headers.get("x-api-key")
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required"
        )
    
    key_data = validate_api_key(api_key)
    
    if not key_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired API key"
        )
    
    return key_data

@app.post("/auth/api-keys/generate")
async def generate_api_key_endpoint(
    request_data: ApiKeyRequest,
    current_user: dict = Depends(get_current_user_from_api_key)
):
    """Generate new API key"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # Generate API key
    api_key = generate_api_key(
        current_user["user_id"],
        request_data.name,
        request_data.permissions
    )
    
    return {
        "success": True,
        "message": "API key generated successfully",
        "data": {
            "id": secrets.token_urlsafe(8),
            "name": request_data.name,
            "key": api_key,
            "permissions": request_data.permissions,
            "created_at": api_keys[api_key]["created_at"],
            "expires_at": api_keys[api_key]["expires_at"]
        }
    }

@app.post("/auth/api-keys/validate")
async def validate_api_key_endpoint(
    request: Request,
    api_key: str = Depends(api_key_header)
):
    """Validate API key"""
    key_data = validate_api_key(api_key)
    
    if not key_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired API key"
        )
    
    # Update last used time
    api_keys[api_key]["last_used_at"] = datetime.utcnow()
    
    return {
        "success": True,
        "message": "API key is valid",
        "data": {
            "key_id": api_keys[api_key]["id"],
            "name": api_keys[api_key]["name"],
            "permissions": api_keys[api_key]["permissions"],
            "user_id": key_data["user_id"],
            "last_used_at": api_keys[api_key]["last_used_at"]
        }
    }

@app.delete("/auth/api-keys/delete")
async def delete_api_key_endpoint(
    request_data: dict,
    current_user: dict = Depends(get_current_user_from_api_key)
):
    """Delete API key"""
    key_id = request_data.get("key_id")
    
    if not key_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Key ID is required"
        )
    
    # Find and delete the key
    key_to_delete = None
    for api_key, key_data in api_keys.items():
        if key_data["id"] == key_id and key_data["user_id"] == current_user["user_id"]:
            key_to_delete = api_key
            break
    
    if not key_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Delete the key
    del api_keys[key_to_delete]
    
    return {
        "success": True,
        "message": "API key deleted successfully"
    }

# Dependency for protected routes
async def get_api_key_user(request: Request):
    """Get user from API key with permission check"""
    key_data = get_current_user_from_api_key(request)
    return key_data

@app.get("/protected")
async def protected_route(
    request: Request,
    current_user: dict = Depends(get_api_key_user)
):
    """Protected route requiring valid API key"""
    return {
        "message": f"Hello user {current_user['user_id']}!",
        "permissions": current_user["permissions"],
        "last_used": current_user.get("last_used_at")
    }

# Middleware for API key cleanup
@app.middleware("http")
async def api_key_cleanup(request: Request, call_next):
    """Clean up expired API keys"""
    current_time = datetime.utcnow()
    expired_keys = [
        api_key for api_key, data in api_keys.items()
        if data["expires_at"] and data["expires_at"] < current_time
    ]
    
    for api_key in expired_keys:
        del api_keys[api_key]
    
    response = await call_next(request)
    return response`

  const flowDiagram = `\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Browser
    participant Server
    participant ApiKeyStore
    
    Client->>Browser: Request API key generation
    Browser->>Server: POST /api-keys/generate + auth
    Server->>Server: Validate user authentication
    Server->>ApiKeyStore: Generate API key
    ApiKeyStore->>Server: Return key data
    Server->>Browser: 200 OK + API key
    Browser->>Client: Display API key
    
    Client->>Browser: Make API request with key
    Browser->>Server: GET /protected + X-API-Key header
    Server->>ApiKeyStore: Validate API key
    ApiKeyStore->>Server: Return key data
    Server->>Browser: 200 OK + protected data
    Browser->>Client: Display API response
    
    Note over Server: API key expires after 1 year
    Client->>Browser: Delete API key
    Browser->>Server: DELETE /api-keys/delete + auth
    Server->>ApiKeyStore: Remove API key
    Server->>Browser: 200 OK
    Browser->>Client: Confirm deletion
\`\`\``;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gray-600 text-white rounded-lg">
            <Key className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              API Key Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Key-based authentication for programmatic access
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
          <Badge variant="outline">Stateless</Badge>
          <Badge variant="outline">Programmatic</Badge>
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
                  API Key authentication uses unique, long-lived keys sent in HTTP headers
                  to authenticate programmatic access to APIs and services.
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
                  <li>• Simple to implement</li>
                  <li>• No user interaction required</li>
                  <li>• Fine-grained access control</li>
                  <li>• Easy to revoke and rotate</li>
                  <li>• Audit trail capability</li>
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
                  <h4 className="font-semibold mb-2">REST APIs</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Public or private APIs requiring secure access
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Microservices</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Service-to-service communication in distributed systems
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Developer Tools</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    CLI tools and SDKs for API integration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> API keys should be treated like passwords - stored securely,
              rotated regularly, and have limited permissions and expiration.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Key Authentication Flow</CardTitle>
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
                API Key Authentication Simulation
              </CardTitle>
              <CardDescription>
                Generate and validate API keys for programmatic access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Generate API Key</h3>
                  <div>
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      type="text"
                      value={apiKeyName}
                      onChange={(e) => setApiKeyName(e.target.value)}
                      placeholder="Enter key name (e.g., Production API)"
                    />
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                      {availablePermissions.map((permission) => (
                        <div key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            id={permission}
                            checked={selectedPermissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPermissions([...selectedPermissions, permission])
                              } else {
                                setSelectedPermissions(selectedPermissions.filter(p => p !== permission))
                              }
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={permission} className="text-sm cursor-pointer">
                            {permission}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateKey}
                    disabled={isLoading || !apiKeyName || selectedPermissions.length === 0}
                    className="w-full"
                  >
                    {isLoading ? 'Generating...' : 'Generate API Key'}
                    <Plus className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-semibold mb-2">API Key Usage:</h4>
                    <div className="text-sm space-y-1">
                      <p>• Include key in <code>X-API-Key</code> header</p>
                      <p>• Send with every API request</p>
                      <p>• Keep keys secure and rotate regularly</p>
                      <p>• Use environment variables in production</p>
                    </div>
                  </div>

                  {apiKey && (
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg">
                      <h4 className="font-semibold mb-2">Generated API Key:</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          type={showToken ? "text" : "password"}
                          value={apiKey}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowToken(!showToken)}
                        >
                          {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Copy this key for validation testing
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Validate API Key</h3>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key to validate"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleValidateKey}
                    disabled={isLoading || !apiKey}
                  >
                    {isLoading ? 'Validating...' : 'Validate Key'}
                    <RefreshCw className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

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
                      {result.data && (
                        <div className="mt-2 text-sm">
                          <strong>Key Name:</strong> {result.data.name}<br />
                          <strong>Permissions:</strong> {result.data.permissions?.join(', ')}<br />
                          <strong>Last Used:</strong> {result.data.last_used_at ? new Date(result.data.last_used_at).toLocaleString() : 'Never'}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explanation Tab */}
        <TabsContent value="explanation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Explanation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">1. Key Generation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  User generates API key through authenticated interface, specifying name and required permissions.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">2. Server Creation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server generates cryptographically secure random key with specified permissions and expiration.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Key Storage</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server stores API key with metadata (creation time, permissions, usage tracking).
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">4. Client Usage</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Client includes API key in HTTP header (typically X-API-Key) for each request.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">5. Server Validation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server validates API key, checks permissions, and updates usage tracking.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Access Control</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server grants or denies access based on key validity and permissions.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Key Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Key Management</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Use long, random keys (32+ characters)</li>
                    <li>• Set expiration dates</li>
                    <li>• Implement key rotation</li>
                    <li>• Limit key permissions</li>
                    <li>• Monitor key usage</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Storage & Transmission</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Store keys in secure vaults</li>
                    <li>• Use environment variables</li>
                    <li>• Never hardcode keys</li>
                    <li>• Use HTTPS always</li>
                    <li>• Implement rate limiting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common API Key Attacks & Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
                  <h4 className="font-semibold mb-2">Key Leakage</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    API keys exposed in code, repositories, or logs.
                  </p>
                  <p className="text-sm font-medium text-red-700">
                    Prevention: Code scanning, access controls, monitoring
                  </p>
                </div>

                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <h4 className="font-semibold mb-2">Key Abuse</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Excessive usage or unauthorized access with stolen keys.
                  </p>
                  <p className="text-sm font-medium text-yellow-700">
                    Prevention: Rate limiting, usage monitoring, quick revocation
                  </p>
                </div>

                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <h4 className="font-semibold mb-2">Insufficient Rotation</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Keys not rotated regularly, increasing compromise risk.
                  </p>
                  <p className="text-sm font-medium text-blue-700">
                    Prevention: Automated rotation, expiration policies
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