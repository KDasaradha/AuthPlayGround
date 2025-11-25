import { NextRequest, NextResponse } from 'next/server'

interface AccessControlEntry {
  id: string
  principal_type: "user" | "group" | "role"
  principal_id: string
  principal_name: string
  resource_type: "file" | "directory" | "api" | "database" | "service"
  resource_id: string
  resource_name: string
  permissions: string[]
  permission_type: "allow" | "deny"
  inherited: boolean
  enabled: boolean
  created_at: string
  updated_at: string
  description?: string
}

interface AccessCheck {
  id: string
  principal_id: string
  resource_id: string
  permission: string
  result: "allow" | "deny"
  matched_aces: string[]
  evaluation_time: number
  timestamp: string
}

// In-memory storage (in production, use a database)
const accessChecks = new Map<string, AccessCheck>()
const aces = new Map<string, AccessControlEntry>()

// Initialize with sample data
function initializeSampleData() {
  if (aces.size === 0) {
    const sampleAce: AccessControlEntry = {
      id: "ace_sample_1",
      principal_type: "user",
      principal_id: "user_001",
      principal_name: "john_doe",
      resource_type: "file",
      resource_id: "/documents/report.pdf",
      resource_name: "report.pdf",
      permissions: ["read", "write"],
      permission_type: "allow",
      inherited: false,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: "Allow John to read and write report file"
    }
    aces.set(sampleAce.id, sampleAce)

    const sampleAce2: AccessControlEntry = {
      id: "ace_sample_2",
      principal_type: "group",
      principal_id: "group_admin",
      principal_name: "Administrators",
      resource_type: "directory",
      resource_id: "/admin/*",
      resource_name: "Admin Directory",
      permissions: ["read", "write", "delete", "create"],
      permission_type: "allow",
      inherited: false,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: "Allow admin group full access to admin directory"
    }
    aces.set(sampleAce2.id, sampleAce2)

    const sampleAce3: AccessControlEntry = {
      id: "ace_sample_3",
      principal_type: "user",
      principal_id: "user_002",
      principal_name: "jane_smith",
      resource_type: "api",
      resource_id: "/api/sensitive/*",
      resource_name: "Sensitive API",
      permissions: ["GET", "POST"],
      permission_type: "deny",
      inherited: false,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: "Deny Jane access to sensitive APIs"
    }
    aces.set(sampleAce3.id, sampleAce3)
  }
}

function matchResource(resourcePattern: string, actualResource: string): boolean {
  if (resourcePattern === actualResource) return true
  if (resourcePattern.endsWith("/*")) {
    const prefix = resourcePattern.slice(0, -2)
    return actualResource.startsWith(prefix)
  }
  return false
}

function evaluateAccess(principalId: string, resourceId: string, permission: string): {
  result: "allow" | "deny"
  matched_aces: string[]
} {
  initializeSampleData()
  
  // Get all applicable ACEs for this principal and resource
  const applicableAces = Array.from(aces.values()).filter(ace => {
    if (!ace.enabled) return false
    
    // Check if ACE applies to principal
    const principalMatch = ace.principal_id === principalId
    
    // Check if ACE applies to resource
    const resourceMatch = matchResource(ace.resource_id, resourceId)
    
    // Check if ACE includes the requested permission
    const permissionMatch = ace.permissions.includes(permission)
    
    return principalMatch && resourceMatch && permissionMatch
  })

  // Sort by priority: deny entries take precedence over allow entries
  applicableAces.sort((a, b) => {
    if (a.permission_type === "deny" && b.permission_type === "allow") return -1
    if (a.permission_type === "allow" && b.permission_type === "deny") return 1
    return 0
  })

  // First matching ACE determines the result
  if (applicableAces.length > 0) {
    const firstAce = applicableAces[0]
    return {
      result: firstAce.permission_type,
      matched_aces: [firstAce.id]
    }
  }

  // Default deny if no ACEs match
  return {
    result: "deny",
    matched_aces: []
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { principal_id, resource_id, permission } = body

    if (!principal_id || !resource_id || !permission) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: principal_id, resource_id, permission' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    const evaluation = evaluateAccess(principal_id, resource_id, permission)
    const evaluationTime = Date.now() - startTime

    const accessCheck: AccessCheck = {
      id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      principal_id,
      resource_id,
      permission,
      result: evaluation.result,
      matched_aces: evaluation.matched_aces,
      evaluation_time: evaluationTime,
      timestamp: new Date().toISOString()
    }

    accessChecks.set(accessCheck.id, accessCheck)

    return NextResponse.json({
      success: true,
      result: evaluation.result,
      matched_aces: evaluation.matched_aces,
      evaluation_time: evaluationTime,
      check_id: accessCheck.id,
      message: `Access ${evaluation.result}ed`
    })
  } catch (error) {
    console.error('Failed to check access:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check access' },
      { status: 500 }
    )
  }
}