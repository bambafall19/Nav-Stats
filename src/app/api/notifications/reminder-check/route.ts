import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  normalizeSubscription,
  sendWebPushToSubscriptions,
  type StoredPushSubscription,
} from '@/lib/push/webpush'

/**
 * Check the current user's due match reminders and send a web push.
 * Called periodically by the client (see MatchNotificationService).
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: true, sent: 0, checked: 0 })
    }

    const now = new Date().toISOString()

    // Due + unsent reminders for this user
    const { data: reminders, error: remError } = await (supabase as any)
      .from('match_reminders')
      .select('id, match_id, remind_at')
      .eq('user_id', user.id)
      .eq('sent', false)
      .lte('remind_at', now)
      .limit(20)

    if (remError) {
      console.error('Erreur lecture rappels dus:', String(remError.message).replace(/[\r\n]/g, ' '))
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ success: true, sent: 0, checked: 0 })
    }

    // Gather match details for nicer messages
    const matchIds = reminders.map((r: { match_id: string }) => r.match_id)
    const { data: matchs } = await (supabase as any)
      .from('matchs')
      .select('id, heure_match, equipe_a:equipes!matchs_equipe_a_id_fkey(nom), equipe_b:equipes!matchs_equipe_b_id_fkey(nom)')
      .in('id', matchIds)

    const matchById: Record<string, { heure_match: string; equipe_a: { nom: string } | null; equipe_b: { nom: string } | null }> = {}
    ;(matchs || []).forEach((m: { id: string; heure_match: string; equipe_a: { nom: string } | null; equipe_b: { nom: string } | null }) => {
      matchById[m.id] = m
    })

    // Load the user's push subscriptions
    const { data: subs, error: subsError } = await (supabase as any)
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', user.id)

    if (subsError) {
      console.error('Erreur lecture abonnements:', String(subsError.message).replace(/[\r\n]/g, ' '))
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    const subscriptions: StoredPushSubscription[] = []
    for (const row of subs || []) {
      const sub = normalizeSubscription(row.subscription)
      if (sub) subscriptions.push(sub)
    }

    let sent = 0
    let failed = 0

    for (const reminder of reminders) {
      const m = matchById[reminder.match_id]
      const teamA = m?.equipe_a?.nom || 'Équipe A'
      const teamB = m?.equipe_b?.nom || 'Équipe B'
      const heure = m?.heure_match?.slice(0, 5) || ''

      const payload = {
        title: '⚽ Rappel match',
        body: `${teamA} vs ${teamB}${heure ? ' à ' + heure : ''} — sur NavéStats !`,
        type: 'match',
        matchId: reminder.match_id,
        url: `/matchs/${reminder.match_id}`,
      }

      if (subscriptions.length > 0) {
        const result = await sendWebPushToSubscriptions(subscriptions, payload)
        sent += result.sent
        failed += result.failed
      }

      // Attempt to store in-app notification (may fail under RLS — non-blocking)
      try {
        await (supabase as any)
          .from('notifications')
          .insert({
            user_id: user.id,
            titre: '⚽ Rappel match',
            message: payload.body,
            type: 'match',
            lien: `/matchs/${reminder.match_id}`,
            est_lue: false,
          })
      } catch {
        // ignore — push still delivered
      }

      // Mark as sent
      await (supabase as any)
        .from('match_reminders')
        .update({ sent: true })
        .eq('id', reminder.id)
    }

    return NextResponse.json({ success: true, sent, failed, checked: reminders.length })
  } catch (error) {
    console.error('Erreur reminder-check:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
