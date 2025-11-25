import { NextRequest, NextResponse } from 'next/server'

// Simulate 2FA verification
export async function POST(request: NextRequest) {
  try {
    const { code, method } = await request.json()

    // Simulate verification logic
    let isValid = false
    
    if (method === 'totp') {
      // Simulate TOTP verification (accept any 6-digit code for demo)
      isValid = /^\d{6}$/.test(code)
    } else if (method === 'sms') {
      // Simulate SMS verification (accept any 6-digit code for demo)
      isValid = /^\d{6}$/.test(code)
    } else if (method === 'email') {
      // Simulate email verification (accept any 6-digit code for demo)
      isValid = /^\d{6}$/.test(code)
    } else if (method === 'backup') {
      // Simulate backup code verification (accept any 8-digit code for demo)
      isValid = /^\d{8}$/.test(code)
    }

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: '2FA verification successful',
        method: method
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}