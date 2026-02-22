import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PK_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const META_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN

/**
 * GET - Vérification du webhook par Meta
 * Meta envoie hub.mode, hub.verify_token, hub.challenge
 * On doit retourner hub.challenge si le verify_token correspond
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

/**
 * POST - Réception des événements (messages, etc.) de Meta
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Meta envoie un objet avec une entrée "entry"
    if (body.object !== 'page' && body.object !== 'instagram') {
      return NextResponse.json({ received: true })
    }

    for (const entry of body.entry || []) {
      const pageId = entry.id
      const timestamp = entry.time

      for (const event of entry.messaging || []) {
        const senderId = event.sender?.id
        const recipientId = event.recipient?.id
        const message = event.message
        const postback = event.postback

        if (message) {
          const messageId = message.mid
          const text = message.text
          const attachments = message.attachments

          // TODO: Sauvegarder en base de données (meta_conversations, meta_messages)
          // Pour l'instant on log - à implémenter quand les tables seront prêtes
          if (supabaseUrl && supabaseServiceKey) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey)

            // Trouver le meta_account correspondant au pageId
            const { data: metaAccount } = await supabase
              .from('meta_accounts')
              .select('user_id, id')
              .eq('page_id', pageId)
              .single()

            if (metaAccount) {
              // Note: Des tables meta_conversations et meta_messages seront nécessaires
              // pour stocker les conversations comme pour Twilio
              console.log('[Meta Webhook]', { pageId, senderId, text, userId: metaAccount.user_id })
            }
          } else {
            console.log('[Meta Webhook]', { pageId, senderId, text })
          }
        }

        if (postback) {
          console.log('[Meta Webhook Postback]', { pageId, senderId, postback })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Meta webhook error:', error)
    return NextResponse.json({ received: true }) // Toujours retourner 200 pour Meta
  }
}
