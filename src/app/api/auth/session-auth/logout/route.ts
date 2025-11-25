import { NextRequest, NextResponse } from 'next/server'

// Global session store (shared across routes)
declare global {
  var __sessionStore: Map<string, any> | undefined
}

if (!global.__sessionStore) {
  global.__sessionStore = new Map()
}

const sessionStore = global.__sessionStore

export async function POST(request: NextRequest) {
  try {
    // Get session ID from cookie
    const sessionId = request.cookies.get('session_id')?.value

    if (sessionId && sessionStore.has(sessionId)) {
      // Remove session from storage
      sessionStore.delete(sessionId)
      console.log(`Session logout successful for session: ${sessionId.substring(0, 8)}...`)
    }

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    })

    response.cookies.set('session_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expire
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Session auth logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}