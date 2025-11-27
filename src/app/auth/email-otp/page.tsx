'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
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
  Clock
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import BackButton from '@/components/ui/back-button'

export default function EmailOTPPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)

  const handleSendOTP = async () => {
    if (!email) {
      setResult({ success: false, message: 'Email is required' })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/auth/email-otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setOtpSent(true)
        startTimer(60) // 60 seconds countdown
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!email || !otp || otp.length !== 6) {
      setResult({ success: false, message: 'Valid email and 6-digit OTP are required' })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/auth/email-otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Reset form
        setEmail('')
        setOtp('')
        setOtpSent(false)
        setTimeLeft(0)
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

  const handleResendOTP = () => {
    setOtpSent(false)
    setTimeLeft(0)
    handleSendOTP()
  }

  const frontendCode = `// Email OTP Authentication with Next.js
class EmailOTPAuth {
  constructor() {
    this.otpCache = new Map(); // Cache OTP requests to prevent spam
  }

  // Send OTP to email
  async sendOTP(email) {
    try {
      // Check rate limiting
      if (this.isRateLimited(email)) {
        throw new Error('Too many OTP requests. Please wait before trying again.');
      }

      const response = await fetch('/api/auth/email-otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        // Cache the OTP request
        this.otpCache.set(email, {
          sentAt: Date.now(),
          attempts: 0
        });
      }
      
      return data;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await fetch('/api/auth/email-otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear cache on successful verification
        this.otpCache.delete(email);
        
        // Store auth token/session
        localStorage.setItem('auth_token', data.data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  // Check rate limiting
  isRateLimited(email) {
    const cache = this.otpCache.get(email);
    if (!cache) return false;
    
    const timeSinceLastOTP = Date.now() - cache.sentAt;
    const attempts = cache.attempts || 0;
    
    // Allow one OTP per minute, max 5 attempts
    return timeSinceLastOTP < 60000 && attempts >= 5;
  }

  // Generate random 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Format email with OTP
  formatEmailWithOTP(email, otp) {
    return \`
      Dear User,

      Your One-Time Password (OTP) is: \${otp}

      This OTP will expire in 10 minutes.

      If you didn't request this OTP, please ignore this email.

      Best regards,
      Your Application Team
    \`;
  }
}

// Usage in React component
const emailOTPAuth = new EmailOTPAuth();

function EmailOTPLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async () => {
    try {
      await emailOTPAuth.sendOTP(email);
      setOtpSent(true);
      alert('OTP sent to your email!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const result = await emailOTPAuth.verifyOTP(email, otp);
      
      if (result.success) {
        alert('Login successful!');
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      {!otpSent ? (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button onClick={handleSendOTP}>
            Send OTP
          </button>
        </div>
      ) : (
        <div>
          <p>OTP sent to {email}</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
          />
          <button onClick={handleVerifyOTP}>
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
}`

  const backendCode = `// FastAPI Email OTP Authentication
from fastapi import FastAPI, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import re

app = FastAPI()

# OTP storage (in production, use database)
otp_store = {}

# Mock user database
users_db = {
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "hashed_password": "hashed_password_here"
    }
}

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

class OTPResponse(BaseModel):
    success: bool
    message: str
    otp_id: str
    expires_at: datetime

class User(BaseModel):
    id: int
    username: str
    email: str

def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return str(secrets.randbelow(10**6)).zfill(6)

def is_valid_email(email: str) -> bool:
    """Basic email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def send_otp_email(email: str, otp: str) -> bool:
    """Send OTP via email (simulation)"""
    try:
        # In production, use real email service
        # This is a simulation that logs to console
        message = f"""
        Your OTP is: {otp}
        
        This OTP will expire in 10 minutes.
        
        If you didn't request this, please ignore this email.
        """
        
        print(f"EMAIL TO: {email}")
        print(f"MESSAGE: {message}")
        
        # Simulate email sending delay
        import time
        time.sleep(1)
        
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@app.post("/auth/email-otp/send")
async def send_otp_endpoint(request: OTPRequest):
    """Send OTP to user's email"""
    email = request.email
    
    if not is_valid_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Check if user exists
    user = users_db.get(email.split('@')[0])  # Simplified for demo
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate OTP
    otp = generate_otp()
    otp_id = secrets.token_urlsafe(16)
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Store OTP
    otp_store[otp_id] = {
        "email": email,
        "otp": otp,
        "expires_at": expires_at,
        "attempts": 0,
        "created_at": datetime.utcnow()
    }
    
    # Send OTP via email
    email_sent = send_otp_email(email, otp)
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email"
        )
    
    return {
        "success": True,
        "message": "OTP sent successfully",
        "data": {
            "otp_id": otp_id,
            "expires_at": expires_at,
            "email": email[:3] + "***"  # Partially mask email
        }
    }

@app.post("/auth/email-otp/verify")
async def verify_otp_endpoint(request: OTPVerifyRequest):
    """Verify OTP and authenticate user"""
    email = request.email
    otp = request.otp
    
    if len(otp) != 6 or not otp.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP must be 6 digits"
        )
    
    # Find valid OTP for this email
    valid_otp = None
    for otp_id, otp_data in otp_store.items():
        if (otp_data["email"] == email and 
            otp_data["otp"] == otp and
            otp_data["expires_at"] > datetime.utcnow()):
            valid_otp = otp_data
            break
    
    if not valid_otp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP"
        )
    
    # Check attempts
    if valid_otp["attempts"] >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP attempts. Please request a new OTP."
        )
    
    # Increment attempts
    valid_otp["attempts"] += 1
    
    # Get user
    user = users_db.get(email.split('@')[0])
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Clean up used OTP
    del otp_store[valid_otp["otp_id"]]
    
    # Generate session/token
    session_token = secrets.token_urlsafe(32)
    
    return {
        "success": True,
        "message": "OTP verified successfully",
        "data": {
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"]
            },
            "token": session_token,
            "otp_used": valid_otp["otp_id"]
        }
    }

# Cleanup expired OTPs
@app.middleware("http")
async def cleanup_expired_otps(request, call_next):
    """Clean up expired OTPs"""
    current_time = datetime.utcnow()
    expired_otps = [
        otp_id for otp_id, otp_data in otp_store.items()
        if otp_data["expires_at"] < current_time
    ]
    
    for otp_id in expired_otps:
        del otp_store[otp_id]
    
    response = await call_next(request)
    return response`

  const flowDiagram = `\`\`\`mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant EmailService
    participant OTPStore
    
    User->>Client: Enter email
    Client->>Server: POST /email-otp/send + email
    Server->>Server: Validate email format
    Server->>Server: Check if user exists
    Server->>Server: Generate 6-digit OTP
    Server->>OTPStore: Store OTP with expiration
    Server->>EmailService: Send OTP via email
    EmailService->>User: Deliver OTP to inbox
    EmailService->>Server: Confirm delivery
    Server->>Client: 200 OK + OTP ID
    Client->>User: Check email for OTP
    User->>Client: Enter 6-digit OTP
    Client->>Server: POST /email-otp/verify + email + OTP
    Server->>OTPStore: Validate OTP
    Server->>Server: Check expiration and attempts
    alt Valid OTP
        Server->>OTPStore: Delete used OTP
        Server->>Client: 200 OK + auth token
        Client->>Client: Store auth token
        Client->>Client: Redirect to dashboard
    else Invalid/Expired OTP
        Server->>Client: 401 Unauthorized
        Client->>Client: Show error message
    end
\`\`\``

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <BackButton />
      </div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-600 text-white rounded-lg">
            <Mail className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Email OTP Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              One-time password sent via email for verification
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
          <Badge variant="outline">Two-Factor</Badge>
          <Badge variant="outline">Time-Based</Badge>
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
                  Email OTP authentication sends a one-time password to the user's registered email address.
                  The user must provide this OTP within a limited time frame to verify their identity.
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
                  <li>• Enhanced security with two-factor authentication</li>
                  <li>• No password transmission during login</li>
                  <li>• Time-limited verification window</li>
                  <li>• Easy user experience</li>
                  <li>• Leverages existing email infrastructure</li>
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
                  <h4 className="font-semibold mb-2">Banking & Finance</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Secure financial transactions with email verification
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">E-commerce</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Additional verification for high-value purchases
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Healthcare</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Patient portal access with email verification
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> Email OTP should be used as part of a multi-factor authentication strategy.
              Always validate email format and implement rate limiting to prevent abuse.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email OTP Authentication Flow</CardTitle>
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
                Email OTP Authentication Simulation
              </CardTitle>
              <CardDescription>
                Send and verify one-time passwords via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!otpSent ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Step 1: Send OTP</h3>
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
                    onClick={handleSendOTP}
                    disabled={isLoading || !email}
                    className="w-full"
                  >
                    {isLoading ? 'Sending...' : 'Send OTP'}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold mb-2">OTP Sent Successfully!</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Check your email for the 6-digit verification code
                    </p>
                    <p className="text-sm text-slate-500">
                      Email: {email.substring(0, 3)}***@***.com
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Label>
                      {timeLeft > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResendOTP}
                          disabled={isLoading}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resend OTP
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Step 2: Verify OTP</h3>
                <div>
                  <Label htmlFor="otp">6-Digit Code</Label>

                  <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || !otp || otp.length !== 6}
                  className="w-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
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
                          <strong>Token:</strong> {result.data.token?.substring(0, 16)}...
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
                <h3 className="font-semibold text-lg mb-3">1. Email Request</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  User provides their email address to request a one-time password for authentication.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">2. OTP Generation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server generates a cryptographically secure 6-digit OTP and stores it with expiration time.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Email Delivery</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server sends the OTP to the user's registered email address through email service.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">4. User Input</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  User receives the OTP via email and enters it in the application interface.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">5. OTP Validation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server validates the OTP against stored value, checking expiration and attempt limits.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Authentication</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  If OTP is valid, server authenticates the user and creates a session or token.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">7. Cleanup</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Used OTP is immediately invalidated to prevent reuse and enhance security.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email OTP Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">OTP Generation</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Use cryptographically secure random numbers</li>
                    <li>• 6-digit codes for balance of security and usability</li>
                    <li>• 10-minute expiration window</li>
                    <li>• One-time use only</li>
                    <li>• Rate limiting per email</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">Email Delivery</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Use reliable email service providers</li>
                    <li>• Implement delivery tracking</li>
                    <li>• Handle bounced and invalid emails</li>
                    <li>• Use professional email templates</li>
                    <li>• Avoid OTP in email subject</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Email OTP Attacks & Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
                  <h4 className="font-semibold mb-2">Email Interception</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker gains access to user's email account to intercept OTPs.
                  </p>
                  <p className="text-sm font-medium text-red-700">
                    Prevention: Email security, 2FA, account monitoring
                  </p>
                </div>

                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <h4 className="font-semibold mb-2">Brute Force Attacks</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker tries all possible 6-digit combinations.
                  </p>
                  <p className="text-sm font-medium text-yellow-700">
                    Prevention: Rate limiting, account lockout, monitoring
                  </p>
                </div>

                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <h4 className="font-semibold mb-2">Phishing</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker creates fake login pages to steal OTPs.
                  </p>
                  <p className="text-sm font-medium text-blue-700">
                    Prevention: User education, domain verification, secure design
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