'use client'

import Link from 'next/link'
import { useState } from 'react'

type Pronostic = {
  id: string
  est_correct: boolean | null
  score_exact: boolean
  points_gagnes: number
  resultat_predit: string
  match: {
    id: string
    statut: string
    score_a: number | null
    score_b: number | null
    equipe_a: { nom: string | null; sigle: string | null } | null
    equipe_b: { nom: string | null; sigle: string | null } | null
  } | null
}

type Props = {
  profile: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    points: number
    rang: number | null
    quartier: string | null
    total_pronostics: number
    pronostics_corrects: number
  }
  recentPronostics: Pronostic[]
  pronosticsToMake: number // nombre de matchs à venir sans pronostic
}

export default function MonEspace({ profile, recentPronostics, pronosticsToMake }: Props) {
  const [tab, setTab] = useState<'apercu' | 'pronostics'>('apercu')

  const accuracy = profile.total_pronostics > 0
    ? Math.round((profile.pronostics_corrects / profile.total_pronostics) * 100)
    : 0

  const pending = recentPronostics.filter(p => p.match?.statut !== 'termine').length
  const corrects = recentPronostics.filter(p => p.est_correct === true).length

  const level = Math.max(1, Math.floor((profile.points || 0) / 100) + 1)
  const levelProgress = Math.min(100, ((profile.points % 100) / 100) * 100)

  const initials = (profile.full_name || profile.username || 'U').charAt(0).toUpperCase()

  return (
    <section className="mon-espace-section card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
      {/* Header banner */}
      <div style={{
        background: 'var(--gradient-hero)',
        padding: '20px 22px 14px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 90, opacity: 0.06 }}>⚽</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 54, height: 54, borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)',
            border: '2.5px solid rgba(255,255,255,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 900, color: 'white',
            fontFamily: 'var(--font-outfit)', flexShrink: 0, overflow: 'hidden',
          }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          {/* Name + rank */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: 'white', fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                {profile.full_name || profile.username}
              </span>
              {profile.rang && (
                <span style={{ background: 'rgba(251,191,0,0.25)', color: '#fff7cc', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                  #{profile.rang}
                </span>
              )}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.75rem', marginTop: 2 }}>
              Niveau {level} · {profile.quartier || 'Khombole'}
            </div>
            {/* Level bar */}
            <div style={{ marginTop: 7, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.2)', overflow: 'hidden', maxWidth: 160 }}>
              <div style={{ height: '100%', borderRadius: 4, background: 'white', width: `${levelProgress}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.6rem', color: 'white', lineHeight: 1 }}>{profile.points}</div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>POINTS</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-card)' }}>
        {[
          { id: 'apercu' as const, label: '📊 Aperçu' },
          { id: 'pronostics' as const, label: `🎯 Pronostics (${recentPronostics.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '12px 8px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-outfit)',
            fontWeight: tab === t.id ? 800 : 500, fontSize: '0.82rem',
            color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
            background: 'transparent',
            borderBottom: tab === t.id ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
            transition: 'all 0.18s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '18px 20px' }}>

        {tab === 'apercu' && (
          <>
            {/* Stats mini grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Pronostics', value: profile.total_pronostics || 0, color: 'var(--color-primary)' },
                { label: 'Réussite', value: `${accuracy}%`, color: '#0F766E' },
                { label: 'En attente', value: pending, color: '#64748B' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--color-surface)', borderRadius: 12 }}>
                  <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.3rem', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 700, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA suggestion bloc */}
            {pronosticsToMake > 0 && (
              <div style={{ padding: '12px 14px', background: 'rgba(0,98,51,0.07)', borderRadius: 12, border: '1px solid rgba(0,98,51,0.15)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                    ⚽ {pronosticsToMake} match{pronosticsToMake > 1 ? 's' : ''} sans pronostic
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>Pronostiquez avant le coup d'envoi !</div>
                </div>
                <Link href="/matchs" style={{ padding: '8px 14px', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800, textDecoration: 'none', fontFamily: 'var(--font-outfit)', whiteSpace: 'nowrap' }}>
                  Jouer →
                </Link>
              </div>
            )}

            {/* Quick links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Link href={`/profil/${profile.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--color-surface)', borderRadius: 12, textDecoration: 'none', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', transition: 'box-shadow 0.18s' }}>
                <span style={{ fontSize: '1.3rem' }}>👤</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-outfit)' }}>Mon Profil</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Badges & stats</div>
                </div>
              </Link>
              <Link href="/pronostics" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--color-surface)', borderRadius: 12, textDecoration: 'none', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', transition: 'box-shadow 0.18s' }}>
                <span style={{ fontSize: '1.3rem' }}>📈</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-outfit)' }}>Mes Pronostics</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Historique complet</div>
                </div>
              </Link>
            </div>
          </>
        )}

        {tab === 'pronostics' && (
          <>
            {recentPronostics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎯</div>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 14, fontSize: '0.9rem' }}>Vous n'avez pas encore de pronostics.</p>
                <Link href="/matchs" style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 700, fontFamily: 'var(--font-outfit)' }}>
                  Pronostiquer un match
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {recentPronostics.slice(0, 5).map(p => {
                  const match = p.match
                  const isDone = match?.statut === 'termine'
                  const isCorrect = p.est_correct === true
                  const isWrong = p.est_correct === false
                  return (
                    <Link key={p.id} href={match ? `/matchs/${match.id}` : '/matchs'} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--color-surface)', borderRadius: 12, textDecoration: 'none', color: 'var(--color-text-primary)' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: isDone ? (isCorrect ? 'rgba(0,166,81,0.1)' : 'rgba(232,0,45,0.08)') : 'var(--color-surface-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
                      }}>
                        {isDone ? (isCorrect ? '✅' : '❌') : '⏳'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {match?.equipe_a?.sigle || match?.equipe_a?.nom} vs {match?.equipe_b?.sigle || match?.equipe_b?.nom}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
                          {isDone ? `Score: ${match?.score_a} – ${match?.score_b}` : 'Match à venir'}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '0.85rem',
                        color: isDone ? (isCorrect ? 'var(--color-primary)' : 'var(--color-red)') : 'var(--color-text-muted)',
                        flexShrink: 0,
                      }}>
                        {isDone ? `+${p.points_gagnes || 0}` : '–'} <span style={{ fontSize: '0.6rem', fontWeight: 500 }}>pts</span>
                      </div>
                    </Link>
                  )
                })}
                <Link href="/pronostics" style={{ display: 'block', textAlign: 'center', padding: '10px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', fontFamily: 'var(--font-outfit)' }}>
                  Voir tous mes pronostics →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
