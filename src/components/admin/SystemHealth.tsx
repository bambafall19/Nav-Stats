'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CheckItem {
  label: string
  detail: string
  ok: boolean | null
  hint?: string
}

export default function SystemHealth() {
  const supabase = createClient() as any
  const [checks, setChecks] = useState<CheckItem[]>([
    { label: 'Base de données Supabase', detail: 'Vérification de la connexion…', ok: null },
    { label: 'API / API Health', detail: 'Test de l’endpoint…', ok: null },
    { label: 'Environment', detail: 'Lecture de la configuration…', ok: null },
    { label: 'Connexions sociales (OAuth)', detail: 'Test des fournisseurs Google / Facebook…', ok: null },
  ])
  const [stats, setStats] = useState<{ label: string; value: string; icon: string }[]>([])
  const [checking, setChecking] = useState(true)

  const runChecks = useCallback(async () => {
    setChecking(true)
    const next: CheckItem[] = [
      { label: 'Base de données Supabase', detail: 'Vérification de la connexion…', ok: null },
      { label: 'API / API Health', detail: 'Test de l’endpoint…', ok: null },
      { label: 'Environment', detail: 'Lecture de la configuration…', ok: null },
      { label: 'Connexions sociales (OAuth)', detail: 'Test des fournisseurs Google / Facebook…', ok: null },
    ]
    setChecks(next)

    const dbStart = performance.now()
    try {
      const { data, error } = await supabase.from('equipes').select('id').limit(1)
      const latency = Math.round(performance.now() - dbStart)
      next[0] = {
        label: 'Base de données Supabase',
        detail: `Connexion OK en ${latency} ms`,
        ok: !error && !!data,
        hint: error?.message,
      }
    } catch (e: any) {
      next[0] = { label: 'Base de données Supabase', detail: 'Connexion impossible', ok: false, hint: e?.message }
    }

    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      const json = await res.json()
      next[1] = {
        label: 'API / API Health',
        detail: res.ok ? `OK · ${json.service} · ${json.vercelEnv || json.env}` : `Erreur HTTP ${res.status}`,
        ok: res.ok,
      }
      next[2] = {
        label: 'Environment',
        detail: `ENV=${json.env} · Vercel=${json.vercelEnv || 'n/a'} · Region=${json.region || 'n/a'}`,
        ok: true,
      }
    } catch (e: any) {
      next[1] = { label: 'API / API Health', detail: 'Endpoint injoignable', ok: false, hint: e?.message }
      next[2] = { label: 'Environment', detail: 'Indisponible', ok: false, hint: e?.message }
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (supabaseUrl && anonKey) {
        const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
          headers: { apikey: anonKey },
          cache: 'no-store',
        })
        if (res.ok) {
          const json = await res.json()
          const providers = (json?.external || {}) as Record<string, boolean>
          const enabled = Object.entries(providers)
            .filter(([, v]) => !!v)
            .map(([k]) => k)
          const google = providers.google, facebook = providers.facebook
          next[3] = {
            label: 'Connexions sociales (OAuth)',
            detail: enabled.length > 0 ? `Activés : ${enabled.join(', ')}` : 'Aucun fournisseur activé',
            ok: !!(google || facebook),
            hint: !(google || facebook)
              ? 'Activez Google et/ou Facebook dans Supabase → Authentication → Providers'
              : `Google ${google ? '✓' : '✗'} · Facebook ${facebook ? '✓' : '✗'}`,
          }
        } else {
          next[3] = { label: 'Connexions sociales (OAuth)', detail: `Erreur HTTP ${res.status}`, ok: false }
        }
      } else {
        next[3] = { label: 'Connexions sociales (OAuth)', detail: 'Env manquants', ok: false }
      }
    } catch (e: any) {
      next[3] = { label: 'Connexions sociales (OAuth)', detail: 'Impossible de lire les réglages', ok: false, hint: e?.message }
    }

    setChecks([...next])

    try {
      const [
        { count: users },
        { count: matchs },
        { count: pronos },
        { count: notifs },
        { count: pendings },
        { count: matchsTerminesSansScore },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('matchs').select('*', { count: 'exact', head: true }),
        supabase.from('pronostics').select('*', { count: 'exact', head: true }),
        supabase.from('notifications').select('*', { count: 'exact', head: true }),
        supabase.from('match_reports').select('*', { count: 'exact', head: true }).eq('statut', 'pending'),
        supabase.from('matchs').select('*', { count: 'exact', head: true }).eq('statut', 'termine').or('score_a.is.null,score_b.is.null'),
      ])
      setStats([
        { label: 'Utilisateurs', value: String(users || 0), icon: '👥' },
        { label: 'Matchs', value: String(matchs || 0), icon: '⚽' },
        { label: 'Pronostics', value: String(pronos || 0), icon: '🎯' },
        { label: 'Notifications envoyées', value: String(notifs || 0), icon: '🔔' },
        { label: 'Reports en attente', value: String(pendings || 0), icon: '🚩' },
        { label: 'Matchs terminés sans score', value: String(matchsTerminesSansScore || 0), icon: '📝' },
      ])
    } catch {
      // stats optional
    }

    setChecking(false)
  }, [supabase])

  useEffect(() => {
    runChecks()
  }, [runChecks])

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div className="admin-section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-plus-jakarta)', fontSize: '1.08rem', fontWeight: 900, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            🩺 Santé du système
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Vérification de la connexion, de l’API et de l’environnement.</p>
        </div>
        <button
          onClick={runChecks}
          disabled={checking}
          style={{
            padding: '7px 14px', borderRadius: 999, border: '1px solid var(--color-border)',
            background: 'var(--color-surface)', color: 'var(--color-text-primary)',
            fontSize: '0.74rem', fontWeight: 800, cursor: checking ? 'not-allowed' : 'pointer', opacity: checking ? 0.5 : 1,
          }}
        >
          {checking ? '⏳ Vérification…' : '↻ Actualiser'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {checks.map(c => (
          <div key={c.label} style={{
            padding: '14px 16px', borderRadius: 12,
            background: 'var(--color-surface-card)', border: '1px solid var(--color-border)',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 4,
              background: c.ok === null ? '#94a3b8' : c.ok ? '#0dca6b' : '#E53E3E',
              boxShadow: c.ok === null ? 'none' : `0 0 12px ${c.ok ? 'rgba(13,202,107,0.6)' : 'rgba(229,62,62,0.6)'}`,
              animation: c.ok === null ? 'healthPulse 1s infinite' : 'none',
            }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>{c.label}</div>
              <div style={{ fontSize: '0.72rem', color: c.ok === false ? '#E53E3E' : 'var(--color-text-muted)', marginTop: 2, wordBreak: 'break-word' }}>
                {c.detail}
                {c.hint && <div style={{ marginTop: 4, color: '#E53E3E' }}>{c.hint}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
        {stats.map(s => (
          <div key={s.label} style={{
            padding: '12px', borderRadius: 12, textAlign: 'center',
            background: 'var(--color-surface-card)', border: '1px solid var(--color-border)',
          }}>
            <div style={{ fontSize: '1.1rem' }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 950, fontSize: '1.25rem', color: 'var(--color-primary)', marginTop: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.66rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes healthPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
