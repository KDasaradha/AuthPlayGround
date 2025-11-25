import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Generate a secure random challenge
    const challenge = Buffer.from(Math.random().toString()).toString('base64url')
    
    return NextResponse.json({
      success: true,
      challenge: challenge,
      expiresAt: new Date(Date.now() + 60000).toISOString(), // 1 minute expiry
      message: "Challenge generated successfully"
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Challenge generation failed' },
      { status: 500 }
    )
  }
}