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
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Code,
  BookOpen,
  Play,
  RefreshCw,
  User,
  Smartphone,
  Lock,
  Mail,
  Key
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function PasswordlessPage() {
  const [identifier, setIdentifier] = useState('')
  const [method, setMethod] = useState('email')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const [sessionData, setSessionData] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const authMethods = [
    { value: 'email', label: 'Email Address', icon: Mail },
    { value: 'phone', label: 'Phone Number', icon: Smartphone },
    { value: 'username', label: 'Username', icon: User },
    { value: 'device', label: 'Device ID', icon: Key }
  ]

  const handleLogin = async () => {
    if (!identifier) {
      setResult({ success: false, message: 'Identifier is required' })
      return
    }

    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/passwordless/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier,
          method,
          deviceInfo: navigator.userAgent
        }),
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
      const response = await fetch('/api/auth/passwordless/logout', {
        method: 'POST',
        headers: {
          'Content-Based': 'application/json',
        },
        body: JSON.stringify({}),
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setIsLoggedIn(false)
        setSessionData(null)
        setIdentifier('')
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const getIdentifierPlaceholder = () => {
    switch (method) {
      case 'email':
        return 'Enter your email address'
      case 'phone':
        return 'Enter your phone number'
      case 'username':
        return 'Enter your username'
      case 'device':
        return 'Enter your device ID'
      default:
        return 'Enter your identifier'
    }
  }

  const frontendCode = `// Passwordless Authentication with Next.js
class PasswordlessAuth {
  constructor() {
    this.deviceCache = new Map(); // Cache device identifiers for security
  }

  // Passwordless login with various methods
  async login(identifier, method, deviceInfo = null) {
    try {
      // Check rate limiting
      if (this.isRateLimited(identifier)) {
        throw new Error('Too many login attempts. Please wait before trying again.');
      }

      const response = await fetch('/api/auth/passwordless/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, method, deviceInfo })
      });

      const data = await response.json();
      
      if (data.success) {
        // Cache the device identifier
        if (deviceInfo) {
          this.deviceCache.set(identifier, {
            firstSeen: Date.now(),
            attempts: 0
          });
        }
        
        // Store auth token/session
        localStorage.setItem('auth_token', data.data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Passwordless login error:', error);
      throw error;
    }
  }

  // Passwordless logout
  async logout() {
    try {
      const response = await fetch('/api/auth/passwordless/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.removeItem('auth_token');
      }
      
      return data;
    } catch (error) {
      console.error('Passwordless logout error:', error);
      throw error;
    }
  }

  // Check rate limiting
  isRateLimited(identifier) {
    const cache = this.deviceCache.get(identifier);
    if (!cache) return false;
    
    const timeSinceLastLogin = Date.now() - cache.firstSeen;
    const attempts = cache.attempts || 0;
    
    // Allow 5 attempts per hour per identifier
    return timeSinceLastLogin < 3600000 && attempts >= 5;
  }

  // Device fingerprinting
  generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Simple device fingerprinting
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      fonts: navigator.fonts.length
    };
    
    return JSON.stringify(fingerprint);
  }

  // Generate secure session token
  generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16)).join('');
  }
}

// Usage in React component
const passwordlessAuth = new PasswordlessAuth();

function PasswordlessLogin() {
  const [identifier, setIdentifier] = useState('');
  const [method, setMethod] = useState('email');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const deviceFingerprint = passwordlessAuth.generateDeviceFingerprint();
      
      const result = await passwordlessAuth.login(identifier, method, deviceFingerprint);
      
      if (result.success) {
        alert('Login successful!');
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="username">Username</option>
          <option value="device">Device ID</option>
        </select>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter your identifier"
        />
        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Authenticating...' : 'Login'}
        </button>
      </div>
    </div>
  );
}

// Usage with device biometrics
function BiometricLogin() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      
      // Get device fingerprint
      const deviceFingerprint = passwordlessAuth.generateDeviceFingerprint();
      
      const result = await passwordlessAuth.login('device_fingerprint', 'biometric', deviceFingerprint);
      
      if (result.success) {
        alert('Biometric authentication successful!');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleBiometricLogin} disabled={isLoading}>
        {isLoading ? 'Authenticating...' : 'Login with Biometrics'}
      </button>
    </div>
  );
}`

  const backendCode = `// FastAPI Passwordless Authentication
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional
import json

app = FastAPI()

# Passwordless session storage (in production, use database)
passwordless_sessions = {}

# Mock user database
users_db = {
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "phone": "+1234567890",
        "device_id": "device_123",
        "hashed_password": hashlib.sha256("password123".encode()).hexdigest()
    }
}

class PasswordlessRequest(BaseModel):
    identifier: str
    method: str
    device_info: Optional[str] = None

class PasswordlessResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: dict

class DeviceInfo(BaseModel):
    device_id: str
    fingerprint: str
    trusted: bool
    last_seen: datetime
    login_attempts: int

def generate_secure_token() -> str:
    """Generate cryptographically secure token"""
    return secrets.token_urlsafe(32)

def is_valid_identifier(identifier: str, method: str) -> bool:
    """Validate identifier based on method"""
    if method == "email":
        # Basic email validation
        return '@' in identifier and len(identifier.split('@')[0]) > 0 and len(identifier.split('@')[1]) > 0
    elif method == "phone":
        # Phone number validation
        cleaned = ''.join(c for c in identifier if c.isdigit())
        return 10 <= len(cleaned) <= 15 and cleaned.isdigit()
    elif method == "username":
        # Username validation
        return len(identifier) >= 3 and len(identifier) <= 50
    elif method == "device":
        # Device ID validation
        return len(identifier) >= 8 and len(identifier) <= 64
    return False

def get_user_by_identifier(identifier: str, method: str):
    """Get user by identifier and method"""
    if method == "email":
        for user_data in users_db.values():
            if user_data.get("email", "").lower() == identifier.lower():
                return user_data
    elif method == "phone":
        for user_data in users_db.values():
            if user_data.get("phone", "").endswith(identifier):
                return user_data
    elif method == "username":
        return users_db.get(identifier)
    elif method == "device":
        for user_data in users_db.values():
            if user_data.get("device_id", "") == identifier:
                return user_data
    return None

def create_passwordless_session(user_id: int, identifier: str, method: str, device_info: Optional[str] = None) -> tuple[str, str]:
    """Create passwordless session"""
    token = generate_secure_token()
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    # Store session
    session_id = secrets.token_urlsafe(16)
    passwordless_sessions[session_id] = {
        "user_id": user_id,
        "identifier": identifier,
        "method": method,
        "device_info": device_info,
        "token": token,
        "expires_at": expires_at,
        "created_at": datetime.utcnow(),
        "last_accessed": datetime.utcnow()
    }
    
    return session_id, token

def get_device_info(request: Request) -> Optional[DeviceInfo]:
    """Extract device information from request"""
    user_agent = request.headers.get("user-agent")
    if not user_agent:
        return None
    
    # Parse user agent for device info
    device_fingerprint = secrets.token_urlsafe(32)
    
    return {
        "device_id": device_fingerprint,
        "fingerprint": json.dumps({
            "user_agent": user_agent,
            "ip": request.client.host,
            "platform": request.headers.get("sec-ch-ua-platform"),
            "mobile": "mobile" in user_agent.lower()
        }),
        "trusted": False,
        "last_seen": datetime.utcnow()
    }

def check_rate_limiting(identifier: str, method: str) -> bool:
    """Check rate limiting for passwordless authentication"""
    # Count recent attempts for this identifier
    recent_attempts = sum(1 for session in passwordless_sessions.values() 
                      if session["identifier"] == identifier and 
                      session["method"] == method and 
                      session["created_at"] > datetime.utcnow() - timedelta(hours=1))
    
    # Allow 5 attempts per hour
    return recent_attempts >= 5

@app.post("/auth/passwordless/login")
async def passwordless_login_endpoint(request: PasswordlessRequest):
    """Passwordless authentication endpoint"""
    identifier = request.identifier
    method = request.method
    device_info = request.device_info
    
    if not is_valid_identifier(identifier, method):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {method} format"
        )
    
    # Check rate limiting
    if check_rate_limiting(identifier, method):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please wait before trying again."
        )
    
    # Get user by identifier
    user = get_user_by_identifier(identifier, method)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify user credentials (if applicable)
    if method in ["username", "email", "phone"] and not verify_user_credentials(user, identifier, method):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create passwordless session
    session_id, token = create_passwordless_session(user["id"], identifier, method, device_info)
    
    return {
        "success": True,
        "message": "Passwordless authentication successful",
        "data": {
            "token": token,
            "session_id": session_id,
            "expires_at": passwordless_sessions[session_id]["expires_at"],
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"]
            }
        }
    }

@app.post("/auth/passwordless/logout")
async def passwordless_logout_endpoint(request: Request):
    """Passwordless logout endpoint"""
    # In a real app, you'd get the session from the request
    # For this demo, we'll just clear all sessions
    
    passwordless_sessions.clear()
    
    return {
        "success": True,
        "message": "Logged out successfully"
    }

# Cleanup expired sessions
@app.middleware("http")
async def cleanup_expired_sessions(request, call_next):
    """Clean up expired passwordless sessions"""
    current_time = datetime.utcnow()
    expired_sessions = [
        session_id for session_id, session_data in passwordless_sessions.items()
        if session_data["expires_at"] < current_time
    ]
    
    for session_id in expired_sessions:
        del passwordless_sessions[session_id]
    
    response = await call_next(request)
    return response`

# Device management
@app.post("/auth/passwordless/register-device")
async def register_device_endpoint(request: Request):
    """Register trusted device"""
    device_info = get_device_info(request)
    
    if not device_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device information required"
        )
    
    device_id = device_info["device_id"]
    
    # Store trusted device
    # In production, this would go to a database
    trusted_devices[device_id] = {
        "device_id": device_id,
        "fingerprint": device_info["fingerprint"],
        "trusted": True,
        "first_seen": datetime.utcnow(),
        "last_seen": datetime.utcnow()
    }
    
    return {
        "success": True,
        "message": "Device registered successfully",
        "device_id": device_id
    }

def verify_user_credentials(user: dict, identifier: str, method: str) -> bool:
    """Verify user credentials for passwordless auth"""
    if method == "email":
        # For email, we might have additional verification
        return True  # Simplified for demo
    elif method == "phone":
        # For phone, we might have additional verification
        return True  # Simplified for demo
    elif method == "username":
        # For username, we'd verify against stored password
        hashed_password = user.get("hashed_password", "")
        # In this demo, we'll accept any non-empty username
        return len(identifier) >= 3
    return False

# Mock trusted devices storage
trusted_devices = {}`

def is_trusted_device(device_id: str) -> bool:
    """Check if device is trusted"""
    return trusted_devices.get(device_id, {}).get("trusted", False)`

def get_device_info_from_request(request: Request) -> Optional[dict]:
    """Extract device information from request"""
    user_agent = request.headers.get("user-agent")
    if not user_agent:
        return None
    
    # Parse user agent for device info
    device_fingerprint = secrets.token_urlsafe(32)
    
    return {
        "device_id": device_fingerprint,
        "fingerprint": json.dumps({
            "user_agent": user_agent,
            "ip": request.client.host,
            "platform": request.headers.get("sec-ch-ua-platform"),
            "mobile": "mobile" in user_agent.lower()
        }),
        "trusted": is_trusted_device(device_fingerprint),
        "last_seen": datetime.utcnow()
    }`}

  const flowDiagram = \`\`\`mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant DeviceManager
    participant PasswordlessStore
    
    User->>Client: Choose auth method
    User->>Client: Enter identifier (email/phone/username/device)
    Client->>Server: POST /passwordless/login + identifier + method + device info
    Server->>Server: Validate identifier format
    Server->>Server: Check rate limiting
    Server->>Server: Look up user by identifier
    Server->>Server: Verify user credentials
    Server->>Server: Check device trust status
    alt Valid credentials and device
        Server->>PasswordlessStore: Create session
        Server->>PasswordlessStore: Store session with expiration
        Server->>Client: 200 OK + auth token
        Client->>Client: Store auth token
        Client->>Client: Access protected resources
    else Invalid credentials
        Server->>Client: 401 Unauthorized
        Client->>Client: Show error message
    end
    
    Note over Server: Session expires after 24 hours
    User->>Client: Click logout
    Client->>Server: POST /passwordless/logout
    Server->>PasswordlessStore: Clear session
    Server->>Client: 200 OK
    Client->>Client: Clear auth token
    end
\`\`\``

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-teal-500 text-white rounded-lg">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-sate-900 dark:text-slate-100">
              Passwordless Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Authentication without passwords using various identifiers
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
          <Badge variant="outline">Passwordless</Badge>
          <Badge variant="outline">Multi-Factor</Badge>
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
                  Passwordless authentication allows users to sign in without passwords using various identifiers 
                  like email, phone number, device ID, or biometric data.
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
                  <li>• Eliminates password fatigue</li>
                  <li>• Enhanced user experience</li>
                  <li>• Improved security</li>
                  <li>• Mobile-friendly</li>
                  <li>• Reduces phishing risks</li>
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
                  <h4 className="font-semibold mb-2">Consumer Apps</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Social media and e-commerce without passwords
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Enterprise Tools</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Secure corporate access with device trust
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Mobile Banking</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Biometric authentication for financial apps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> Passwordless authentication should be combined with device trust management 
              and rate limiting to prevent abuse while maintaining user convenience.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Passwordless Authentication Flow</CardTitle>
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
                Passwordless Authentication Simulation
              </CardTitle>
              <CardDescription>
                Test passwordless login with various identifier methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Authentication Method</h3>
                  <div>
                    <Label>Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {authMethods.map((authMethod) => (
                          <SelectItem key={authMethod.value} value={authMethod.value}>
                            {authMethod.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  </div>
                  <div>
                    <Label>Identifier</Label>
                    <Input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={getIdentifierPlaceholder()}
                    />
                  </div>
                  <Button 
                    onClick={handleLogin} 
                    disabled={isLoading || !identifier}
                    className="w-full"
                  >
                    {isLoading ? 'Authenticating...' : 'Login'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-2">Login Status</h4>
                  {isLoggedIn ? (
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div>
                        <p className="text-green-800 font-medium">Successfully Logged In</p>
                        <p className="text-sm text-green-600">
                          User: {sessionData?.user?.username}
                        </p>
                        <Button 
                          onClick={handleLogout}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div>
                        <p className="text-yellow-800 font-medium">Not Logged In</p>
                        <p className="text-sm text-yellow-600">
                          Please authenticate to continue
                        </p>
                      </div>
                    </div>
                  )}
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
                            <strong>Session ID:</strong> {result.data?.sessionId?.substring(0, 8)}...
                            <strong>Expires:</strong> {new Date(result.data?.expiresAt).toLocaleString()}
                          <strong>User:</strong> {result.data?.user?.username}
                          <strong>Method:</strong> {method}
                        </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </div>
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
                <h3 className="font-semibold text-lg mb-3">1. Identifier Collection</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  User provides their identifier (email, phone, username, device ID) through the application interface.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">2. Method Selection</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  User chooses their preferred passwordless authentication method from available options.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Device Fingerprinting</h3>
                <p className="text-scale-600 dark:text-slate-400">
                  Server collects device information (user agent, IP address, platform) to create a unique device fingerprint.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">4. Session Creation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server generates a secure session token and stores it with expiration time (typically 24 hours).
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">5. Authentication</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server validates the identifier and creates a passwordless session without requiring passwords.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Session Management</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server manages passwordless sessions with automatic expiration and invalidation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passwordless Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Identifier Security</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Validate all identifier formats</li>
                    <li>• Implement rate limiting per identifier</li>
                    <li>• Use secure token generation</li>
                    <li>• Sanitize all inputs</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Device Security</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Implement device fingerprinting</li>
                    <li>• Maintain trusted device registry</li>
                    <li>• Monitor for suspicious activity</li>
                    <li>• Implement device deprecation policies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Passwordless Attacks & Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
                  <h4 className="font-semibold mb-2">Identifier Spoofing</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker uses fake email addresses or phone numbers to gain access.
                  </p>
                  <p className="text-sm font-medium text-red-700">
                    Prevention: Email verification, domain validation, monitoring
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <h4 className="font-semibold mb-2">Device Cloning</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker copies device fingerprint to bypass authentication.
                  </p>
                  <p className="text-sm font-medium text-yellow-700">
                    Prevention: Device fingerprinting, trusted devices, behavioral analysis
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <h4 className="font-semibold mb-2">Session Hijacking</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker steals or reuses session tokens.
                  </p>
                  <p className="text-sm font-medium text-blue-700">
                    Prevention: Secure token storage, HTTPS, short expiration
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