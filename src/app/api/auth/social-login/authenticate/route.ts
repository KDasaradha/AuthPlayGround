import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    // Simulate social authentication
    const users = {
      google: {
        id: 'google_123456789',
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        avatar: 'https://lh3.googleusercontent.com/a/default-user',
        verified: true,
        locale: 'en-US'
      },
      github: {
        id: 'github_987654321',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://avatars.githubusercontent.com/u/123456?v=4',
        verified: true,
        username: 'johndoe'
      },
      facebook: {
        id: 'facebook_456789123',
        name: 'John Doe',
        email: 'john.doe@facebook.com',
        avatar: 'https://graph.facebook.com/123456/picture',
        verified: true
      },
      twitter: {
        id: 'twitter_789123456',
        name: 'John Doe',
        email: 'john.doe@twitter.com',
        avatar: 'https://pbs.twimg.com/profile_images/123456/default.jpg',
        verified: true,
        username: '@johndoe'
      },
      microsoft: {
        id: 'microsoft_321654987',
        name: 'John Doe',
        email: 'john.doe@outlook.com',
        avatar: 'https://graph.microsoft.com/v1.0/me/photo/$value',
        verified: true
      },
      linkedin: {
        id: 'linkedin_654987321',
        name: 'John Doe',
        email: 'john.doe@linkedin.com',
        avatar: 'https://media.licdn.com/dms/image/default.jpg',
        verified: true
      }
    }

    const userInfo = users[provider]
    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: 'Unsupported provider' },
        { status: 400 }
      )
    }

    // Generate mock tokens
    const accessToken = `social_${provider}_${Math.random().toString(36).substring(2, 32)}`
    const refreshToken = `refresh_${provider}_${Math.random().toString(36).substring(2, 32)}`

    return NextResponse.json({
      success: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      userInfo: {
        ...userInfo,
        provider: provider,
        lastLogin: new Date().toISOString()
      },
      message: `Successfully authenticated with ${provider}`
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}