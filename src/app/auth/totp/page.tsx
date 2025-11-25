import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHmac } from 'crypto'

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

// TOTP time step (30 seconds)
const TOTP_TIME_STEP = 30 * 1000 // 30 seconds in milliseconds

function generateTOTPSecret(): string {
  return randomBytes(20).toString('hex')
}

function cleanupExpiredSecrets() {
  const now = new Date()
  for (const [token, secret_data] of totpStore.entries()) {
    if (secret_data.expiresAt < now) {
      totpStore.delete(token)
    }
  }
}

function isRateLimited(email: string): boolean {
  const emailLinks = Array.from(totpStore.values()).filter(link => link.email === email)
  const recentLinks = emailLinks.filter(link =>
    (Date.now() - link.sentAt) < 60000) // 1 minute
  return recentLinks.length >= 5
}

function verifyTOTP(secret: string, userOTP: string): boolean {
  const timeStep = 30 // 30-second steps
  const counter = Math.floor(Date.now() / 1000 / timeStep)

  // Check current and previous time steps (allowing for clock skew)
  for (let i = 0; i <= 1; i++) {
    const counterBytes = Buffer.alloc(8)
    counterBytes.writeUInt32BE(counter - i, 4)

    const hmac = createHmac('sha1', Buffer.from(secret, 'hex')).update(counterBytes).digest()
    const offset = hmac[hmac.length - 1] & 0x0f
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)

    const otp = (binary % 1000000).toString().padStart(6, '0')

    if (otp === userOTP) {
      return true
    }
  }

  return false
}

export async function POST(request: NextRequest) {
  try {
    // Cleanup expired TOTPs
    cleanupExpiredSecrets()

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
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

    // Check rate limiting
    if (isRateLimited(email)) {
      return NextResponse.json(
        { success: false, message: 'Too many OTP requests. Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Check if user exists
    const user = Object.values(users).find(u => u.email === email)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Generate TOTP
    const secret = generateTOTPSecret()
    const otp = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit OTP
    const expiresAt = new Date(Date.now() + TOTP_TIME_STEP)
    const token = randomBytes(32).toString('hex')

    // Store TOTP
    totpStore.set(token, {
      email,
      secret,
      otp,
      expiresAt,
      sentAt: Date.now(),
      used: false,
      attempts: 0,
      userId: user.id
    })

    // In production, send real email
    // For simulation, we'll just log it
    console.log(`OTP for ${email}: ${otp} (expires at ${expiresAt.toISOString()})`)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        email: email.substring(0, 3) + '***@***.com',
        magicLinkUrl: `https://yourapp.com/auth/totp/verify?token=${token}`,
        expiresAt,
        otpId: randomBytes(16).toString('hex')
      }
    })
  } catch (error) {
    console.error('Email OTP send error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Cleanup expired TOTPs
    cleanupExpiredSecrets()

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    // Find valid TOTP for this token
    const totpSecret = totpStore.get(token)

    if (!totpSecret) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired TOTP' },
        { status: 401 }
      )
    }

    // Check if TOTP is expired
    if (totpSecret.expiresAt < new Date()) {
      totpStore.delete(token)
      return NextResponse.json(
        { success: false, message: 'OTP has expired' },
        { status: 401 }
      )
    }

    // Check if TOTP is already used
    if (totpSecret.used) {
      return NextResponse.json(
        { success: false, message: 'OTP has already been used' },
        { status: 401 }
      )
    }

    // Check attempts limit
    const attempts = totpSecret.attempts || 0
    if (attempts >= 3) {
      return NextResponse.json(
        { success: false, message: 'Too many OTP verification attempts. Please request a new OTP.' },
        { status: 429 }
      )
    }

    // Get user
    const user = Object.values(users).find(u => u.id === totpSecret.userId)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Generate session token
    const sessionToken = randomBytes(32).toString('hex')

    // Mark TOTP as used
    totpSecret.used = true
    totpStore.set(token, totpSecret)

    console.log(`OTP verification successful for user: ${user.id}`)

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        sessionToken
      }
    })
  } catch (error) {
    console.error('TOTP verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add a new endpoint for OTP verification
export async function PUT(request: NextRequest) {
  try {
    // Cleanup expired TOTPs
    cleanupExpiredSecrets()

    const { token, otp } = await request.json()

    if (!token || !otp) {
      return NextResponse.json(
        { success: false, message: 'Token and OTP are required' },
        { status: 400 }
      )
    }

    // Find valid TOTP for this token
    const totpSecret = totpStore.get(token)

    if (!totpSecret) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired TOTP' },
        { status: 401 }
      )
    }

    // Check if TOTP is expired
    if (totpSecret.expiresAt < new Date()) {
      totpStore.delete(token)
      return NextResponse.json(
        { success: false, message: 'OTP has expired' },
        { status: 401 }
      )
    }

    // Check if TOTP is already used
    if (totpSecret.used) {
      return NextResponse.json(
        { success: false, message: 'OTP has already been used' },
        { status: 401 }
      )
    }

    // Increment attempts
    totpSecret.attempts = (totpSecret.attempts || 0) + 1
    totpStore.set(token, totpSecret)

    // Check attempts limit
    if (totpSecret.attempts >= 3) {
      return NextResponse.json(
        { success: false, message: 'Too many OTP verification attempts. Please request a new OTP.' },
        { status: 429 }
      )
    }

    // Verify OTP
    const isValid = otp === totpSecret.otp || verifyTOTP(totpSecret.secret, otp)

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 401 }
      )
    }

    // Get user
    const user = Object.values(users).find(u => u.id === totpSecret.userId)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Generate session token
    const sessionToken = randomBytes(32).toString('hex')

    // Mark TOTP as used
    totpSecret.used = true
    totpStore.set(token, totpSecret)

    console.log(`OTP verification successful for user: ${user.id}`)

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        sessionToken
      }
    })
  } catch (error) {
    console.error('TOTP verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}