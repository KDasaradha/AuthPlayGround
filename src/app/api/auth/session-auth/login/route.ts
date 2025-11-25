import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'

// Mock user database for simulation
const users = {
  admin: {
    id: '1',
    username: 'admin',
    hashedPassword: createHash('sha256').update('password123').digest('hex'),
    email: 'admin@example.com'
  }
}

// Global session store (shared across routes)
declare global {
  var __sessionStore: Map<string, any> | undefined
}

if (!global.__sessionStore) {
  global.__sessionStore = new Map()
}

const sessionStore = global.__sessionStore

// Session expiration time (24 hours)
const SESSION_EXPIRY = 24 * 60 * 60 * 1000

function createSession(userId: string, username: string) {
  const sessionId = randomBytes(32).toString('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY)
  
  sessionStore.set(sessionId, {
    userId,
    username,
    createdAt: now,
    expiresAt,
    lastAccessed: now
  })
  
  return sessionId
}

function cleanupExpiredSessions() {
  const now = new Date()
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.expiresAt < now) {
      sessionStore.delete(sessionId)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Cleanup expired sessions
    cleanupExpiredSessions()
    
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = users[username as keyof typeof users]
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const hashedPassword = createHash('sha256').update(password).digest('hex')
    if (hashedPassword !== user.hashedPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session
    const sessionId = createSession(user.id, user.username)

    // Set session cookie (HTTP-only for security)
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        sessionId: sessionId.substring(0, 8) + '...' // Only show partial for security
      }
    })

    response.cookies.set('session_id', sessionId, {
      httpOnly: true,      // Prevent XSS
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',     // CSRF protection
      maxAge: SESSION_EXPIRY / 1000, // 24 hours in seconds
      path: '/'
    })

    console.log(`Session login successful for user: ${username}`)
    return response

  } catch (error) {
    console.error('Session auth login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}