import { NextRequest, NextResponse } from 'next/server'

interface Scope {
  id: string
  name: string
  description: string
  category: "identity" | "profile" | "contact" | "location" | "device" | "payment" | "content" | "admin" | "custom"
  permissions: string[]
  required: boolean
  sensitive: boolean
  expires_in?: number
  created_at: string
  updated_at: string
}

// In-memory storage for scopes (in production, use a database)
const scopes = new Map<string, Scope>()

// Initialize with sample data
function initializeSampleScopes() {
  if (scopes.size === 0) {
    const sampleScopes: Scope[] = [
      {
        id: "scope_identity_basic",
        name: "read:basic",
        description: "Read basic user identity information",
        category: "identity",
        permissions: ["read:user_id", "read:username", "read:created_at"],
        required: true,
        sensitive: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "scope_identity_email",
        name: "read:email",
        description: "Read user email address",
        category: "identity",
        permissions: ["read:email", "read:email_verified"],
        required: false,
        sensitive: true,
        expires_in: 3600,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "scope_profile_full",
        name: "read:profile",
        description: "Read complete user profile",
        category: "profile",
        permissions: ["read:profile", "read:avatar", "read:bio", "read:preferences"],
        required: false,
        sensitive: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "scope_profile_write",
        name: "write:profile",
        description: "Update user profile information",
        category: "profile",
        permissions: ["write:profile", "write:avatar", "write:bio", "write:preferences"],
        required: false,
        sensitive: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "scope_contact_read",
        name: "read:contacts",
        description: "Read user contacts and address book",
        category: "contact",
        permissions: ["read:contacts", "read:address_book", "read:phone_numbers"],
        required: false,
        sensitive: true,
        expires_in: 7200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "scope_location_current",
        name: "read:location",
        description: "Read user's current location",
        category: "location",
        permissions: ["read:location", "read:coordinates"],
        required: false,
        sensitive: true,
        expires_in: 1800,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "scope_device_camera",
        name: "access:camera",
        description: "Access device camera for photos and video",
        category: "device",
        permissions: ["access:camera", "access:photo_library"],
        required: false,
        sensitive: true,
        expires_in: 900,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "scope_payment_read",
        name: "read:payment",
        description: "Read payment methods and transaction history",
        category: "payment",
        permissions: ["read:payment_methods", "read:transactions", "read:billing_history"],
        required: false,
        sensitive: true,
        expires_in: 3600,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "scope_content_create",
        name: "write:content",
        description: "Create and modify user content",
        category: "content",
        permissions: ["create:content", "update:content", "delete:content"],
        required: false,
        sensitive: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "scope_admin_users",
        name: "admin:users",
        description: "Administrative access to user management",
        category: "admin",
        permissions: ["read:all_users", "write:all_users", "delete:users", "manage:roles"],
        required: false,
        sensitive: true,
        expires_in: 1800,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    sampleScopes.forEach(scope => {
      scopes.set(scope.id, scope)
    })
  }
}

export async function GET() {
  try {
    initializeSampleScopes()
    const scopeList = Array.from(scopes.values())
    
    return NextResponse.json({
      success: true,
      scopes: scopeList.sort((a, b) => a.name.localeCompare(b.name))
    })
  } catch (error) {
    console.error('Failed to fetch scopes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scopes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSampleScopes()
    
    const body = await request.json()
    const { name, description, category, permissions, required, sensitive, expires_in } = body

    if (!name || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, category' },
        { status: 400 }
      )
    }

    const scope: Scope = {
      id: `scope_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      permissions: permissions || [],
      required: required || false,
      sensitive: sensitive || false,
      expires_in,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    scopes.set(scope.id, scope)

    return NextResponse.json({
      success: true,
      scope,
      message: 'Scope created successfully'
    })
  } catch (error) {
    console.error('Failed to create scope:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create scope' },
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
        { success: false, error: 'Scope ID is required' },
        { status: 400 }
      )
    }

    const existingScope = scopes.get(id)
    if (!existingScope) {
      return NextResponse.json(
        { success: false, error: 'Scope not found' },
        { status: 404 }
      )
    }

    const updatedScope: Scope = {
      ...existingScope,
      ...updates,
      updated_at: new Date().toISOString()
    }

    scopes.set(id, updatedScope)

    return NextResponse.json({
      success: true,
      scope: updatedScope,
      message: 'Scope updated successfully'
    })
  } catch (error) {
    console.error('Failed to update scope:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update scope' },
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
        { success: false, error: 'Scope ID is required' },
        { status: 400 }
      )
    }

    const existingScope = scopes.get(id)
    if (!existingScope) {
      return NextResponse.json(
        { success: false, error: 'Scope not found' },
        { status: 404 }
      )
    }

    scopes.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Scope deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete scope:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete scope' },
      { status: 500 }
    )
  }
}