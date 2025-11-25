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

// In-memory token storage (in production, use database)
const tokens = new Map<string, {
  userId: string
  username: string
  createdAt: Date
  expiresAt: Date
  lastAccessed?: Date
}>()

// Token expiration time (24 hours)
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000

function generateToken(userId: string, username: string) {
  const token = randomBytes(32).toString('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY)
  
  tokens.set(token, {
    userId,
    username,
    createdAt: now,
    expiresAt,
    lastAccessed: now
  })
  
  return token
}

function cleanupExpiredTokens() {
  const now = new Date()
  for (const [token, tokenData] of tokens.entries()) {
    if (tokenData.expiresAt < now) {
      tokens.delete(token)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Cleanup expired tokens
    cleanupExpiredTokens()
    
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

    // Generate token
    const token = generateToken(user.id, user.username)

    console.log(`Token generated for user: ${username}`)

    return NextResponse.json({
      success: true,
      message: 'Token generated successfully',
      data: {
        token,
        expiresAt: tokens.get(token)?.expiresAt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    })

  } catch (error) {
    console.error('Token auth generate error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}