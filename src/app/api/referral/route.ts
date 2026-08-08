import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET — code de parrainage du user connecté + ses parrainages
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('code_parrainage, points')
      .eq('id', user.id)
      .single()

    const { data: parrainages } = await (supabase as any)
      .from('parrainages')
      .select(
        'id, filleul_id, points, created_at, profiles:parrainages_filleul_id_fkey(username, avatar_url)'
      )
      .eq('parrain_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    const list = (parrainages || []).map((p: any) => ({
      id: p.id,
      username: p.profiles?.username || 'Joueur',
      avatar_url: p.profiles?.avatar_url || null,
      points: p.points,
      created_at: p.created_at,
    }))

    return NextResponse.json({
      code: profile?.code_parrainage || null,
      pointsTotal: list.reduce((acc: number, p: { points: number }) => acc + (p.points || 0), 0),
      parrainages: list,
    })
  } catch (error) {
    console.error('Erreur lecture parrainage:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST — appliquer un code de parrainage
 * Body: { code }
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
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''

    if (!code) {
      return NextResponse.json({ error: 'Code requis' }, { status: 400 })
    }

    const { data, error } = await (supabase as any).rpc('apply_referral', { code })

    if (error) {
      console.error('Erreur apply_referral:', String(error.message).replace(/[\r\n]/g, ' '))
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    if (!data?.ok) {
      const messages: Record<string, string> = {
        code_invalide: 'Ce code de parrainage est invalide.',
        auto_parrainage: 'Vous ne pouvez pas vous parrainer vous-même.',
        deja_parraine: 'Vous avez déjà été parrainé.',
        non_authentifie: 'Connectez-vous pour appliquer un parrainage.',
      }
      return NextResponse.json(
        { error: messages[data?.error] || 'Impossible d\'appliquer ce code.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, ...data })
  } catch (error) {
    console.error('Erreur application parrainage:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
