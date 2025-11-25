import { NextRequest, NextResponse } from 'next/server'

// Simulate backup codes generation
export async function POST(request: NextRequest) {
  try {
    // Generate 10 backup codes
    const codes = Array.from({ length: 10 }, (_, i) => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )

    return NextResponse.json({
      success: true,
      message: 'Backup codes generated successfully',
      codes: codes
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate backup codes' },
      { status: 500 }
    )
  }
}