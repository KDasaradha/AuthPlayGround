'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputOTP } from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Smartphone, 
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

export default function SMSOTPPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [selectedCountry, setSelectedCountry] = useState('+1')

  const countries = [
    { code: '+1', name: 'United States' },
    { code: '+44', name: 'United Kingdom' },
    { code: '+49', name: 'Germany' },
    { code: '+33', name: 'France' },
    { code: '+86', name: 'China' },
    { code: '+81', name: 'Japan' },
    { code: '+91', name: 'India' }
  ]

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      setResult({ success: false, message: 'Phone number is required' })
      return
    }

    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/sms-otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: selectedCountry + phoneNumber,
          country: selectedCountry
        }),
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
    if (!phoneNumber || !otp || otp.length !== 6) {
      setResult({ success: false, message: 'Valid phone number and 6-digit OTP are required' })
      return
    }

    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/sms-otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: selectedCountry + phoneNumber,
          otp,
          country: selectedCountry
        }),
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        // Reset form
        setPhoneNumber('')
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

  const frontendCode = `// SMS OTP Authentication with Next.js
class SMSOTPAuth {
  constructor() {
    this.otpCache = new Map(); // Cache OTP requests to prevent spam
  }

  // Send OTP via SMS
  async sendOTP(phoneNumber, country = '+1') {
    try {
      // Check rate limiting
      if (this.isRateLimited(phoneNumber)) {
        throw new Error('Too many OTP requests. Please wait before trying again.');
      }

      const response = await fetch('/api/auth/sms-otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, country })
      });

      const data = await response.json();
      
      if (data.success) {
        // Cache the OTP request
        this.otpCache.set(phoneNumber, {
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
  async verifyOTP(phoneNumber, otp) {
    try {
      const response = await fetch('/api/auth/sms-otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp })
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear cache on successful verification
        this.otpCache.delete(phoneNumber);
        
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
  isRateLimited(phoneNumber) {
    const cache = this.otpCache.get(phoneNumber);
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

  // Format phone number
  formatPhoneNumber(phoneNumber, country) {
    return \`\${country}\${phoneNumber.replace(/\\D/g, '')}\`;
  }
}

// Usage in React component
const smsOTPAuth = new SMSOTPAuth();

function SMSOTPLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('+1');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async () => {
    try {
      await smsOTPAuth.sendOTP(phoneNumber, country);
      setOtpSent(true);
      alert('OTP sent to your phone!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const result = await smsOTPAuth.verifyOTP(phoneNumber, otp);
      
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
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="+1">+1 (US)</option>
            <option value="+44">+44 (UK)</option>
            <option value="+49">+49 (Germany)</option>
          </select>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
          />
          <button onClick={handleSendOTP}>
            Send OTP
          </button>
        </div>
      ) : (
        <div>
          <p>OTP sent to {country}{phoneNumber}</p>
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

  const backendCode = `// FastAPI SMS OTP Authentication
from fastapi import FastAPI, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
import secrets
import re
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI()

# OTP storage (in production, use database)
otp_store = {}

# Mock user database
users_db = {
    "admin": {
        "id": 1,
        "username": "admin",
        "phone": "+1234567890",
        "hashed_password": "hashed_password_here"
    }
}

class SMSOTPRequest(BaseModel):
    phone_number: str
    country: str

class SMSOTPVerifyRequest(BaseModel):
    phone_number: str
    otp: str
    country: str

class SMSOTPResponse(BaseModel):
    success: bool
    message: str
    otp_id: str
    expires_at: datetime

class SMSOTPVerifyResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: dict

def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return str(secrets.randbelow(10**6)).zfill(6)

def is_valid_phone_number(phone: str) -> bool:
    """Basic phone number validation"""
    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\\d+]', '', phone)
    
    # Check if it's a valid phone number (10-15 digits)
    return 10 <= len(cleaned) <= 15 and cleaned.isdigit()

def send_sms_otp(phone: str, otp: str) -> bool:
    """Send OTP via SMS (simulation)"""
    try:
        # In production, use real SMS service like Twilio, AWS SNS, etc.
        # This is a simulation that logs to console
        message = f"""
        Your verification code is: {otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request this, please ignore this message.
        """
        
        print(f"SMS TO: {phone}")
        print(f"MESSAGE: {message}")
        
        # Simulate SMS sending delay
        import time
        time.sleep(2)
        
        return True
    except Exception as e:
        print(f"Failed to send SMS: {e}")
        return False

@app.post("/auth/sms-otp/send")
async def send_sms_otp_endpoint(request: SMSOTPRequest):
    """Send OTP to user's phone number"""
    phone_number = request.phone_number
    country = request.country
    full_phone_number = f"{country}{phone_number}"
    
    if not is_valid_phone_number(phone_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format"
        )
    
    # Check if user exists
    user = None
    for user_data in users_db.values():
        if user_data.get("phone", "").endswith(phone_number):
            user = user_data
            break
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this phone number not found"
        )
    
    # Generate OTP
    otp = generate_otp()
    otp_id = secrets.token_urlsafe(16)
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Store OTP
    otp_store[otp_id] = {
        "phone_number": full_phone_number,
        "otp": otp,
        "expires_at": expires_at,
        "attempts": 0,
        "created_at": datetime.utcnow()
    }
    
    # Send OTP via SMS
    sms_sent = send_sms_otp(full_phone_number, otp)
    
    if not sms_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send SMS OTP"
        )
    
    return {
        "success": True,
        "message": "OTP sent successfully",
        "data": {
            "otp_id": otp_id,
            "expires_at": expires_at,
            "phone_number": full_phone_number[: -4] + "XXXX"  # Mask phone number
        }
    }

@app.post("/auth/sms-otp/verify")
async def verify_sms_otp_endpoint(request: SMSOTPVerifyRequest):
    """Verify OTP and authenticate user"""
    phone_number = request.phone_number
    country = request.country
    otp = request.otp
    full_phone_number = f"{country}{phone_number}"
    
    if len(otp) != 6 or not otp.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP must be exactly 6 digits"
        )
    
    # Find valid OTP for this phone number
    valid_otp = None
    for otp_id, otp_data in otp_store.items():
        if (otp_data["phone_number"] == full_phone_number and 
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
    user = None
    for user_data in users_db.values():
        if user_data.get("phone", "").endswith(phone_number):
            user = user_data
            break
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Clean up used OTP
    del otp_store[valid_otp["otp_id"]]
    
    # Generate session token
    session_token = secrets.token_urlsafe(32)
    
    return {
        "success": True,
        "message": "OTP verified successfully",
        "token": session_token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "phone": user["phone"]
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
    participant SMSService
    participant OTPStore
    
    User->>Client: Enter phone number
    Client->>Server: POST /sms-otp/send + phone
    Server->>Server: Validate phone format
    Server->>Server: Check if user exists
    Server->>Server: Generate 6-digit OTP
    Server->>OTPStore: Store OTP with expiration
    Server->>SMSService: Send SMS with OTP
    SMSService->>User: Deliver OTP to phone
    SMSService->>Server: Confirm delivery
    Server->>Client: 200 OK + OTP ID
    Client->>User: Check phone for OTP
    User->>Client: Enter 6-digit OTP
    Client->>Server: POST /sms-otp/verify + phone + OTP
    Server->>OTPStore: Validate OTP
    Server->>Server: Check expiration and attempts
    alt Valid OTP
        Server->>OTPStore: Delete used OTP
        Server->>Client: 200 OK + auth token
        Client->>User: Store auth token
        Client->>User: Redirect to dashboard
    else Invalid/Expired OTP
        Server->>Client: 401 Unauthorized
        Client->>User: Show error message
    end
\`\`\``

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-600 text-white rounded-lg">
            <Smartphone className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              SMS OTP Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              One-time password sent via SMS for verification
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
          <Badge variant="outline">Two-Factor</Badge>
          <Badge variant="outline">Mobile-First</Badge>
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
                  SMS OTP authentication sends a one-time password via SMS to the user's registered 
                  phone number. The user must provide this OTP within a limited time frame to verify their identity.
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
                  <li>• No smartphone required for basic use</li>
                  <li>• Works on any mobile phone</li>
                  <li>• Better security than passwords alone</li>
                  <li>• Familiar user experience</li>
                  <li>• Good for account recovery</li>
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
                  <h4 className="font-semibold mb-2">Banking Apps</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Secure financial transactions with SMS verification
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">E-commerce</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Additional security for high-value purchases
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Travel Apps</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Verification for booking confirmations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Note:</strong> SMS OTP should be part of a multi-factor authentication strategy. 
              Always validate phone numbers and implement rate limiting to prevent abuse.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMS OTP Authentication Flow</CardTitle>
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
                SMS OTP Authentication Simulation
              </CardTitle>
              <CardDescription>
                Send and verify one-time passwords via SMS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!otpSent ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Step 1: Send OTP</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country Code</Label>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name} ({country.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleSendOTP} 
                    disabled={isLoading || !phoneNumber}
                    className="w-full mt-4"
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
                      Check your phone for the 6-digit verification code
                    </p>
                    <p className="text-sm text-slate-500">
                      Phone: {selectedCountry} {phoneNumber.substring(0, 3)}***-****
                    </p>
                  </div>

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
              )}

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Step 2: Verify OTP</h3>
                <div>
                  <Label htmlFor="otp">6-Digit Code</Label>
                  <InputOTP
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    maxLength={6}
                  />
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
                <h3 className="font-semibold text-lg mb-3">1. Phone Number Collection</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  User provides their phone number during registration or login. Server validates format and checks if number is already registered.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">2. OTP Generation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server generates a cryptographically secure 6-digit random number and stores it with expiration time (typically 10 minutes).
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">3. SMS Delivery</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server sends the OTP to user's phone number via SMS gateway. The message includes the OTP and expiration information.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">4. User Input</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  User receives the SMS and enters the 6-digit OTP in the application interface within the time limit.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">5. OTP Validation</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Server validates the OTP against stored value, checks expiration, and monitors attempt limits.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Authentication</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  If OTP is valid, server authenticates the user and creates a session or token for subsequent requests.
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
              <CardTitle>SMS OTP Security Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">OTP Generation</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Use cryptographically secure random numbers</li>
                    <li>• 6-digit codes for balance</li>
                    <li>• 10-minute expiration window</li>
                    <li>• One-time use only</li>
                    <li>• Rate limiting per phone number</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-600 mb-2">SMS Delivery</h4>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    <li>• Use reliable SMS gateway</li>
                    <li>• Implement delivery tracking</li>
                    <li>• Handle failed deliveries</li>
                    <li>• Use sender ID verification</li>
                    <li>• Avoid OTP in message content</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common SMS OTP Attacks & Prevention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950">
                  <h4 className="font-semibold mb-2">SIM Swapping</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker transfers user's SIM to intercept OTPs.
                  </p>
                  <p className="text-sm font-medium text-red-700">
                    Prevention: Phone verification, device fingerprinting
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <h4 className="font-semibold mb-2">SMS Interception</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker intercepts SMS messages to steal OTPs.
                  </p>
                  <p className="text-sm font-medium text-yellow-700">
                    Prevention: Encrypted messaging, secure channels
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <h4 className="font-semibold mb-2">Brute Force</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Attacker tries all possible 6-digit combinations.
                  </p>
                  <p className="text-sm font-medium text-blue-700">
                    Prevention: Rate limiting, account lockout, monitoring
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