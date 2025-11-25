import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Global magic link store (shared across routes)
declare global {
  var __magicLinkStore: Map<string, any> | undefined
}

if (!global.__magicLinkStore) {
  global.__magicLinkStore = new Map()
}

const magicLinkStore = global.__magicLinkStore

// Mock user database (same as send)
const users = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com'
  }
}

function cleanupExpiredLinks() {
  const now = new Date()
  for (const [token, linkData] of magicLinkStore.entries()) {
    if (linkData.expiresAt && linkData.expiresAt < now) {
      magicLinkStore.delete(token)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Cleanup expired links
    cleanupExpiredLinks()
    
    const token = request.nextUrl.searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      )
    }

    // Find valid magic link
    const magicLinkData = magicLinkStore.get(token)
    
    if (!magicLinkData) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired magic link' },
        { status: 401 }
      )
    }

    // Check if magic link is expired
    if (magicLinkData.expiresAt && magicLinkData.expiresAt < new Date()) {
      magicLinkStore.delete(token)
      return NextResponse.json(
        { success: false, message: 'Magic link has expired' },
        { status: 401 }
      )
    }

    // Check if magic link is already used
    if (magicLinkData.used) {
      return NextResponse.json(
        { success: false, message: 'Magic link has already been used' },
        { status: 401 }
      )
    }

    // Get user
    const user = users[magicLinkData.email as keyof typeof users]
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Mark magic link as used
    magicLinkData.used = true
    magicLinkStore.set(token, magicLinkData)

    // Generate session token
    const sessionToken = randomBytes(32).toString('hex')

    console.log(`Magic link verification successful for user: ${user.username}`)

    // In production, you would redirect to dashboard with session cookie
    // For this demo, we'll return a success message
    return NextResponse.json({
      success: true,
      message: 'Magic link verified successfully! You can now sign in.',
      token: sessionToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Magic link verify error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}