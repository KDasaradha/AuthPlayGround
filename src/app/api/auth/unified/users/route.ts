import { NextRequest, NextResponse } from 'next/server'

interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone?: string
  avatar?: string
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
  last_login?: string
  auth_methods: string[]
  roles: string[]
  permissions: string[]
  metadata: Record<string, any>
}

// In-memory storage for users (in production, use a database)
const users = new Map<string, User>()

// Initialize with sample data
function initializeSampleUsers() {
  if (users.size === 0) {
    const sampleUsers: User[] = [
      {
        id: "user_001",
        email: "john.doe@example.com",
        username: "johndoe",
        first_name: "John",
        last_name: "Doe",
        phone: "+1 (555) 123-4567",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        auth_methods: ["jwt", "session", "webauthn"],
        roles: ["user", "admin"],
        permissions: ["read:profile", "write:profile", "admin:users"],
        metadata: {
          department: "Engineering",
          location: "San Francisco",
          employee_id: "EMP001"
        }
      },
      {
        id: "user_002",
        email: "jane.smith@example.com",
        username: "janesmith",
        first_name: "Jane",
        last_name: "Smith",
        phone: "+1 (555) 987-6543",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        auth_methods: ["jwt", "oauth2", "totp"],
        roles: ["user"],
        permissions: ["read:profile", "write:profile"],
        metadata: {
          department: "Marketing",
          location: "New York",
          employee_id: "EMP002"
        }
      },
      {
        id: "user_003",
        email: "bob.wilson@example.com",
        username: "bobwilson",
        first_name: "Bob",
        last_name: "Wilson",
        phone: "+1 (555) 456-7890",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        auth_methods: ["session", "passwordless"],
        roles: ["user", "moderator"],
        permissions: ["read:profile", "write:profile", "moderate:content"],
        metadata: {
          department: "Support",
          location: "Chicago",
          employee_id: "EMP003"
        }
      },
      {
        id: "user_004",
        email: "alice.johnson@example.com",
        username: "alicejohnson",
        first_name: "Alice",
        last_name: "Johnson",
        phone: "+1 (555) 321-9876",
        status: "inactive",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        auth_methods: ["jwt"],
        roles: ["user"],
        permissions: ["read:profile"],
        metadata: {
          department: "Sales",
          location: "Los Angeles",
          employee_id: "EMP004"
        }
      },
      {
        id: "user_005",
        email: "charlie.brown@example.com",
        username: "charliebrown",
        first_name: "Charlie",
        last_name: "Brown",
        phone: "+1 (555) 654-3210",
        status: "suspended",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
        auth_methods: ["jwt", "session"],
        roles: ["user"],
        permissions: ["read:profile"],
        metadata: {
          department: "Finance",
          location: "Boston",
          employee_id: "EMP005"
        }
      }
    ]

    sampleUsers.forEach(user => {
      users.set(user.id, user)
    })
  }
}

export async function GET() {
  try {
    initializeSampleUsers()
    const userList = Array.from(users.values())
    
    return NextResponse.json({
      success: true,
      users: userList.sort((a, b) => a.first_name.localeCompare(b.first_name))
    })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSampleUsers()
    
    const body = await request.json()
    const { email, username, first_name, last_name, phone, auth_methods, roles, permissions } = body

    if (!email || !username || !first_name || !last_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, username, first_name, last_name' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => 
      u.email === email || u.username === username
    )

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email or username already exists' },
        { status: 409 }
      )
    }

    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      username,
      first_name,
      last_name,
      phone,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      auth_methods: auth_methods || [],
      roles: roles || ["user"],
      permissions: permissions || ["read:profile"],
      metadata: {}
    }

    users.set(user.id, user)

    return NextResponse.json({
      success: true,
      user,
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const existingUser = users.get(id)
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      updated_at: new Date().toISOString()
    }

    users.set(id, updatedUser)

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const existingUser = users.get(id)
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    users.delete(id)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}