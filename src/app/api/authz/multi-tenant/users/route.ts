import { NextRequest, NextResponse } from 'next/server'

interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  email: string
  role: "owner" | "admin" | "member" | "viewer"
  permissions: string[]
  status: "active" | "inactive" | "pending"
  created_at: string
  last_login: string
}

// In-memory storage for tenant users (in production, use a database)
const tenantUsers = new Map<string, TenantUser>()

// Initialize with sample data
function initializeSampleUsers() {
  if (tenantUsers.size === 0) {
    const sampleUsers: TenantUser[] = [
      {
        id: "user_acme_001",
        tenant_id: "tenant_acme_corp",
        user_id: "john_acme",
        email: "john@acme.com",
        role: "owner",
        permissions: ["read", "write", "delete", "admin", "manage_users", "manage_billing"],
        status: "active",
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      },
      {
        id: "user_acme_002",
        tenant_id: "tenant_acme_corp",
        user_id: "sarah_acme",
        email: "sarah@acme.com",
        role: "admin",
        permissions: ["read", "write", "delete", "manage_users"],
        status: "active",
        created_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        id: "user_tech_001",
        tenant_id: "tenant_tech_startup",
        user_id: "mike_tech",
        email: "mike@techstartup.io",
        role: "owner",
        permissions: ["read", "write", "delete", "admin", "manage_billing"],
        status: "active",
        created_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: "user_local_001",
        tenant_id: "tenant_local_business",
        user_id: "lisa_local",
        email: "lisa@localbiz.com",
        role: "owner",
        permissions: ["read", "write", "delete", "admin"],
        status: "active",
        created_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
      },
      {
        id: "user_freelancer_001",
        tenant_id: "tenant_freelancer",
        user_id: "alex_freelance",
        email: "alex@freelancer.net",
        role: "owner",
        permissions: ["read", "write"],
        status: "active",
        created_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
      }
    ]

    sampleUsers.forEach(user => {
      tenantUsers.set(user.id, user)
    })
  }
}

export async function GET() {
  try {
    initializeSampleUsers()
    const userList = Array.from(tenantUsers.values())
    
    return NextResponse.json({
      success: true,
      users: userList.sort((a, b) => a.email.localeCompare(b.email))
    })
  } catch (error) {
    console.error('Failed to fetch tenant users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tenant users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSampleUsers()
    
    const body = await request.json()
    const { tenant_id, user_id, email, role, permissions } = body

    if (!tenant_id || !user_id || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tenant_id, user_id, email, role' },
        { status: 400 }
      )
    }

    const user: TenantUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenant_id,
      user_id,
      email,
      role,
      permissions: permissions || getDefaultPermissions(role),
      status: "pending",
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    }

    tenantUsers.set(user.id, user)

    return NextResponse.json({
      success: true,
      user,
      message: 'Tenant user created successfully'
    })
  } catch (error) {
    console.error('Failed to create tenant user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create tenant user' },
      { status: 500 }
    )
  }
}

function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case "owner":
      return ["read", "write", "delete", "admin", "manage_users", "manage_billing"]
    case "admin":
      return ["read", "write", "delete", "manage_users"]
    case "member":
      return ["read", "write"]
    case "viewer":
      return ["read"]
    default:
      return ["read"]
  }
}