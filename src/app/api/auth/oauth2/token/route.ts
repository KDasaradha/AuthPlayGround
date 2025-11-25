import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { clientId, clientSecret, authCode, redirectUri, grantType } = await request.json()

    // Simulate token exchange
    const accessToken = `at_${Math.random().toString(36).substring(2, 32)}`
    const refreshToken = `rt_${Math.random().toString(36).substring(2, 32)}`
    
    const tokenInfo = {
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'profile email',
      issued_at: Date.now(),
      client_id: clientId,
      grant_type: grantType
    }

    return NextResponse.json({
      success: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      tokenInfo: tokenInfo,
      message: 'Token exchange successful'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Token exchange failed' },
      { status: 500 }
    )
  }
}