import { NextRequest, NextResponse } from 'next/server'

// Mock databases
const policies = [
  {
    id: "policy_1",
    name: "Admin Access Policy",
    rules: [
      { id: "rule_1", name: "Admin Check", condition: "user.role == 'admin'", action: "allow", effect: "permit" },
      { id: "rule_2", name: "Business Hours", condition: "time.hour >= 9 && time.hour <= 17", action: "allow", effect: "permit" }
    ],
    enabled: true,
    priority: 1
  },
  {
    id: "policy_2",
    name: "Developer Access Policy",
    rules: [
      { id: "rule_3", name: "Developer Role", condition: "user.role == 'developer'", action: "allow", effect: "permit" },
      { id: "rule_4", name: "Project Access", condition: "user.project == 'assigned'", action: "allow", effect: "permit" },
      { id: "rule_5", name: "Deny Production", condition: "environment == 'production'", action: "allow", effect: "deny" }
    ],
    enabled: true,
    priority: 2
  },
  {
    id: "policy_3",
    name: "Guest Access Policy",
    rules: [
      { id: "rule_6", name: "Read Only", condition: "action.type == 'read'", action: "allow", effect: "permit" },
      { id: "rule_7", name: "No Write", condition: "action.type == 'write'", action: "allow", effect: "deny" },
      { id: "rule_8", name: "Time Limit", condition: "time.hour < 6 || time.hour > 22", action: "allow", effect: "deny" }
    ],
    enabled: true,
    priority: 3
  }
]

const policySets = [
  {
    id: "set_1",
    name: "Corporate Policies",
    policies: ["policy_1", "policy_2"],
    enabled: true
  },
  {
    id: "set_2",
    name: "Development Policies",
    policies: ["policy_2", "policy_3"],
    enabled: true
  },
  {
    id: "set_3",
    name: "Guest Policies",
    policies: ["policy_3"],
    enabled: true
  }
]

const users = [
  { id: "1", name: "John Smith", role: "admin", department: "IT" },
  { id: "2", name: "Sarah Johnson", role: "developer", department: "Engineering" },
  { id: "3", name: "Mike Wilson", role: "guest", department: "External" }
]

function evaluateCondition(condition: string, context: Record<string, any>): boolean {
  // Simple condition evaluator (in production, use a proper expression parser)
  try {
    // Replace variables with context values
    let evalCondition = condition
    Object.keys(context).forEach(key => {
      if (typeof context[key] === 'object') {
        Object.keys(context[key]).forEach(subKey => {
          const regex = new RegExp(`\\b${key}\\.${subKey}\\b`, 'g')
          evalCondition = evalCondition.replace(regex, context[key][subKey])
        })
      } else {
        const regex = new RegExp(`\\b${key}\\b`, 'g')
        evalCondition = evalCondition.replace(regex, context[key])
      }
    })
    
    // Evaluate the condition
    return Function(`"use strict"; return (${evalCondition})`)()
  } catch (error) {
    console.error('Condition evaluation error:', error)
    return false
  }
}

function evaluatePolicy(policy: any, context: Record<string, any>): { matched: boolean, triggeredRules: any[] } {
  const triggeredRules = []
  
  for (const rule of policy.rules) {
    if (evaluateCondition(rule.condition, context)) {
      triggeredRules.push(rule)
    }
  }
  
  // If any rule triggers and has a deny effect, deny access
  const hasDeny = triggeredRules.some(rule => rule.effect === 'deny')
  
  return {
    matched: triggeredRules.length > 0,
    triggeredRules
  }
}

export async function POST(request: NextRequest) {
  try {
    const { policySetId, context } = await request.json()

    // Validate required fields
    if (!policySetId) {
      return NextResponse.json(
        { success: false, error: 'Policy set ID is required' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Get policy set
    const policySet = policySets.find(set => set.id === policySetId)
    if (!policySet) {
      return NextResponse.json(
        { success: false, error: 'Policy set not found' },
        { status: 404 }
      )
    }

    // Get policies in the set
    const setPolicies = policies.filter(policy => policySet.policies.includes(policy.id))
    
    // Evaluate policies in priority order
    const appliedPolicies = []
    let finalDecision = 'deny' // Default to deny
    
    for (const policy of setPolicies.sort((a, b) => a.priority - b.priority)) {
      const evaluation = evaluatePolicy(policy, context)
      
      if (evaluation.matched) {
        appliedPolicies.push({
          id: policy.id,
          name: policy.name,
          priority: policy.priority,
          triggeredRules: evaluation.triggeredRules
        })
        
        // Check if any triggered rule has deny effect
        const hasDeny = evaluation.triggeredRules.some(rule => rule.effect === 'deny')
        if (hasDeny) {
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
        appliedPolicies,
        triggeredRules: appliedPolicies.flatMap(p => p.triggeredRules),
        totalPolicies: setPolicies.length,
        matchedPolicies: appliedPolicies.length,
        evaluationTime,
        context
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