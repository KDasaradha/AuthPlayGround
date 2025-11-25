import { NextRequest, NextResponse } from 'next/server'

// Mock role database
let roles: any[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full system access",
    level: 0,
    permissions: ["*"],
    parent: null
  },
  {
    id: "admin",
    name: "Admin",
    description: "Administrative access",
    level: 1,
    permissions: ["users.read", "users.write", "roles.read", "roles.write", "system.config"],
    parent: "super_admin"
  },
  {
    id: "manager",
    name: "Manager",
    description: "Team management access",
    level: 2,
    permissions: ["users.read", "team.read", "team.write", "reports.read"],
    parent: "admin"
  },
  {
    id: "supervisor",
    name: "Supervisor",
    description: "Supervisory access",
    level: 3,
    permissions: ["users.read", "team.read", "reports.read"],
    parent: "manager"
  },
  {
    id: "employee",
    name: "Employee",
    description: "Basic employee access",
    level: 4,
    permissions: ["profile.read", "profile.write"],
    parent: "supervisor"
  },
  {
    id: "guest",
    name: "Guest",
    description: "Limited guest access",
    level: 5,
    permissions: ["profile.read"],
    parent: "employee"
  }
]

export async function POST(request: NextRequest) {
  try {
    const { name, description, parent, permissions } = await request.json()

    // Validate parent role exists
    if (parent && !roles.find(r => r.id === parent)) {
      return NextResponse.json(
        { success: false, error: 'Parent role not found' },
        { status: 400 }
      )
    }

    // Calculate role level
    let level = 0
    if (parent) {
      const parentRole = roles.find(r => r.id === parent)
      level = parentRole ? parentRole.level + 1 : 0
    }

    // Create new role
    const newRole = {
      id: `role_${Math.random().toString(36).substring(2, 15)}`,
      name,
      description,
      level,
      parent,
      permissions,
      createdAt: new Date().toISOString()
    }

    roles.push(newRole)

    return NextResponse.json({
      success: true,
      role: newRole,
      message: 'Role created successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Role creation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      roles: roles,
      message: 'Roles retrieved successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve roles' },
      { status: 500 }
    )
  }
}