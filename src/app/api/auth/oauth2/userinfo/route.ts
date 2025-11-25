import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing authorization header' },
        { status: 401 }
      )
    }

    const token = authorization.substring(7)

    // Simulate user info extraction from token
    const userInfo = {
      id: `user_${Math.random().toString(36).substring(2, 15)}`,
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      provider: 'google',
      verified: true,
      scope: 'profile email',
      locale: 'en-US',
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      userInfo: userInfo,
      message: 'User info retrieved successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve user info' },
      { status: 500 }
    )
  }
}