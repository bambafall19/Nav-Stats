import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isVapidConfigured,
  normalizeSubscription,
  sendWebPushToSubscriptions,
  type StoredPushSubscription,
} from '@/lib/push/webpush'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) }
  }

  const { data: profile } = (await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()) as { data: { is_admin: boolean } | null }

  if (!profile?.is_admin) {
    return { error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) }
  }

  return { supabase, user }
}

/**
 * POST — save a push subscription for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const subscription = normalizeSubscription(body.subscription ?? body)

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription invalide (endpoint + keys requis)' },
        { status: 400 }
      )
    }

    const userAgent =
      typeof body.userAgent === 'string'
        ? body.userAgent
        : request.headers.get('user-agent')

    const { data, error } = await (supabase as any)
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          subscription,
          subscription_endpoint: subscription.endpoint,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'subscription_endpoint' }
      )
      .select()

    if (error) {
      console.error('Erreur enregistrement push subscription:', String(error.message).replace(/[\r\n]/g, ' '))
      return NextResponse.json(
        { error: 'Échec enregistrement' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription enregistrée',
      data,
    })
  } catch (error) {
    console.error('Erreur enregistrement push:', error instanceof Error ? error.message.replace(/[\r\n]/g, ' ') : 'Unknown error')
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * PUT — send a web push to all (or selected) subscribers (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth && auth.error) return auth.error
    const { supabase } = auth as {
      supabase: Awaited<ReturnType<typeof createClient>>
    }

    const body = await request.json()
    const { titre, message, type, matchId, lien, userIds } = body as {
      titre?: string
      message?: string
      type?: string
      matchId?: string
      lien?: string
      userIds?: string[]
    }

    if (!titre || !message) {
      return NextResponse.json(
        { error: 'Titre et message requis' },
        { status: 400 }
      )
    }

    if (!isVapidConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'VAPID non configuré. Ajoutez NEXT_PUBLIC_VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY (Vercel / .env.local).',
          sent: 0,
          total: 0,
        },
        { status: 503 }
      )
    }

    let query = (supabase as any)
      .from('push_subscriptions')
      .select('subscription, subscription_endpoint, user_id')

    if (Array.isArray(userIds) && userIds.length > 0) {
      query = query.in('user_id', userIds)
    }

    const { data: rows, error: fetchError } = await query

    if (fetchError) {
      console.error('Erreur lecture push_subscriptions:', String(fetchError.message).replace(/[\r\n]/g, ' '))
      return NextResponse.json(
        { error: 'Impossible de lire les abonnements push' },
        { status: 500 }
      )
    }

    const subscriptions: StoredPushSubscription[] = []
    for (const row of rows || []) {
      const sub = normalizeSubscription(row.subscription)
      if (sub) subscriptions.push(sub)
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        total: 0,
        message: 'Aucun abonnement push enregistré',
      })
    }

    const url = lien || (matchId ? `/matchs/${matchId}` : '/')
    const result = await sendWebPushToSubscriptions(subscriptions, {
      title: titre,
      body: message,
      type,
      matchId,
      url,
    })

    // Remove expired subscriptions
    if (result.staleEndpoints.length > 0) {
      await (supabase as any)
        .from('push_subscriptions')
        .delete()
        .in('subscription_endpoint', result.staleEndpoints)
    }

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      total: subscriptions.length,
      cleaned: result.staleEndpoints.length,
    })
  } catch (error) {
    console.error('Erreur envoi push:', error instanceof Error ? error.message.replace(/[\r\n]/g, ' ') : 'Unknown error')
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    vapid: isVapidConfigured(),
  })
}
