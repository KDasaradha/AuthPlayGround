import { NextRequest, NextResponse } from 'next/server'

interface AuthMethod {
  id: string
  name: string
  type: "jwt" | "session" | "oauth2" | "webauthn" | "passwordless" | "totp" | "sms_otp" | "email_otp" | "magic_link" | "api_keys"
  description: string
  enabled: boolean
  required: boolean
  priority: number
  config: Record<string, any>
  icon: string
  color: string
}

// In-memory storage for auth methods (in production, use a database)
const authMethods = new Map<string, AuthMethod>()

// Initialize with sample data
function initializeSampleMethods() {
  if (authMethods.size === 0) {
    const sampleMethods: AuthMethod[] = [
      {
        id: "method_jwt",
        name: "JWT Authentication",
        type: "jwt",
        description: "JSON Web Token based authentication with secure token management",
        enabled: true,
        required: true,
        priority: 1,
        config: {
          secret_key: "your-secret-key",
          algorithm: "HS256",
          expires_in: 3600,
          refresh_token_enabled: true,
          refresh_token_expires_in: 86400
        },
        icon: "key",
        color: "blue"
      },
      {
        id: "method_session",
        name: "Session Authentication",
        type: "session",
        description: "Traditional server-side session management with secure cookies",
        enabled: true,
        required: false,
        priority: 2,
        config: {
          secret: "session-secret",
          max_age: 86400,
          secure: true,
          http_only: true,
          same_site: "strict"
        },
        icon: "monitor",
        color: "green"
      },
      {
        id: "method_oauth2",
        name: "OAuth2 Authentication",
        type: "oauth2",
        description: "OAuth2 integration for third-party authentication providers",
        enabled: true,
        required: false,
        priority: 3,
        config: {
          providers: ["google", "github", "microsoft", "facebook"],
          client_id: "oauth-client-id",
          client_secret: "oauth-client-secret",
          redirect_uri: "http://localhost:3000/auth/callback"
        },
        icon: "globe",
        color: "purple"
      },
      {
        id: "method_webauthn",
        name: "WebAuthn (FIDO2)",
        type: "webauthn",
        description: "Passwordless authentication using biometrics and security keys",
        enabled: true,
        required: false,
        priority: 4,
        config: {
          rp_id: "localhost",
          rp_name: "Auth System",
          user_verification: "preferred",
          authenticator_attachment: "platform"
        },
        icon: "fingerprint",
        color: "orange"
      },
      {
        id: "method_passwordless",
        name: "Passwordless Login",
        type: "passwordless",
        description: "Magic link and one-time password authentication",
        enabled: true,
        required: false,
        priority: 5,
        config: {
          magic_link_enabled: true,
          otp_enabled: true,
          otp_length: 6,
          otp_expires_in: 300
        },
        icon: "smartphone",
        color: "pink"
      },
      {
        id: "method_totp",
        name: "Time-based OTP",
        type: "totp",
        description: "Two-factor authentication using TOTP apps",
        enabled: true,
        required: false,
        priority: 6,
        config: {
          issuer: "Auth System",
          digits: 6,
          period: 30,
          window: 1
        },
        icon: "clock",
        color: "indigo"
      },
      {
        id: "method_sms_otp",
        name: "SMS OTP",
        type: "sms_otp",
        description: "One-time passwords sent via SMS",
        enabled: false,
        required: false,
        priority: 7,
        config: {
          provider: "twilio",
          from_number: "+1234567890",
          template: "Your verification code is: {code}"
        },
        icon: "phone",
        color: "yellow"
      },
      {
        id: "method_email_otp",
        name: "Email OTP",
        type: "email_otp",
        description: "One-time passwords sent via email",
        enabled: true,
        required: false,
        priority: 8,
        config: {
          provider: "sendgrid",
          from_email: "noreply@example.com",
          template: "Your verification code is: {code}"
        },
        icon: "mail",
        color: "cyan"
      },
      {
        id: "method_magic_link",
        name: "Magic Link",
        type: "magic_link",
        description: "Passwordless login using magic email links",
        enabled: true,
        required: false,
        priority: 9,
        config: {
          expires_in: 900,
          single_use: true,
          template: "Click here to login: {link}"
        },
        icon: "message-square",
        color: "teal"
      },
      {
        id: "method_api_keys",
        name: "API Keys",
        type: "api_keys",
        description: "API key authentication for programmatic access",
        enabled: true,
        required: false,
        priority: 10,
        config: {
          key_length: 32,
          prefix: "sk_",
          expires_in: 31536000
        },
        icon: "key-round",
        color: "gray"
      }
    ]

    sampleMethods.forEach(method => {
      authMethods.set(method.id, method)
    })
  }
}

export async function GET() {
  try {
    initializeSampleMethods()
    const methodList = Array.from(authMethods.values())
    
    return NextResponse.json({
      success: true,
      methods: methodList.sort((a, b) => a.priority - b.priority)
    })
  } catch (error) {
    console.error('Failed to fetch auth methods:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auth methods' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeSampleMethods()
    
    const body = await request.json()
    const { name, type, description, enabled, required, priority, config } = body

    if (!name || !type || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, type, description' },
        { status: 400 }
      )
    }

    const method: AuthMethod = {
      id: `method_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      description,
      enabled: enabled !== false,
      required: required || false,
      priority: priority || 100,
      config: config || {},
      icon: getIconForType(type),
      color: getColorForType(type)
    }

    authMethods.set(method.id, method)

    return NextResponse.json({
      success: true,
      method,
      message: 'Authentication method created successfully'
    })
  } catch (error) {
    console.error('Failed to create auth method:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create auth method' },
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
        { success: false, error: 'Method ID is required' },
        { status: 400 }
      )
    }

    const existingMethod = authMethods.get(id)
    if (!existingMethod) {
      return NextResponse.json(
        { success: false, error: 'Authentication method not found' },
        { status: 404 }
      )
    }

    const updatedMethod: AuthMethod = {
      ...existingMethod,
      ...updates
    }

    authMethods.set(id, updatedMethod)

    return NextResponse.json({
      success: true,
      method: updatedMethod,
      message: 'Authentication method updated successfully'
    })
  } catch (error) {
    console.error('Failed to update auth method:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update auth method' },
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
        { success: false, error: 'Method ID is required' },
        { status: 400 }
      )
    }

    const existingMethod = authMethods.get(id)
    if (!existingMethod) {
      return NextResponse.json(
        { success: false, error: 'Authentication method not found' },
        { status: 404 }
      )
    }

    authMethods.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Authentication method deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete auth method:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete auth method' },
      { status: 500 }
    )
  }
}

function getIconForType(type: string): string {
  const iconMap: Record<string, string> = {
    jwt: "key",
    session: "monitor",
    oauth2: "globe",
    webauthn: "fingerprint",
    passwordless: "smartphone",
    totp: "clock",
    sms_otp: "phone",
    email_otp: "mail",
    magic_link: "message-square",
    api_keys: "key-round"
  }
  return iconMap[type] || "shield"
}

function getColorForType(type: string): string {
  const colorMap: Record<string, string> = {
    jwt: "blue",
    session: "green",
    oauth2: "purple",
    webauthn: "orange",
    passwordless: "pink",
    totp: "indigo",
    sms_otp: "yellow",
    email_otp: "cyan",
    magic_link: "teal",
    api_keys: "gray"
  }
  return colorMap[type] || "gray"
}