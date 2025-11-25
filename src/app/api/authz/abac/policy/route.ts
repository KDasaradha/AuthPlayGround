import { NextRequest, NextResponse } from 'next/server'

// Mock policy database
let policies: any[] = [
  {
    id: "policy_1",
    name: "High Security Access",
    description: "Allow access to high-security resources for authorized personnel",
    conditions: [
      { attribute: "user.clearance", operator: "equals", value: "secret" },
      { attribute: "resource.sensitivity", operator: "equals", value: "high" }
    ],
    effect: "permit",
    priority: 1
  },
  {
    id: "policy_2",
    name: "Engineering Access",
    description: "Allow engineering access to engineering projects",
    conditions: [
      { attribute: "user.department", operator: "equals", value: "engineering" },
      { attribute: "resource.project", operator: "equals", value: "alpha" }
    ],
    effect: "permit",
    priority: 2
  },
  {
    id: "policy_3",
    name: "Business Hours Access",
    description: "Allow access only during business hours",
    conditions: [
      { attribute: "environment.time", operator: "in_range", value: "09:00-17:00" },
      { attribute: "environment.day_of_week", operator: "in", value: "monday-friday" }
    ],
    effect: "permit",
    priority: 3
  },
  {
    id: "policy_4",
    name: "Trusted Device Only",
    description: "Allow access only from trusted devices",
    conditions: [
      { attribute: "environment.device_trusted", operator: "equals", value: "true" }
    ],
    effect: "permit",
    priority: 4
  },
  {
    id: "policy_5",
    name: "Deny Unknown Locations",
    description: "Deny access from unknown locations",
    conditions: [
      { attribute: "user.location", operator: "not_equals", value: "US" }
    ],
    effect: "deny",
    priority: 5
  }
]

export async function POST(request: NextRequest) {
  try {
    const { name, description, conditions, effect, priority } = await request.json()

    // Validate required fields
    if (!name || !conditions || conditions.length === 0 || !effect) {
      return NextResponse.json(
        { success: false, error: 'Name, conditions, and effect are required' },
        { status: 400 }
      )
    }

    // Create new policy
    const newPolicy = {
      id: `policy_${Math.random().toString(36).substring(2, 15)}`,
      name,
      description,
      conditions,
      effect,
      priority: priority || 1,
      createdAt: new Date().toISOString()
    }

    policies.push(newPolicy)

    return NextResponse.json({
      success: true,
      policy: newPolicy,
      message: 'Policy created successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Policy creation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      policies: policies,
      message: 'Policies retrieved successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve policies' },
      { status: 500 }
    )
  }
}