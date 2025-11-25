import { NextRequest, NextResponse } from 'next/server'

// Simulate user database
const users = [
  { id: 1, username: 'user1', password: 'password123', has2FA: false },
  { id: 2, username: 'user2', password: 'password456', has2FA: true },
]

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Find user
    const user = users.find(u => u.username === username && u.password === password)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user has 2FA enabled
    if (user.has2FA) {
      return NextResponse.json({
        success: true,
        requires2FA: true,
        userId: user.id,
        message: 'Please complete 2FA verification'
      })
    }

    return NextResponse.json({
      success: true,
      requires2FA: false,
      has2FA: user.has2FA,
      userId: user.id,
      message: 'Login successful'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}