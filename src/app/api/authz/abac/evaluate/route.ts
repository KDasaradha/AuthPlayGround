import { NextRequest, NextResponse } from 'next/server'

// Mock databases
const attributes = [
  { id: "attr_1", name: "department", value: "engineering", type: "string", category: "user" },
  { id: "attr_2", name: "role", value: "developer", type: "string", category: "user" },
  { id: "attr_3", name: "clearance", value: "secret", type: "string", category: "user" },
  { id: "attr_4", name: "location", value: "US", type: "string", category: "user" },
  { id: "attr_5", name: "project", value: "alpha", type: "string", category: "resource" },
  { id: "attr_6", name: "sensitivity", value: "high", type: "string", category: "resource" },
  { id: "attr_7", name: "time", value: "09:00-17:00", type: "string", category: "environment" },
  { id: "attr_8", name: "day_of_week", value: "monday-friday", type: "string", category: "environment" },
  { id: "attr_9", name: "device_trusted", value: "true", type: "boolean", category: "environment" }
]

const policies = [
  {
    id: "policy_1",
    name: "High Security Access",
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
    conditions: [
      { attribute: "environment.device_trusted", operator: "equals", value: "true" }
    ],
    effect: "permit",
    priority: 4
  },
  {
    id: "policy_5",
    name: "Deny Unknown Locations",
    conditions: [
      { attribute: "user.location", operator: "not_equals", value: "US" }
    ],
    effect: "deny",
    priority: 5
  }
]

const users = [
  { id: "1", name: "John Smith", department: "engineering", clearance: "secret", location: "US" },
  { id: "2", name: "Sarah Johnson", department: "engineering", clearance: "confidential", location: "US" },
  { id: "3", name: "Mike Wilson", department: "marketing", clearance: "public", location: "UK" }
]

function getAttributeValue(attributeName: string, category: string, context: Record<string, any>): any {
  // Check context first
  if (context && context[category] && context[category][attributeName] !== undefined) {
    return context[category][attributeName]
  }
  
  // Fall back to attribute database
  const attribute = attributes.find(attr => 
    attr.name === attributeName && attr.category === category
  )
  return attribute ? attribute.value : null
}

function evaluateCondition(condition: any, context: Record<string, any>): boolean {
  const [category, attributeName] = condition.attribute.split('.')
  const attributeValue = getAttributeValue(attributeName, category, context)
  
  if (attributeValue === null) return false
  
  switch (condition.operator) {
    case 'equals':
      return attributeValue === condition.value
    case 'not_equals':
      return attributeValue !== condition.value
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(attributeValue)
    case 'not_in':
      return Array.isArray(condition.value) && !condition.value.includes(attributeValue)
    case 'greater_than':
      return Number(attributeValue) > Number(condition.value)
    case 'less_than':
      return Number(attributeValue) < Number(condition.value)
    case 'in_range':
      const [min, max] = condition.value.split('-').map(v => v.trim())
      const value = Number(attributeValue)
      return value >= Number(min) && value <= Number(max)
    default:
      return false
  }
}

function evaluatePolicy(policy: any, context: Record<string, any>): boolean {
  // All conditions must be met for the policy to apply
  return policy.conditions.every(condition => evaluateCondition(condition, context))
}

export async function POST(request: NextRequest) {
  try {
    const { userId, resource, action, context } = await request.json()

    // Validate required fields
    if (!userId || !resource || !action) {
      return NextResponse.json(
        { success: false, error: 'User ID, resource, and action are required' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Get user information
    const user = users.find(u => u.id === userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Build evaluation context
    const evaluationContext = {
      user: {
        department: user.department,
        clearance: user.clearance,
        location: user.location
      },
      resource: {
        project: resource,
        sensitivity: resource.includes('high') ? 'high' : 'normal'
      },
      environment: context || {},
      action: action
    }

    // Evaluate all policies
    const sortedPolicies = policies.sort((a, b) => a.priority - b.priority)
    const appliedPolicies = []
    let finalDecision = 'deny' // Default to deny
    
    for (const policy of sortedPolicies) {
      if (evaluatePolicy(policy, evaluationContext)) {
        appliedPolicies.push(policy)
        if (policy.effect === 'deny') {
          // Deny policies take precedence
          finalDecision = 'deny'
          break
        } else {
          finalDecision = 'permit'
        }
      }
    }

    const evaluationTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      result: {
        decision: finalDecision,
        appliedPolicies: appliedPolicies.map(p => ({
          id: p.id,
          name: p.name,
          priority: p.priority,
          effect: p.effect
        })),
        matchedConditions: appliedPolicies.flatMap(p => p.conditions),
        totalPolicies: policies.length,
        matchedPolicies: appliedPolicies.length,
        evaluationTime: evaluationTime,
        context: evaluationContext
      },
      message: `Access ${finalDecision === 'permit' ? 'granted' : 'denied'}`
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Evaluation failed' },
      { status: 500 }
    )
  }
}