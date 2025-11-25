import { NextRequest, NextResponse } from 'next/server'

// Global token store (shared across routes)
declare global {
  var __tokenStore: Map<string, any> | undefined
}

if (!global.__tokenStore) {
  global.__tokenStore = new Map()
}

const tokenStore = global.__tokenStore

// Mock user database (same as generate)
const users = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com'
  }
}

function cleanupExpiredTokens() {
  const now = new Date()
  for (const [token, tokenData] of tokenStore.entries()) {
    if (tokenData.expiresAt < now) {
      tokenStore.delete(token)
    }
  }
}

function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return null
  }

  // Extract token from "Bearer <token>" format
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}

export async function POST(request: NextRequest) {
  try {
    // Cleanup expired tokens
    cleanupExpiredTokens()
    
    // Extract token from Authorization header
    const token = extractTokenFromHeader(request)

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    // Get token from storage
    const tokenData = tokenStore.get(token)
    
    if (!tokenData) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if token expired
    if (tokenData.expiresAt < new Date()) {
      tokenStore.delete(token)
      return NextResponse.json(
        { success: false, message: 'Token expired' },
        { status: 401 }
      )
    }

    // Update last accessed time
    tokenData.lastAccessed = new Date()
    tokenStore.set(token, tokenData)

    // Get user data
    const user = users[tokenData.username as keyof typeof users]
    
    console.log(`Token validation successful for user: ${tokenData.username}`)

    return NextResponse.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email
        } : null,
        tokenInfo: {
          createdAt: tokenData.createdAt,
          expiresAt: tokenData.expiresAt,
          lastAccessed: tokenData.lastAccessed
        }
      }
    })

  } catch (error) {
    console.error('Token auth validate error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}