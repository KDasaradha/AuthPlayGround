import { NextRequest, NextResponse } from 'next/server'

interface Policy {
  id: string
  name: string
  description: string
  type: "allow" | "deny"
  priority: number
  conditions: PolicyCondition[]
  actions: string[]
  resources: string[]
  effect: "allow" | "deny"
  enabled: boolean
  created_at: string
  updated_at: string
}

interface PolicyCondition {
  id: string
  type: "attribute" | "role" | "time" | "location" | "resource" | "custom"
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "in" | "not_in" | "matches"
  key: string
  value: string | string[] | number | boolean
  description?: string
}

// In-memory storage for policies (in production, use a database)
const policies = new Map<string, Policy>()

export async function GET() {
  try {
    const policyList = Array.from(policies.values())
    
    return NextResponse.json({
      success: true,
      policies: policyList.sort((a, b) => a.priority - b.priority)
    })
  } catch (error) {
    console.error('Failed to fetch policies:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch policies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, priority, conditions, actions, resources, enabled } = body

    if (!name || !type || !actions || !resources) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const policy: Policy = {
      id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: description || '',
      type,
      priority: priority || 100,
      conditions: conditions || [],
      actions,
      resources,
      effect: type,
      enabled: enabled !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    policies.set(policy.id, policy)

    return NextResponse.json({
      success: true,
      policy,
      message: 'Policy created successfully'
    })
  } catch (error) {
    console.error('Failed to create policy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create policy' },
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
        { success: false, error: 'Policy ID is required' },
        { status: 400 }
      )
    }

    const existingPolicy = policies.get(id)
    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'Policy not found' },
        { status: 404 }
      )
    }

    const updatedPolicy: Policy = {
      ...existingPolicy,
      ...updates,
      updated_at: new Date().toISOString()
    }

    policies.set(id, updatedPolicy)

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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Policy ID is required' },
        { status: 400 }
      )
    }

    const existingPolicy = policies.get(id)
    if (!existingPolicy) {
      return NextResponse.json(
        { success: false, error: 'Policy not found' },
        { status: 404 }
      )
    }

    policies.delete(id)

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