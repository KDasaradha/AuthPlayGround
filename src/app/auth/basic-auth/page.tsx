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
  Key, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Code,
  BookOpen,
  Play
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function BasicAuthPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; token?: string } | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/basic-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const frontendCode = `// Basic Authentication with Fetch API
const login = async (username, password) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Basic \${btoa(username + ':' + password)}\`
      },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};

// Making authenticated requests
const fetchProtectedData = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/protected', {
    headers: {
      'Authorization': \`Basic \${token}\`
    }
  });
  return response.json();
};`

  const backendCode = `// FastAPI Basic Authentication
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets
import hashlib

app = FastAPI()
security = HTTPBasic()

# Mock user database
users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": hashlib.sha256("password123".encode()).hexdigest()
    }
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    user = users_db.get(credentials.username)
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return user

@app.post("/login")
async def login(credentials: HTTPBasicCredentials = Depends(security)):
    user = get_current_user(credentials)
    token = secrets.token_urlsafe(32)
    return {"access_token": token, "token_type": "bearer"}

@app.get("/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hello {current_user['username']}!", "data": "Protected content"}`

  const flowDiagram = `\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Browser
    participant Server
    
    Client->>Browser: Enter username/password
    Browser->>Server: POST /login
    Note over Server: Validate credentials
    alt Valid credentials
        Server->>Browser: 200 OK + Token
        Browser->>Client: Store token
        Client->>Browser: Request protected resource
        Browser->>Server: GET /protected + Authorization header
        Server->>Browser: 200 OK + Protected data
        Browser->>Client: Display data
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
          <div className="p-3 bg-blue-500 text-white rounded-lg">
            <Key className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Basic Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Username and password authentication
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">Basic</Badge>
          <Badge variant="outline">HTTP Standard</Badge>
          <Badge variant="outline">Widely Supported</Badge>
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
                  Basic Authentication is a simple authentication scheme built into the HTTP protocol. 
                  It sends credentials as a Base64 encoded string in the Authorization header.
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
                  <li>• HTTP standard protocol</li>
                  <li>• Works with any HTTP client</li>
                  <li>• No additional infrastructure needed</li>
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
                    Simple APIs that need basic protection without complex session management
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Internal Tools</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Internal dashboards and admin panels with trusted network environments
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Development</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Quick prototyping and testing environments where simplicity is prioritized
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> Basic Auth sends credentials in Base64 encoding, which is not encryption. 
              Always use HTTPS to protect credentials in transit.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Flow</CardTitle>
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
                Basic Auth Simulation
              </CardTitle>
              <CardDescription>
                Test Basic Authentication with username/password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
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
                          {result.token && (
                            <div className="mt-2">
                              <strong>Token:</strong> {result.token}
                            </div>
                          )}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                </div>
              </div>
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
                <h3 className="font-semibold text-lg mb-3">1. Client Request</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  The client sends a POST request to the login endpoint with username and password in the request body.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">2. Server Validation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  The server receives the credentials, hashes the password, and compares it with the stored hash in the database.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Token Generation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  If credentials are valid, the server generates a secure token and returns it to the client.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">4. Client Storage</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  The client stores the token (typically in localStorage or sessionStorage) for future requests.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">5. Authenticated Requests</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  For subsequent requests to protected resources, the client includes the token in the Authorization header.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Server Verification</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  The server validates the token on each request and grants access to protected resources if valid.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Considerations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Best Practices</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Always use HTTPS</li>
                    <li>• Hash passwords with salt</li>
                    <li>• Use strong password policies</li>
                    <li>• Implement rate limiting</li>
                    <li>• Log authentication attempts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Common Pitfalls</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Storing passwords in plain text</li>
                    <li>• Using HTTP instead of HTTPS</li>
                    <li>• Weak password requirements</li>
                    <li>• No account lockout mechanism</li>
                    <li>• Missing input validation</li>
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