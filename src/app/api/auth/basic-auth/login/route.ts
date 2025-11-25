import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
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

// Mock session storage
const sessions = new Map<string, { userId: string; expiresAt: Date }>()

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

    // Generate session token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    sessions.set(token, { userId: user.id, expiresAt })

    // Log to audit trail (in real app, this would go to database)
    console.log(`Basic Auth login successful for user: ${username}`)

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Basic auth error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Verify token middleware function (for other protected routes)
export function verifyToken(token: string): { userId: string } | null {
  const session = sessions.get(token)
  if (!session || session.expiresAt < new Date()) {
    sessions.delete(token)
    return null
  }
  return { userId: session.userId }
}