"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Code,
  BookOpen,
  Play,
  RefreshCw,
  Copy,
  Smartphone,
  Clock,
  Key,
  Eye,
  EyeOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TOTPPage() {
  const [isSetup, setIsSetup] = useState(false)
  const [secret, setSecret] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const { toast } = useToast()

  const handleSetup = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/totp/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setSecret(data.data.secret)
        setQrCode(data.data.qrCode)
        setIsSetup(true)
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setResult({ success: false, message: 'Please enter a valid 6-digit OTP' })
      return
    }

    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/totp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        toast({
          title: "Success",
          description: "TOTP verified successfully!",
        })
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Secret copied to clipboard",
    })
  }

  const frontendCode = `// TOTP Authentication with Next.js
class TOTPAuth {
  constructor() {
    this.secret = null;
    this.verified = false;
  }

  // Generate TOTP secret
  async generateSecret(userId) {
    try {
      const response = await fetch('/api/auth/totp/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      
      if (data.success) {
        this.secret = data.data.secret;
        return data.data;
      }
      
      throw new Error(data.message || 'Secret generation failed');
    } catch (error) {
      console.error('TOTP secret generation error:', error);
      throw error;
    }
  }

  // Verify TOTP code
  async verifyCode(code) {
    try {
      const response = await fetch('/api/auth/totp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      
      if (data.success) {
        this.verified = true;
        return data.data;
      }
      
      throw new Error(data.message || 'Verification failed');
    } catch (error) {
      console.error('TOTP verification error:', error);
      throw error;
    }
  }

  // Generate TOTP code (client-side)
  generateTOTPCode(secret, timeStep = 30) {
    const crypto = require('crypto');
    const counter = Math.floor(Date.now() / 1000 / timeStep);
    
    const counterBytes = Buffer.alloc(8);
    counterBytes.writeBigUInt64BE(BigInt(counter), 0);
    
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'hex'));
    hmac.update(counterBytes);
    const digest = hmac.digest();
    
    const offset = digest[digest.length - 1] & 0x0f;
    const code = (
      ((digest[offset] & 0x07) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff)
    ) % 1000000;
    
    return code.toString().padStart(6, '0');
  }
}

// Usage in React component
const totpAuth = new TOTPAuth();

function TOTPComponent() {
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');

  const handleSetup = async () => {
    try {
      const result = await totpAuth.generateSecret('user123');
      setSecret(result.secret);
      setQrCode(result.qrCode);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleVerify = async () => {
    try {
      const result = await totpAuth.verifyCode(code);
      alert('TOTP verified successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <button onClick={handleSetup}>Setup TOTP</button>
      {secret && (
        <div>
          <p>Secret: {secret}</p>
          <img src={qrCode} alt="QR Code" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
          />
          <button onClick={handleVerify}>Verify</button>
        </div>
      )}
    </div>
  );
}`

  const backendCode = `// FastAPI TOTP Authentication
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel
import pyotp
import qrcode
import io
import base64
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI()

# TOTP storage (in production, use database)
totp_secrets = {}

class TOTPSetupRequest(BaseModel):
    user_id: str

class TOTPVerifyRequest(BaseModel):
    code: str

def generate_qr_code(secret: str, user_email: str) -> str:
    """Generate QR code for TOTP secret"""
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user_email,
        issuer_name="YourApp"
    )
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(totp_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

@app.post("/auth/totp/setup")
async def setup_totp(request_data: TOTPSetupRequest):
    """Setup TOTP for user"""
    user_id = request_data.user_id
    
    # Generate TOTP secret
    secret = pyotp.random_base32()
    
    # Store secret with expiration
    totp_secrets[user_id] = {
        "secret": secret,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(hours=24),
        "verified": False
    }
    
    # Generate QR code
    qr_code = generate_qr_code(secret, f"user{user_id}@example.com")
    
    return {
        "success": True,
        "message": "TOTP setup successful",
        "data": {
            "secret": secret,
            "qr_code": qr_code,
            "manual_entry_key": secret,
            "expires_at": totp_secrets[user_id]["expires_at"].isoformat()
        }
    }

@app.post("/auth/totp/verify")
async def verify_totp(request_data: TOTPVerifyRequest):
    """Verify TOTP code"""
    code = request_data.code
    
    # Find user's TOTP secret (simplified - in reality, you'd identify user from session)
    user_id = "default_user"  # This would come from authentication
    totp_data = totp_secrets.get(user_id)
    
    if not totp_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="TOTP not found for user"
        )
    
    # Check if TOTP has expired
    if totp_data["expires_at"] < datetime.utcnow():
        del totp_secrets[user_id]
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="TOTP setup has expired"
        )
    
    # Verify TOTP code
    totp = pyotp.TOTP(totp_data["secret"])
    
    if totp.verify(code):
        totp_data["verified"] = True
        return {
            "success": True,
            "message": "TOTP verified successfully",
            "data": {
                "user_id": user_id,
                "verified_at": datetime.utcnow().isoformat()
            }
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TOTP code"
        )

# Cleanup expired TOTPs
@app.middleware("http")
async def cleanup_expired_totps(request, call_next):
    """Clean up expired TOTP setups"""
    current_time = datetime.utcnow()
    expired_totps = [
        user_id for user_id, data in totp_secrets.items()
        if data["expires_at"] < current_time
    ]
    
    for user_id in expired_totps:
        del totp_secrets[user_id]
    
    response = await call_next(request)
    return response`

  const flowDiagram = ```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant TOTPService
    participant AuthenticatorApp
    
    User->>Client: Request TOTP setup
    Client->>Server: POST /totp/setup
    Server->>TOTPService: Generate secret
    TOTPService->>Server: Return secret + QR code
    Server->>Client: 200 OK + secret + QR code
    Client->>User: Show QR code and secret
    User->>AuthenticatorApp: Scan QR code
    AuthenticatorApp->>User: Store TOTP secret
    
    User->>Client: Request login with TOTP
    User->>AuthenticatorApp: Get 6-digit code
    User->>Client: Enter TOTP code
    Client->>Server: POST /totp/verify + code
    Server->>TOTPService: Verify code
    alt Valid code
        TOTPService->>Server: Return success
        Server->>Client: 200 OK + auth token
        Client->>Client: Store auth token
        Client->>User: Redirect to dashboard
    else Invalid code
        TOTPService->>Server: Return error
        Server->>Client: 401 Unauthorized
        Client->>User: Show error
    end
```

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-600 text-white rounded-lg">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              TOTP Authentication
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Time-based One-Time Password for secure two-factor authentication
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">Advanced</Badge>
          <Badge variant="outline">Two-Factor</Badge>
          <Badge variant="outline">Time-Based</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="verify">Verify</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="flow">Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  What is TOTP?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Time-based One-Time Password (TOTP) generates a 6-digit code that changes every 30 seconds. 
                  It provides an additional layer of security beyond passwords.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-slate-600 dark:text-slate-400 space-y-2">
                  <li>• Codes expire after 30 seconds</li>
                  <li>• Works offline without internet</li>
                  <li>• Compatible with authenticator apps</li>
                  <li>• Resistant to replay attacks</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Authenticator Apps</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Google Authenticator, Authy, Microsoft Authenticator
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Setup Process</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Scan QR code or manually enter secret key
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Code Format</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                6-digit numerical code, changes every 30 seconds
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                TOTP Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                {!isSetup ? (
                  <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400">
                      Click the button below to generate a new TOTP secret
                    </p>
                    <Button 
                      onClick={handleSetup}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          Generate TOTP Secret
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <h4 className="font-semibold mb-2">Secret Key</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <code className="flex-1 p-2 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono">
                          {showSecret ? secret : '••••••••••••••••••'}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(secret)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Store this secret securely. You'll need it to restore your authenticator.
                      </p>
                    </div>
                    
                    {qrCode && (
                      <div className="p-4 bg-white rounded-lg border">
                        <h4 className="font-semibold mb-2">QR Code</h4>
                        <div className="flex justify-center">
                          <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Scan this QR code with your authenticator app
                        </p>
                      </div>
                    )}
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
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verify TOTP Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp">6-Digit Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-2xl font-mono"
                    maxLength={6}
                  />
                </div>
                
                <Button 
                  onClick={handleVerify}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify Code
                    </>
                  )}
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
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
                <h4 className="font-semibold mb-2">Tips</h4>
                <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                  <li>• Make sure your device time is correct</li>
                  <li>• Wait for a new code if the current one expires</li>
                  <li>• TOTP codes refresh every 30 seconds</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Frontend Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm">
                  {frontendCode}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Backend Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm">
                  {backendCode}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Authentication Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm">
                  {flowDiagram}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}