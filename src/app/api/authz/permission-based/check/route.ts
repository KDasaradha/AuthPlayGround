import { NextRequest, NextResponse } from 'next/server'

// Mock user permissions database
const userPermissions = [
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

// Mock user database
const users = [
  { id: "1", name: "John Smith", email: "john@company.com", isActive: true },
  { id: "2", name: "Sarah Johnson", email: "sarah@company.com", isActive: true },
  { id: "3", name: "Mike Wilson", email: "mike@company.com", isActive: true },
  { id: "4", name: "Emily Davis", email: "emily@company.com", isActive: true },
  { id: "5", name: "Tom Brown", email: "tom@company.com", isActive: true },
  { id: "6", name: "Lisa Anderson", email: "lisa@company.com", isActive: false }
]

function hasPermission(userId: string, permissionId: string): boolean {
  // Find user
  const user = users.find(u => u.id === userId)
  if (!user || !user.isActive) {
    return false
  }

  // Check if user has the permission
  const userPermission = userPermissions.find(
    up => up.userId === userId && up.permissionId === permissionId
  )

  if (!userPermission) {
    return false
  }

  // Check if permission has expired
  if (userPermission.expiresAt) {
    const expiryTime = new Date(userPermission.expiresAt).getTime()
    const currentTime = new Date().getTime()
    if (currentTime > expiryTime) {
      return false
    }
  }

  return true
}

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

    // Check permission
    const hasPerm = hasPermission(userId, permissionId)

    return NextResponse.json({
      success: true,
      hasPermission: hasPerm,
      userId: userId,
      permissionId: permissionId,
      checkedAt: new Date().toISOString(),
      message: hasPerm ? 'Permission granted' : 'Permission denied'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Permission check failed' },
      { status: 500 }
    )
  }
}