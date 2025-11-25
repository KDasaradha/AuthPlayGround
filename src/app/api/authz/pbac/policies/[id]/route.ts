import { NextRequest, NextResponse } from 'next/server'

interface Policy {
  id: string
  name: string
  description: string
  type: "allow" | "deny"
  priority: number
  conditions: any[]
  actions: string[]
  resources: string[]
  effect: "allow" | "deny"
  enabled: boolean
  created_at: string
  updated_at: string
}

// In-memory storage for policies (in production, use a database)
const policies = new Map<string, Policy>()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const policy = policies.get(params.id)
    
    if (!policy) {
      return NextResponse.json(
        { success: false, error: 'Policy not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      policy
    })
  } catch (error) {
    console.error('Failed to fetch policy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch policy' },
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
    const existingPolicy = policies.get(params.id)

    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'Policy not found' },
        { status: 404 }
      )
    }

    const updatedPolicy: Policy = {
      ...existingPolicy,
      ...body,
      updated_at: new Date().toISOString()
    }

    policies.set(params.id, updatedPolicy)

    return NextResponse.json({
      success: true,
      policy: updatedPolicy,
      message: 'Policy updated successfully'
    })
  } catch (error) {
    console.error('Failed to update policy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update policy' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingPolicy = policies.get(params.id)

    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'Policy not found' },
        { status: 404 }
      )
    }

    policies.delete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Policy deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete policy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete policy' },
      { status: 500 }
    )
  }
}