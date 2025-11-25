import { NextRequest, NextResponse } from 'next/server'

// Mock role database
const roles = [
  {
    id: "super_admin",
    name: "Super Admin",
    level: 0,
    permissions: ["*"],
    parent: null
  },
  {
    id: "admin",
    name: "Admin",
    level: 1,
    permissions: ["users.read", "users.write", "roles.read", "roles.write", "system.config"],
    parent: "super_admin"
  },
  {
    id: "manager",
    name: "Manager",
    level: 2,
    permissions: ["users.read", "team.read", "team.write", "reports.read"],
    parent: "admin"
  },
  {
    id: "supervisor",
    name: "Supervisor",
    level: 3,
    permissions: ["users.read", "team.read", "reports.read"],
    parent: "manager"
  },
  {
    id: "employee",
    name: "Employee",
    level: 4,
    permissions: ["profile.read", "profile.write"],
    parent: "supervisor"
  },
  {
    id: "guest",
    name: "Guest",
    level: 5,
    permissions: ["profile.read"],
    parent: "employee"
  }
]

// Mock user database
const users = [
  { id: "1", name: "John Smith", email: "john@company.com", role: "super_admin", isActive: true },
  { id: "2", name: "Sarah Johnson", email: "sarah@company.com", role: "admin", isActive: true },
  { id: "3", name: "Mike Wilson", email: "mike@company.com", role: "manager", isActive: true },
  { id: "4", name: "Emily Davis", email: "emily@company.com", role: "supervisor", isActive: true },
  { id: "5", name: "Tom Brown", email: "tom@company.com", role: "employee", isActive: true },
  { id: "6", name: "Lisa Anderson", email: "lisa@company.com", role: "guest", isActive: true }
]

function getEffectivePermissions(roleId: string): string[] {
  const role = roles.find(r => r.id === roleId)
  if (!role) return []
  
  let permissions = [...role.permissions]
  let currentRole = role
  
  // Inherit permissions from parent roles
  while (currentRole.parent) {
    const parentRole = roles.find(r => r.id === currentRole.parent)
    if (parentRole) {
      permissions = [...permissions, ...parentRole.permissions]
      currentRole = parentRole
    } else {
      break
    }
  }
  
  return [...new Set(permissions)]
}

export async function POST(request: NextRequest) {
  try {
    const { userId, permission } = await request.json()

    // Find user
    const user = users.find(u => u.id === userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({
        success: true,
        hasPermission: false,
        reason: 'User is inactive',
        message: 'Permission denied'
      })
    }

    // Get effective permissions for user's role
    const effectivePermissions = getEffectivePermissions(user.role)
    
    // Check permission
    const hasPermission = effectivePermissions.includes('*') || effectivePermissions.includes(permission)

    return NextResponse.json({
      success: true,
      hasPermission,
      userRole: user.role,
      effectivePermissions,
      checkedPermission: permission,
      message: hasPermission ? 'Permission granted' : 'Permission denied'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Permission check failed' },
      { status: 500 }
    )
  }
}