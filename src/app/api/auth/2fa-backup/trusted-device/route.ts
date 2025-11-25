import { NextRequest, NextResponse } from 'next/server'

// Simulate trusted device management
export async function POST(request: NextRequest) {
  try {
    const { deviceName } = await request.json()

    // Simulate adding trusted device
    const device = {
      id: Math.random().toString(36).substring(2, 9),
      name: deviceName,
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ipAddress: request.ip || '127.0.0.1',
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Trusted device added successfully',
      device: device
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add trusted device' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { deviceId } = await request.json()

    // Simulate removing trusted device
    return NextResponse.json({
      success: true,
      message: 'Trusted device removed successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to remove trusted device' },
      { status: 500 }
    )
  }
}