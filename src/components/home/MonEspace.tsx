'use client'

import Link from 'next/link'
import { useState } from 'react'
import { User, BarChart3, Target, ArrowRight, CheckCircle2, Clock, Trophy, TrendingUp, ChevronRight } from 'lucide-react'

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
  pronosticsToMake: number
}

export default function MonEspace({ profile, recentPronostics, pronosticsToMake }: Props) {
  const [tab, setTab] = useState<'apercu' | 'pronostics'>('apercu')

  const accuracy = profile.total_pronostics > 0 ? Math.round((profile.pronostics_corrects / profile.total_pronostics) * 100) : 0
  const pending = recentPronostics.filter(p => p.match?.statut !== 'termine').length
  const level = Math.max(1, Math.floor((profile.points || 0) / 100) + 1)
  const levelProgress = Math.min(100, ((profile.points % 100) / 100) * 100)
  const initials = (profile.full_name || profile.username || 'U').charAt(0).toUpperCase()

  const stats = [
    { label: 'Pronostics', value: profile.total_pronostics || 0, icon: Target, color: 'var(--color-primary)' },
    { label: 'Réussite', value: `${accuracy}%`, icon: TrendingUp, color: 'var(--color-accent)' },
    { label: 'En attente', value: pending, icon: Clock, color: 'var(--color-text-muted)' },
  ]

  return (
    <section className="mon-espace-section card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24, borderRadius: 'var(--radius-xl)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--gradient-hero)',
        padding: '26px 24px 22px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -40,
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 18,
            background: 'rgba(255,255,255,0.14)',
            border: '2px solid rgba(255,255,255,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: 'white',
            fontFamily: 'var(--font-plus-jakarta)', flexShrink: 0, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: 'white', fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800, fontSize: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                {profile.full_name || profile.username}
              </span>
              {profile.rang && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'rgba(255,201,77,0.16)',
                  color: 'var(--color-accent-light)', fontSize: '0.64rem', fontWeight: 800,
                  padding: '3px 10px', borderRadius: 999,
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid rgba(255,201,77,0.3)',
                }}>
                  <Trophy size={11} /> #{profile.rang}
                </span>
              )}
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.14)',
                color: 'white', fontSize: '0.62rem', fontWeight: 700,
                padding: '3px 9px', borderRadius: 999,
                fontFamily: 'var(--font-plus-jakarta)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}>
                Niveau {level}
              </span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.72rem', marginTop: 3, fontFamily: 'var(--font-plus-jakarta)' }}>
              {profile.quartier || 'Khombole'}
            </div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, maxWidth: 220, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-light))',
                  width: `${levelProgress}%`,
                  transition: 'width 0.8s var(--ease-out)',
                }} />
              </div>
              <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {Math.round(levelProgress)}%
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.7rem', color: 'white', lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>{profile.points}</div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontFamily: 'var(--font-plus-jakarta)', letterSpacing: '0.08em' }}>POINTS</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-card)', padding: '0 12px' }}>
        {[
          { id: 'apercu' as const, label: 'Aperçu', icon: <BarChart3 size={14} /> },
          { id: 'pronostics' as const, label: `Pronostics (${recentPronostics.length})`, icon: <Target size={14} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '14px 8px', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-plus-jakarta)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            fontWeight: tab === t.id ? 700 : 500, fontSize: '0.8rem',
            color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
            background: 'transparent',
            borderBottom: tab === t.id ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
            transition: 'all 0.15s',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 24px' }}>
        {tab === 'apercu' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
              {stats.map(s => (
                <div key={s.label} className="mon-espace-stat" style={{
                  textAlign: 'center',
                  padding: '16px 8px',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  transition: 'all var(--transition-base) var(--ease-out)',
                }}>
                  <s.icon size={16} color={s.color} style={{ marginBottom: 6 }} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.35rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 4, fontFamily: 'var(--font-plus-jakarta)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {pronosticsToMake > 0 && (
              <div style={{
                padding: '14px 16px',
                background: 'var(--color-primary-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(42,255,160,0.2)',
                marginBottom: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--color-primary-dark)', fontFamily: 'var(--font-plus-jakarta)' }}>
                    {pronosticsToMake} match{pronosticsToMake > 1 ? 's' : ''} sans pronostic
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>Pronostiquez avant le coup d'envoi !</div>
                </div>
                <Link href="/matchs" style={{
                  padding: '9px 16px', background: 'var(--gradient-green)', color: 'white',
                  borderRadius: 'var(--radius-md)', fontSize: '0.74rem', fontWeight: 700,
                  textDecoration: 'none', fontFamily: 'var(--font-plus-jakarta)',
                  whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                  boxShadow: 'var(--shadow-green)',
                  transition: 'all var(--transition-base) var(--ease-out)',
                }}>
                  Jouer <ArrowRight size={12} />
                </Link>
              </div>
            )}

            <Link href={`/profil/${profile.id}`} className="mon-espace-profile-btn" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px', marginBottom: 12,
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-green)', color: 'white',
              fontSize: '0.84rem', fontWeight: 700,
              fontFamily: 'var(--font-plus-jakarta)',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-green)',
              transition: 'all var(--transition-base) var(--ease-out)',
            }}>
              Voir le profil <ArrowRight size={15} />
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Link href={`/profil/${profile.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}>
                <User size={18} color="var(--color-primary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', fontFamily: 'var(--font-plus-jakarta)' }}>Mon Profil</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>Badges & stats</div>
                </div>
                <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }} />
              </Link>
              <Link href="/pronostics" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}>
                <BarChart3 size={18} color="var(--color-primary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', fontFamily: 'var(--font-plus-jakarta)' }}>Mes Pronostics</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>Historique complet</div>
                </div>
                <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }} />
              </Link>
            </div>
          </>
        )}

        {tab === 'pronostics' && (
          <>
            {recentPronostics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <Target size={30} color="var(--color-text-muted)" style={{ marginBottom: 10 }} />
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 16, fontSize: '0.85rem' }}>Vous n'avez pas encore de pronostics.</p>
                <Link href="/matchs" style={{ padding: '12px 22px', background: 'var(--gradient-green)', color: 'white', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 700, fontFamily: 'var(--font-plus-jakarta)', boxShadow: 'var(--shadow-green)' }}>
                  Pronostiquer un match
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {recentPronostics.slice(0, 5).map(p => {
                  const match = p.match
                  const isDone = match?.statut === 'termine'
                  const isCorrect = p.est_correct === true
                  return (
                    <Link key={p.id} href={match ? `/matchs/${match.id}` : '/matchs'} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)', transition: 'all 0.15s' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: isDone ? (isCorrect ? 'var(--color-primary-50)' : 'var(--color-red-light)') : 'var(--color-surface-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {isDone ? (isCorrect ? <CheckCircle2 size={17} color="var(--color-primary)" /> : <Clock size={17} color="var(--color-red)" />) : <Clock size={17} color="var(--color-text-muted)" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', fontFamily: 'var(--font-plus-jakarta)' }}>
                          {match?.equipe_a?.sigle || match?.equipe_a?.nom} vs {match?.equipe_b?.sigle || match?.equipe_b?.nom}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
                          {isDone ? `Score: ${match?.score_a} – ${match?.score_b}` : 'Match à venir'}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem', color: isDone ? (isCorrect ? 'var(--color-primary)' : 'var(--color-red)') : 'var(--color-text-muted)', flexShrink: 0 }}>
                        {isDone ? `+${p.points_gagnes || 0}` : '–'} <span style={{ fontSize: '0.55rem', fontWeight: 500 }}>pts</span>
                      </div>
                    </Link>
                  )
                })}
                <Link href="/pronostics" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '12px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', fontFamily: 'var(--font-plus-jakarta)' }}>
                  Voir tous mes pronostics <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .mon-espace-stat:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .mon-espace-profile-btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
        @media (max-width: 480px) {
          .mon-espace-section .mon-espace-stat { padding: 12px 6px !important; }
        }
      `}</style>
    </section>
  )
}
