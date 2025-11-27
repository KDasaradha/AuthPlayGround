import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Mock user database for simulation
const users = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    phone: '+1234567890',
    device_id: 'device_123',
    hashedPassword: 'hashed_password_here'
  }
}

// Passwordless session storage (in production, use database)
const passwordlessSessions = new Map<string, {
  userId: string
  identifier: string
  method: string
  deviceInfo: any
  token: string
  expiresAt: Date
  createdAt: Date
  lastAccessed: Date
}>()

// Passwordless session expiration time (24 hours)
const PASSWORDLESS_SESSION_EXPIRY = 24 * 60 * 60 * 1000

function generateSecureToken(): string {
  return randomBytes(32).toString('hex')
}

function isRateLimited(identifier: string, method: string): boolean {
  // Count recent attempts for this identifier
  const recentAttempts = Array.from(passwordlessSessions.values()).filter(session => 
    session["identifier"] === identifier && 
    session["method"] === method && 
    session["created_at"] > new Date(Date.now() - 3600000) // 1 hour
  )
  
  return recentAttempts.length >= 5 // Max 5 attempts per hour
}

function isValidIdentifier(identifier: string, method: string): boolean {
  if (method === 'email') {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(identifier)
  } else if (method === 'phone') {
    // Phone number validation
    const cleaned = identifier.replace(/\D/g, '')
    return cleaned.length >= 10 && cleaned.length <= 15 && /^\d+$/.test(cleaned)
  } else if (method === 'username') {
    // Username validation
    return identifier.length >= 3 && identifier.length <= 50
  } else if (method === 'device') {
    // Device ID validation
    return identifier.length >= 8 && identifier.length <= 64
  }
  return false
}

function getUserByIdentifier(identifier: string, method: string) {
  if (method === 'email') {
    for (const user of Object.values(users)) {
      if (user.email?.toLowerCase() === identifier.toLowerCase()) {
        return user
      }
    }
  } else if (method === 'phone') {
    for (const user of Object.values(users)) {
      if (user.phone?.includes(identifier)) {
        return user
      }
    }
  } else if (method === 'username') {
    return users[identifier]
  }
  return null
}

function createPasswordlessSession(userId: string, identifier: string, method: string, deviceInfo: any): { sessionId: string, token: string } {
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + PASSWORDLESS_SESSION_EXPIRY)
  const sessionId = randomBytes(16).toString('hex')
  
  // Store session
  passwordlessSessions.set(sessionId, {
    userId,
    identifier,
    method,
    deviceInfo,
    token,
    expiresAt,
    createdAt: new Date(),
    lastAccessed: new Date()
  })
  
  return { sessionId, token }
}

export async function POST(request: NextRequest) {
  try {
    const { identifier, method, deviceInfo } = await request.json()

    if (!identifier || !method) {
      return NextResponse.json(
        { success: false, message: 'Identifier and method are required' },
        { status: 400 }
      )
    }

    // Validate identifier format
    if (!isValidIdentifier(identifier, method)) {
      return NextResponse.json(
        { success: false, message: `Invalid ${method} format` },
        { status: 400 }
      )
    }

    // Check rate limiting
    if (isRateLimited(identifier, method)) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Get user by identifier
    const user = getUserByIdentifier(identifier, method)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Create passwordless session
    const { sessionId, token } = createPasswordlessSession(user.id, identifier, method, deviceInfo)

    console.log(`Passwordless login successful for user: ${user.username} via ${method}`)

    return NextResponse.json({
      success: true,
      message: 'Passwordless authentication successful',
      data: {
        sessionId,
        token,
        expiresAt: new Date(Date.now() + PASSWORDLESS_SESSION_EXPIRY),
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    })

  } catch (error) {
    console.error('Passwordless login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}