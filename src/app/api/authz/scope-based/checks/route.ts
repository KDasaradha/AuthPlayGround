import { NextRequest, NextResponse } from 'next/server'

interface AccessCheck {
  id: string
  user_id: string
  client_id: string
  requested_scopes: string[]
  granted_scopes: string[]
  resource: string
  action: string
  result: "allow" | "deny"
  reason: string
  evaluation_time: number
  timestamp: string
}

// In-memory storage for access checks (in production, use a database)
const accessChecks = new Map<string, AccessCheck>()

// Initialize with sample data
function initializeSampleChecks() {
  if (accessChecks.size === 0) {
    const sampleChecks: AccessCheck[] = [
      {
        id: "check_001",
        user_id: "user_001",
        client_id: "web_app_123456",
        requested_scopes: ["read:basic", "read:email", "read:profile"],
        granted_scopes: ["read:basic", "read:email", "read:profile"],
        resource: "/api/user/profile",
        action: "read",
        result: "allow",
        reason: "Access granted",
        evaluation_time: 15,
        timestamp: new Date().toISOString()
      },
      {
        id: "check_002",
        user_id: "user_001",
        client_id: "web_app_123456",
        requested_scopes: ["read:basic", "write:profile"],
        granted_scopes: ["read:basic", "write:profile"],
        resource: "/api/user/profile",
        action: "write",
        result: "allow",
        reason: "Access granted",
        evaluation_time: 12,
        timestamp: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
      },
      {
        id: "check_003",
        user_id: "user_002",
        client_id: "mobile_app_234567",
        requested_scopes: ["read:basic", "read:email"],
        granted_scopes: ["read:basic", "read:email"],
        resource: "/api/user/email",
        action: "read",
        result: "allow",
        reason: "Access granted",
        evaluation_time: 18,
        timestamp: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
      },
      {
        id: "check_004",
        user_id: "user_002",
        client_id: "mobile_app_234567",
        requested_scopes: ["read:basic"],
        granted_scopes: ["read:basic"],
        resource: "/api/user/contacts",
        action: "read",
        result: "deny",
        reason: "Insufficient permissions for requested action",
        evaluation_time: 8,
        timestamp: new Date(Date.now() - 900000).toISOString() // 15 minutes ago
      },
      {
        id: "check_005",
        user_id: "user_003",
        client_id: "api_service_345678",
        requested_scopes: ["admin:users"],
        granted_scopes: ["admin:users"],
        resource: "/api/admin/users",
        action: "read",
        result: "allow",
        reason: "Access granted",
        evaluation_time: 22,
        timestamp: new Date(Date.now() - 1200000).toISOString() // 20 minutes ago
      },
      {
        id: "check_006",
        user_id: "user_001",
        client_id: "third_party_456789",
        requested_scopes: ["read:contacts"],
        granted_scopes: [],
        resource: "/api/user/contacts",
        action: "read",
        result: "deny",
        reason: "Scope grant has expired",
        evaluation_time: 5,
        timestamp: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
      }
    ]

    sampleChecks.forEach(check => {
      accessChecks.set(check.id, check)
    })
  }
}

export async function GET() {
  try {
    initializeSampleChecks()
    const checkList = Array.from(accessChecks.values())
    
    return NextResponse.json({
      success: true,
      checks: checkList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    })
  } catch (error) {
    console.error('Failed to fetch access checks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch access checks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, client_id, requested_scopes, granted_scopes, resource, action, result, reason, evaluation_time } = body

    if (!user_id || !client_id || !requested_scopes || !resource || !action || !result) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const accessCheck: AccessCheck = {
      id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id,
      client_id,
      requested_scopes,
      granted_scopes: granted_scopes || [],
      resource,
      action,
      result,
      reason: reason || "",
      evaluation_time: evaluation_time || 0,
      timestamp: new Date().toISOString()
    }

    accessChecks.set(accessCheck.id, accessCheck)

    return NextResponse.json({
      success: true,
      check: accessCheck,
      message: 'Access check logged successfully'
    })
  } catch (error) {
    console.error('Failed to log access check:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log access check' },
      { status: 500 }
    )
  }
}