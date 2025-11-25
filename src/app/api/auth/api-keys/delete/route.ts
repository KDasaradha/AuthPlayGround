import { NextRequest, NextResponse } from 'next/server'

// Global API key store (shared across routes)
declare global {
  var __apiKeyStore: Map<string, any> | undefined
}

if (!global.__apiKeyStore) {
  global.__apiKeyStore = new Map()
}

const apiKeyStore = global.__apiKeyStore

export async function DELETE(request: NextRequest) {
  try {
    const { keyId } = await request.json()

    if (!keyId) {
      return NextResponse.json(
        { success: false, message: 'Key ID is required' },
        { status: 400 }
      )
    }

    // Find and delete the API key
    let deletedKey = null
    for (const [apiKey, keyData] of apiKeyStore.entries()) {
      if (keyData.id === keyId) {
        deletedKey = keyData
        apiKeyStore.delete(apiKey)
        break
      }
    }

    if (!deletedKey) {
      return NextResponse.json(
        { success: false, message: 'API key not found' },
        { status: 404 }
      )
    }

    console.log(`API key deleted: ${deletedKey.name} (${keyId})`)

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
      data: {
        deletedKey: {
          id: deletedKey.id,
          name: deletedKey.name
        }
      }
    })

  } catch (error) {
    console.error('API key delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}