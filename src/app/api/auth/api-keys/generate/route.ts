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

// In-memory API key storage (in production, use database)
const apiKeys = new Map<string, {
  id: string
  name: string
  key: string
  permissions: string[]
  createdAt: Date
  expiresAt?: Date
  lastUsedAt?: Date
  userId: string
}>()

// API key expiration time (1 year)
const API_KEY_EXPIRY = 365 * 24 * 60 * 60 * 1000

function generateApiKey(userId: string, name: string, permissions: string[]) {
  const apiKey = randomBytes(32).toString('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + API_KEY_EXPIRY)
  
  const keyData = {
    id: randomBytes(8).toString('hex'),
    name,
    key: apiKey,
    permissions,
    createdAt: now,
    expiresAt,
    lastUsedAt: undefined,
    userId
  }
  
  apiKeys.set(apiKey, keyData)
  return { apiKey, keyData }
}

function cleanupExpiredKeys() {
  const now = new Date()
  for (const [apiKey, keyData] of apiKeys.entries()) {
    if (keyData.expiresAt && keyData.expiresAt < now) {
      apiKeys.delete(apiKey)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Cleanup expired keys
    cleanupExpiredKeys()
    
    const { name, permissions } = await request.json()

    if (!name || !permissions || permissions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Name and permissions are required' },
        { status: 400 }
      )
    }

    // For simulation, we'll assume user is authenticated
    // In reality, you'd get this from session/JWT
    const userId = '1' // admin user
    const user = users[userId as keyof typeof users]

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Generate API key
    const { apiKey, keyData } = generateApiKey(userId, name, permissions)

    console.log(`API key generated for user: ${user.username}, key: ${apiKey.substring(0, 8)}...`)

    return NextResponse.json({
      success: true,
      message: 'API key generated successfully',
      data: {
        id: keyData.id,
        name: keyData.name,
        key: apiKey,
        permissions: keyData.permissions,
        createdAt: keyData.createdAt,
        expiresAt: keyData.expiresAt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    })

  } catch (error) {
    console.error('API key generate error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}