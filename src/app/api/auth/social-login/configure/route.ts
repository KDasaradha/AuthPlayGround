import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { provider, redirectUri } = await request.json()

    // Generate mock API credentials for social provider
    const apiKey = `${provider}_${Math.random().toString(36).substring(2, 32)}`
    const apiSecret = Math.random().toString(36).substring(2, 32)
    
    // Provider-specific configuration
    const configs = {
      google: {
        authUrl: 'https://accounts.google.com/oauth/authorize',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scopes: ['profile', 'email', 'openid']
      },
      github: {
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user',
        scopes: ['user', 'user:email']
      },
      facebook: {
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        userInfoUrl: 'https://graph.facebook.com/me',
        scopes: ['email', 'public_profile']
      },
      twitter: {
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        userInfoUrl: 'https://api.twitter.com/2/users/me',
        scopes: ['users.read', 'tweet.read']
      },
      microsoft: {
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
        scopes: ['profile', 'email', 'openid']
      },
      linkedin: {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        userInfoUrl: 'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,emailAddress)',
        scopes: ['profile', 'email']
      }
    }

    const config = configs[provider]
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Unsupported provider' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      apiKey: apiKey,
      apiSecret: apiSecret,
      redirectUri: redirectUri || `https://localhost:3000/auth/social-login/${provider}/callback`,
      config: config,
      message: `${provider} configured successfully`
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to configure provider' },
      { status: 500 }
    )
  }
}