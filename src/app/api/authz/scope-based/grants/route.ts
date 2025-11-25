import { NextRequest, NextResponse } from 'next/server'

interface ScopeGrant {
  id: string
  user_id: string
  client_id: string
  scope: string
  granted_at: string
  expires_at?: string
  active: boolean
  permissions: string[]
}

// In-memory storage for grants (in production, use a database)
const grants = new Map<string, ScopeGrant>()

// Initialize with sample data
function initializeSampleGrants() {
  if (grants.size === 0) {
    const sampleGrants: ScopeGrant[] = [
      {
        id: "grant_user1_web_basic",
        user_id: "user_001",
        client_id: "web_app_123456",
        scope: "read:basic",
        granted_at: new Date().toISOString(),
        active: true,
        permissions: ["read:user_id", "read:username", "read:created_at"]
      },
      {
        id: "grant_user1_web_email",
        user_id: "user_001",
        client_id: "web_app_123456",
        scope: "read:email",
        granted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        active: true,
        permissions: ["read:email", "read:email_verified"]
      },
      {
        id: "grant_user1_web_profile",
        user_id: "user_001",
        client_id: "web_app_123456",
        scope: "read:profile",
        granted_at: new Date().toISOString(),
        active: true,
        permissions: ["read:profile", "read:avatar", "read:bio", "read:preferences"]
      },
      {
        id: "grant_user2_mobile_basic",
        user_id: "user_002",
        client_id: "mobile_app_234567",
        scope: "read:basic",
        granted_at: new Date().toISOString(),
        active: true,
        permissions: ["read:user_id", "read:username", "read:created_at"]
      },
      {
        id: "grant_user2_mobile_profile",
        user_id: "user_002",
        client_id: "mobile_app_234567",
        scope: "write:profile",
        granted_at: new Date().toISOString(),
        active: true,
        permissions: ["write:profile", "write:avatar", "write:bio", "write:preferences"]
      },
      {
        id: "grant_user3_api_admin",
        user_id: "user_003",
        client_id: "api_service_345678",
        scope: "admin:users",
        granted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 1800000).toISOString(), // 30 minutes from now
        active: true,
        permissions: ["read:all_users", "write:all_users", "delete:users", "manage:roles"]
      },
      {
        id: "grant_user1_expired",
        user_id: "user_001",
        client_id: "third_party_456789",
        scope: "read:contacts",
        granted_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago (expired)
        active: false,
        permissions: ["read:contacts", "read:address_book", "read:phone_numbers"]
      }
    ]

    sampleGrants.forEach(grant => {
      grants.set(grant.id, grant)
    })
  }
}

export async function GET() {
  try {
    initializeSampleGrants()
    const grantList = Array.from(grants.values())
    
    return NextResponse.json({
      success: true,
      grants: grantList.sort((a, b) => new Date(b.granted_at).getTime() - new Date(a.granted_at).getTime())
    })
  } catch (error) {
    console.error('Failed to fetch grants:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSampleGrants()
    
    const body = await request.json()
    const { user_id, client_id, scope, expires_at, permissions } = body

    if (!user_id || !client_id || !scope) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_id, client_id, scope' },
        { status: 400 }
      )
    }

    const grant: ScopeGrant = {
      id: `grant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id,
      client_id,
      scope,
      granted_at: new Date().toISOString(),
      expires_at,
      active: true,
      permissions: permissions || []
    }

    grants.set(grant.id, grant)

    return NextResponse.json({
      success: true,
      grant,
      message: 'Scope grant created successfully'
    })
  } catch (error) {
    console.error('Failed to create grant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create grant' },
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
        { success: false, error: 'Grant ID is required' },
        { status: 400 }
      )
    }

    const existingGrant = grants.get(id)
    if (!existingGrant) {
      return NextResponse.json(
        { success: false, error: 'Grant not found' },
        { status: 404 }
      )
    }

    const updatedGrant: ScopeGrant = {
      ...existingGrant,
      ...updates
    }

    grants.set(id, updatedGrant)

    return NextResponse.json({
      success: true,
      grant: updatedGrant,
      message: 'Grant updated successfully'
    })
  } catch (error) {
    console.error('Failed to update grant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update grant' },
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
        { success: false, error: 'Grant ID is required' },
        { status: 400 }
      )
    }

    const existingGrant = grants.get(id)
    if (!existingGrant) {
      return NextResponse.json(
        { success: false, error: 'Grant not found' },
        { status: 404 }
      )
    }

    grants.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Grant deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete grant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete grant' },
      { status: 500 }
    )
  }
}