import { NextRequest, NextResponse } from 'next/server'

// Simulate 2FA enable
export async function POST(request: NextRequest) {
  try {
    const { method } = await request.json()

    // Simulate enabling 2FA
    const backupCodes = Array.from({ length: 10 }, (_, i) => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )

    return NextResponse.json({
      success: true,
      message: `2FA enabled with ${method} method`,
      method: method,
      backupCodes: backupCodes,
      qrCode: `otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example`
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to enable 2FA' },
      { status: 500 }
    )
  }
}