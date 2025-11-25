import { NextRequest, NextResponse } from 'next/server'

interface PolicyEvaluation {
  id: string
  policy_id: string
  user_id: string
  resource: string
  action: string
  context: Record<string, any>
  result: "allow" | "deny"
  matched_policies: string[]
  evaluation_time: number
  timestamp: string
}

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

// In-memory storage (in production, use a database)
const evaluations = new Map<string, PolicyEvaluation>()
const policies = new Map<string, Policy>()

// Initialize with sample policies
function initializeSamplePolicies() {
  if (policies.size === 0) {
    const samplePolicy: Policy = {
      id: "sample_admin_policy",
      name: "Admin Access Policy",
      description: "Allow admin users full access",
      type: "allow",
      priority: 1,
      conditions: [
        {
          id: "admin_role_condition",
          type: "role",
          operator: "equals",
          key: "role",
          value: "admin",
          description: "User must have admin role"
        }
      ],
      actions: ["read", "write", "delete", "admin"],
      resources: ["*"],
      effect: "allow",
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    policies.set(samplePolicy.id, samplePolicy)
  }
}

function evaluateCondition(condition: PolicyCondition, context: Record<string, any>): boolean {
  const actualValue = context[condition.key]
  const expectedValue = condition.value

  switch (condition.operator) {
    case "equals":
      return actualValue === expectedValue
    case "not_equals":
      return actualValue !== expectedValue
    case "contains":
      return typeof actualValue === "string" && actualValue.includes(String(expectedValue))
    case "not_contains":
      return typeof actualValue === "string" && !actualValue.includes(String(expectedValue))
    case "greater_than":
      return Number(actualValue) > Number(expectedValue)
    case "less_than":
      return Number(actualValue) < Number(expectedValue)
    case "in":
      return Array.isArray(expectedValue) && expectedValue.includes(actualValue)
    case "not_in":
      return Array.isArray(expectedValue) && !expectedValue.includes(actualValue)
    case "matches":
      if (typeof actualValue === "string" && typeof expectedValue === "string") {
        const regex = new RegExp(expectedValue)
        return regex.test(actualValue)
      }
      return false
    default:
      return false
  }
}

function evaluatePolicy(policy: Policy, request: {
  user_id: string
  resource: string
  action: string
  context: Record<string, any>
}): boolean {
  // Check if policy is enabled
  if (!policy.enabled) {
    return false
  }

  // Check if action matches
  if (!policy.actions.includes("*") && !policy.actions.includes(request.action)) {
    return false
  }

  // Check if resource matches
  const resourceMatches = policy.resources.some(resourcePattern => {
    if (resourcePattern === "*") return true
    if (resourcePattern.endsWith("/*")) {
      const prefix = resourcePattern.slice(0, -2)
      return request.resource.startsWith(prefix)
    }
    return resourcePattern === request.resource
  })

  if (!resourceMatches) {
    return false
  }

  // Evaluate all conditions
  const allConditionsMatch = policy.conditions.every(condition => 
    evaluateCondition(condition, request.context)
  )

  return allConditionsMatch
}

function matchResource(resourcePattern: string, actualResource: string): boolean {
  if (resourcePattern === "*") return true
  if (resourcePattern.endsWith("/*")) {
    const prefix = resourcePattern.slice(0, -2)
    return actualResource.startsWith(prefix)
  }
  return resourcePattern === actualResource
}

export async function GET() {
  try {
    const evaluationList = Array.from(evaluations.values())
    
    return NextResponse.json({
      success: true,
      evaluations: evaluationList.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 100) // Return last 100 evaluations
    })
  } catch (error) {
    console.error('Failed to fetch evaluations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch evaluations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSamplePolicies()
    
    const body = await request.json()
    const { user_id, resource, action, context } = body

    if (!user_id || !resource || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_id, resource, action' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    const requestContext = { ...context, user_id }
    
    // Get all enabled policies sorted by priority
    const enabledPolicies = Array.from(policies.values())
      .filter(policy => policy.enabled)
      .sort((a, b) => a.priority - b.priority)

    const matchedPolicies: string[] = []
    let finalResult: "allow" | "deny" = "deny" // Default deny

    // Evaluate policies in priority order
    for (const policy of enabledPolicies) {
      if (evaluatePolicy(policy, { user_id, resource, action, context: requestContext })) {
        matchedPolicies.push(policy.id)
        
        // First matching policy determines the result
        finalResult = policy.effect
        break
      }
    }

    const evaluationTime = Date.now() - startTime

    const evaluation: PolicyEvaluation = {
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      policy_id: matchedPolicies[0] || "",
      user_id,
      resource,
      action,
      context: requestContext,
      result: finalResult,
      matched_policies: matchedPolicies,
      evaluation_time: evaluationTime,
      timestamp: new Date().toISOString()
    }

    evaluations.set(evaluation.id, evaluation)

    return NextResponse.json({
      success: true,
      result: finalResult,
      matched_policies: matchedPolicies,
      evaluation_time: evaluationTime,
      evaluation_id: evaluation.id,
      message: `Access ${finalResult}ed`
    })
  } catch (error) {
    console.error('Failed to evaluate policy:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to evaluate policy' },
      { status: 500 }
    )
  }
}