import { NextRequest, NextResponse } from 'next/server'

// Global session store (shared across routes)
declare global {
  var __sessionStore: Map<string, any> | undefined
}

if (!global.__sessionStore) {
  global.__sessionStore = new Map()
}

const sessionStore = global.__sessionStore

// Mock user database (same as login)
const users = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com'
  }
}

function cleanupExpiredSessions() {
  const now = new Date()
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.expiresAt < now) {
      sessionStore.delete(sessionId)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Cleanup expired sessions
    cleanupExpiredSessions()
    
    // Get session ID from cookie
    const sessionId = request.cookies.get('session_id')?.value

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        message: 'No session cookie found'
      })
    }

    // Get session from storage
    const session = sessionStore.get(sessionId)
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session'
      })
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      sessionStore.delete(sessionId)
      return NextResponse.json({
        success: false,
        message: 'Session expired'
      })
    }

    // Update last accessed time
    session.lastAccessed = new Date()
    sessionStore.set(sessionId, session)

    // Get user data
    const user = users[session.username as keyof typeof users]
    
    return NextResponse.json({
      success: true,
      message: 'Valid session',
      data: {
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email
        } : null,
        sessionId: sessionId.substring(0, 8) + '...', // Partial for security
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        lastAccessed: session.lastAccessed
      }
    })

  } catch (error) {
    console.error('Session auth check error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}