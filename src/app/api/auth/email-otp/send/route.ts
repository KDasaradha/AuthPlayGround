import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Mock user database for simulation
const users = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com'
  }
}

// In-memory OTP storage (in production, use database)
const otpStore = new Map<string, {
  email: string
  otp: string
  expiresAt: Date
  attempts: number
  createdAt: Date
}>()

// OTP expiration time (10 minutes)
const OTP_EXPIRY = 10 * 60 * 1000

function generateOTP(): string {
  // Generate 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function cleanupExpiredOTPs() {
  const now = new Date()
  for (const [email, otpData] of otpStore.entries()) {
    if (otpData.expiresAt < now) {
      otpStore.delete(email)
    }
  }
}

function isRateLimited(email: string): boolean {
  const otpData = otpStore.get(email)
  if (!otpData) return false
  
  const timeSinceLastOTP = Date.now() - otpData.createdAt.getTime()
  const oneMinute = 60 * 1000
  
  // Allow one OTP per minute, max 5 attempts
  return timeSinceLastOTP < oneMinute && otpData.attempts >= 5
}

export async function POST(request: NextRequest) {
  try {
    // Cleanup expired OTPs
    cleanupExpiredOTPs()
    
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
    const user = users[email as keyof typeof users]
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY)
    
    // Store OTP
    otpStore.set(email, {
      email,
      otp,
      expiresAt,
      attempts: 0,
      createdAt: new Date()
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
        email: email.substring(0, 3) + '***@***.com', // Partially mask email
        otpId: randomBytes(16).toString('hex'),
        expiresAt
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