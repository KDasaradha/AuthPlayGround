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
import { Textarea } from '@/components/ui/textarea'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Code,
  BookOpen,
  Play,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function JWTPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [decodedToken, setDecodedToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const [showToken, setShowToken] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/auth/jwt/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      setResult(data)
      if (data.success) {
        setAccessToken(data.data.accessToken)
        setRefreshToken(data.data.refreshToken)
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!refreshToken) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/jwt/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await response.json()
      setResult(data)
      if (data.success) {
        setAccessToken(data.data.accessToken)
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecode = () => {
    if (!accessToken) return

    try {
      const parts = accessToken.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        setDecodedToken(JSON.stringify(payload, null, 2))
      }
    } catch (error) {
      setDecodedToken('Invalid token format')
    }
  }

  const frontendCode = `// JWT Authentication with Access & Refresh Tokens
class JWTAuth {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async login(username, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
        
        return data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      const data = await response.json();
      
      if (data.success) {
        this.accessToken = data.accessToken;
        localStorage.setItem('accessToken', this.accessToken);
        return data.accessToken;
      }
      throw new Error('Refresh failed');
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Authorization': \`Bearer \${this.accessToken}\`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshAccessToken();
        defaultOptions.headers.Authorization = \`Bearer \${this.accessToken}\`;
        return fetch(url, { ...defaultOptions, ...options });
      }
      
      return response;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  decodeToken(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }
}

// Usage example
const auth = new JWTAuth();

// Login
await auth.login('user@example.com', 'password');

// Make authenticated request
const response = await auth.makeAuthenticatedRequest('/api/protected');

// Check token expiration
const decoded = auth.decodeToken(auth.accessToken);
const isExpired = decoded.exp * 1000 < Date.now();`

  const backendCode = `// FastAPI JWT Authentication with Refresh Tokens
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
import secrets

app = FastAPI()
security = HTTPBearer()

# Configuration
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Mock user database
users_db = {
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "hashed_password": "hashed_password_here"
    }
}

# Mock refresh token storage
refresh_tokens = {}

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    # Store refresh token
    refresh_tokens[encoded_jwt] = {
        "user_id": data["sub"],
        "expires": expire
    }
    
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/login")
async def login(username: str, password: str):
    user = users_db.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"]), "username": user["username"]}, 
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user["id"])}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/refresh")
async def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if token_type != "refresh" or user_id not in refresh_tokens:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id}, 
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_id = verify_token(token)
    user = get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hello {current_user['username']}!", "data": "Protected content"}`

  const flowDiagram = `\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Browser
    participant Server
    
    Client->>Browser: Enter credentials
    Browser->>Server: POST /login
    Note over Server: Validate credentials
    alt Valid credentials
        Server->>Browser: Access Token + Refresh Token
        Browser->>Client: Store tokens
        Client->>Browser: Request protected resource
        Browser->>Server: GET /protected + Bearer token
        Note over Server: Validate access token
        alt Token valid
            Server->>Browser: 200 OK + Protected data
            Browser->>Client: Display data
        else Token expired
            Server->>Browser: 401 Unauthorized
            Browser->>Server: POST /refresh + refresh token
            Server->>Browser: New access token
            Browser->>Server: GET /protected + new token
            Server->>Browser: 200 OK + Protected data
            Browser->>Client: Display data
        end
    else Invalid credentials
        Server->>Browser: 401 Unauthorized
        Browser->>Client: Show error
    end
\`\`\``

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-orange-500 text-white rounded-lg">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              JWT Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              JSON Web Tokens with Access & Refresh Token pattern
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
          <Badge variant="outline">Stateless</Badge>
          <Badge variant="outline">Scalable</Badge>
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
                  JWT (JSON Web Token) is an open standard for securely transmitting information between parties as a JSON object.
                  It uses access tokens for short-term authentication and refresh tokens for obtaining new access tokens.
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
                  <li>• Cross-domain/cross-service compatibility</li>
                  <li>• Built-in expiration mechanism</li>
                  <li>• Reduced database load</li>
                  <li>• Mobile and API friendly</li>
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
                  <h4 className="font-semibold mb-2">Single Page Applications</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    SPAs use JWT for seamless authentication without server-side sessions
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Microservices</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Service-to-service authentication using JWT tokens
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Mobile Apps</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Native mobile apps authenticate with JWT for offline capabilities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> JWT tokens should be stored securely (httpOnly cookies or secure storage)
              and access tokens should have short expiration times with refresh tokens for long-term sessions.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>JWT Authentication Flow</CardTitle>
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
                JWT Authentication Simulation
              </CardTitle>
              <CardDescription>
                Test JWT authentication with access and refresh tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Login Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">1. Login</h3>
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
                    onClick={handleLogin}
                    disabled={isLoading || !username || !password}
                    className="w-full"
                  >
                    {isLoading ? 'Authenticating...' : 'Login'}
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
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Token Management Section */}
              {accessToken && (
                <>
                  <Separator />
                  <div className="space-y-6">
                    <h3 className="font-semibold">2. Token Management</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Access Token</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowToken(!showToken)}
                            >
                              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <Textarea
                            value={showToken ? accessToken : '••••••••••••••••••••••••••••••••'}
                            readOnly
                            className="font-mono text-xs"
                            rows={3}
                          />
                        </div>

                        <Button
                          onClick={handleRefresh}
                          disabled={isLoading || !refreshToken}
                          className="w-full"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh Access Token
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Decoded Token</Label>
                          <Textarea
                            value={decodedToken}
                            readOnly
                            placeholder="Click 'Decode Token' to view payload"
                            className="font-mono text-xs"
                            rows={6}
                          />
                        </div>

                        <Button
                          onClick={handleDecode}
                          disabled={!accessToken}
                          className="w-full"
                        >
                          Decode Token
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
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
                  User provides credentials which are validated against the database. If valid, the server generates two tokens.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">2. Token Generation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Access Token:</strong> Short-lived (15-30 minutes) containing user claims and permissions.<br />
                  <strong>Refresh Token:</strong> Long-lived (7-30 days) used only to obtain new access tokens.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Token Storage</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Client stores both tokens securely. Access token is used for API calls, refresh token is stored for later use.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">4. API Requests</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Each API request includes the access token in the Authorization header: "Bearer &lt;token&gt;"
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">5. Token Expiration</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  When access token expires, client uses refresh token to obtain a new access token without requiring user login.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Token Validation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server validates JWT signature, expiration, and claims on each request without database lookup.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>JWT Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Header</h4>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm">
                    {`{
  "alg": "HS256",
  "typ": "JWT"
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Payload</h4>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm">
                    {`{
  "sub": "1234567890",
  "username": "admin",
  "iat": 1516239022,
  "exp": 1516242622
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Signature</h4>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm">
                    {`HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Do's</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Use strong secret keys</li>
                    <li>• Keep access tokens short-lived</li>
                    <li>• Use HTTPS always</li>
                    <li>• Implement token blacklisting</li>
                    <li>• Store tokens securely</li>
                    <li>• Validate all claims</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Don'ts</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Store sensitive data in payload</li>
                    <li>• Use long-lived access tokens</li>
                    <li>• Store tokens in localStorage (XSS risk)</li>
                    <li>• Skip token validation</li>
                    <li>• Use weak signing algorithms</li>
                    <li>• Ignore token expiration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}