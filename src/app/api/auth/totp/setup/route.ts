import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode'

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
  lastUsedAt?: Date
}>()

// TOTP time step (30 seconds)
const TOTP_TIME_STEP = 30

function generateTOTPSecret(): string {
  return speakeasy.generateSecret({ length: 20 }).base32
}

function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    codes.push(randomBytes(8).toString('hex'))
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

export async function POST(request: NextRequest) {
  try {
    // Cleanup expired secrets
    cleanupExpiredSecrets()
    
    const { userId, username } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Generate TOTP secret
    const secret = generateTOTPSecret()
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // Store TOTP secret
    totpSecrets.set(token, {
      userId,
      secret,
      expiresAt,
      createdAt: new Date()
    })

    // Generate QR code for authenticator apps
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: username || userId,
      issuer: 'AuthPlayGround'
    })

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)

    // Generate backup codes
    const backupCodes = generateBackupCodes(10)

    console.log(`TOTP setup initiated for user: ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'TOTP setup initiated successfully',
      data: {
        token,
        secret,
        qrCode: qrCodeDataUrl,
        backupCodes,
        expiresAt
      }
    })
  } catch (error) {
    console.error('TOTP setup error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Cleanup expired secrets
    cleanupExpiredSecrets()
    
    const token = request.nextUrl.searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      )
    }

    const totpData = totpSecrets.get(token)
    
    if (!totpData) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 404 }
      )
    }

    // Check if expired
    if (totpData.expiresAt < new Date()) {
      totpSecrets.delete(token)
      return NextResponse.json(
        { success: false, message: 'Token has expired' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: totpData.userId,
        secret: totpData.secret,
        expiresAt: totpData.expiresAt
      }
    })
  } catch (error) {
    console.error('TOTP get error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}