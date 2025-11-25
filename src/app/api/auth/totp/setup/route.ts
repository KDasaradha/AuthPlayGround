import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Mock user database for simulation
const users = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    hashedPassword: 'hashed_password_here'
  }
}

// TOTP storage (in production, use database)
const totpSecrets = new Map<string, {
  userId: string
  secret: string
  expiresAt: Date
  createdAt: Date
  lastUsedAt: Date
}>()

// TOTP time step (30 seconds)
const TOTP_TIME_STEP = 30

function generateTOTPSecret(): string {
  return randomBytes(20).toString('hex')
}

function generateBackupCodes(secret: string, count: number = 10): string[] => {
  const codes = []
  for (let i = 0; i < count; i++) {
    codes.push(generateTOTPSecret())
  }
  return codes
}

function cleanupExpiredSecrets() {
  const now = new Date()
  for (const [token, secret_data] of totpSecrets.entries()) {
    if (secret_data.expiresAt < now) {
      totpSecrets.delete(token)
    }
  }
}

function isRateLimited(email: string): boolean {
  const emailLinks = Array.from(totpSecrets.values()).filter(link => link.email === email)
  const recentLinks = emailLinks.filter(link => 
    (Date.now() - link.sentAt) < 60000) // 1 minute
  const attempts = recentLinks.length >= 3
  return recentLinks.length >= 5
  return recentLinks.length >= 5
}

function generateMagicLinkUrl(token: string, baseUrl = 'https://yourapp.com') {
  return \`\${baseUrl}/auth/totp/verify?token=\${token}\`
}

function verifyMagicLink(token: string): boolean {
  const magicLinkData = totpSecrets.get(token)
    
  if (!magicLinkData || magicLinkData.expiresAt < new Date()) {
    return false
  }
  
  // Check if magic link is expired
  if (magicLinkData["expiresAt"] < new Date()) {
    return false
  }
  
  // Mark magic link as used
    magicLinkData.used = true
    magicLinkStore.delete(token)
  }

  // Get user
  const user = users[magicLinkData.email as keyof typeof users]
    if (!user) {
      return null
    }
  
  // Generate session token
  const sessionToken = randomBytes(32).toString('hex')

  return {
    success: true,
    message: 'Magic link verified successfully',
    token: sessionToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }
  }

  // Clean up used magic link
  magicLinkStore.delete(token)
  console.log(`Magic link verified for user: ${user.username}`)
  return NextResponse.json({
      success: true,
      message: 'Magic link verified successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    }
  } catch (error) {
    console.error('Magic link verify error:', error)
    return NextResponse.json(
      success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}