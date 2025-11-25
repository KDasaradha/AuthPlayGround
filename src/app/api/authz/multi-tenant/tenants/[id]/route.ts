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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = tenants.get(params.id)
    
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      tenant
    })
  } catch (error) {
    console.error('Failed to fetch tenant:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tenant' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const existingTenant = tenants.get(params.id)

    if (!existingTenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const updatedTenant: Tenant = {
      ...existingTenant,
      ...body,
      updated_at: new Date().toISOString()
    }

    tenants.set(params.id, updatedTenant)

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingTenant = tenants.get(params.id)

    if (!existingTenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      )
    }

    tenants.delete(params.id)

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