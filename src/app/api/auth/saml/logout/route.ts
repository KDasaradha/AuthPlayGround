import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { spEntityId, sloUrl } = await request.json()

    // Generate SAML LogoutRequest
    const logoutRequestId = `id_${Math.random().toString(36).substring(2, 15)}`
    const timestamp = new Date().toISOString()
    
    // Create SAML logout request
    const logoutRequest = `
      <samlp:LogoutRequest 
        xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
        ID="${logoutRequestId}"
        Version="2.0"
        IssueInstant="${timestamp}"
        Destination="https://idp.example.com/slo">
        
        <saml:Issuer>${spEntityId}</saml:Issuer>
        <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
          user@example.com
        </saml:NameID>
        <samlp:SessionIndex>sess_${Math.random().toString(36).substring(2, 15)}</samlp:SessionIndex>
        
      </samlp:LogoutRequest>
    `.trim()

    // Base64 encode the logout request
    const encodedLogoutRequest = Buffer.from(logoutRequest).toString('base64')

    return NextResponse.json({
      success: true,
      logoutRequest: encodedLogoutRequest,
      logoutRequestId: logoutRequestId,
      timestamp: timestamp,
      rawRequest: logoutRequest,
      logoutUrl: `${sloUrl}?SAMLRequest=${encodedLogoutRequest}`,
      message: 'SAML Single Logout initiated successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Logout initiation failed' },
      { status: 500 }
    )
  }
}