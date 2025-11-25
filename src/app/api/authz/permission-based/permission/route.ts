import { NextRequest, NextResponse } from 'next/server'

// Mock permission database
let permissions: any[] = [
  {
    id: "user.create",
    name: "Create User",
    description: "Create new user accounts",
    category: "User Management",
    resource: "user",
    action: "create"
  },
  {
    id: "user.read",
    name: "Read User",
    description: "View user information",
    category: "User Management",
    resource: "user",
    action: "read"
  },
  {
    id: "user.update",
    name: "Update User",
    description: "Update user information",
    category: "User Management",
    resource: "user",
    action: "update"
  },
  {
    id: "user.delete",
    name: "Delete User",
    description: "Delete user accounts",
    category: "User Management",
    resource: "user",
    action: "delete"
  },
  {
    id: "document.create",
    name: "Create Document",
    description: "Create new documents",
    category: "Document Management",
    resource: "document",
    action: "create"
  },
  {
    id: "document.read",
    name: "Read Document",
    description: "View documents",
    category: "Document Management",
    resource: "document",
    action: "read"
  },
  {
    id: "document.update",
    name: "Update Document",
    description: "Update documents",
    category: "Document Management",
    resource: "document",
    action: "update"
  },
  {
    id: "document.delete",
    name: "Delete Document",
    description: "Delete documents",
    category: "Document Management",
    resource: "document",
    action: "delete"
  },
  {
    id: "report.read",
    name: "Read Reports",
    description: "View reports",
    category: "Reporting",
    resource: "report",
    action: "read"
  },
  {
    id: "report.export",
    name: "Export Reports",
    description: "Export reports",
    category: "Reporting",
    resource: "report",
    action: "export"
  },
  {
    id: "system.config",
    name: "System Configuration",
    description: "Configure system settings",
    category: "System",
    resource: "system",
    action: "configure"
  },
  {
    id: "audit.read",
    name: "Read Audit Logs",
    description: "View audit logs",
    category: "Audit",
    resource: "audit",
    action: "read"
  }
]

export async function POST(request: NextRequest) {
  try {
    const { name, description, category, resource, action } = await request.json()

    // Validate required fields
    if (!name || !description || !category || !resource || !action) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create new permission
    const newPermission = {
      id: `perm_${Math.random().toString(36).substring(2, 15)}`,
      name,
      description,
      category,
      resource,
      action,
      createdAt: new Date().toISOString()
    }

    permissions.push(newPermission)

    return NextResponse.json({
      success: true,
      permission: newPermission,
      message: 'Permission created successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Permission creation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      permissions: permissions,
      message: 'Permissions retrieved successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve permissions' },
      { status: 500 }
    )
  }
}