import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET — list the current user's reminders
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ reminders: [] })
    }

    const { data, error } = await (supabase as any)
      .from('match_reminders')
      .select('id, match_id, remind_at, sent')
      .eq('user_id', user.id)

    if (error) {
      console.error('Erreur lecture rappels:', String(error.message).replace(/[\r\n]/g, ' '))
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ reminders: data || [] })
  } catch (error) {
    console.error('Erreur lecture rappels:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST — create or update a reminder for a match
 * Body: { matchId, remindAt }
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
    const matchId = typeof body.matchId === 'string' ? body.matchId : null
    const remindAt = typeof body.remindAt === 'string' ? body.remindAt : null

    if (!matchId || !remindAt || isNaN(Date.parse(remindAt))) {
      return NextResponse.json({ error: 'matchId et remindAt requis' }, { status: 400 })
    }

    const { data, error } = await (supabase as any)
      .from('match_reminders')
      .upsert(
        {
          user_id: user.id,
          match_id: matchId,
          remind_at: new Date(remindAt).toISOString(),
          sent: false,
        },
        { onConflict: 'user_id,match_id' }
      )
      .select('id, match_id, remind_at, sent')

    if (error) {
      console.error('Erreur création rappel:', String(error.message).replace(/[\r\n]/g, ' '))
      return NextResponse.json({ error: 'Échec création du rappel' }, { status: 500 })
    }

    return NextResponse.json({ success: true, reminder: data?.[0] })
  } catch (error) {
    console.error('Erreur création rappel:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * DELETE — remove a reminder
 * Body: { matchId }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const matchId = typeof body.matchId === 'string' ? body.matchId : null

    if (!matchId) {
      return NextResponse.json({ error: 'matchId requis' }, { status: 400 })
    }

    const { error } = await (supabase as any)
      .from('match_reminders')
      .delete()
      .eq('user_id', user.id)
      .eq('match_id', matchId)

    if (error) {
      console.error('Erreur suppression rappel:', String(error.message).replace(/[\r\n]/g, ' '))
      return NextResponse.json({ error: 'Échec suppression du rappel' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression rappel:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
