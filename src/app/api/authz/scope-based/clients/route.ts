import { NextRequest, NextResponse } from 'next/server'

interface ClientApplication {
  id: string
  name: string
  description: string
  client_id: string
  client_secret?: string
  redirect_uris: string[]
  allowed_scopes: string[]
  default_scopes: string[]
  created_at: string
  updated_at: string
}

// In-memory storage for clients (in production, use a database)
const clients = new Map<string, ClientApplication>()

// Initialize with sample data
function initializeSampleClients() {
  if (clients.size === 0) {
    const sampleClients: ClientApplication[] = [
      {
        id: "client_web_app",
        name: "Web Application",
        description: "Main web application with full OAuth2 support",
        client_id: "web_app_123456",
        client_secret: "secret_web_app_789012",
        redirect_uris: [
          "https://app.example.com/auth/callback",
          "https://app.example.com/auth/silent-callback"
        ],
        allowed_scopes: [
          "read:basic",
          "read:email",
          "read:profile",
          "write:profile",
          "read:contacts",
          "read:location",
          "write:content"
        ],
        default_scopes: ["read:basic", "read:email", "read:profile"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "client_mobile_app",
        name: "Mobile Application",
        description: "iOS and Android mobile application",
        client_id: "mobile_app_234567",
        client_secret: "secret_mobile_app_890123",
        redirect_uris: [
          "com.example.mobile://oauth/callback",
          "com.example.mobile://auth/silent"
        ],
        allowed_scopes: [
          "read:basic",
          "read:email",
          "read:profile",
          "write:profile",
          "access:camera",
          "read:location",
          "read:payment"
        ],
        default_scopes: ["read:basic", "read:email", "read:profile"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "client_api_service",
        name: "API Service",
        description: "Backend service integration",
        client_id: "api_service_345678",
        client_secret: "secret_api_service_901234",
        redirect_uris: [
          "https://api.example.com/auth/callback"
        ],
        allowed_scopes: [
          "read:basic",
          "read:email",
          "read:profile",
          "read:contacts",
          "write:content",
          "admin:users"
        ],
        default_scopes: ["read:basic", "read:email"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "client_third_party",
        name: "Third Party Integration",
        description: "External partner application",
        client_id: "third_party_456789",
        client_secret: "secret_third_party_012345",
        redirect_uris: [
          "https://partner.example.com/oauth/callback"
        ],
        allowed_scopes: [
          "read:basic",
          "read:email",
          "read:profile"
        ],
        default_scopes: ["read:basic"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    sampleClients.forEach(client => {
      clients.set(client.id, client)
    })
  }
}

export async function GET() {
  try {
    initializeSampleClients()
    const clientList = Array.from(clients.values())
    
    return NextResponse.json({
      success: true,
      clients: clientList.sort((a, b) => a.name.localeCompare(b.name))
    })
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSampleClients()
    
    const body = await request.json()
    const { name, description, redirect_uris, allowed_scopes, default_scopes } = body

    if (!name || !description || !redirect_uris || !allowed_scopes) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, redirect_uris, allowed_scopes' },
        { status: 400 }
      )
    }

    const client: ClientApplication = {
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      client_id: `client_${Math.random().toString(36).substr(2, 16)}`,
      client_secret: `secret_${Math.random().toString(36).substr(2, 32)}`,
      redirect_uris,
      allowed_scopes,
      default_scopes: default_scopes || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    clients.set(client.id, client)

    return NextResponse.json({
      success: true,
      client,
      message: 'Client created successfully'
    })
  } catch (error) {
    console.error('Failed to create client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const existingClient = clients.get(id)
    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    const updatedClient: ClientApplication = {
      ...existingClient,
      ...updates,
      updated_at: new Date().toISOString()
    }

    clients.set(id, updatedClient)

    return NextResponse.json({
      success: true,
      client: updatedClient,
      message: 'Client updated successfully'
    })
  } catch (error) {
    console.error('Failed to update client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const existingClient = clients.get(id)
    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    clients.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}