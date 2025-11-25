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

// In-memory storage for ACEs (in production, use a database)
const aces = new Map<string, AccessControlEntry>()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ace = aces.get(params.id)
    
    if (!ace) {
      return NextResponse.json(
        { success: false, error: 'ACE not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      ace
    })
  } catch (error) {
    console.error('Failed to fetch ACE:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ACE' },
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
    const existingAce = aces.get(params.id)

    if (!existingAce) {
      return NextResponse.json(
        { success: false, error: 'ACE not found' },
        { status: 404 }
      )
    }

    const updatedAce: AccessControlEntry = {
      ...existingAce,
      ...body,
      updated_at: new Date().toISOString()
    }

    aces.set(params.id, updatedAce)

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingAce = aces.get(params.id)

    if (!existingAce) {
      return NextResponse.json(
        { success: false, error: 'ACE not found' },
        { status: 404 }
      )
    }

    aces.delete(params.id)

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