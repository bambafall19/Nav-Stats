'use client'

import Link from 'next/link'
import { Target, Users, Zap, Award, Trophy, ChevronRight } from 'lucide-react'

interface DashboardProps {
  topEquipes?: Array<{
    nom: string
    sigle?: string | null
    points_classement: number
    logo_url?: string | null
    matchs_joues: number
    couleur_principale?: string | null
    couleur_secondaire?: string | null
  }>
  statsGlobales?: {
    totalPronostics: number
    totalUtilisateurs: number
    totalMatchs: number
    totalPoints: number
  }
}

const MEDALS = ['🥇', '🥈', '🥉']

function TeamAvatar({ equipe }: { equipe: NonNullable<DashboardProps['topEquipes']>[number] }) {
  if (equipe.logo_url) {
    return (
      <img src={equipe.logo_url} alt={equipe.nom}
        style={{ width: 34, height: 34, borderRadius: 11, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-border-subtle)' }}
      />
    )
  }
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 11, flexShrink: 0,
      background: `linear-gradient(135deg, ${equipe.couleur_principale || '#0dca6b'}, ${equipe.couleur_secondaire || '#ffc94d'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 800, color: 'white',
      fontFamily: 'var(--font-plus-jakarta)',
    }}>
      {equipe.sigle || equipe.nom.charAt(0)}
    </div>
  )
}

export default function StatsDashboard({
  topEquipes = [],
  statsGlobales = { totalPronostics: 0, totalUtilisateurs: 0, totalMatchs: 0, totalPoints: 0 }
}: DashboardProps) {
  const stats = [
    { icon: Target, label: 'Pronostics', value: statsGlobales.totalPronostics, color: 'var(--color-primary)', bg: 'linear-gradient(135deg, rgba(42,255,160,0.22), rgba(42,255,160,0.04))' },
    { icon: Users, label: 'Pronostiqueurs', value: statsGlobales.totalUtilisateurs, color: '#4da6ff', bg: 'linear-gradient(135deg, rgba(77,166,255,0.22), rgba(77,166,255,0.04))' },
    { icon: Zap, label: 'Matchs', value: statsGlobales.totalMatchs, color: '#ffc94d', bg: 'linear-gradient(135deg, rgba(255,201,77,0.22), rgba(255,201,77,0.04))' },
    { icon: Award, label: 'Points', value: statsGlobales.totalPoints, color: '#ff6b6b', bg: 'linear-gradient(135deg, rgba(255,107,107,0.22), rgba(255,107,107,0.04))' },
  ]

  const maxPoints = Math.max(1, ...topEquipes.map(e => e.points_classement))

  return (
    <section style={{ marginBottom: 20 }}>
      <div className="stat-tiles-grid h-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-tile" style={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: 'var(--shadow-card)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', insetInline: 0, top: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--color-primary-100), transparent)' }} />
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} color={stat.color} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.15rem', fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.1,
                }}>{stat.value.toLocaleString()}</div>
                <div style={{
                  fontSize: '0.62rem', color: 'var(--color-text-muted)',
                  fontWeight: 700, fontFamily: 'var(--font-plus-jakarta)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{stat.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {topEquipes.length > 0 && (
        <div style={{
          marginTop: 14,
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(255,201,77,0.1), rgba(255,201,77,0.02))',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(255,201,77,0.25), rgba(255,201,77,0.08))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trophy size={16} color="var(--color-accent)" />
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'var(--font-plus-jakarta)', color: 'var(--color-text-primary)' }}>
              Top Équipes
            </h3>
            <Link href="/classements" style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3,
              color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.7rem',
              textDecoration: 'none', fontFamily: 'var(--font-plus-jakarta)',
            }}>
              Classement <ChevronRight size={12} />
            </Link>
          </div>

          <div className="top-equipes-list h-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 10 }}>
            {topEquipes.slice(0, 5).map((equipe, idx) => {
              const pct = Math.round((equipe.points_classement / maxPoints) * 100)
              const isTop3 = idx < 3
              return (
                <div key={equipe.nom} className="top-equipe-row" style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px',
                  background: idx === 0
                    ? 'linear-gradient(135deg, rgba(255,201,77,0.14), rgba(255,201,77,0.03))'
                    : idx === 1
                      ? 'linear-gradient(135deg, rgba(148,163,184,0.10), rgba(148,163,184,0.02))'
                      : 'transparent',
                  border: idx === 0 ? '1px solid rgba(255,201,77,0.3)' : idx === 1 ? '1px solid rgba(148,163,184,0.18)' : '1px solid transparent',
                  borderRadius: 14,
                  transition: 'all var(--transition-base) var(--ease-out)',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                    background: isTop3 ? 'var(--gradient-green)' : 'var(--color-bg-secondary)',
                    color: isTop3 ? 'white' : 'var(--color-text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    boxShadow: isTop3 ? '0 4px 12px rgba(42,255,160,0.25)' : 'none',
                  }}>
                    {MEDALS[idx] ?? idx + 1}
                  </div>
                  <TeamAvatar equipe={equipe} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', fontFamily: 'var(--font-plus-jakarta)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{equipe.nom}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem', color: idx === 0 ? 'var(--color-accent)' : 'var(--color-primary)', flexShrink: 0 }}>
                        {equipe.points_classement} <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>pts</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          borderRadius: 99,
                          background: idx === 0 ? 'linear-gradient(90deg, #ffc94d, #fbbf24)' : 'var(--gradient-green)',
                          transition: 'width 800ms var(--ease-out)',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.56rem', color: 'var(--color-text-muted)', fontWeight: 600, fontFamily: 'var(--font-plus-jakarta)', flexShrink: 0 }}>
                        {equipe.matchs_joues} matchs
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .stat-tiles-grid.h-scroll > * { flex: 0 0 150px !important; }
          .top-equipes-list.h-scroll { padding: 4px var(--app-pad) 12px !important; }
          .top-equipes-list.h-scroll > * { flex: 0 0 82% !important; margin-bottom: 0 !important; }
        }
        @media (max-width: 640px) {
          .stat-tile { padding: 12px 10px !important; gap: 8px !important; }
          .stat-tile > div:last-child > div:first-child { font-size: 0.98rem !important; }
        }
      `}</style>
    </section>
  )
}
