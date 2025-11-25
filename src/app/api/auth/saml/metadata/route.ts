import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { spEntityId, acsUrl, sloUrl, certificate } = await request.json()

    // Generate SAML metadata XML
    const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor 
  xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  entityID="${spEntityId}"
  validUntil="${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}">
  
  <md:SPSSODescriptor 
    protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"
    AuthnRequestsSigned="true"
    WantAssertionsSigned="true">
    
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>${certificate || 'mock-certificate'}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    
    <md:KeyDescriptor use="encryption">
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>${certificate || 'mock-certificate'}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    
    <md:SingleLogoutService 
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
      Location="${sloUrl}"/>
      
    <md:SingleLogoutService 
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${sloUrl}"/>
      
    <md:AssertionConsumerService 
      index="0"
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${acsUrl}"/>
      
    <md:AssertionConsumerService 
      index="1"
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
      Location="${acsUrl}"/>
      
  </md:SPSSODescriptor>
  
  <md:Organization>
    <md:OrganizationName xml:lang="en">WebAuthn Playground</md:OrganizationName>
    <md:OrganizationDisplayName xml:lang="en">WebAuthn Playground</md:OrganizationDisplayName>
    <md:OrganizationURL xml:lang="en">https://localhost:3000</md:OrganizationURL>
  </md:Organization>
  
  <md:ContactPerson contactType="technical">
    <md:GivenName>Admin</md:GivenName>
    <md:SurName>User</md:SurName>
    <md:EmailAddress>admin@example.com</md:EmailAddress>
  </md:ContactPerson>
  
</md:EntityDescriptor>`.trim()

    return NextResponse.json({
      success: true,
      metadata: metadata,
      entityID: spEntityId,
      acsUrl: acsUrl,
      sloUrl: sloUrl,
      message: 'SAML metadata generated successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Metadata generation failed' },
      { status: 500 }
    )
  }
}