import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role key for webhook (no user context)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PK_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const formData = await request.formData()
    
    const messageSid = formData.get('MessageSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const body = formData.get('Body') as string
    const accountSid = formData.get('AccountSid') as string

    // Determine channel
    const isWhatsApp = from.startsWith('whatsapp:') || to.startsWith('whatsapp:')
    const channel = isWhatsApp ? 'whatsapp' : 'sms'

    // Clean phone numbers
    const cleanFrom = from.replace('whatsapp:', '')
    const cleanTo = to.replace('whatsapp:', '')

    // Find the phone number in our database
    const { data: phoneNumber } = await supabase
      .from('phone_numbers')
      .select('*, twilio_accounts!inner(user_id)')
      .eq('phone_number', cleanTo)
      .single()

    if (!phoneNumber) {
      console.error('Phone number not found:', cleanTo)
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const userId = phoneNumber.twilio_accounts.user_id

    // Find or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('phone_number_id', phoneNumber.id)
      .eq('contact_phone', cleanFrom)
      .eq('channel', channel)
      .single()

    if (!conversation) {
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          phone_number_id: phoneNumber.id,
          contact_phone: cleanFrom,
          channel: channel,
        })
        .select()
        .single()

      if (convError) {
        console.error('Failed to create conversation:', convError)
        return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
          headers: { 'Content-Type': 'text/xml' },
        })
      }

      conversation = newConversation
    }

    // Save message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        conversation_id: conversation.id,
        twilio_message_sid: messageSid,
        direction: 'inbound',
        body: body,
        status: 'received',
      })

    if (msgError) {
      console.error('Failed to save message:', msgError)
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id)

    // Return empty TwiML response
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}
