import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  isVapidConfigured,
  normalizeSubscription,
  sendWebPushToSubscriptions,
  type StoredPushSubscription,
} from '@/lib/push/webpush'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: profile } = (await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()) as { data: { is_admin: boolean } | null }

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { titre, message, type, matchId, lien } = await request.json()

    if (!titre || !message || !type) {
      return NextResponse.json(
        { error: 'Titre, message et type requis' },
        { status: 400 }
      )
    }

    const { data: users, error: usersError } = (await supabase
      .from('profiles')
      .select('id')) as { data: { id: string }[] | null; error: { message: string } | null }

    if (usersError) {
      console.error('Erreur récupération utilisateurs:', usersError)
      return NextResponse.json(
        {
          error: 'Erreur récupération utilisateurs',
          details: usersError.message,
        },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Aucun utilisateur trouvé', count: 0 },
        { status: 404 }
      )
    }

    const notificationLien = lien || (matchId ? `/matchs/${matchId}` : null)

    const notifications = users.map((u) => ({
      user_id: u.id,
      titre,
      message,
      type,
      lien: notificationLien,
    }))

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications as any)

    if (notifError) {
      console.error('Erreur insertion notifications:', notifError)
      return NextResponse.json(
        {
          error: 'Échec envoi notifications',
          details: notifError.message,
        },
        { status: 500 }
      )
    }

    // Also send real web push notifications when VAPID is configured
    let push = {
      sent: 0,
      failed: 0,
      total: 0,
      cleaned: 0,
      skipped: !isVapidConfigured(),
    }

    if (isVapidConfigured()) {
      const { data: rows, error: pushFetchError } = await (supabase as any)
        .from('push_subscriptions')
        .select('subscription, subscription_endpoint')

      if (pushFetchError) {
        console.error('Erreur lecture push_subscriptions:', pushFetchError)
      } else {
        const subscriptions: StoredPushSubscription[] = []
        for (const row of rows || []) {
          const sub = normalizeSubscription(row.subscription)
          if (sub) subscriptions.push(sub)
        }

        push.total = subscriptions.length

        if (subscriptions.length > 0) {
          const result = await sendWebPushToSubscriptions(subscriptions, {
            title: titre,
            body: message,
            type,
            matchId,
            url: notificationLien || '/',
          })
          push.sent = result.sent
          push.failed = result.failed

          if (result.staleEndpoints.length > 0) {
            await (supabase as any)
              .from('push_subscriptions')
              .delete()
              .in('subscription_endpoint', result.staleEndpoints)
            push.cleaned = result.staleEndpoints.length
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: notifications.length,
      push,
    })
  } catch (error) {
    console.error('Erreur API notifications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
