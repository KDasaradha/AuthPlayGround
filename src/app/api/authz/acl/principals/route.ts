import { NextRequest, NextResponse } from 'next/server'

interface Principal {
  id: string
  name: string
  type: "user" | "group" | "role"
  description?: string
  members?: string[] // For groups
  permissions?: string[] // For roles
}

// In-memory storage for principals (in production, use a database)
const principals = new Map<string, Principal>()

// Initialize with sample data
function initializeSamplePrincipals() {
  if (principals.size === 0) {
    const samplePrincipals: Principal[] = [
      {
        id: "user_001",
        name: "john_doe",
        type: "user",
        description: "Regular user with access to documents"
      },
      {
        id: "user_002",
        name: "jane_smith",
        type: "user",
        description: "Developer with API access"
      },
      {
        id: "user_003",
        name: "bob_wilson",
        type: "user",
        description: "Manager with elevated permissions"
      },
      {
        id: "group_admin",
        name: "Administrators",
        type: "group",
        description: "System administrators with full access",
        members: ["user_003", "user_004"]
      },
      {
        id: "group_dev",
        name: "Developers",
        type: "group",
        description: "Development team members",
        members: ["user_002", "user_005"]
      },
      {
        id: "group_users",
        name: "Regular Users",
        type: "group",
        description: "Standard user group",
        members: ["user_001", "user_006"]
      },
      {
        id: "role_admin",
        name: "Administrator",
        type: "role",
        description: "Full system administrator role",
        permissions: ["read", "write", "delete", "admin", "execute"]
      },
      {
        id: "role_editor",
        name: "Editor",
        type: "role",
        description: "Content editor role",
        permissions: ["read", "write", "update"]
      },
      {
        id: "role_viewer",
        name: "Viewer",
        type: "role",
        description: "Read-only access role",
        permissions: ["read"]
      },
      {
        id: "role_api_user",
        name: "API User",
        type: "role",
        description: "API access role",
        permissions: ["GET", "POST", "PUT", "DELETE"]
      }
    ]

    samplePrincipals.forEach(principal => {
      principals.set(principal.id, principal)
    })
  }
}

export async function GET() {
  try {
    initializeSamplePrincipals()
    const principalList = Array.from(principals.values())
    
    return NextResponse.json({
      success: true,
      principals: principalList.sort((a, b) => a.name.localeCompare(b.name))
    })
  } catch (error) {
    console.error('Failed to fetch principals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch principals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, description, members, permissions } = body

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, type' },
        { status: 400 }
      )
    }

    const principal: Principal = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      description: description || '',
      members: type === 'group' ? (members || []) : undefined,
      permissions: type === 'role' ? (permissions || []) : undefined
    }

    principals.set(principal.id, principal)

    return NextResponse.json({
      success: true,
      principal,
      message: 'Principal created successfully'
    })
  } catch (error) {
    console.error('Failed to create principal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create principal' },
      { status: 500 }
    )
  }
}