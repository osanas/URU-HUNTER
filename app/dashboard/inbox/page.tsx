import { createClient } from '@/lib/supabase/server'
import { InboxClient } from './inbox-client'

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user's Twilio account
  const { data: twilioAccount } = await supabase
    .from('twilio_accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get phone numbers
  const { data: phoneNumbers } = await supabase
    .from('phone_numbers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get conversations with last message
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      phone_numbers (phone_number)
    `)
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false })

  return (
    <InboxClient
      twilioAccount={twilioAccount}
      phoneNumbers={phoneNumbers || []}
      conversations={conversations || []}
    />
  )
}
