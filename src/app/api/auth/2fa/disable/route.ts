import { NextRequest, NextResponse } from 'next/server'

// Simulate 2FA disable
export async function POST(request: NextRequest) {
  try {
    // Simulate disabling 2FA
    return NextResponse.json({
      success: true,
      message: '2FA has been disabled successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to disable 2FA' },
      { status: 500 }
    )
  }
}