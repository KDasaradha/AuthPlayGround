import { NextRequest, NextResponse } from 'next/server'

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

// In-memory storage for tenant resources (in production, use a database)
const tenantResources = new Map<string, TenantResource>()

// Initialize with sample data
function initializeSampleResources() {
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
      },
      {
        id: "res_acme_storage_001",
        tenant_id: "tenant_acme_corp",
        name: "Document Storage",
        type: "storage",
        resource_id: "s3://acme-corp-docs/",
        permissions: {
          owner: ["read", "write", "delete", "list"],
          admin: ["read", "write", "delete"],
          member: ["read", "write"],
          viewer: ["read"]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "res_tech_api_001",
        tenant_id: "tenant_tech_startup",
        name: "Analytics API",
        type: "api",
        resource_id: "/api/analytics/*",
        permissions: {
          owner: ["GET", "POST", "PUT", "DELETE"],
          admin: ["GET", "POST", "PUT"],
          member: ["GET", "POST"],
          viewer: ["GET"]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "res_local_app_001",
        tenant_id: "tenant_local_business",
        name: "Inventory Management",
        type: "application",
        resource_id: "app://inventory-manager",
        permissions: {
          owner: ["read", "write", "delete", "admin"],
          admin: ["read", "write", "delete"],
          member: ["read", "write"],
          viewer: ["read"]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "res_freelancer_storage_001",
        tenant_id: "tenant_freelancer",
        name: "Portfolio Storage",
        type: "storage",
        resource_id: "s3://freelancer-portfolio/",
        permissions: {
          owner: ["read", "write", "delete", "list"],
          member: ["read", "write"],
          viewer: ["read"]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    sampleResources.forEach(resource => {
      tenantResources.set(resource.id, resource)
    })
  }
}

export async function GET() {
  try {
    initializeSampleResources()
    const resourceList = Array.from(tenantResources.values())
    
    return NextResponse.json({
      success: true,
      resources: resourceList.sort((a, b) => a.name.localeCompare(b.name))
    })
  } catch (error) {
    console.error('Failed to fetch tenant resources:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tenant resources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSampleResources()
    
    const body = await request.json()
    const { tenant_id, name, type, resource_id, permissions } = body

    if (!tenant_id || !name || !type || !resource_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tenant_id, name, type, resource_id' },
        { status: 400 }
      )
    }

    const resource: TenantResource = {
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenant_id,
      name,
      type,
      resource_id,
      permissions: permissions || getDefaultPermissions(type),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    tenantResources.set(resource.id, resource)

    return NextResponse.json({
      success: true,
      resource,
      message: 'Tenant resource created successfully'
    })
  } catch (error) {
    console.error('Failed to create tenant resource:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create tenant resource' },
      { status: 500 }
    )
  }
}

function getDefaultPermissions(type: string): Record<string, string[]> {
  const basePermissions = {
    owner: ["read", "write", "delete", "admin"],
    admin: ["read", "write", "delete"],
    member: ["read", "write"],
    viewer: ["read"]
  }

  switch (type) {
    case "database":
      return {
        owner: ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP"],
        admin: ["SELECT", "INSERT", "UPDATE", "DELETE"],
        member: ["SELECT", "INSERT"],
        viewer: ["SELECT"]
      }
    case "storage":
      return {
        owner: ["read", "write", "delete", "list"],
        admin: ["read", "write", "delete"],
        member: ["read", "write"],
        viewer: ["read"]
      }
    case "api":
      return {
        owner: ["GET", "POST", "PUT", "DELETE"],
        admin: ["GET", "POST", "PUT"],
        member: ["GET", "POST"],
        viewer: ["GET"]
      }
    default:
      return basePermissions
  }
}