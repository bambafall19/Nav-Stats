'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Share2 } from 'lucide-react'
import FilterButton from '@/components/shared/FilterButton'
import { MATCH_STATUS_LABELS } from '@/lib/constants/matchStatus'

interface Team {
  id: string
  nom: string
  sigle: string | null
  poule: 'A' | 'B' | 'C' | null
  couleur_principale: string
  couleur_secondaire: string
  logo_url: string | null
  quartier: string | null
  asc_nom: string | null
}

interface Match {
  id: string
  equipe_a_id: string
  equipe_b_id: string
  date_match: string
  heure_match: string
  stade: string
  arbitre: string | null
  journee: number | null
  phase: 'phase_groupe' | 'quart_finale' | 'demi_finale' | 'finale'
  statut: 'a_venir' | 'en_cours' | 'termine' | 'reporte'
  score_a: number | null
  score_b: number | null
  equipe_a: Team
  equipe_b: Team
}

interface Props {
  initialMatchs: Match[]
}

const EXEMPTE_MAP: Record<number, { nom: string; sigle: string }> = {
  1: { nom: 'Kocc', sigle: 'KOC' },
  2: { nom: 'Entente C.S', sigle: 'ECS' },
  3: { nom: 'Manko', sigle: 'MAN' },
  4: { nom: 'Book Joom', sigle: 'BJ' },
  5: { nom: 'Maag Daan', sigle: 'MD' },
}

const POULE_COLORS: Record<string, string> = {
  A: '#006233',
  B: '#1E40AF',
  C: '#B91C1C',
}

function TeamBadge({ equipe, size = 52 }: { equipe: Team; size?: number }) {
  if (equipe.logo_url) {
    return (
      <Image
        src={equipe.logo_url}
        alt={equipe.nom}
        width={size}
        height={size}
        style={{
          borderRadius: 12,
          objectFit: 'cover',
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
        }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size,
      borderRadius: 12,
      background: `linear-gradient(135deg, ${equipe.couleur_principale || '#006233'}, ${equipe.couleur_secondaire || '#FBBF00'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38,
      fontWeight: 800,
      color: 'white',
      flexShrink: 0,
      boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
      fontFamily: 'var(--font-outfit)',
    }}>
      {equipe.sigle || equipe.nom.charAt(0)}
    </div>
  )
}

export default function MatchListClient({ initialMatchs }: Props) {
  const [selectedJournee, setSelectedJournee] = useState<number | 'all'>(1)
  const [selectedStatus, setSelectedStatus] = useState<'all' | Match['statut']>('all')
  const [selectedPoule, setSelectedPoule] = useState<'all' | 'A' | 'B' | 'C'>('all')
  const [search, setSearch] = useState('')

  const normalizedSearch = search.trim().toLowerCase()
  const matchesByJournee = initialMatchs.filter(m => {
    const byJournee = selectedJournee === 'all' || m.journee === selectedJournee
    const byStatus = selectedStatus === 'all' || m.statut === selectedStatus
    const byPoule = selectedPoule === 'all' || m.equipe_a.poule === selectedPoule || m.equipe_b.poule === selectedPoule
    const bySearch = !normalizedSearch || [m.equipe_a.nom, m.equipe_b.nom, m.equipe_a.sigle, m.equipe_b.sigle, m.stade]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(normalizedSearch))
    return byJournee && byStatus && byPoule && bySearch
  })

  const matchesByDate: Record<string, Match[]> = {}
  matchesByJournee.forEach(m => {
    if (!matchesByDate[m.date_match]) matchesByDate[m.date_match] = []
    matchesByDate[m.date_match].push(m)
  })
  const sortedDates = Object.keys(matchesByDate).sort()
  const journees = [1, 2, 3, 4, 5]
  const statusFilters: { value: 'all' | Match['statut']; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'a_venir', label: MATCH_STATUS_LABELS.a_venir },
    { value: 'en_cours', label: MATCH_STATUS_LABELS.en_cours },
    { value: 'termine', label: MATCH_STATUS_LABELS.termine },
  ]
  const pouleFilters: { value: 'all' | 'A' | 'B' | 'C'; label: string }[] = [
    { value: 'all', label: 'Poules' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
  ]

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Filtres */}
      <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
        <input
          className="input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une équipe ou un stade..."
          aria-label="Rechercher un match"
          style={{ background: 'var(--color-surface-card)' }}
        />
        <div className="match-filter-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, padding: 6, background: 'var(--color-surface-card)', borderRadius: 18, overflowX: 'auto', border: '1px solid var(--color-border)' }}>
            {statusFilters.map(filter => (
              <FilterButton
                key={filter.value}
                active={selectedStatus === filter.value}
                onClick={() => setSelectedStatus(filter.value)}
              >
                {filter.label}
              </FilterButton>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, padding: 6, background: 'var(--color-surface-card)', borderRadius: 18, overflowX: 'auto', border: '1px solid var(--color-border)' }}>
            {pouleFilters.map(filter => (
              <FilterButton
                key={filter.value}
                active={selectedPoule === filter.value}
                onClick={() => setSelectedPoule(filter.value)}
              >
                {filter.label}
              </FilterButton>
            ))}
          </div>
        </div>
      </div>

      {/* Journée Tab Pills */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: 6,
        background: 'var(--color-surface-card)',
        borderRadius: 20,
        marginBottom: 24,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        scrollbarWidth: 'none',
      }}>
        <button
          onClick={() => setSelectedJournee('all')}
          style={{
            flex: 1,
            padding: '11px 16px',
            border: 'none',
            background: selectedJournee === 'all' ? 'var(--gradient-green)' : 'transparent',
            color: selectedJournee === 'all' ? 'white' : 'var(--color-text-secondary)',
            borderRadius: 14,
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: selectedJournee === 'all' ? 'var(--shadow-green)' : 'none',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap',
            minWidth: 90,
            fontFamily: 'var(--font-outfit)',
          }}
        >
          Toutes
        </button>
        {journees.map(j => (
          <button
            key={j}
            onClick={() => setSelectedJournee(j)}
            style={{
              flex: 1,
              padding: '11px 16px',
              border: 'none',
              background: selectedJournee === j ? 'var(--gradient-green)' : 'transparent',
              color: selectedJournee === j ? 'white' : 'var(--color-text-secondary)',
              borderRadius: 14,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: selectedJournee === j ? 'var(--shadow-green)' : 'none',
              transition: 'all 0.25s ease',
              whiteSpace: 'nowrap',
              minWidth: 90,
              fontFamily: 'var(--font-outfit)',
              letterSpacing: '-0.01em',
            }}
          >
            J{j}
          </button>
        ))}
      </div>

      {/* Exempted Team Banner */}
      {typeof selectedJournee === 'number' && EXEMPTE_MAP[selectedJournee] && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 18px',
          background: 'rgba(251,191,0,0.07)',
          border: '1px dashed rgba(251,191,0,0.45)',
          borderRadius: 14,
          marginBottom: 24,
          fontSize: '0.82rem',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
        }}>
          <span style={{ fontSize: '1.1rem' }}>📢</span>
          <span>
            Exempté ce tour : <strong style={{ color: '#D97706' }}>ASC {EXEMPTE_MAP[selectedJournee].nom}</strong>
          </span>
        </div>
      )}

      {/* Magal Pause */}
      {selectedJournee === 4 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          padding: '20px',
          background: 'rgba(0,98,51,0.05)',
          border: '1px solid rgba(0,98,51,0.12)',
          borderRadius: 16,
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}>
            🕌 Pause Magal de Touba
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', maxWidth: 380, lineHeight: 1.5 }}>
            Le calendrier observe une pause officielle. Les matchs reprennent le <strong>03/08/2026</strong>.
          </span>
        </div>
      )}

      {/* Match Cards */}
      {sortedDates.length === 0 ? (
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 20,
          padding: '60px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚽</div>
          <h3 style={{ fontFamily: 'var(--font-outfit)', marginBottom: 6, fontSize: '1.1rem' }}>Aucun match programmé</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Revenez bientôt pour le calendrier officiel.</p>
          {(selectedStatus !== 'all' || selectedPoule !== 'all' || selectedJournee !== 'all' || search) && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => {
                setSelectedJournee('all')
                setSelectedStatus('all')
                setSelectedPoule('all')
                setSearch('')
              }}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {sortedDates.map(date => {
            const matches = matchesByDate[date]
            const d = new Date(date)
            const day = d.toLocaleDateString('fr-FR', { weekday: 'long' })
            const dayNum = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

            return (
              <div key={date}>
                {/* Date Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: 'var(--gradient-green)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-green)',
                  }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{day.slice(0, 3)}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>{d.getDate()}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', fontFamily: 'var(--font-outfit)', textTransform: 'capitalize' }}>{day} {dayNum}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{matches.length} rencontre{matches.length > 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'var(--color-border)', marginLeft: 4 }} />
                </div>

                {/* Match List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {matches.map(m => {
                    const isDone = m.statut === 'termine'
                    const isLive = m.statut === 'en_cours'
                    const isWinA = isDone && (m.score_a ?? 0) > (m.score_b ?? 0)
                    const isWinB = isDone && (m.score_b ?? 0) > (m.score_a ?? 0)
                    const poule = m.equipe_a.poule || 'A'
                    const pouleColor = POULE_COLORS[poule] || '#006233'
                    const shareText = `⚽ ${m.equipe_a.nom} vs ${m.equipe_b.nom} sur NavéStats\n📅 ${new Date(m.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${m.heure_match?.slice(0, 5)}\n👉 https://navestats.site/matchs/${m.id}`
                    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

                    return (
                      <Link key={m.id} href={`/matchs/${m.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                        <div style={{
                          background: 'var(--color-surface-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 16,
                          overflow: 'hidden',
                          position: 'relative',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                            ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                            ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
                          }}
                        >
                          {/* Top strip: Poule label + status badge */}
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 16px',
                            borderBottom: '1px solid var(--color-border)',
                            background: 'var(--color-surface-elevated)',
                          }}>
                            <span style={{
                              fontSize: '0.68rem', fontWeight: 800,
                              color: pouleColor,
                              background: `${pouleColor}15`,
                              padding: '3px 10px', borderRadius: 20,
                              textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>
                              Poule {poule}
                            </span>

                            {isLive ? (
                              <span style={{
                                fontSize: '0.68rem', fontWeight: 800, color: '#EF4444',
                                background: 'rgba(239,68,68,0.08)', padding: '3px 10px',
                                borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5,
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                                EN DIRECT
                              </span>
                            ) : isDone ? (
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', background: 'var(--color-surface)', padding: '3px 10px', borderRadius: 20 }}>
                                ✓ Terminé
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-primary)', background: 'rgba(0,98,51,0.07)', padding: '3px 10px', borderRadius: 20 }}>
                                ⏰ {m.heure_match?.slice(0, 5)}
                              </span>
                            )}
                          </div>

                          {/* Match Body */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            gap: 8,
                            alignItems: 'center',
                            padding: '16px 16px',
                          }}>
                            {/* Équipe A */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                              <TeamBadge equipe={m.equipe_a} size={52} />
                              <span style={{
                                fontSize: '0.78rem', fontWeight: isWinA ? 800 : 600,
                                color: isWinA ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                textAlign: 'center', lineHeight: 1.2,
                                maxWidth: 90, overflow: 'hidden',
                              }}>
                                {m.equipe_a.nom}
                              </span>
                            </div>

                            {/* Center: Score or VS */}
                            <div style={{ textAlign: 'center', padding: '0 8px' }}>
                              {isDone || isLive ? (
                                <div style={{
                                  fontFamily: 'var(--font-outfit)',
                                  fontWeight: 900,
                                  fontSize: '1.5rem',
                                  letterSpacing: '-0.03em',
                                  color: isLive ? '#EF4444' : 'var(--color-text-primary)',
                                  lineHeight: 1,
                                }}>
                                  {m.score_a} <span style={{ opacity: 0.4, fontSize: '1rem' }}>–</span> {m.score_b}
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-outfit)' }}>VS</div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: 2 }}>📍 {m.stade?.split(' ')[0]}</div>
                                </div>
                              )}
                            </div>

                            {/* Équipe B */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                              <TeamBadge equipe={m.equipe_b} size={52} />
                              <span style={{
                                fontSize: '0.78rem', fontWeight: isWinB ? 800 : 600,
                                color: isWinB ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                textAlign: 'center', lineHeight: 1.2,
                                maxWidth: 90, overflow: 'hidden',
                              }}>
                                {m.equipe_b.nom}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={event => {
                              event.preventDefault()
                              event.stopPropagation()
                              window.open(shareUrl, '_blank', 'noopener,noreferrer')
                            }}
                            aria-label="Partager ce match sur WhatsApp"
                            style={{
                              position: 'absolute',
                              right: 10,
                              bottom: 10,
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              border: '1px solid rgba(0,98,51,0.12)',
                              background: 'rgba(0,98,51,0.08)',
                              color: 'var(--color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Share2 size={16} />
                          </button>

                          {/* Bottom: Pronostiquer CTA (if upcoming) */}
                          {m.statut === 'a_venir' && (
                            <div style={{
                              borderTop: '1px solid var(--color-border)',
                              padding: '10px 16px',
                              display: 'flex',
                              justifyContent: 'center',
                              paddingRight: 48,
                            }}>
                              <span style={{
                                fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)',
                                display: 'flex', alignItems: 'center', gap: 6,
                              }}>
                                🎯 Pronostiquer ce match →
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <style>{`
        @media (max-width: 720px) {
          .match-filter-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
