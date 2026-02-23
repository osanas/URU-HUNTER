import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const META_GRAPH_VERSION = 'v22.0'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Utiliser l'origin de la requête en priorité (pour le dev local)
  const requestOrigin = request.nextUrl.origin
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || requestOrigin
  const appUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  const chatUrl = `${appUrl}/dashboard/chat`

  if (error) {
    console.error('Meta OAuth error:', error)
    return NextResponse.redirect(`${chatUrl}?meta_error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${chatUrl}?meta_error=missing_code`)
  }

  const metaAppId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID
  const metaAppSecret = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET

  if (!metaAppId || !metaAppSecret) {
    console.error('Missing META_APP_ID or META_APP_SECRET')
    return NextResponse.redirect(`${chatUrl}?meta_error=server_config`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${chatUrl}?meta_error=not_authenticated`)
  }

  try {
    // 1. Échanger le code contre un User Access Token
    const tokenUrl = new URL(`https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token`)
    tokenUrl.searchParams.set('client_id', metaAppId)
    tokenUrl.searchParams.set('client_secret', metaAppSecret)
    tokenUrl.searchParams.set('redirect_uri', `${appUrl}/api/auth/meta/callback`)
    tokenUrl.searchParams.set('code', code)

    const tokenResponse = await fetch(tokenUrl.toString())

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Meta token exchange error:', tokenData.error)
      return NextResponse.redirect(`${chatUrl}?meta_error=token_exchange`)
    }

    const userAccessToken = tokenData.access_token

    // 2. Récupérer l'ID Facebook de l'utilisateur (pour le callback de suppression)
    const meResponse = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/me?fields=id&access_token=${userAccessToken}`
    )
    const meData = await meResponse.json()
    const facebookUserId = meData.id || null

    // 3. Récupérer les Pages Facebook de l'utilisateur
    const pagesResponse = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/me/accounts?fields=id,name,access_token,tasks&access_token=${userAccessToken}`
    )
    const pagesData = await pagesResponse.json()

    if (pagesData.error || !pagesData.data?.length) {
      console.error('Meta pages fetch error:', pagesData.error || 'No pages found')
      return NextResponse.redirect(`${chatUrl}?meta_error=no_pages`)
    }

    // 4. Pour chaque Page, vérifier si Instagram est lié et sauvegarder
    for (const page of pagesData.data) {
      if (!page.tasks?.includes('MESSAGING')) continue

      let instagramAccountId: string | null = null
      let instagramUsername: string | null = null

      try {
        const igResponse = await fetch(
          `https://graph.facebook.com/${META_GRAPH_VERSION}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        )
        const igData = await igResponse.json()
        if (igData.instagram_business_account?.id) {
          instagramAccountId = igData.instagram_business_account.id
          const igProfileResponse = await fetch(
            `https://graph.facebook.com/${META_GRAPH_VERSION}/${instagramAccountId}?fields=username&access_token=${page.access_token}`
          )
          const igProfile = await igProfileResponse.json()
          instagramUsername = igProfile.username || null
        }
      } catch {
        // Page sans Instagram lié
      }

      const { error: upsertError } = await supabase.from('meta_accounts').upsert(
        {
          user_id: user.id,
          platform: 'facebook',
          page_id: page.id,
          page_name: page.name,
          access_token: page.access_token,
          facebook_user_id: facebookUserId,
          instagram_account_id: instagramAccountId,
          instagram_username: instagramUsername,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,page_id', ignoreDuplicates: false }
      )

      if (upsertError) {
        console.error('Meta account upsert error:', upsertError)
      }
    }

    return NextResponse.redirect(`${chatUrl}?meta_connected=true`)
  } catch (err) {
    console.error('Meta callback error:', err)
    return NextResponse.redirect(`${chatUrl}?meta_error=unknown`)
  }
}
