import { NextRequest, NextResponse } from 'next/server'

// Mock user database
let users: any[] = [
  { id: "1", name: "John Smith", email: "john@company.com", role: "super_admin", isActive: true },
  { id: "2", name: "Sarah Johnson", email: "sarah@company.com", role: "admin", isActive: true },
  { id: "3", name: "Mike Wilson", email: "mike@company.com", role: "manager", isActive: true },
  { id: "4", name: "Emily Davis", email: "emily@company.com", role: "supervisor", isActive: true },
  { id: "5", name: "Tom Brown", email: "tom@company.com", role: "employee", isActive: true },
  { id: "6", name: "Lisa Anderson", email: "lisa@company.com", role: "guest", isActive: true }
]

export async function POST(request: NextRequest) {
  try {
    const { userId, roleId } = await request.json()

    // Validate user exists
    const user = users.find(u => u.id === userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user role
    user.role = roleId
    user.updatedAt = new Date().toISOString()

    return NextResponse.json({
      success: true,
      user: user,
      message: 'Role assigned successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Role assignment failed' },
      { status: 500 }
    )
  }
}