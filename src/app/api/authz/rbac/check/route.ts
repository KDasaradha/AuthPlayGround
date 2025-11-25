import { NextRequest, NextResponse } from 'next/server'

// Mock RBAC data
interface User {
  id: string
  name: string
  email: string
  roleId: string
}

interface Role {
  id: string
  name: string
  permissions: string[]
}

const users: Record<string, User> = {
  '1': { id: '1', name: 'Alice Johnson', email: 'alice@company.com', roleId: 'admin' },
  '2': { id: '2', name: 'Bob Smith', email: 'bob@company.com', roleId: 'manager' },
  '3': { id: '3', name: 'Charlie Brown', email: 'charlie@company.com', roleId: 'user' },
  '4': { id: '4', name: 'Diana Prince', email: 'diana@company.com', roleId: 'viewer' }
}

const roles: Record<string, Role> = {
  'admin': {
    id: 'admin',
    name: 'Admin',
    permissions: [
      'users:read',
      'users:write', 
      'users:delete',
      'reports:read',
      'reports:write',
      'settings:read',
      'settings:write',
      'dashboard:read',
      'api:write'
    ]
  },
  'manager': {
    id: 'manager',
    name: 'Manager',
    permissions: [
      'users:read',
      'users:write',
      'reports:read',
      'reports:write',
      'dashboard:read'
    ]
  },
  'user': {
    id: 'user',
    name: 'User',
    permissions: [
      'dashboard:read'
    ]
  },
  'viewer': {
    id: 'viewer',
    name: 'Viewer',
    permissions: [
      'dashboard:read'
    ]
  }
}

// Resource mapping
const resources: Record<string, string> = {
  '1': 'users',
  '2': 'reports',
  '3': 'settings',
  '4': 'dashboard',
  '5': 'api'
}

export async function POST(request: NextRequest) {
  try {
    const { userId, resourceId, action } = await request.json()

    if (!userId || !resourceId || !action) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'userId, resourceId, and action are required' 
        },
        { status: 400 }
      )
    }

    // Get user
    const user = users[userId]
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's role
    const role = roles[user.roleId]
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: 404 }
      )
    }

    // Get resource name
    const resourceName = resources[resourceId]
    if (!resourceName) {
      return NextResponse.json(
        { success: false, message: 'Resource not found' },
        { status: 404 }
      )
    }

    // Check permission
    const requiredPermission = `${resourceName}:${action}`
    const hasAccess = role.permissions.includes(requiredPermission)

    console.log(`RBAC Check: User ${user.name} (${user.roleId}) - ${requiredPermission} - ${hasAccess ? 'GRANTED' : 'DENIED'}`)

    return NextResponse.json({
      success: true,
      message: hasAccess ? 'Access granted' : 'Access denied',
      hasAccess,
      details: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: role.name
        },
        resource: resourceName,
        action,
        requiredPermission,
        permissions: role.permissions
      }
    })

  } catch (error) {
    console.error('RBAC check error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}