import { NextRequest, NextResponse } from 'next/server'

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

// In-memory storage for tenants (in production, use a database)
const tenants = new Map<string, Tenant>()

// Initialize with sample data
function initializeSampleTenants() {
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
      },
      {
        id: "tenant_tech_startup",
        name: "Tech Startup Inc",
        domain: "techstartup.io",
        subdomain: "techstartup.app.com",
        status: "active",
        plan: "premium",
        settings: {
          allow_custom_domains: true,
          allow_sso: false,
          allow_api_access: true,
          max_users: 100,
          max_storage: 10240,
          features: ["api_access", "basic_analytics", "email_support"],
          restrictions: {}
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { industry: "technology", size: "small" }
      },
      {
        id: "tenant_local_business",
        name: "Local Business LLC",
        domain: "localbiz.com",
        subdomain: "localbiz.app.com",
        status: "active",
        plan: "basic",
        settings: {
          allow_custom_domains: false,
          allow_sso: false,
          allow_api_access: true,
          max_users: 10,
          max_storage: 1024,
          features: ["basic_features", "email_support"],
          restrictions: { api_rate_limit: "100/hour" }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { industry: "retail", size: "small" }
      },
      {
        id: "tenant_freelancer",
        name: "Freelancer Pro",
        domain: "freelancer.net",
        subdomain: "freelancer.app.com",
        status: "active",
        plan: "free",
        settings: {
          allow_custom_domains: false,
          allow_sso: false,
          allow_api_access: false,
          max_users: 1,
          max_storage: 100,
          features: ["basic_features"],
          restrictions: { no_commercial_use: true }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { industry: "services", size: "individual" }
      }
    ]

    sampleTenants.forEach(tenant => {
      tenants.set(tenant.id, tenant)
    })
  }
}

export async function GET() {
  try {
    initializeSampleTenants()
    const tenantList = Array.from(tenants.values())
    
    return NextResponse.json({
      success: true,
      tenants: tenantList.sort((a, b) => a.name.localeCompare(b.name))
    })
  } catch (error) {
    console.error('Failed to fetch tenants:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tenants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSampleTenants()
    
    const body = await request.json()
    const { name, domain, subdomain, plan, settings } = body

    if (!name || !domain || !subdomain || !plan) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, domain, subdomain, plan' },
        { status: 400 }
      )
    }

    const tenant: Tenant = {
      id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      domain,
      subdomain,
      status: "active",
      plan,
      settings: settings || {
        allow_custom_domains: false,
        allow_sso: false,
        allow_api_access: true,
        max_users: 10,
        max_storage: 1024,
        features: ["basic_features"],
        restrictions: {}
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {}
    }

    tenants.set(tenant.id, tenant)

    return NextResponse.json({
      success: true,
      tenant,
      message: 'Tenant created successfully'
    })
  } catch (error) {
    console.error('Failed to create tenant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create tenant' },
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
        { success: false, error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const existingTenant = tenants.get(id)
    if (!existingTenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const updatedTenant: Tenant = {
      ...existingTenant,
      ...updates,
      updated_at: new Date().toISOString()
    }

    tenants.set(id, updatedTenant)

    return NextResponse.json({
      success: true,
      tenant: updatedTenant,
      message: 'Tenant updated successfully'
    })
  } catch (error) {
    console.error('Failed to update tenant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update tenant' },
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
        { success: false, error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const existingTenant = tenants.get(id)
    if (!existingTenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      )
    }

    tenants.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Tenant deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete tenant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete tenant' },
      { status: 500 }
    )
  }
}