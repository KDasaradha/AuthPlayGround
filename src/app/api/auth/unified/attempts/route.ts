import { NextRequest, NextResponse } from 'next/server'

interface AuthAttempt {
  id: string
  user_id?: string
  email?: string
  auth_method: string
  result: "success" | "failure" | "blocked"
  reason: string
  ip: string
  user_agent: string
  timestamp: string
  metadata: Record<string, any>
}

// In-memory storage for auth attempts (in production, use a database)
const attempts = new Map<string, AuthAttempt>()

// Initialize with sample data
function initializeSampleAttempts() {
  if (attempts.size === 0) {
    const sampleAttempts: AuthAttempt[] = [
      {
        id: "attempt_001",
        user_id: "user_001",
        email: "john.doe@example.com",
        auth_method: "jwt",
        result: "success",
        reason: "Authentication successful",
        ip: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        metadata: {
          device: "Desktop",
          browser: "Chrome",
          os: "Windows",
          location: "San Francisco"
        }
      },
      {
        id: "attempt_002",
        user_id: "user_002",
        email: "jane.smith@example.com",
        auth_method: "oauth2",
        result: "success",
        reason: "OAuth2 authentication successful",
        ip: "192.168.1.101",
        user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        metadata: {
          device: "Desktop",
          browser: "Safari",
          os: "macOS",
          location: "New York"
        }
      },
      {
        id: "attempt_003",
        email: "unknown@example.com",
        auth_method: "jwt",
        result: "failure",
        reason: "Invalid credentials",
        ip: "192.168.1.200",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        metadata: {
          device: "Desktop",
          browser: "Chrome",
          os: "Windows",
          location: "Unknown"
        }
      },
      {
        id: "attempt_004",
        user_id: "user_003",
        email: "bob.wilson@example.com",
        auth_method: "webauthn",
        result: "success",
        reason: "WebAuthn authentication successful",
        ip: "192.168.1.102",
        user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        metadata: {
          device: "Mobile",
          browser: "Safari",
          os: "iOS",
          location: "Chicago"
        }
      },
      {
        id: "attempt_005",
        email: "suspicious@example.com",
        auth_method: "jwt",
        result: "blocked",
        reason: "Too many failed attempts - IP blocked",
        ip: "192.168.1.250",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        metadata: {
          device: "Desktop",
          browser: "Chrome",
          os: "Windows",
          location: "Unknown",
          risk_score: 85
        }
      },
      {
        id: "attempt_006",
        user_id: "user_004",
        email: "alice.johnson@example.com",
        auth_method: "passwordless",
        result: "failure",
        reason: "Magic link expired",
        ip: "192.168.1.103",
        user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        metadata: {
          device: "Desktop",
          browser: "Firefox",
          os: "Linux",
          location: "Los Angeles"
        }
      },
      {
        id: "attempt_007",
        user_id: "user_001",
        email: "john.doe@example.com",
        auth_method: "totp",
        result: "success",
        reason: "TOTP verification successful",
        ip: "192.168.1.100",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
        metadata: {
          device: "Desktop",
          browser: "Chrome",
          os: "Windows",
          location: "San Francisco"
        }
      },
      {
        id: "attempt_008",
        email: "attacker@example.com",
        auth_method: "jwt",
        result: "blocked",
        reason: "Suspicious activity detected",
        ip: "192.168.1.251",
        user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        metadata: {
          device: "Desktop",
          browser: "Chrome",
          os: "Windows",
          location: "Unknown",
          risk_score: 95,
          threat_type: "brute_force"
        }
      }
    ]

    sampleAttempts.forEach(attempt => {
      attempts.set(attempt.id, attempt)
    })
  }
}

export async function GET() {
  try {
    initializeSampleAttempts()
    const attemptList = Array.from(attempts.values())
    
    return NextResponse.json({
      success: true,
      attempts: attemptList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    })
  } catch (error) {
    console.error('Failed to fetch attempts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attempts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSampleAttempts()
    
    const body = await request.json()
    const { user_id, email, auth_method, result, reason, ip, user_agent, metadata } = body

    if (!auth_method || !result || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: auth_method, result, reason' },
        { status: 400 }
      )
    }

    const attempt: AuthAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id,
      email,
      auth_method,
      result,
      reason,
      ip: ip || "0.0.0.0",
      user_agent: user_agent || "Unknown",
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    }

    attempts.set(attempt.id, attempt)

    return NextResponse.json({
      success: true,
      attempt,
      message: 'Authentication attempt logged successfully'
    })
  } catch (error) {
    console.error('Failed to log attempt:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log attempt' },
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
        { success: false, error: 'Attempt ID is required' },
        { status: 400 }
      )
    }

    const existingAttempt = attempts.get(id)
    if (!existingAttempt) {
      return NextResponse.json(
        { success: false, error: 'Authentication attempt not found' },
        { status: 404 }
      )
    }

    attempts.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Authentication attempt deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete attempt:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete attempt' },
      { status: 500 }
    )
  }
}