import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { spEntityId, acsUrl, attributes } = await request.json()

    // Generate SAML AuthnRequest
    const requestId = `id_${Math.random().toString(36).substring(2, 15)}`
    const timestamp = new Date().toISOString()
    
    // Create SAML request structure
    const samlRequest = `
      <samlp:AuthnRequest 
        xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
        xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
        ID="${requestId}"
        Version="2.0"
        IssueInstant="${timestamp}"
        Destination="https://idp.example.com/sso"
        AssertionConsumerServiceURL="${acsUrl}">
        
        <saml:Issuer>${spEntityId}</saml:Issuer>
        
        <samlp:NameIDPolicy 
          Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
          AllowCreate="true"/>
          
        <samlp:RequestedAuthnContext 
          Comparison="minimum"
          Reference="urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport"/>
          
        ${attributes.map(attr => `
          <saml:AttributeRequirement 
            Name="${attr}"
            NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic"/>
        `).join('')}
        
      </samlp:AuthnRequest>
    `.trim()

    // Base64 encode the SAML request
    const encodedRequest = Buffer.from(samlRequest).toString('base64')

    return NextResponse.json({
      success: true,
      samlRequest: encodedRequest,
      requestId: requestId,
      timestamp: timestamp,
      rawRequest: samlRequest,
      message: 'SAML request generated successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Request generation failed' },
      { status: 500 }
    )
  }
}