import { NextRequest, NextResponse } from 'next/server'

// Global API key store (shared across routes)
declare global {
  var __apiKeyStore: Map<string, any> | undefined
}

if (!global.__apiKeyStore) {
  global.__apiKeyStore = new Map()
}

const apiKeyStore = global.__apiKeyStore

// Mock user database (same as generate)
const users = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com'
  }
}

function cleanupExpiredKeys() {
  const now = new Date()
  for (const [apiKey, keyData] of apiKeyStore.entries()) {
    if (keyData.expiresAt && keyData.expiresAt < now) {
      apiKeyStore.delete(apiKey)
    }
  }
}

function extractApiKeyFromHeader(request: NextRequest): string | null {
  const apiKey = request.headers.get('x-api-key')
  return apiKey || null
}

export async function POST(request: NextRequest) {
  try {
    // Cleanup expired keys
    cleanupExpiredKeys()
    
    // Extract API key from header
    const apiKey = extractApiKeyFromHeader(request)

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'API key required' },
        { status: 401 }
      )
    }

    // Get API key from storage
    const keyData = apiKeyStore.get(apiKey)
    
    if (!keyData) {
      return NextResponse.json(
        { success: false, message: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Check if key expired
    if (keyData.expiresAt && keyData.expiresAt < new Date()) {
      apiKeyStore.delete(apiKey)
      return NextResponse.json(
        { success: false, message: 'API key expired' },
        { status: 401 }
      )
    }

    // Update last used time
    keyData.lastUsedAt = new Date()
    apiKeyStore.set(apiKey, keyData)

    // Get user data
    const user = users[keyData.userId as keyof typeof users]
    
    console.log(`API key validation successful for user: ${keyData.userId}`)

    return NextResponse.json({
      success: true,
      message: 'API key is valid',
      data: {
        keyId: keyData.id,
        name: keyData.name,
        permissions: keyData.permissions,
        userId: keyData.userId,
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email
        } : null,
        keyInfo: {
          createdAt: keyData.createdAt,
          expiresAt: keyData.expiresAt,
          lastUsedAt: keyData.lastUsedAt
        }
      }
    })

  } catch (error) {
    console.error('API key validate error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}