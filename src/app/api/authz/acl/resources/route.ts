import { NextRequest, NextResponse } from 'next/server'

interface Resource {
  id: string
  name: string
  type: "file" | "directory" | "api" | "database" | "service"
  path: string
  parent_id?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// In-memory storage for resources (in production, use a database)
const resources = new Map<string, Resource>()

// Initialize with sample data
function initializeSampleResources() {
  if (resources.size === 0) {
    const sampleResources: Resource[] = [
      {
        id: "res_file_001",
        name: "report.pdf",
        type: "file",
        path: "/documents/report.pdf",
        metadata: { size: "2.5MB", extension: "pdf" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "res_dir_001",
        name: "Admin Directory",
        type: "directory",
        path: "/admin/*",
        metadata: { permissions: "755" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "res_api_001",
        name: "Sensitive API",
        type: "api",
        path: "/api/sensitive/*",
        metadata: { version: "v1", auth_required: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "res_db_001",
        name: "User Database",
        type: "database",
        path: "postgresql://localhost/users",
        metadata: { engine: "postgresql", version: "14" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "res_svc_001",
        name: "Payment Service",
        type: "service",
        path: "service://payment-processor",
        metadata: { port: 8080, protocol: "grpc" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "res_file_002",
        name: "config.json",
        type: "file",
        path: "/config/config.json",
        metadata: { size: "1.2KB", extension: "json" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "res_dir_002",
        name: "Public Directory",
        type: "directory",
        path: "/public/*",
        metadata: { permissions: "755" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "res_api_002",
        name: "Public API",
        type: "api",
        path: "/api/public/*",
        metadata: { version: "v1", auth_required: false },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    sampleResources.forEach(resource => {
      resources.set(resource.id, resource)
    })
  }
}

export async function GET() {
  try {
    initializeSampleResources()
    const resourceList = Array.from(resources.values())
    
    return NextResponse.json({
      success: true,
      resources: resourceList.sort((a, b) => a.name.localeCompare(b.name))
    })
  } catch (error) {
    console.error('Failed to fetch resources:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, path, parent_id, metadata } = body

    if (!name || !type || !path) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, type, path' },
        { status: 400 }
      )
    }

    const resource: Resource = {
      id: `res_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      path,
      parent_id,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    resources.set(resource.id, resource)

    return NextResponse.json({
      success: true,
      resource,
      message: 'Resource created successfully'
    })
  } catch (error) {
    console.error('Failed to create resource:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}