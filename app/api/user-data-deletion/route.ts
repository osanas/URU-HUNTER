import { createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PK_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const metaAppSecret = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(base64, 'base64').toString('utf-8')
}

function parseSignedRequest(signedRequest: string): { user_id?: string } | null {
  if (!metaAppSecret) {
    console.error('META_APP_SECRET not configured')
    return null
  }

  try {
    const [encodedSig, payload] = signedRequest.split('.', 2)
    if (!encodedSig || !payload) return null

    const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
    const data = JSON.parse(base64UrlDecode(payload))

    const expectedSig = createHmac('sha256', metaAppSecret)
      .update(payload)
      .digest()

    if (Buffer.compare(sig, expectedSig) !== 0) {
      console.error('Invalid signed request signature')
      return null
    }

    return data
  } catch (error) {
    console.error('Error parsing signed request:', error)
    return null
  }
}

/**
 * POST - Callback Meta pour les demandes de suppression de données
 * Meta envoie un POST avec signed_request contenant user_id (app-scoped Facebook ID)
 */
export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'https://votre-domaine.com'
  const appUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  const statusUrl = `${appUrl}/user-data-deletion`
  const confirmationCode = `del-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  try {
    const formData = await request.formData()
    const signedRequest = formData.get('signed_request') as string | null

    if (!signedRequest) {
      return NextResponse.json(
        { error: 'Missing signed_request' },
        { status: 400 }
      )
    }

    const data = parseSignedRequest(signedRequest)
    if (!data?.user_id) {
      return NextResponse.json(
        { error: 'Invalid signed request' },
        { status: 400 }
      )
    }

    const facebookUserId = data.user_id

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Trouver les meta_accounts avec ce facebook_user_id et supprimer les données
      const { data: metaAccounts } = await supabase
        .from('meta_accounts')
        .select('user_id')
        .eq('facebook_user_id', facebookUserId)

      if (metaAccounts && metaAccounts.length > 0) {
        const userIds = [...new Set(metaAccounts.map((a) => a.user_id))]

        for (const userId of userIds) {
          await supabase.from('meta_accounts').delete().eq('user_id', userId)
          await supabase.from('conversations').delete().eq('user_id', userId)
          await supabase.from('messages').delete().eq('user_id', userId)
          await supabase.from('phone_numbers').delete().eq('user_id', userId)
          await supabase.from('twilio_accounts').delete().eq('user_id', userId)
        }
      }

      console.log(`[Data Deletion] Processed request for Facebook user ${facebookUserId}, code: ${confirmationCode}`)
    }
  } catch (error) {
    console.error('Data deletion callback error:', error)
  }

  return NextResponse.json({
    url: statusUrl,
    confirmation_code: confirmationCode,
  })
}
