import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    // Generate mock OAuth2 credentials
    const clientId = `${provider}_client_${Math.random().toString(36).substring(2, 15)}`
    const clientSecret = Math.random().toString(36).substring(2, 32)
    const redirectUri = `https://localhost:3000/auth/oauth2/${provider}/callback`

    return NextResponse.json({
      success: true,
      clientId: clientId,
      clientSecret: clientSecret,
      redirectUri: redirectUri,
      authUrl: `https://accounts.${provider}.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile email`,
      message: 'OAuth2 credentials generated successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate credentials' },
      { status: 500 }
    )
  }
}