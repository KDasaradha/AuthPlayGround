import { NextRequest, NextResponse } from 'next/server'

interface PolicyTemplate {
  id: string
  name: string
  description: string
  category: string
  template: {
    name: string
    description: string
    type: "allow" | "deny"
    priority: number
    conditions: any[]
    actions: string[]
    resources: string[]
    enabled: boolean
  }
}

// Sample policy templates
const templates: PolicyTemplate[] = [
  {
    id: "admin_full_access",
    name: "Admin Full Access",
    description: "Grant administrators full access to all resources",
    category: "Administrative",
    template: {
      name: "Admin Full Access Policy",
      description: "Allows admin users to perform any action on any resource",
      type: "allow",
      priority: 1,
      conditions: [
        {
          id: "admin_role",
          type: "role",
          operator: "equals",
          key: "role",
          value: "admin",
          description: "User must have admin role"
        }
      ],
      actions: ["*"],
      resources: ["*"],
      enabled: true
    }
  },
  {
    id: "user_read_only",
    name: "User Read-Only Access",
    description: "Allow regular users to read most resources",
    category: "User Access",
    template: {
      name: "User Read-Only Policy",
      description: "Allows authenticated users to read resources",
      type: "allow",
      priority: 100,
      conditions: [
        {
          id: "authenticated_user",
          type: "attribute",
          operator: "equals",
          key: "authenticated",
          value: true,
          description: "User must be authenticated"
        }
      ],
      actions: ["read"],
      resources: ["/api/*", "/documents/*", "/reports/*"],
      enabled: true
    }
  },
  {
    id: "manager_department_access",
    name: "Manager Department Access",
    description: "Allow managers to access their department resources",
    category: "Role-Based",
    template: {
      name: "Manager Department Access Policy",
      description: "Allows managers to manage resources in their department",
      type: "allow",
      priority: 50,
      conditions: [
        {
          id: "manager_role",
          type: "role",
          operator: "equals",
          key: "role",
          value: "manager",
          description: "User must have manager role"
        },
        {
          id: "department_match",
          type: "attribute",
          operator: "equals",
          key: "department",
          value: "resource.department",
          description: "User's department must match resource's department"
        }
      ],
      actions: ["read", "write", "update"],
      resources: ["/api/department/*", "/documents/department/*", "/reports/department/*"],
      enabled: true
    }
  },
  {
    id: "time_restricted_access",
    name: "Time-Restricted Access",
    description: "Allow access only during business hours",
    category: "Time-Based",
    template: {
      name: "Business Hours Access Policy",
      description: "Allows access only during business hours (9 AM - 5 PM, weekdays)",
      type: "allow",
      priority: 75,
      conditions: [
        {
          id: "business_hours",
          type: "time",
          operator: "matches",
          key: "time.hour",
          value: "^(9|1[0-6])$",
          description: "Current hour must be between 9 AM and 5 PM"
        },
        {
          id: "weekdays_only",
          type: "time",
          operator: "not_in",
          key: "time.day_of_week",
          value: [0, 6], // Sunday, Saturday
          description: "Access only on weekdays"
        }
      ],
      actions: ["read", "write"],
      resources: ["/api/*"],
      enabled: true
    }
  },
  {
    id: "ip_whitelist",
    name: "IP Whitelist Access",
    description: "Allow access only from specific IP addresses",
    category: "Location-Based",
    template: {
      name: "IP Whitelist Policy",
      description: "Allows access only from whitelisted IP addresses",
      type: "allow",
      priority: 25,
      conditions: [
        {
          id: "ip_whitelist",
          type: "location",
          operator: "in",
          key: "request.ip",
          value: ["192.168.1.0/24", "10.0.0.0/8", "172.16.0.0/12"],
          description: "Request must come from whitelisted IP ranges"
        }
      ],
      actions: ["*"],
      resources: ["/api/admin/*", "/api/sensitive/*"],
      enabled: true
    }
  },
  {
    id: "deny_suspicious_activity",
    name: "Deny Suspicious Activity",
    description: "Block access for users with suspicious activity",
    category: "Security",
    template: {
      name: "Suspicious Activity Deny Policy",
      description: "Denies access for users with high risk scores or suspicious activity",
      type: "deny",
      priority: 10,
      conditions: [
        {
          id: "high_risk_score",
          type: "attribute",
          operator: "greater_than",
          key: "risk_score",
          value: 80,
          description: "Block users with risk score above 80"
        },
        {
          id: "multiple_failed_attempts",
          type: "attribute",
          operator: "greater_than",
          key: "failed_login_attempts",
          value: 5,
          description: "Block users with more than 5 failed login attempts"
        }
      ],
      actions: ["*"],
      resources: ["*"],
      enabled: true
    }
  },
  {
    id: "developer_api_access",
    name: "Developer API Access",
    description: "Allow developers to access API endpoints",
    category: "API Access",
    template: {
      name: "Developer API Access Policy",
      description: "Allows developers to access and modify API resources",
      type: "allow",
      priority: 30,
      conditions: [
        {
          id: "developer_role",
          type: "role",
          operator: "equals",
          key: "role",
          value: "developer",
          description: "User must have developer role"
        },
        {
          id: "api_key_present",
          type: "attribute",
          operator: "equals",
          key: "has_api_key",
          value: true,
          description: "User must have valid API key"
        }
      ],
      actions: ["read", "write", "update", "delete"],
      resources: ["/api/*", "/webhooks/*", "/integrations/*"],
      enabled: true
    }
  },
  {
    id: "guest_limited_access",
    name: "Guest Limited Access",
    description: "Allow limited access for unauthenticated guests",
    category: "Guest Access",
    template: {
      name: "Guest Limited Access Policy",
      description: "Allows unauthenticated users to access public resources",
      type: "allow",
      priority: 200,
      conditions: [
        {
          id: "guest_user",
          type: "attribute",
          operator: "equals",
          key: "authenticated",
          value: false,
          description: "User is not authenticated"
        }
      ],
      actions: ["read"],
      resources: ["/public/*", "/api/public/*", "/docs/*"],
      enabled: true
    }
  },
  {
    id: "audit_log_access",
    name: "Audit Log Access",
    description: "Allow access to audit logs for auditors and admins",
    category: "Compliance",
    template: {
      name: "Audit Log Access Policy",
      description: "Allows auditors and admins to access audit logs",
      type: "allow",
      priority: 15,
      conditions: [
        {
          id: "auditor_or_admin",
          type: "role",
          operator: "in",
          key: "role",
          value: ["auditor", "admin"],
          description: "User must have auditor or admin role"
        }
      ],
      actions: ["read"],
      resources: ["/api/audit/*", "/logs/*", "/compliance/*"],
      enabled: true
    }
  },
  {
    id: "emergency_access",
    name: "Emergency Access",
    description: "Allow emergency access during critical situations",
    category: "Emergency",
    template: {
      name: "Emergency Access Policy",
      description: "Allows elevated access during emergency situations",
      type: "allow",
      priority: 5,
      conditions: [
        {
          id: "emergency_mode",
          type: "attribute",
          operator: "equals",
          key: "emergency_mode",
          value: true,
          description: "System must be in emergency mode"
        },
        {
          id: "emergency_role",
          type: "role",
          operator: "in",
          key: "role",
          value: ["emergency_responder", "admin", "security_team"],
          description: "User must have emergency response role"
        }
      ],
      actions: ["*"],
      resources: ["*"],
      enabled: true
    }
  }
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      templates: templates.sort((a, b) => a.name.localeCompare(b.name))
    })
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, template } = body

    if (!name || !description || !category || !template) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newTemplate: PolicyTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      template
    }

    templates.push(newTemplate)

    return NextResponse.json({
      success: true,
      template: newTemplate,
      message: 'Template created successfully'
    })
  } catch (error) {
    console.error('Failed to create template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    )
  }
}