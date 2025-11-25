import { NextRequest, NextResponse } from 'next/server'

// Mock policy database
let policies: any[] = [
  {
    id: "policy_1",
    name: "Admin Access Policy",
    description: "Grants full administrative access",
    rules: [
      { id: "rule_1", name: "Admin Check", condition: "user.role == 'admin'", action: "allow", effect: "permit" },
      { id: "rule_2", name: "Business Hours", condition: "time.hour >= 9 && time.hour <= 17", action: "allow", effect: "permit" }
    ],
    enabled: true,
    priority: 1,
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "policy_2",
    name: "Developer Access Policy",
    description: "Grants developer-level access",
    rules: [
      { id: "rule_3", name: "Developer Role", condition: "user.role == 'developer'", action: "allow", effect: "permit" },
      { id: "rule_4", name: "Project Access", condition: "user.project == 'assigned'", action: "allow", effect: "permit" },
      { id: "rule_5", name: "Deny Production", condition: "environment == 'production'", action: "allow", effect: "deny" }
    ],
    enabled: true,
    priority: 2,
    createdAt: "2024-01-16T10:00:00Z"
  },
  {
    id: "policy_3",
    name: "Guest Access Policy",
    description: "Limited guest access policy",
    rules: [
      { id: "rule_6", name: "Read Only", condition: "action.type == 'read'", action: "allow", effect: "permit" },
      { id: "rule_7", name: "No Write", condition: "action.type == 'write'", action: "allow", effect: "deny" },
      { id: "rule_8", name: "Time Limit", condition: "time.hour < 6 || time.hour > 22", action: "allow", effect: "deny" }
    ],
    enabled: true,
    priority: 3,
    createdAt: "2024-01-17T10:00:00Z"
  }
]

export async function POST(request: NextRequest) {
  try {
    const { name, description, rules } = await request.json()

    // Validate required fields
    if (!name || !rules || rules.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name and rules are required' },
        { status: 400 }
      )
    }

    // Create new policy
    const newPolicy = {
      id: `policy_${Math.random().toString(36).substring(2, 15)}`,
      name,
      description,
      rules,
      enabled: true,
      priority: policies.length + 1,
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