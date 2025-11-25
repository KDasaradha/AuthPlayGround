import { NextRequest, NextResponse } from 'next/server'

// Mock user permissions database
let userPermissions: any[] = [
  { userId: "1", permissionId: "user.create", grantedBy: "admin", grantedAt: "2024-01-15T10:00:00Z" },
  { userId: "1", permissionId: "user.read", grantedBy: "admin", grantedAt: "2024-01-15T10:00:00Z" },
  { userId: "1", permissionId: "user.update", grantedBy: "admin", grantedAt: "2024-01-15T10:00:00Z" },
  { userId: "1", permissionId: "user.delete", grantedBy: "admin", grantedAt: "2024-01-15T10:00:00Z" },
  { userId: "2", permissionId: "user.read", grantedBy: "admin", grantedAt: "2024-01-16T10:00:00Z" },
  { userId: "2", permissionId: "user.update", grantedBy: "admin", grantedAt: "2024-01-16T10:00:00Z" },
  { userId: "3", permissionId: "document.create", grantedBy: "manager", grantedAt: "2024-01-17T10:00:00Z" },
  { userId: "3", permissionId: "document.read", grantedBy: "manager", grantedAt: "2024-01-17T10:00:00Z" },
  { userId: "4", permissionId: "document.read", grantedBy: "manager", grantedAt: "2024-01-18T10:00:00Z" },
  { userId: "5", permissionId: "report.read", grantedBy: "supervisor", grantedAt: "2024-01-19T10:00:00Z", expiresAt: "2024-12-31T23:59:59Z" }
]

export async function POST(request: NextRequest) {
  try {
    const { userId, permissionId, expiresAt } = await request.json()

    // Validate required fields
    if (!userId || !permissionId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Permission ID are required' },
        { status: 400 }
      )
    }

    // Check if permission already granted
    const existingPermission = userPermissions.find(
      up => up.userId === userId && up.permissionId === permissionId
    )

    if (existingPermission) {
      return NextResponse.json(
        { success: false, error: 'Permission already granted to user' },
        { status: 400 }
      )
    }

    // Grant permission
    const newUserPermission = {
      userId,
      permissionId,
      grantedBy: "current_user",
      grantedAt: new Date().toISOString(),
      expiresAt: expiresAt || null
    }

    userPermissions.push(newUserPermission)

    return NextResponse.json({
      success: true,
      userPermission: newUserPermission,
      message: 'Permission granted successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Permission grant failed' },
      { status: 500 }
    )
  }
}