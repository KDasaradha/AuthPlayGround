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
import { 
  KeyRound, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Code,
  BookOpen,
  Play,
  RefreshCw,
  Shield,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function TokenAuthPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [generatedToken, setGeneratedToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)

  const handleGenerateToken = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/token-auth/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setGeneratedToken(data.data.token)
        setToken(data.data.token)
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidateToken = async () => {
    if (!token) {
      setResult({ success: false, message: 'Please enter a token to validate' })
      return
    }

    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/token-auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  const frontendCode = `// Token-based Authentication with Next.js
class TokenAuth {
  constructor() {
    this.token = localStorage.getItem('auth_token') || null;
  }

  // Generate token with credentials
  async generateToken(username, password) {
    try {
      const response = await fetch('/api/auth/token/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        this.token = data.data.token;
        localStorage.setItem('auth_token', this.token);
        return data;
      }
      
      throw new Error(data.message || 'Token generation failed');
    } catch (error) {
      console.error('Token generation error:', error);
      throw error;
    }
  }

  // Validate existing token
  async validateToken(token) {
    try {
      const response = await fetch('/api/auth/token/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Token validation error:', error);
      return { success: false, message: 'Validation failed' };
    }
  }

  // Make authenticated request
  async makeAuthenticatedRequest(url, options = {}) {
    if (!this.token) {
      throw new Error('No token available');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': \`Bearer \${this.token}\`
        }
      });

      if (response.status === 401) {
        // Token invalid, clear it
        this.clearToken();
        throw new Error('Token expired or invalid');
      }

      return response;
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }

  // Clear token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get current token
  getToken() {
    return this.token;
  }
}

// Usage in React component
const tokenAuth = new TokenAuth();

function TokenManager() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleGenerateToken = async () => {
    try {
      await tokenAuth.generateToken(username, password);
      alert('Token generated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleValidateToken = async () => {
    const token = tokenAuth.getToken();
    if (!token) {
      alert('No token to validate');
      return;
    }

    try {
      const result = await tokenAuth.validateToken(token);
      alert(result.success ? 'Token is valid' : 'Token is invalid');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleGenerateToken}>
        Generate Token
      </button>
      
      <button onClick={handleValidateToken}>
        Validate Token
      </button>
    </div>
  );
}

// HOC for protected routes
function withTokenAuth(WrappedComponent) {
  return function ProtectedComponent(props) {
    const tokenAuth = new TokenAuth();
    
    if (!tokenAuth.isAuthenticated()) {
      return <div>Please authenticate first</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
}`

  const backendCode = `// FastAPI Token-based Authentication
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import secrets
import hashlib
from datetime import datetime, timedelta

app = FastAPI()
security = HTTPBearer()

# Mock user database
users_db = {
    "admin": {
        "id": 1,
        "username": "admin",
        "hashed_password": hashlib.sha256("password123".encode()).hexdigest(),
        "email": "admin@example.com"
    }
}

# Token storage (in production, use database)
tokens = {}

class TokenRequest(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str

def generate_token(user_id: int, username: str) -> str:
    """Generate a secure token"""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    tokens[token] = {
        "user_id": user_id,
        "username": username,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at
    }
    
    return token

def validate_token(token: str) -> dict:
    """Validate token and return user data"""
    if token not in tokens:
        return None
    
    token_data = tokens[token]
    
    # Check if token expired
    if token_data["expires_at"] < datetime.utcnow():
        del tokens[token]
        return None
    
    # Update last accessed time
    token_data["last_accessed"] = datetime.utcnow()
    
    return token_data

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return hashlib.sha256(password.encode()).hexdigest() == hashed_password

@app.post("/auth/token/generate")
async def generate_token_endpoint(request_data: TokenRequest):
    """Generate authentication token"""
    user = users_db.get(request_data.username)
    
    if not user or not verify_password(request_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate token
    token = generate_token(user["id"], user["username"])
    
    return {
        "success": True,
        "message": "Token generated successfully",
        "data": {
            "token": token,
            "expires_at": tokens[token]["expires_at"],
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"]
            }
        }
    }

@app.post("/auth/token/validate")
async def validate_token_endpoint(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Validate authentication token"""
    token = credentials.credentials
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided"
        )
    
    token_data = validate_token(token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return {
        "success": True,
        "message": "Token is valid",
        "data": {
            "user": {
                "id": token_data["user_id"],
                "username": token_data["username"]
            },
            "token_info": {
                "created_at": token_data["created_at"],
                "expires_at": token_data["expires_at"],
                "last_accessed": token_data.get("last_accessed")
            }
        }
    }

# Dependency for protected routes
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from token"""
    token = credentials.credentials
    token_data = validate_token(token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return {
        "user_id": token_data["user_id"],
        "username": token_data["username"]
    }

const flowDiagram = `mermaid
sequenceDiagram
    participant Client
    participant Browser
    participant Server
    participant TokenStore
    
    Client->>Browser: Enter credentials
    Browser->>Server: POST /token/generate + credentials
    Server->>Server: Validate credentials
    alt Valid credentials
        Server->>TokenStore: Generate token
        TokenStore->>Server: Return token
        Server->>Browser: 200 OK + token
        Browser->>Client: Store token locally
        Client->>Browser: Request protected resource
        Browser->>Server: GET /protected + Authorization header
        Server->>TokenStore: Validate token
        TokenStore->>Server: Return token data
        Server->>Browser: 200 OK + protected data
        Browser->>Client: Display protected content
    else Invalid credentials
        Server->>Browser: 401 Unauthorized
        Browser->>Client: Show error
    end
    
    Note over Server: Token expires after 24 hours
    Client->>Browser: Manual token validation
    Browser->>Server: POST /token/validate + Authorization header
    Server->>TokenStore: Validate token
    TokenStore->>Server: Return validation result
    Server->>Browser: 200 OK + validation result
    Browser->>Client: Display validation status`

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-500 text-white rounded-lg">
            <KeyRound className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Token Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Simple token-based authentication with bearer tokens
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
          <Badge variant="outline">Stateless</Badge>
          <Badge variant="outline">Bearer Tokens</Badge>
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
                  Token authentication uses bearer tokens sent in Authorization headers. 
                  Tokens are generated upon login and validated on each request.
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
                  <li>• Stateless authentication</li>
                  <li>• Easy to implement</li>
                  <li>• Works across domains</li>
                  <li>• Mobile app friendly</li>
                  <li>• API authentication standard</li>
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
                  <h4 className="font-semibold mb-2">API Authentication</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    RESTful APIs requiring simple, stateless authentication
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Mobile Apps</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Native mobile apps with backend API integration
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Microservices</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Service-to-service authentication in distributed systems
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> Tokens should be transmitted securely over HTTPS and stored safely. 
              Implement proper token expiration and refresh mechanisms.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Authentication Flow</CardTitle>
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
                Token Authentication Simulation
              </CardTitle>
              <CardDescription>
                Generate and validate bearer tokens for authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Generate Token</h3>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateToken} 
                    disabled={isLoading || !username || !password}
                    className="w-full"
                  >
                    {isLoading ? 'Generating...' : 'Generate Token'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-semibold mb-2">Test Credentials:</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Username:</strong> admin</p>
                      <p><strong>Password:</strong> password123</p>
                    </div>
                  </div>

                  {generatedToken && (
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg">
                      <h4 className="font-semibold mb-2">Generated Token:</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          type={showToken ? "text" : "password"}
                          value={generatedToken}
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
                          onClick={() => copyToClipboard(generatedToken)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Copy this token for validation testing
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Validate Token</h3>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter token to validate"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleValidateToken} 
                    disabled={isLoading || !token}
                  >
                    {isLoading ? 'Validating...' : 'Validate Token'}
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
                          <strong>User:</strong> {result.data.user?.username}<br />
                          <strong>Token Created:</strong> {new Date(result.data.token_info?.created_at).toLocaleString()}<br />
                          <strong>Expires:</strong> {new Date(result.data.token_info?.expires_at).toLocaleString()}
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
                <h3 className="font-semibold text-lg mb-3">1. User Login</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  User submits credentials to generate a token instead of creating a session.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">2. Token Generation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server validates credentials and generates a cryptographically secure token with expiration time.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Token Storage</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Client stores the token securely (localStorage, secure storage, or memory).
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">4. Token Transmission</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Client includes token in Authorization header: "Bearer &lt;token&gt;" for each API request.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">5. Token Validation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server validates token signature and expiration on each request.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Access Grant</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  If token is valid, server grants access to protected resources.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Token Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Token Generation</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Use cryptographically secure random tokens</li>
                    <li>• Set appropriate expiration times</li>
                    <li>• Include user context in tokens</li>
                    <li>• Use HTTPS for token transmission</li>
                    <li>• Implement token blacklisting</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Token Storage</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Store tokens securely (httpOnly cookies if possible)</li>
                    <li>• Avoid localStorage for sensitive apps</li>
                    <li>• Consider secure storage alternatives</li>
                    <li>• Clear tokens on logout</li>
                    <li>• Implement token refresh mechanism</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Token Attacks & Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
                  <h4 className="font-semibold mb-2">Token Theft</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker steals token through XSS or insecure storage.
                  </p>
                  <p className="text-sm font-medium text-red-700">
                    Prevention: Secure storage, HTTPS, input validation
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <h4 className="font-semibold mb-2">Token Replay</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker reuses captured token to make requests.
                  </p>
                  <p className="text-sm font-medium text-yellow-700">
                    Prevention: Short expiration, one-time use tokens, nonce
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <h4 className="font-semibold mb-2">Token Brute Force</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker tries to guess valid tokens.
                  </p>
                  <p className="text-sm font-medium text-blue-700">
                    Prevention: Long tokens, rate limiting, monitoring
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