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
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Code,
  BookOpen,
  Play,
  RefreshCw,
  Send,
  Shield,
  Link,
  Clock
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function MagicLinkPage() {
  const [email, setEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)

  const handleSendLink = async () => {
    if (!email) {
      setResult({ success: false, message: 'Email is required' })
      return
    }

    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/magic-link/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setLinkSent(true)
        startTimer(300) // 5 minutes = 300 seconds
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleResendLink = () => {
    setLinkSent(false)
    setTimeLeft(0)
    handleSendLink()
  }

  const frontendCode = `// Magic Link Authentication with Next.js
class MagicLinkAuth {
  constructor() {
    this.linkCache = new Map(); // Cache magic link requests to prevent spam
  }

  // Send magic link
  async sendMagicLink(email) {
    try {
      // Check rate limiting
      if (this.isRateLimited(email)) {
        throw new Error('Too many magic link requests. Please wait before trying again.');
      }

      const response = await fetch('/api/auth/magic-link/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        // Cache the magic link request
        this.linkCache.set(email, {
          sentAt: Date.now(),
          attempts: 0
        });
      }
      
      return data;
    } catch (error) {
      console.error('Send magic link error:', error);
      throw error;
    }
  }

  // Verify magic link token
  async verifyMagicLink(token) {
    try {
      const response = await fetch('/api/auth/magic-link/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear cache on successful verification
        this.linkCache.delete(email);
        
        // Store auth token/session
        localStorage.setItem('auth_token', data.data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Verify magic link error:', error);
      throw error;
    }
  }

  // Check rate limiting
  isRateLimited(email) {
    const cache = this.linkCache.get(email);
    if (!cache) return false;
    
    const timeSinceLastLink = Date.now() - cache.sentAt;
    const attempts = cache.attempts || 0;
    
    // Allow one magic link per 5 minutes, max 3 attempts
    return timeSinceLastLink < 300000 && attempts >= 3;
  }

  // Generate secure token
  generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16)).join('');
  }

  // Generate magic link URL
  generateMagicLinkUrl(token, baseUrl = 'https://yourapp.com') {
    return \`\${baseUrl}/auth/magic-link/verify?token=\${token}\`;
  }
}

// Usage in React component
const magicLinkAuth = new MagicLinkAuth();

function MagicLinkLogin() {
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);

  const handleSendLink = async () => {
    try {
      await magicLinkAuth.sendMagicLink(email);
      setLinkSent(true);
      alert('Magic link sent to your email!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      {!linkSent ? (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button onClick={handleSendLink}>
            Send Magic Link
          </button>
        </div>
      ) : (
        <div>
          <p>Check your email for the magic link</p>
          <p>Click the link in the email to sign in</p>
        </div>
      )}
    </div>
  );
}

// Usage with URL verification
function useMagicLinkToken() {
  const [token] = useState(null);
  
  // Extract token from URL
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      
      // Verify token with server
      magicLinkAuth.verifyMagicLink(tokenFromUrl)
        .then((response) => {
          if (response.success) {
            // Redirect to dashboard
            window.location.href = '/dashboard';
          } else {
            // Show error
            alert('Invalid or expired magic link');
          }
        })
        .catch((error) => {
          console.error('Magic link verification error:', error);
          alert('Error verifying magic link');
        });
    }
  }, []);

  return { token };
}`

  const backendCode = `// FastAPI Magic Link Authentication
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import quote

app = FastAPI()

# Magic link storage (in production, use database)
magic_links = {}

# Mock user database
users_db = {
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "hashed_password": hashlib.sha256("password123".encode()).hexdigest()
    }
}

class MagicLinkRequest(BaseModel):
    email: EmailStr

class MagicLinkResponse(BaseModel):
    success: bool
    message: str
    token: str
    expires_at: datetime
    magic_link_url: str

class MagicLinkVerifyRequest(BaseModel):
    token: str

class MagicLinkVerifyResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: dict

def generate_magic_token(user_id: int, email: str) -> tuple[str, str]:
    """Generate secure magic link token"""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    # Store magic link
    magic_links[token] = {
        "user_id": user_id,
        "email": email,
        "expires_at": expires_at,
        "created_at": datetime.utcnow(),
        "used": False
    }
    
    # Generate magic link URL
    magic_link_url = f"https://yourapp.com/auth/magic-link/verify?token={token}"
    
    return token, magic_link_url

def send_magic_link_email(email: str, magic_link_url: str) -> bool:
    """Send magic link via email (simulation)"""
    try:
        message = f"""
        Hello!
        
        Click the link below to sign in to your account:
        
        {magic_link_url}
        
        This link will expire in 5 minutes.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        Your Application Team
        """
        
        print(f"EMAIL TO: {email}")
        print(f"MESSAGE: {message}")
        
        # Simulate email sending delay
        import time
        time.sleep(1)
        
        return True
    except Exception as e:
        print(f"Failed to send magic link email: {e}")
        return False

@app.post("/auth/magic-link/send")
async def send_magic_link_endpoint(request: MagicLinkRequest):
    """Send magic link to user's email"""
    email = request.email
    
    # Basic email validation
    if '@' not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Check if user exists
    user = None
    for user_data in users_db.values():
        if user_data.get("email", "").lower() == email.lower():
            user = user_data
            break
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email not found"
        )
    
    # Generate magic token and link
    token, magic_link_url = generate_magic_token(user["id"], email)
    
    # Send magic link via email
    email_sent = send_magic_link_email(email, magic_link_url)
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send magic link email"
        )
    
    return {
        "success": True,
        "message": "Magic link sent successfully",
        "data": {
            "token": token,
            "magic_link_url": magic_link_url,
            "expires_at": magic_links[token]["expires_at"],
            "email": email[:3] + "***@***.com"  # Partially mask email
        }
    }

@app.post("/auth/magic-link/verify")
async def verify_magic_link_endpoint(request: MagicLinkVerifyRequest):
    """Verify magic link and authenticate user"""
    token = request.token
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is required"
        )
    
    # Find valid magic link
    magic_link_data = magic_links.get(token)
    
    if not magic_link_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired magic link"
        )
    
    # Check if magic link is expired
    if magic_link_data["expires_at"] < datetime.utcnow():
        # Clean up expired link
        del magic_links[token]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Magic link has expired"
        )
    
    # Check if magic link is already used
    if magic_link_data["used"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Magic link has already been used"
        )
    
    # Get user
    user = None
    for user_data in users_db.values():
        if user_data.get("email", "").lower() == magic_link_data["email"].lower():
            user = user_data
            break
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Mark magic link as used
    magic_links[token]["used"] = True
    
    # Generate session token
    session_token = secrets.token_urlsafe(32)
    
    return {
        "success": True,
        "message": "Magic link verified successfully",
        "token": session_token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    }

# Cleanup expired magic links
@app.middleware("http")
async def cleanup_expired_links(request, call_next):
    """Clean up expired magic links"""
    current_time = datetime.utcnow()
    expired_links = [
        token for token, link_data in magic_links.items()
        if link_data["expires_at"] < current_time
    ]
    
    for token in expired_links:
        del magic_links[token]
    
    response = await call_next(request)
    return response

# Magic link verification page
@app.get("/auth/magic-link/verify")
async def magic_link_verify_page(request: Request):
    """Magic link verification page"""
    token = request.query_params.get("token")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is required"
        )
    
    magic_link_data = magic_links.get(token)
    
    if not magic_link_data or magic_link_data["expires_at"] < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired magic link"
        )
    
    # Auto-verify the token and redirect
    user = None
    for user_data in users_db.values():
        if user_data.get("email", "").lower() == magic_link_data["email"].lower():
            user = user_data
            break
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Mark magic link as used
    magic_links[token]["used"] = True
    
    # Generate session token
    session_token = secrets.token_urlsafe(32)
    
    # In production, you would redirect to dashboard with session
    # For this demo, we'll return a success message
    return {
        "message": "Magic link verified successfully! You can now sign in.",
        "token": session_token
    }`

  const flowDiagram = \`\`\`mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant EmailService
    participant MagicLinkStore
    
    User->>Client: Enter email
    Client->>Server: POST /magic-link/send + email
    Server->>Server: Validate email format
    Server->>Server: Check if user exists
    Server->>Server: Generate magic token
    Server->>MagicLinkStore: Store token with expiration
    Server->>EmailService: Send magic link email
    EmailService->>User: Deliver magic link to inbox
    EmailService->>Server: Confirm delivery
    Server->>Client: 200 OK + magic link URL
    Client->>User: Check email for magic link
    User->>Client: Click magic link
    Client->>Server: GET /magic-link/verify?token=xxx
    Server->>MagicLinkStore: Validate magic token
    Server->>MagicLinkStore: Check expiration and usage
    Server->>MagicLinkStore: Mark token as used
    Server->>Client: 200 OK + auth token
    Client->>Client: Store auth token
    Client->>Client: Redirect to dashboard
    Note over Server: Magic link expires after 5 minutes
    else Invalid/Expired/Used Link
        Server->>Client: 401 Unauthorized
        Client->>Client: Show error message
    end
\`\`\``

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-500 text-white rounded-lg">
            <Mail className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Magic Link Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Passwordless login via secure email links
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
          <Badge variant="outline">Passwordless</Badge>
          <Badge variant="outline">Email-Based</Badge>
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
                  Magic link authentication sends a unique, time-limited URL to the user's email address. 
                  Clicking the link authenticates the user without requiring a password.
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
                  <li>• No password required</li>
                  <li>• Enhanced security</li>
                  <li>• Easy user experience</li>
                  <li>• Reduces password fatigue</li>
                  <li>• Good for mobile users</li>
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
                    Passwordless login for social media and e-commerce
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Enterprise Tools</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Secure access to internal systems
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Mobile Banking</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Quick and secure access to financial services
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> Magic links should be single-use and have short expiration times. 
              Always validate tokens and implement proper logging to detect abuse.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Magic Link Authentication Flow</CardTitle>
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
                Magic Link Authentication Simulation
              </CardTitle>
              <CardDescription>
                Send passwordless login links via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!linkSent ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Step 1: Send Magic Link</h3>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>
                  <Button 
                    onClick={handleSendLink} 
                    disabled={isLoading || !email}
                    className="w-full"
                  >
                    {isLoading ? 'Sending...' : 'Send Magic Link'}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 rounded-lg">
                    <h4 className="font-semibold mb-2">Magic Link Sent Successfully!</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Check your email for the magic link
                    </p>
                    <p className="text-sm text-slate-500">
                      Email: {email.substring(0, 3)}***@***.com
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Time remaining: {formatTime(timeLeft)}</Label>
                    {timeLeft > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleResendLink}
                        disabled={isLoading}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Link
                      </Button>
                    )}
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
                <h3 className="font-semibold text-lg mb-3">1. Email Request</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  User provides their email address to request a passwordless login link.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">2. Token Generation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server generates a cryptographically secure token and creates a unique magic link URL.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Email Delivery</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server sends the magic link to the user's email address via email service.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">4. Link Click</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  User clicks the magic link, which automatically redirects to the verification endpoint.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">5. Token Validation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server validates the token, checks expiration and usage status.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Authentication</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  If token is valid, server authenticates the user and creates a session.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">7. Session Creation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server generates a session token for subsequent authenticated requests.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Magic Link Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">Token Security</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Use cryptographically secure random tokens</li>
                    <li>• Short expiration times (5-15 minutes)</li>
                    <li>• Single-use tokens</li>
                    <li>• URL-encoded tokens</li>
                    <li>• Rate limiting per email</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Link Security</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• HTTPS only for all links</li>
                    <li>• Secure email headers</li>
                    <li>• Anti-phishing measures</li>
                    <li>• Domain validation</li>
                    <li>• Click tracking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Magic Link Attacks & Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
                  <h4 className="font-semibold mb-2">Link Interception</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker gains access to user's email to intercept magic links.
                  </p>
                  <p className="text-sm font-medium text-red-700">
                    Prevention: Email security, 2FA, user education
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <h4 className="font-semibold mb-2">Link Reuse</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker reuses a valid magic link multiple times.
                  </p>
                  <p className="text-sm font-medium text-yellow-700">
                    Prevention: Single-use tokens, immediate invalidation
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <h4 className="font-semibold mb-2">Token Guessing</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker tries to guess valid token URLs.
                  </p>
                  <p className="text-sm font-medium text-blue-700">
                    Prevention: Long random tokens, rate limiting, monitoring
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