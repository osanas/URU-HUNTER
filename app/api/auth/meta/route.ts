import { NextRequest, NextResponse } from 'next/server'

const META_GRAPH_VERSION = 'v22.0'

/**
 * GET - Lance le flux OAuth Meta (Facebook)
 * Redirige l'utilisateur vers Facebook pour autoriser l'accès aux Pages
 */
export async function GET(request: NextRequest) {
  const metaAppId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID

  if (!metaAppId) {
    return NextResponse.json(
      { error: 'META_APP_ID non configuré' },
      { status: 500 }
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'
  const appUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  const redirectUri = `${appUrl}/api/auth/meta/callback`

  const scopes = [
    'pages_show_list',
    'pages_messaging',
    'pages_manage_metadata',
    'instagram_business_manage_messages',
    'instagram_business_basic',
  ].join(',')

  const authUrl = new URL(`https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth`)
  authUrl.searchParams.set('client_id', metaAppId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('response_type', 'code')

  return NextResponse.redirect(authUrl.toString())
}
