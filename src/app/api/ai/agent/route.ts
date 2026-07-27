import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createXaiClient, NAVESTATS_AGENT_SYSTEM, XAI_MODEL } from '@/lib/ai/xai'
import { buildNavestatsContext } from '@/lib/ai/context'

export const runtime = 'nodejs'
export const maxDuration = 60

type IncomingMessage = {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = (await supabase
      .from('profiles')
      .select('is_admin, username')
      .eq('id', user.id)
      .single()) as { data: { is_admin: boolean; username: string } | null }

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Réservé aux administrateurs NavéStats' },
        { status: 403 },
      )
    }

    const body = await req.json()
    const messages = (body?.messages ?? []) as IncomingMessage[]
    const mode = (body?.mode as string) || 'general'
    const includeLiveData = body?.includeLiveData !== false

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages requis' }, { status: 400 })
    }

    // Limite anti-abus
    const trimmed = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-20)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 8000),
      }))

    if (trimmed.length === 0) {
      return NextResponse.json({ error: 'Aucun message valide' }, { status: 400 })
    }

    let liveContext = ''
    if (includeLiveData) {
      try {
        liveContext = await buildNavestatsContext(supabase as any)
      } catch {
        liveContext = '(Contexte live indisponible pour le moment.)'
      }
    }

    const modeHints: Record<string, string> = {
      general: 'Mode libre : aide opérationnelle admin NavéStats.',
      actualite:
        'Mode ACTUALITÉ : produis un titre + catégorie + corps d\'article prêts à coller dans /admin/actualites.',
      match:
        'Mode MATCH : analyse ou compte-rendu de match (pré-match, live notes, post-match).',
      social:
        'Mode SOCIAL : textes courts pour WhatsApp / Facebook / Instagram / story (emojis ok, max ~280–600 car.).',
      analyse:
        'Mode ANALYSE : stats, classements, formes, idées de contenu data-driven.',
    }

    const system = [
      NAVESTATS_AGENT_SYSTEM,
      '',
      modeHints[mode] || modeHints.general,
      '',
      `Admin connecté : @${profile.username}`,
      includeLiveData
        ? `## Données live NavéStats\n${liveContext}`
        : '## Données live : non demandées pour ce message.',
    ].join('\n')

    const client = createXaiClient()

    const response = await client.responses.create({
      model: XAI_MODEL,
      input: [
        { role: 'system', content: system },
        ...trimmed.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    })

    const text = response.output_text?.trim() || ''

    if (!text) {
      return NextResponse.json(
        { error: 'Réponse vide du modèle' },
        { status: 502 },
      )
    }

    return NextResponse.json({
      reply: text,
      model: XAI_MODEL,
      mode,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    const status = message.includes('XAI_API_KEY') ? 503 : 500
    console.error('[api/ai/agent]', message)
    return NextResponse.json({ error: message }, { status })
  }
}
