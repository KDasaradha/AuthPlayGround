import { NextRequest, NextResponse } from 'next/server'

interface AuthSession {
  id: string
  user_id: string
  auth_method: string
  client_info: {
    ip: string
    user_agent: string
    device: string
    browser: string
    os: string
  }
  created_at: string
  expires_at: string
  active: boolean
  last_activity: string
}

// In-memory storage for sessions (in production, use a database)
const sessions = new Map<string, AuthSession>()

// Initialize with sample data
function initializeSampleSessions() {
  if (sessions.size === 0) {
    const sampleSessions: AuthSession[] = [
      {
        id: "session_001",
        user_id: "user_001",
        auth_method: "jwt",
        client_info: {
          ip: "192.168.1.100",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          device: "Desktop",
          browser: "Chrome",
          os: "Windows"
        },
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        expires_at: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        active: true,
        last_activity: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
      },
      {
        id: "session_002",
        user_id: "user_002",
        auth_method: "oauth2",
        client_info: {
          ip: "192.168.1.101",
          user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          device: "Desktop",
          browser: "Safari",
          os: "macOS"
        },
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        expires_at: new Date(Date.now() + 43200000).toISOString(), // 12 hours from now
        active: true,
        last_activity: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: "session_003",
        user_id: "user_003",
        auth_method: "webauthn",
        client_info: {
          ip: "192.168.1.102",
          user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
          device: "Mobile",
          browser: "Safari",
          os: "iOS"
        },
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        expires_at: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
        active: true,
        last_activity: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
      },
      {
        id: "session_004",
        user_id: "user_001",
        auth_method: "session",
        client_info: {
          ip: "192.168.1.103",
          user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
          device: "Desktop",
          browser: "Firefox",
          os: "Linux"
        },
        created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        expires_at: new Date(Date.now() - 3600000).toISOString(), // Expired 1 hour ago
        active: false,
        last_activity: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: "session_005",
        user_id: "user_005",
        auth_method: "passwordless",
        client_info: {
          ip: "192.168.1.104",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101",
          device: "Desktop",
          browser: "Firefox",
          os: "Windows"
        },
        created_at: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
        expires_at: new Date(Date.now() + 604800000).toISOString(), // 1 week from now
        active: false,
        last_activity: new Date(Date.now() - 604800000).toISOString() // 1 week ago
      }
    ]

    sampleSessions.forEach(session => {
      sessions.set(session.id, session)
    })
  }
}

export async function GET() {
  try {
    initializeSampleSessions()
    const sessionList = Array.from(sessions.values())
    
    return NextResponse.json({
      success: true,
      sessions: sessionList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSampleSessions()
    
    const body = await request.json()
    const { user_id, auth_method, client_info } = body

    if (!user_id || !auth_method) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_id, auth_method' },
        { status: 400 }
      )
    }

    const session: AuthSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id,
      auth_method,
      client_info: client_info || {
        ip: "0.0.0.0",
        user_agent: "Unknown",
        device: "Unknown",
        browser: "Unknown",
        os: "Unknown"
      },
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
      active: true,
      last_activity: new Date().toISOString()
    }

    sessions.set(session.id, session)

    return NextResponse.json({
      success: true,
      session,
      message: 'Session created successfully'
    })
  } catch (error) {
    console.error('Failed to create session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const existingSession = sessions.get(id)
    if (!existingSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    const updatedSession: AuthSession = {
      ...existingSession,
      ...updates,
      last_activity: new Date().toISOString()
    }

    sessions.set(id, updatedSession)

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: 'Session updated successfully'
    })
  } catch (error) {
    console.error('Failed to update session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const existingSession = sessions.get(id)
    if (!existingSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Mark session as inactive instead of deleting
    const updatedSession: AuthSession = {
      ...existingSession,
      active: false,
      last_activity: new Date().toISOString()
    }

    sessions.set(id, updatedSession)

    return NextResponse.json({
      success: true,
      message: 'Session revoked successfully'
    })
  } catch (error) {
    console.error('Failed to revoke session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to revoke session' },
      { status: 500 }
    )
  }
}