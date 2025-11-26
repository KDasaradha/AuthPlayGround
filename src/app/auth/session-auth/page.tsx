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
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Code,
  BookOpen,
  Play,
  LogOut,
  User,
  Shield,
  Database
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import BackButton from '@/components/ui/back-button'

export default function SessionAuthPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/session-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ username, password }),
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setIsLoggedIn(true)
        setSessionData(data.data)
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/session-auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setIsLoggedIn(false)
        setSessionData(null)
        setUsername('')
        setPassword('')
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session-auth/check', {
        method: 'GET',
        credentials: 'include',
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setIsLoggedIn(true)
        setSessionData(data.data)
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    }
  }

  const frontendCode = `// Session-based Authentication with Next.js
class SessionAuth {
  // Login with username and password
  async login(username, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        // Session is automatically stored in HTTP-only cookie
        // No need to manually store tokens
        return data;
      }
      
      throw new Error(data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout - clear session on server
  async logout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Check if user is logged in
  async checkSession() {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Session check error:', error);
      return { success: false, message: 'Session invalid' };
    }
  }

  // Make authenticated request
  async makeAuthenticatedRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include' // Automatically includes session cookie
      });

      if (response.status === 401) {
        // Session expired, redirect to login
        window.location.href = '/login';
        return;
      }

      return response;
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }
}`

  const backendCode = `// FastAPI Session-based Authentication
from fastapi import FastAPI, HTTPException, Request, Response, Depends, status
from pydantic import BaseModel
import secrets
import hashlib
from datetime import datetime, timedelta

app = FastAPI()

# Session storage (in production, use Redis or database)
sessions = {}

# Mock user database
users_db = {
    "admin": {
        "id": 1,
        "username": "admin",
        "hashed_password": hashlib.sha256("password123".encode()).hexdigest(),
        "email": "admin@example.com"
    }
}

class LoginRequest(BaseModel):
    username: str
    password: str

def create_session(user_id: int, username: str) -> str:
    """Create a new session and return session ID"""
    session_id = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    sessions[session_id] = {
        "user_id": user_id,
        "username": username,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
        "last_accessed": datetime.utcnow()
    }
    
    return session_id

def get_session_from_cookie(request: Request) -> dict:
    """Extract session from cookie and validate"""
    session_id = request.cookies.get("session_id")
    
    if not session_id or session_id not in sessions:
        return None
    
    session = sessions[session_id]
    
    # Check if session expired
    if session["expires_at"] < datetime.utcnow():
        del sessions[session_id]
        return None
    
    # Update last accessed time
    session["last_accessed"] = datetime.utcnow()
    
    return session

@app.post("/auth/login")
async def login(
    login_data: LoginRequest,
    response: Response
):
    """Login user and create session"""
    user = users_db.get(login_data.username)
    
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create session
    session_id = create_session(user["id"], user["username"])
    
    # Set session cookie (HTTP-only for security)
    response.set_cookie(
        key="session_id",
        value=session_id,
        max_age=24 * 60 * 60,  # 24 hours
        httponly=True,  # Prevent XSS
        secure=True,     # HTTPS only
        samesite="lax"  # CSRF protection
    )
    
    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    }

@app.post("/auth/logout")
async def logout(response: Response, request: Request):
    """Logout user and clear session"""
    session_id = request.cookies.get("session_id")
    
    if session_id and session_id in sessions:
        del sessions[session_id]
    
    # Clear session cookie
    response.delete_cookie(key="session_id")
    
    return {
        "success": True,
        "message": "Logout successful"
    }

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return hashlib.sha256(password.encode()).hexdigest() == hashed_password`

  const flowDiagram = `\\\`\\\`mermaid
sequenceDiagram
    participant Client
    participant Browser
    participant Server
    participant SessionStore
    
    Client->>Browser: Enter credentials
    Browser->>Server: POST /login + credentials
    Server->>Server: Validate credentials
    alt Valid credentials
        Server->>SessionStore: Create session
        SessionStore->>Server: Return session ID
        Server->>Browser: Set session cookie (HTTP-only)
        Browser->>Client: Show logged in state
    else Invalid credentials
        Server->>Browser: 401 Unauthorized
        Browser->>Client: Show error
    end
\\\`\\\``

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-500 text-white rounded-lg">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Session Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Server-side session management with HTTP-only cookies
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">Basic</Badge>
          <Badge variant="outline">Server-Side</Badge>
          <Badge variant="outline">Cookie-Based</Badge>
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
                  Session authentication stores user authentication state on the server and sends a session identifier 
                  to the client via HTTP-only cookies. The server validates the session on each request.
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
                  <li>• Enhanced security with HTTP-only cookies</li>
                  <li>• Server-controlled session invalidation</li>
                  <li>• Automatic session expiration</li>
                  <li>• Protection against XSS attacks</li>
                  <li>• Easy to implement and understand</li>
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
                  <h4 className="font-semibold mb-2">Traditional Web Apps</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Classic server-rendered applications with form-based login
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Admin Panels</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Administrative interfaces requiring secure session management
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">E-commerce Sites</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Shopping carts and user accounts with persistent sessions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> Always use HTTP-only cookies with secure and SameSite attributes 
              to prevent XSS and CSRF attacks. Implement proper session timeout and invalidation.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Authentication Flow</CardTitle>
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
                Session Authentication Simulation
              </CardTitle>
              <CardDescription>
                Test session-based authentication with server-side storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isLoggedIn ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Login</h3>
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
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Session Active</h3>
                      <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">Successfully Logged In</span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>User ID:</strong> {sessionData?.user?.id}</p>
                          <p><strong>Username:</strong> {sessionData?.user?.username}</p>
                          <p><strong>Email:</strong> {sessionData?.user?.email}</p>
                          <p><strong>Session ID:</strong> {sessionData?.sessionId?.substring(0, 8)}...</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          onClick={checkSession} 
                          variant="outline"
                          className="w-full"
                        >
                          <Database className="mr-2 h-4 w-4" />
                          Check Session Status
                        </Button>
                        
                        <Button 
                          onClick={handleLogout} 
                          variant="destructive"
                          className="w-full"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Session Information</h3>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">How Sessions Work:</h4>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          <li>• Server stores session data in memory/database</li>
                          <li>• Client receives HTTP-only session cookie</li>
                          <li>• Cookie automatically sent with each request</li>
                          <li>• Server validates session on each request</li>
                          <li>• Session expires after inactivity timeout</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result && isLoggedIn && (
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
                  User submits username and password through a login form. The credentials are sent to the server via HTTPS POST request.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">2. Server Validation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server validates credentials against the database. If valid, it creates a new session with a unique session ID.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Session Creation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server generates a cryptographically secure session ID and stores session data (user info, creation time, expiration).
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">4. Cookie Setting</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server sends Set-Cookie header with session ID. Cookie is marked HTTP-only, secure, and SameSite for security.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">5. Subsequent Requests</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Browser automatically includes session cookie in all requests to the same domain. Server validates session ID and grants access.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Session Management</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server tracks session activity, updates last accessed time, and handles expiration and invalidation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Cookie Security</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Use HTTP-only cookies</li>
                    <li>• Set Secure flag for HTTPS</li>
                    <li>• Use SameSite attribute</li>
                    <li>• Set appropriate expiration</li>
                    <li>• Use cryptographically secure session IDs</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Session Management</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Implement session timeout</li>
                    <li>• Regenerate session IDs on login</li>
                    <li>• Invalidate on logout</li>
                    <li>• Store sessions securely</li>
                    <li>• Monitor for suspicious activity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Session Attacks & Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
                  <h4 className="font-semibold mb-2">Session Hijacking</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker steals session cookie to impersonate user.
                  </p>
                  <p className="text-sm font-medium text-red-700">
                    Prevention: HTTPS, HTTP-only cookies, SameSite attribute
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <h4 className="font-semibold mb-2">Session Fixation</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker forces user to use known session ID.
                  </p>
                  <p className="text-sm font-medium text-yellow-700">
                    Prevention: Regenerate session ID on login
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <h4 className="font-semibold mb-2">Cross-Site Scripting (XSS)</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Malicious script steals session cookies.
                  </p>
                  <p className="text-sm font-medium text-blue-700">
                    Prevention: HTTP-only cookies, input validation, CSP
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Back Button */}
      <div className="mt-8">
        <BackButton />
      </div>
    </div>
  )
}