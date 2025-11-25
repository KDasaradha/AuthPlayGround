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

// Mock refresh token storage
const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>()

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production'

function createToken(payload: any, expiresIn: string): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  
  let exp = now
  if (expiresIn === '15m') {
    exp = now + (15 * 60) // 15 minutes
  } else if (expiresIn === '7d') {
    exp = now + (7 * 24 * 60 * 60) // 7 days
  }

  const tokenPayload = {
    ...payload,
    iat: now,
    exp
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
  const signature = Buffer.from(
    createHash('sha256')
      .update(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`)
      .digest('hex')
  ).toString('base64url')

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export async function POST(request: NextRequest) {
  try {
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

    // Generate tokens
    const accessToken = createToken(
      { 
        sub: user.id, 
        username: user.username,
        email: user.email,
        type: 'access'
      },
      '15m'
    )

    const refreshToken = createToken(
      { 
        sub: user.id,
        type: 'refresh'
      },
      '7d'
    )

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    refreshTokens.set(refreshToken, { userId: user.id, expiresAt })

    // Log to audit trail
    console.log(`JWT login successful for user: ${username}`)

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 15 * 60 // 15 minutes in seconds
      },
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })

  } catch (error) {
    console.error('JWT auth error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export for use in refresh endpoint
export { refreshTokens, JWT_SECRET }