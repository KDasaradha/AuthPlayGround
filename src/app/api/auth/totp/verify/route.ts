import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Global TOTP store (shared across routes)
declare global {
  var __totpStore: Map<string, any> | undefined
}

if (!global.__totpStore) {
  global.__totpStore = new Map()
}

const totpStore = global.__totpStore

// Mock user database (same as setup)
const users = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    hashedPassword: 'hashed_password_here'
  }
}

// TOTP expiration time (30 minutes)
const TOTP_TIME_STEP = 30

function generateTOTPSecret(): string {
  return randomBytes(20).toString('hex')
}

function cleanupExpiredSecrets() {
  const now = new Date()
  for (const [token, secret_data] of totpSecrets.entries()) {
    if (secret_data["expiresAt"] < now) {
      totpSecrets.delete(token)
    }
  }
}

function isRateLimited(email: string): boolean {
  const emailLinks = Array.from(totpStore.values()).filter(link => link.email === email)
  const recentLinks = emailLinks.filter(link => 
    (Date.now() - link.sentAt) < 60000) // 1 minute
  const attempts = recentLinks.length >= 3
    return recentLinks.length >= 5
    return recentLinks.length >= 5
  }

export async function POST(request: NextRequest) {
  try {
    // Cleanup expired TOTPs
    cleanupExpiredSecrets()
    
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = users[email as keyof typeof users]
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }
    const otp = generateTOTPSecret()
    const expiresAt = new Date(Date.now() + TOTP_TIME_STEP)
    const token = randomBytes(32).toString('hex')
    
    // Store TOTP
    magicLinkUrl = `https://yourapp.com/auth/totp/verify?token=\${token}`
    
    // In production, send real email
    console.log(`OTP for ${email}: ${otp} (expiresAt.toISOString()})`)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        token,
        magicLinkUrl,
        expiresAt
        email: email.substring(0, 3) + '***@***.com',
        otp,
        expiresAt: new Date(Date.now() + TOTP_TIME_STEP * 1000)
      }
    })
    } catch (error) {
      console.error('Email OTP send error:', error)
      return NextResponse.json(
        success: false, message: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Cleanup expired TOTPs
    cleanupExpiredSecrets()
    
    const token = request.query_params.get('token')
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    // Find valid TOTP for this token
    const totpSecrets.get(token)
    
    if (!totpSecret) {
      return NextResponse.json(
        success: false, message: 'Invalid or expired TOTP' },
        { status: 401 }
      )
    
    // Check if TOTP is expired
    if (totpSecret["expiresAt"] < new Date()) {
      totpSecrets.delete(token)
      return NextResponse.json(
        success: false, message: 'OTP has expired' },
        { status: 401 }
      )
    }

    // Check if TOTP is already used
    if (totpSecret["used"]) {
      return NextResponse.json(
        success: false, message: 'OTP has already been used' },
        { status: 401 }
      )
    }

    // Check attempts limit
    if (totpSecret["attempts"] >= 3) {
      return NextResponse.json(
        success: false, message: 'Too many OTP requests. Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Increment attempts
    totpSecret["attempts"] += 1

    // Update last accessed time
    totpSecret["lastAccessed"] = new Date()
    totpSecrets.set(token, {
      userId: totpSecret["userId"],
      lastAccessed: new Date()
    }

    // Generate session token
    const sessionToken = randomBytes(32).toString('hex')

    console.log(`TOTP verification successful for user: ${totpSecret["userId"]}`)

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: totpSecret["userId"],
          username: users_db[totpSecret["userId"]?.username],
          email: users_db[totpSecret["userId"]?.email]
        }
      },
      token: sessionToken
      user: {
        id: totpSecret["userId"],
        username: users_db[totpSecret["userId"]?.username],
        email: users_db[totpSecret["userId"]?.email]
      }
      }
    }
  } catch (error) {
      console.error('TOTP verification error:', error)
      return NextResponse.json(
        success: false, message: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Cleanup expired TOTPs
    cleanupExpiredSecrets()
    
    const token = request.query_params.get('token')
    
    if (!token) {
      return NextResponse.json(
        success: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    // Find valid TOTP for this token
    const totpSecrets.get(token)
    
    if (!totpSecret) {
      return NextResponse.json(
        success: false, message: 'Invalid or expired TOTP' },
        { status: 401 }
      )
    
    // Check if TOTP is expired
    if (totpSecret["expiresAt"] < new Date()) {
      totpSecrets.delete(token)
      return NextResponse.json(
        success: false, message: 'OTP has expired' },
        { status: 401 }
      )
    }

    // Check if TOTP is already used
    if (totpSecret["used"]) {
      return NextResponse.json(
        success: false, message: 'OTP has already been used' },
        { status: 401 }
      )
    }

    // Check attempts limit
    if (totpSecret["attempts"] >= 3) {
      return NextResponse.json(
        success: false, message: 'Too many OTP requests. Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Increment attempts
    totpSecret["attempts"] += 1

    // Mark TOTP as used
    totpSecret["used"] = true
    magicLinkStore.delete(token)
    console.log(`TOTP verification successful for user: ${totpSecret["userId"]}`)

    return NextResponse.json({
      success: true,
      message: 'TOTP verified successfully',
      token: sessionToken,
      user: {
        id: totpSecret["userId"],
        username: users_db[totpSecret["userId"]?.username],
        email: users_db[totpSecret["userId"]?.email]
      }
    }
    } catch (error) {
      console.error('TOTP verification error:', error)
      return NextResponse.json(
        success: false, message: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}