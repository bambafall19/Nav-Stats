'use client'

import Link from 'next/link'
import { CalendarDays, MapPin, ArrowRight, Trophy } from 'lucide-react'
import type { Database } from '@/types/database.types'

type EquipeInfo = Pick<Database['public']['Tables']['equipes']['Row'],
  'id' | 'nom' | 'sigle' | 'logo_url' | 'couleur_principale' | 'couleur_secondaire'>

type CadetMatch = Database['public']['Tables']['cadet_matchs']['Row'] & {
  equipe_a_info?: EquipeInfo | null
  equipe_b_info?: EquipeInfo | null
}

function TeamBadge({ equipe, name, size = 34 }: { equipe?: EquipeInfo | null; name: string; size?: number }) {
  const fallback = equipe?.sigle || name.replace(/^ASC\s+/i, '').slice(0, 3)
  const colorA = equipe?.couleur_principale || '#0dca6b'
  const colorB = equipe?.couleur_secondaire || '#ffc94d'

  if (equipe?.logo_url) {
    return (
      <img src={equipe.logo_url} alt={name}
        style={{ width: size, height: size, borderRadius: size * 0.34, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-border-subtle)', boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.34, flexShrink: 0,
      background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 800, color: 'white',
      fontFamily: 'var(--font-plus-jakarta)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
    }}>
      {fallback}
    </div>
  )
}

export default function CadetsDuJour({ matchs, isToday }: { matchs: CadetMatch[]; isToday: boolean }) {
  const formatDate = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, fontSize: '1rem' }}>
            <CalendarDays size={17} color="var(--color-accent)" />
            {isToday ? 'Cadets – Matchs du jour' : 'Cadets – Prochains matchs'}
          </h2>
          <p className="section-subtitle" style={{ fontSize: '0.7rem' }}>Championnat National des Pronostiqueurs CNP 2026</p>
        </div>
        <Link href="/cadets" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.72rem', textDecoration: 'none', fontFamily: 'var(--font-plus-jakarta)', whiteSpace: 'nowrap' }}>
          Voir tout <ArrowRight size={13} />
        </Link>
      </div>

      <div className="cadet-grid h-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
        {matchs.map((match, i) => {
          const nameA = match.equipe_a_info?.nom || match.equipe_a
          const nameB = match.equipe_b_info?.nom || match.equipe_b
          return (
            <div key={`${match.date_match}-${match.equipe_a}-${match.equipe_b}`} className="cadet-home-card" style={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
              animation: `fadeInUp 0.4s ${i * 0.05}s ease both`,
            }}>
              <div style={{
                height: 3,
                background: 'linear-gradient(90deg, #ffc94d, rgba(255,201,77,0.1))',
              }} />
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.56rem', fontWeight: 800, color: 'var(--color-accent)',
                    background: 'rgba(255,201,77,0.1)', padding: '3px 9px', borderRadius: 999,
                    fontFamily: 'var(--font-mono)',
                    border: '1px solid rgba(255,201,77,0.2)',
                  }}>J{match.journee}</span>
                  {match.poule && (
                    <span style={{ fontSize: '0.52rem', color: 'var(--color-text-muted)', padding: '3px 9px', borderRadius: 999, background: 'var(--color-bg-secondary)', fontFamily: 'var(--font-mono)' }}>
                      Poule {match.poule}
                    </span>
                  )}
                  <span style={{ fontSize: '0.56rem', color: 'var(--color-text-muted)', fontWeight: 600, fontFamily: 'var(--font-plus-jakarta)', marginLeft: 'auto' }}>
                    {formatDate(match.date_match)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <TeamBadge equipe={match.equipe_a_info} name={nameA} />
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {nameA}
                    </span>
                  </div>
                  <div style={{
                    width: 32, height: 24, borderRadius: 9, flexShrink: 0,
                    background: 'linear-gradient(135deg, #E8002D, #ff6b6b)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.52rem', fontWeight: 900, fontFamily: 'var(--font-plus-jakarta)',
                    letterSpacing: '0.03em',
                    boxShadow: '0 4px 10px rgba(232,0,45,0.3)',
                  }}>VS</div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end', minWidth: 0 }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {nameB}
                    </span>
                    <TeamBadge equipe={match.equipe_b_info} name={nameB} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.58rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 10 }}>
                  <MapPin size={10} /> {match.terrain}
                  {match.ordre && <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Trophy size={9} color="var(--color-accent)" /> #{match.ordre}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <style>{`
        @media (max-width: 767px) {
          .cadet-grid.h-scroll > * { flex: 0 0 84% !important; }
        }
        .cadet-home-card:hover { border-color: rgba(42,255,160,0.3); box-shadow: var(--shadow-card-hover) !important; transform: translateY(-3px); }
      `}</style>
    </div>
  )
}
