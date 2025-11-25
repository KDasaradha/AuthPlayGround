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

// In-memory storage for ACL entries (in production, use a database)
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
      description: "Allow John to read and write the report file"
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

export async function GET() {
  try {
    initializeSampleData()
    const aceList = Array.from(aces.values())
    
    return NextResponse.json({
      success: true,
      aces: aceList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })
  } catch (error) {
    console.error('Failed to fetch ACEs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ACEs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSampleData()
    
    const body = await request.json()
    const { 
      principal_type, 
      principal_id, 
      principal_name,
      resource_type, 
      resource_id, 
      resource_name,
      permissions, 
      permission_type, 
      inherited, 
      enabled, 
      description 
    } = body

    if (!principal_type || !principal_id || !resource_type || !resource_id || !permissions || !permission_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const ace: AccessControlEntry = {
      id: `ace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      principal_type,
      principal_id,
      principal_name: principal_name || principal_id,
      resource_type,
      resource_id,
      resource_name: resource_name || resource_id,
      permissions,
      permission_type,
      inherited: inherited || false,
      enabled: enabled !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: description || ''
    }

    aces.set(ace.id, ace)

    return NextResponse.json({
      success: true,
      ace,
      message: 'ACE created successfully'
    })
  } catch (error) {
    console.error('Failed to create ACE:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create ACE' },
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
        { success: false, error: 'ACE ID is required' },
        { status: 400 }
      )
    }

    const existingAce = aces.get(id)
    if (!existingAce) {
      return NextResponse.json(
        { success: false, error: 'ACE not found' },
        { status: 404 }
      )
    }

    const updatedAce: AccessControlEntry = {
      ...existingAce,
      ...updates,
      updated_at: new Date().toISOString()
    }

    aces.set(id, updatedAce)

    return NextResponse.json({
      success: true,
      ace: updatedAce,
      message: 'ACE updated successfully'
    })
  } catch (error) {
    console.error('Failed to update ACE:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update ACE' },
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
        { success: false, error: 'ACE ID is required' },
        { status: 400 }
      )
    }

    const existingAce = aces.get(id)
    if (!existingAce) {
      return NextResponse.json(
        { success: false, error: 'ACE not found' },
        { status: 404 }
      )
    }

    aces.delete(id)

    return NextResponse.json({
      success: true,
      message: 'ACE deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete ACE:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete ACE' },
      { status: 500 }
    )
  }
}