import { NextRequest, NextResponse } from 'next/server'

interface AccessCheck {
  id: string
  tenant_id: string
  user_id: string
  resource: string
  action: string
  result: "allow" | "deny"
  reason: string
  evaluation_time: number
  timestamp: string
}

interface Tenant {
  id: string
  name: string
  domain: string
  subdomain: string
  status: "active" | "inactive" | "suspended"
  plan: "free" | "basic" | "premium" | "enterprise"
  settings: TenantSettings
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

interface TenantSettings {
  allow_custom_domains: boolean
  allow_sso: boolean
  allow_api_access: boolean
  max_users: number
  max_storage: number
  features: string[]
  restrictions: Record<string, any>
}

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

interface TenantResource {
  id: string
  tenant_id: string
  name: string
  type: "database" | "storage" | "api" | "service" | "application"
  resource_id: string
  permissions: Record<string, string[]>
  created_at: string
  updated_at: string
}

// In-memory storage (in production, use a database)
const accessChecks = new Map<string, AccessCheck>()
const tenants = new Map<string, Tenant>()
const tenantUsers = new Map<string, TenantUser>()
const tenantResources = new Map<string, TenantResource>()

// Initialize with sample data
function initializeSampleData() {
  // Initialize sample tenants
  if (tenants.size === 0) {
    const sampleTenants: Tenant[] = [
      {
        id: "tenant_acme_corp",
        name: "Acme Corporation",
        domain: "acme.com",
        subdomain: "acme.app.com",
        status: "active",
        plan: "enterprise",
        settings: {
          allow_custom_domains: true,
          allow_sso: true,
          allow_api_access: true,
          max_users: 1000,
          max_storage: 102400,
          features: ["advanced_analytics", "custom_integrations", "priority_support", "white_labeling"],
          restrictions: {}
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { industry: "technology", size: "large" }
      }
    ]
    sampleTenants.forEach(tenant => tenants.set(tenant.id, tenant))
  }

  // Initialize sample users
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
      }
    ]
    sampleUsers.forEach(user => tenantUsers.set(user.id, user))
  }

  // Initialize sample resources
  if (tenantResources.size === 0) {
    const sampleResources: TenantResource[] = [
      {
        id: "res_acme_db_001",
        tenant_id: "tenant_acme_corp",
        name: "Customer Database",
        type: "database",
        resource_id: "postgresql://acme_corp/customers",
        permissions: {
          owner: ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP"],
          admin: ["SELECT", "INSERT", "UPDATE", "DELETE"],
          member: ["SELECT", "INSERT"],
          viewer: ["SELECT"]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    sampleResources.forEach(resource => tenantResources.set(resource.id, resource))
  }
}

function evaluateMultiTenantAccess(tenantId: string, userId: string, resource: string, action: string): {
  result: "allow" | "deny"
  reason: string
} {
  initializeSampleData()

  // Check if tenant exists and is active
  const tenant = tenants.get(tenantId)
  if (!tenant) {
    return { result: "deny", reason: "Tenant not found" }
  }

  if (tenant.status !== "active") {
    return { result: "deny", reason: `Tenant is ${tenant.status}` }
  }

  // Check if user exists in tenant
  const user = Array.from(tenantUsers.values()).find(u => u.tenant_id === tenantId && u.user_id === userId)
  if (!user) {
    return { result: "deny", reason: "User not found in tenant" }
  }

  if (user.status !== "active") {
    return { result: "deny", reason: `User is ${user.status}` }
  }

  // Check tenant plan restrictions
  if (!tenant.settings.allow_api_access && resource.startsWith("api://")) {
    return { result: "deny", reason: "API access not allowed for tenant plan" }
  }

  // Find the resource
  const tenantResource = Array.from(tenantResources.values()).find(r => 
    r.tenant_id === tenantId && r.resource_id === resource
  )

  if (!tenantResource) {
    return { result: "deny", reason: "Resource not found in tenant" }
  }

  // Check user permissions for the resource
  const userPermissions = tenantResource.permissions[user.role] || []
  
  if (!userPermissions.includes(action)) {
    return { 
      result: "deny", 
      reason: `User role '${user.role}' does not have permission '${action}' for resource '${resource}'` 
    }
  }

  // Check tenant restrictions
  if (tenant.settings.restrictions.api_rate_limit && resource.startsWith("api://")) {
    // In a real implementation, you would check actual API usage
    return { 
      result: "allow", 
      reason: "Access granted (rate limit would be checked in production)" 
    }
  }

  return { result: "allow", reason: "Access granted" }
}

export async function GET() {
  try {
    const checkList = Array.from(accessChecks.values())
    
    return NextResponse.json({
      success: true,
      checks: checkList.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 100) // Return last 100 checks
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
    const { tenant_id, user_id, resource, action } = body

    if (!tenant_id || !user_id || !resource || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tenant_id, user_id, resource, action' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    const evaluation = evaluateMultiTenantAccess(tenant_id, user_id, resource, action)
    const evaluationTime = Date.now() - startTime

    const accessCheck: AccessCheck = {
      id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenant_id,
      user_id,
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