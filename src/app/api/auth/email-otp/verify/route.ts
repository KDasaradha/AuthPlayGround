import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Global OTP store (shared across routes)
declare global {
  var __otpStore: Map<string, any> | undefined
}

if (!global.__otpStore) {
  global.__otpStore = new Map()
}

const otpStore = global.__otpStore

// Mock user database (same as send)
const users = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com'
  }
}

// Session/token storage for successful verification
const sessions = new Map<string, {
  userId: string
  username: string
  email: string
  token: string
  createdAt: Date
}>()

function cleanupExpiredOTPs() {
  const now = new Date()
  for (const [email, otpData] of otpStore.entries()) {
    if (otpData.expiresAt < now) {
      otpStore.delete(email)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Cleanup expired OTPs
    cleanupExpiredOTPs()
    
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'OTP must be exactly 6 digits' },
        { status: 400 }
      )
    }

    // Find valid OTP for this email
    const otpData = otpStore.get(email)
    
    if (!otpData || otpData.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 401 }
      )
    }

    // Check if OTP expired
    if (otpData.expiresAt < new Date()) {
      otpStore.delete(email)
      return NextResponse.json(
        { success: false, message: 'OTP has expired' },
        { status: 401 }
      )
    }

    // Check attempts limit
    if (otpData.attempts >= 3) {
      otpStore.delete(email)
      return NextResponse.json(
        { success: false, message: 'Too many OTP attempts. Please request a new OTP.' },
        { status: 429 }
      )
    }

    // Increment attempts
    otpData.attempts += 1
    otpStore.set(email, otpData)

    // Get user
    const user = users[email as keyof typeof users]
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Generate session token
    const sessionToken = randomBytes(32).toString('hex')
    const sessionId = randomBytes(16).toString('hex')
    
    // Store session
    sessions.set(sessionId, {
      userId: user.id,
      username: user.username,
      email: user.email,
      token: sessionToken,
      createdAt: new Date()
    })

    // Clean up used OTP
    otpStore.delete(email)

    console.log(`Email OTP verification successful for user: ${user.username}`)

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token: sessionToken,
        sessionId: sessionId.substring(0, 8) + '...' // Partial for security
      }
    })

  } catch (error) {
    console.error('Email OTP verify error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}