'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import {
  IconMessagePlus,
  IconPhone,
  IconBrandWhatsapp,
  IconSend,
  IconPlus,
  IconLoader2,
  IconUser,
  IconCheck,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  createTwilioSubaccount,
  createConversation,
  sendMessage,
  getMessages,
  searchPhoneNumbers,
  purchasePhoneNumber,
} from './actions'

interface TwilioAccount {
  id: string
  twilio_account_sid: string
  friendly_name: string
}

interface PhoneNumber {
  id: string
  phone_number: string
  friendly_name: string
  is_whatsapp_enabled: boolean
}

interface Conversation {
  id: string
  contact_phone: string
  contact_name: string | null
  channel: 'sms' | 'whatsapp'
  last_message_at: string
  phone_numbers: { phone_number: string }
}

interface Message {
  id: string
  body: string
  direction: 'inbound' | 'outbound'
  created_at: string
  status: string
}

interface InboxClientProps {
  twilioAccount: TwilioAccount | null
  phoneNumbers: PhoneNumber[]
  conversations: Conversation[]
}

export function InboxClient({ twilioAccount, phoneNumbers, conversations }: InboxClientProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newConversationOpen, setNewConversationOpen] = useState(false)
  const [buyNumberOpen, setBuyNumberOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async (conversationId: string) => {
    setLoadingMessages(true)
    const result = await getMessages(conversationId)
    if (result.messages) {
      setMessages(result.messages)
    }
    setLoadingMessages(false)
  }

  const handleConnectTwilio = () => {
    startTransition(async () => {
      const result = await createTwilioSubaccount()
      if (result.error) {
        alert(result.error)
      } else {
        window.location.reload()
      }
    })
  }

  const handleSendMessage = async (formData: FormData) => {
    if (!selectedConversation) return
    formData.append('conversationId', selectedConversation.id)
    
    startTransition(async () => {
      const result = await sendMessage(formData)
      if (result.error) {
        alert(result.error)
      } else {
        loadMessages(selectedConversation.id)
        const form = document.getElementById('message-form') as HTMLFormElement
        form?.reset()
      }
    })
  }

  // No Twilio account - show onboarding
  if (!twilioAccount) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Twilio</CardTitle>
            <CardDescription>
              Connect your Twilio account to start sending SMS and WhatsApp messages
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground text-center">
              We'll create a dedicated Twilio subaccount for your messaging needs. 
              You can then purchase phone numbers and start conversations.
            </p>
            <Button onClick={handleConnectTwilio} disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Twilio Account'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No phone numbers - show phone purchase flow
  if (phoneNumbers.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get a Phone Number</CardTitle>
            <CardDescription>
              Purchase a phone number to start sending messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BuyPhoneNumberForm onSuccess={() => window.location.reload()} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0">
      {/* Conversations List */}
      <div className="w-80 flex-shrink-0 border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Conversations</h2>
          <div className="flex gap-2">
            <Dialog open={buyNumberOpen} onOpenChange={setBuyNumberOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <IconPhone className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buy Phone Number</DialogTitle>
                  <DialogDescription>
                    Purchase a new phone number for messaging
                  </DialogDescription>
                </DialogHeader>
                <BuyPhoneNumberForm onSuccess={() => {
                  setBuyNumberOpen(false)
                  window.location.reload()
                }} />
              </DialogContent>
            </Dialog>
            <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
              <DialogTrigger asChild>
                <Button size="icon">
                  <IconMessagePlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                  <DialogDescription>
                    Start a new SMS or WhatsApp conversation
                  </DialogDescription>
                </DialogHeader>
                <NewConversationForm 
                  phoneNumbers={phoneNumbers} 
                  onSuccess={(conversation) => {
                    setNewConversationOpen(false)
                    setSelectedConversation(conversation)
                    window.location.reload()
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Click + to start a new conversation</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                    selectedConversation?.id === conversation.id && "bg-muted"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {conversation.channel === 'whatsapp' ? (
                        <IconBrandWhatsapp className="h-5 w-5 text-green-600" />
                      ) : (
                        <IconUser className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {conversation.contact_name || conversation.contact_phone}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {conversation.channel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conversation.phone_numbers.phone_number}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {/* Phone Numbers */}
        <div className="border-t p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Your Numbers</p>
          <div className="space-y-1">
            {phoneNumbers.map((number) => (
              <div key={number.id} className="text-sm flex items-center gap-2">
                <IconPhone className="h-3 w-3" />
                {number.phone_number}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {selectedConversation.channel === 'whatsapp' ? (
                  <IconBrandWhatsapp className="h-5 w-5 text-green-600" />
                ) : (
                  <IconUser className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {selectedConversation.contact_name || selectedConversation.contact_phone}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} • {selectedConversation.contact_phone}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No messages yet. Send the first message!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2",
                          message.direction === 'outbound'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <p className="text-sm">{message.body}</p>
                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                        )}>
                          <span className="text-xs opacity-70">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.direction === 'outbound' && (
                            <IconCheck className="h-3 w-3 opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form id="message-form" action={handleSendMessage} className="flex gap-2">
                <Input
                  name="body"
                  placeholder="Type a message..."
                  className="flex-1"
                  autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={isPending}>
                  {isPending ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconSend className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <IconMessagePlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Buy Phone Number Form Component
function BuyPhoneNumberForm({ onSuccess }: { onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [searchPending, setSearchPending] = useState(false)
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([])
  const [countryCode, setCountryCode] = useState('US')
  const [areaCode, setAreaCode] = useState('')

  const handleSearch = async () => {
    setSearchPending(true)
    const result = await searchPhoneNumbers(countryCode, areaCode || undefined)
    if (result.numbers) {
      setAvailableNumbers(result.numbers.slice(0, 10))
    } else if (result.error) {
      alert(result.error)
    }
    setSearchPending(false)
  }

  const handlePurchase = (phoneNumber: string) => {
    startTransition(async () => {
      // Pass the current URL as base for webhook configuration
      const baseUrl = window.location.origin
      const result = await purchasePhoneNumber(phoneNumber, baseUrl)
      if (result.error) {
        alert(result.error)
      } else {
        onSuccess()
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="countryCode">Country</Label>
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="GB">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="areaCode">Area Code (optional)</Label>
          <Input
            id="areaCode"
            placeholder="e.g. 415"
            value={areaCode}
            onChange={(e) => setAreaCode(e.target.value)}
          />
        </div>
      </div>
      
      <Button onClick={handleSearch} disabled={searchPending} className="w-full">
        {searchPending ? (
          <>
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          'Search Available Numbers'
        )}
      </Button>

      {availableNumbers.length > 0 && (
        <div className="space-y-2">
          <Label>Available Numbers</Label>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableNumbers.map((number) => (
              <div
                key={number.phone_number}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{number.friendly_name}</p>
                  <p className="text-xs text-muted-foreground">{number.locality}, {number.region}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handlePurchase(number.phone_number)}
                  disabled={isPending}
                >
                  {isPending ? <IconLoader2 className="h-4 w-4 animate-spin" /> : 'Buy'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// New Conversation Form Component
function NewConversationForm({ 
  phoneNumbers, 
  onSuccess 
}: { 
  phoneNumbers: PhoneNumber[]
  onSuccess: (conversation: Conversation) => void 
}) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createConversation(formData)
      if (result.error) {
        alert(result.error)
      } else if (result.conversation) {
        onSuccess(result.conversation as Conversation)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="phoneNumberId">From Number</Label>
        <Select name="phoneNumberId" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a phone number" />
          </SelectTrigger>
          <SelectContent>
            {phoneNumbers.map((number) => (
              <SelectItem key={number.id} value={number.id}>
                {number.phone_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="contactPhone">To Phone Number</Label>
        <Input
          id="contactPhone"
          name="contactPhone"
          placeholder="+1234567890"
          required
        />
      </div>

      <div>
        <Label htmlFor="contactName">Contact Name (optional)</Label>
        <Input
          id="contactName"
          name="contactName"
          placeholder="John Doe"
        />
      </div>

      <div>
        <Label htmlFor="channel">Channel</Label>
        <Select name="channel" required>
          <SelectTrigger>
            <SelectValue placeholder="Select channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sms">
              <div className="flex items-center gap-2">
                <IconPhone className="h-4 w-4" />
                SMS
              </div>
            </SelectItem>
            <SelectItem value="whatsapp">
              <div className="flex items-center gap-2">
                <IconBrandWhatsapp className="h-4 w-4 text-green-600" />
                WhatsApp
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Start Conversation'
        )}
      </Button>
    </form>
  )
}
