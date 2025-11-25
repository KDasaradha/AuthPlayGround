import { NextRequest, NextResponse } from 'next/server'

// Mock attribute database
let attributes: any[] = [
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

export async function POST(request: NextRequest) {
  try {
    const { name, value, type, category } = await request.json()

    // Validate required fields
    if (!name || !value || !type || !category) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create new attribute
    const newAttribute = {
      id: `attr_${Math.random().toString(36).substring(2, 15)}`,
      name,
      value,
      type,
      category,
      createdAt: new Date().toISOString()
    }

    attributes.push(newAttribute)

    return NextResponse.json({
      success: true,
      attribute: newAttribute,
      message: 'Attribute created successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Attribute creation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      attributes: attributes,
      message: 'Attributes retrieved successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve attributes' },
      { status: 500 }
    )
  }
}