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
    const { userId, permissionId } = await request.json()

    // Validate required fields
    if (!userId || !permissionId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Permission ID are required' },
        { status: 400 }
      )
    }

    // Find and remove permission
    const permissionIndex = userPermissions.findIndex(
      up => up.userId === userId && up.permissionId === permissionId
    )

    if (permissionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Permission not found for user' },
        { status: 404 }
      )
    }

    // Remove permission
    const revokedPermission = userPermissions[permissionIndex]
    userPermissions.splice(permissionIndex, 1)

    return NextResponse.json({
      success: true,
      revokedPermission: revokedPermission,
      revokedAt: new Date().toISOString(),
      message: 'Permission revoked successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Permission revocation failed' },
      { status: 500 }
    )
  }
}