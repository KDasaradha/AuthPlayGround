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

interface ClientApplication {
  id: string
  name: string
  description: string
  client_id: string
  client_secret?: string
  redirect_uris: string[]
  allowed_scopes: string[]
  default_scopes: string[]
  created_at: string
  updated_at: string
}

// In-memory storage (in production, use a database)
const accessChecks = new Map<string, AccessCheck>()
const scopes = new Map<string, Scope>()
const clients = new Map<string, ClientApplication>()

// Initialize with sample data
function initializeSampleData() {
  // Initialize sample scopes
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
      }
    ]
    sampleScopes.forEach(scope => scopes.set(scope.id, scope))
  }

  // Initialize sample clients
  if (clients.size === 0) {
    const sampleClients: ClientApplication[] = [
      {
        id: "client_web_app",
        name: "Web Application",
        description: "Main web application with full OAuth2 support",
        client_id: "web_app_123456",
        redirect_uris: ["https://app.example.com/auth/callback"],
        allowed_scopes: ["read:basic", "read:email", "read:profile", "write:profile"],
        default_scopes: ["read:basic", "read:email", "read:profile"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    sampleClients.forEach(client => clients.set(client.id, client))
  }
}

function evaluateScopeAccess(clientId: string, requestedScopes: string[], resource: string, action: string): {
  result: "allow" | "deny"
  grantedScopes: string[]
  reason: string
} {
  initializeSampleData()

  // Find the client
  const client = Array.from(clients.values()).find(c => c.client_id === clientId)
  if (!client) {
    return { result: "deny", grantedScopes: [], reason: "Client not found" }
  }

  // Check if requested scopes are allowed for this client
  const allowedScopes = client.allowed_scopes
  const validRequestedScopes = requestedScopes.filter(scope => allowedScopes.includes(scope))

  if (validRequestedScopes.length === 0) {
    return { result: "deny", grantedScopes: [], reason: "No valid scopes requested" }
  }

  // Get scope details
  const scopeDetails = Array.from(scopes.values()).filter(scope => 
    validRequestedScopes.includes(scope.name)
  )

  // Check if required scopes are included
  const requiredScopes = scopeDetails.filter(scope => scope.required).map(scope => scope.name)
  const missingRequiredScopes = requiredScopes.filter(scope => !validRequestedScopes.includes(scope))

  if (missingRequiredScopes.length > 0) {
    return { 
      result: "deny", 
      grantedScopes: [], 
      reason: `Missing required scopes: ${missingRequiredScopes.join(", ")}` 
    }
  }

  // Check if the requested action is covered by any granted scope permissions
  const hasPermission = scopeDetails.some(scope => {
    // Simple permission mapping - in a real implementation, this would be more sophisticated
    if (resource.startsWith("/api/user/profile") && action === "read") {
      return scope.permissions.includes("read:profile")
    }
    if (resource.startsWith("/api/user/profile") && action === "write") {
      return scope.permissions.includes("write:profile")
    }
    if (resource.startsWith("/api/user/email") && action === "read") {
      return scope.permissions.includes("read:email")
    }
    if (resource.startsWith("/api/user/basic") && action === "read") {
      return scope.permissions.includes("read:user_id")
    }
    return false
  })

  if (!hasPermission) {
    return { 
      result: "deny", 
      grantedScopes: validRequestedScopes, 
      reason: "Insufficient permissions for requested action" 
    }
  }

  return { 
    result: "allow", 
    grantedScopes: validRequestedScopes, 
    reason: "Access granted" 
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, client_id, requested_scopes, resource, action } = body

    if (!user_id || !client_id || !requested_scopes || !resource || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_id, client_id, requested_scopes, resource, action' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    const evaluation = evaluateScopeAccess(client_id, requested_scopes, resource, action)
    const evaluationTime = Date.now() - startTime

    const accessCheck: AccessCheck = {
      id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id,
      client_id,
      requested_scopes,
      granted_scopes: evaluation.grantedScopes,
      resource,
      action,
      result: evaluation.result,
      reason: evaluation.reason,
      evaluation_time: evaluationTime,
      timestamp: new Date().toISOString()
    }

    accessChecks.set(accessCheck.id, accessCheck)

    return NextResponse.json({
      success: true,
      result: evaluation.result,
      granted_scopes: evaluation.grantedScopes,
      reason: evaluation.reason,
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