import { NextRequest, NextResponse } from 'next/server'

// Mock policy set database
let policySets: any[] = [
  {
    id: "set_1",
    name: "Corporate Policies",
    description: "Standard corporate access policies",
    policies: ["policy_1", "policy_2"],
    enabled: true
  },
  {
    id: "set_2",
    name: "Development Policies",
    description: "Development environment policies",
    policies: ["policy_2", "policy_3"],
    enabled: true
  },
  {
    id: "set_3",
    name: "Guest Policies",
    description: "Guest access policies",
    policies: ["policy_3"],
    enabled: true
  }
]

export async function POST(request: NextRequest) {
  try {
    const { name, description, policies } = await request.json()

    // Validate required fields
    if (!name || !policies || policies.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name and policies are required' },
        { status: 400 }
      )
    }

    // Create new policy set
    const newPolicySet = {
      id: `set_${Math.random().toString(36).substring(2, 15)}`,
      name,
      description,
      policies,
      enabled: true,
      createdAt: new Date().toISOString()
    }

    policySets.push(newPolicySet)

    return NextResponse.json({
      success: true,
      policySet: newPolicySet,
      message: 'Policy set created successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Policy set creation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      policySets: policySets,
      message: 'Policy sets retrieved successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve policy sets' },
      { status: 500 }
    )
  }
}