'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!

// Create a Twilio subaccount for a user
export async function createTwilioSubaccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if user already has a Twilio account
  const { data: existingAccount } = await supabase
    .from('twilio_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (existingAccount) {
    return { error: 'You already have a Twilio account connected' }
  }

  try {
    // Create subaccount via Twilio API
    const response = await fetch('https://api.twilio.com/2010-04-01/Accounts.json', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        FriendlyName: `User-${user.id.slice(0, 8)}`,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || 'Failed to create Twilio subaccount' }
    }

    const twilioAccount = await response.json()

    // Save to database
    const { error: dbError } = await supabase
      .from('twilio_accounts')
      .insert({
        user_id: user.id,
        twilio_account_sid: twilioAccount.sid,
        twilio_auth_token: twilioAccount.auth_token,
        friendly_name: twilioAccount.friendly_name,
      })

    if (dbError) {
      return { error: 'Failed to save Twilio account' }
    }

    revalidatePath('/dashboard/chat')
    return { success: true, account: twilioAccount }
  } catch (error) {
    console.error('Twilio error:', error)
    return { error: 'Failed to connect to Twilio' }
  }
}

// Get user's Twilio account
export async function getTwilioAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('twilio_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { error: 'Failed to fetch Twilio account' }
  }

  return { account: data }
}

// Search available phone numbers
export async function searchPhoneNumbers(countryCode: string = 'US', areaCode?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: twilioAccount } = await supabase
    .from('twilio_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!twilioAccount) {
    return { error: 'No Twilio account found. Please connect your account first.' }
  }

  try {
    let url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccount.twilio_account_sid}/AvailablePhoneNumbers/${countryCode}/Local.json?SmsEnabled=true&VoiceEnabled=true`
    
    if (areaCode) {
      url += `&AreaCode=${areaCode}`
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${twilioAccount.twilio_account_sid}:${twilioAccount.twilio_auth_token}`).toString('base64'),
      },
    })

    if (!response.ok) {
      return { error: 'Failed to search phone numbers' }
    }

    const data = await response.json()
    return { numbers: data.available_phone_numbers || [] }
  } catch (error) {
    return { error: 'Failed to connect to Twilio' }
  }
}

// Purchase a phone number with automatic webhook configuration
export async function purchasePhoneNumber(phoneNumber: string, baseUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: twilioAccount } = await supabase
    .from('twilio_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!twilioAccount) {
    return { error: 'No Twilio account found' }
  }

  // Get the webhook URL - use provided baseUrl or environment variable
  const webhookBaseUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
  const webhookUrl = webhookBaseUrl ? `${webhookBaseUrl.startsWith('http') ? webhookBaseUrl : `https://${webhookBaseUrl}`}/api/twilio/webhook` : null

  try {
    // Build request body with webhook URLs if available
    const bodyParams: Record<string, string> = {
      PhoneNumber: phoneNumber,
    }

    // Configure webhooks automatically if we have a URL
    if (webhookUrl) {
      bodyParams.SmsUrl = webhookUrl
      bodyParams.SmsMethod = 'POST'
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccount.twilio_account_sid}/IncomingPhoneNumbers.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioAccount.twilio_account_sid}:${twilioAccount.twilio_auth_token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(bodyParams),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || 'Failed to purchase phone number' }
    }

    const purchasedNumber = await response.json()

    // Save to database
    const { error: dbError } = await supabase
      .from('phone_numbers')
      .insert({
        user_id: user.id,
        twilio_account_id: twilioAccount.id,
        phone_number: purchasedNumber.phone_number,
        phone_sid: purchasedNumber.sid,
        friendly_name: purchasedNumber.friendly_name,
        capabilities: purchasedNumber.capabilities,
      })

    if (dbError) {
      return { error: 'Failed to save phone number' }
    }

    revalidatePath('/dashboard/chat')
    return { success: true, number: purchasedNumber, webhookConfigured: !!webhookUrl }
  } catch (error) {
    return { error: 'Failed to purchase phone number' }
  }
}

// Update webhook URL for an existing phone number
export async function updatePhoneNumberWebhook(phoneSid: string, webhookUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: twilioAccount } = await supabase
    .from('twilio_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!twilioAccount) {
    return { error: 'No Twilio account found' }
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccount.twilio_account_sid}/IncomingPhoneNumbers/${phoneSid}.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioAccount.twilio_account_sid}:${twilioAccount.twilio_auth_token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          SmsUrl: webhookUrl,
          SmsMethod: 'POST',
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || 'Failed to update webhook' }
    }

    return { success: true }
  } catch (error) {
    return { error: 'Failed to update webhook' }
  }
}

// Get user's phone numbers
export async function getPhoneNumbers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('phone_numbers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: 'Failed to fetch phone numbers' }
  }

  return { numbers: data || [] }
}

// Get conversations
export async function getConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      phone_numbers (phone_number),
      messages (id, body, direction, created_at, status)
    `)
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false })

  if (error) {
    return { error: 'Failed to fetch conversations' }
  }

  return { conversations: data || [] }
}

// Get messages for a conversation
export async function getMessages(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: 'Failed to fetch messages' }
  }

  return { messages: data || [] }
}

// Send a message
export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const conversationId = formData.get('conversationId') as string
  const body = formData.get('body') as string

  if (!conversationId || !body) {
    return { error: 'Missing required fields' }
  }

  // Get conversation details
  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      *,
      phone_numbers (phone_number, twilio_account_id),
      twilio_accounts:phone_numbers(twilio_account_id(twilio_account_sid, twilio_auth_token))
    `)
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!conversation) {
    return { error: 'Conversation not found' }
  }

  // Get Twilio account
  const { data: twilioAccount } = await supabase
    .from('twilio_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!twilioAccount) {
    return { error: 'No Twilio account found' }
  }

  try {
    // Format the To number based on channel
    let toNumber = conversation.contact_phone
    if (conversation.channel === 'whatsapp') {
      toNumber = `whatsapp:${conversation.contact_phone}`
    }

    let fromNumber = conversation.phone_numbers.phone_number
    if (conversation.channel === 'whatsapp') {
      fromNumber = `whatsapp:${fromNumber}`
    }

    // Send via Twilio
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccount.twilio_account_sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioAccount.twilio_account_sid}:${twilioAccount.twilio_auth_token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: toNumber,
          From: fromNumber,
          Body: body,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.message || 'Failed to send message' }
    }

    const twilioMessage = await response.json()

    // Save message to database
    const { data: message, error: dbError } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        twilio_message_sid: twilioMessage.sid,
        direction: 'outbound',
        body: body,
        status: twilioMessage.status,
      })
      .select()
      .single()

    if (dbError) {
      return { error: 'Failed to save message' }
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    revalidatePath('/dashboard/chat')
    return { success: true, message }
  } catch (error) {
    return { error: 'Failed to send message' }
  }
}

// Create a new conversation
export async function createConversation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const phoneNumberId = formData.get('phoneNumberId') as string
  const contactPhone = formData.get('contactPhone') as string
  const contactName = formData.get('contactName') as string
  const channel = formData.get('channel') as 'sms' | 'whatsapp'

  if (!phoneNumberId || !contactPhone || !channel) {
    return { error: 'Missing required fields' }
  }

  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .eq('phone_number_id', phoneNumberId)
    .eq('contact_phone', contactPhone)
    .eq('channel', channel)
    .single()

  if (existing) {
    return { conversation: existing }
  }

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      phone_number_id: phoneNumberId,
      contact_phone: contactPhone,
      contact_name: contactName || null,
      channel: channel,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Failed to create conversation' }
  }

  revalidatePath('/dashboard/chat')
  return { conversation }
}
