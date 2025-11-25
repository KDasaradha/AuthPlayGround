import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { refreshTokens, JWT_SECRET } from '../login/route'

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

function verifyToken(token: string): any {
  try {
    const [header, payload, signature] = token.split('.')
    
    // Verify signature
    const expectedSignature = Buffer.from(
      createHash('sha256')
        .update(`${header}.${payload}.${JWT_SECRET}`)
        .digest('hex')
    ).toString('base64url')

    if (signature !== expectedSignature) {
      return null
    }

    // Decode payload
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString())
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (decodedPayload.exp < now) {
      return null
    }

    return decodedPayload
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken)
    if (!payload || payload.type !== 'refresh') {
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      )
    }

    // Check if refresh token exists in storage
    const tokenData = refreshTokens.get(refreshToken)
    if (!tokenData || tokenData.expiresAt < new Date()) {
      refreshTokens.delete(refreshToken)
      return NextResponse.json(
        { success: false, message: 'Refresh token expired' },
        { status: 401 }
      )
    }

    // Generate new access token
    const accessToken = createToken(
      { 
        sub: payload.sub,
        type: 'access'
      },
      '15m'
    )

    console.log(`Access token refreshed for user ID: ${payload.sub}`)

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: 15 * 60 // 15 minutes in seconds
      }
    })

  } catch (error) {
    console.error('JWT refresh error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}