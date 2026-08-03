'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Share2, RefreshCw } from 'lucide-react'
import CountdownTimer from '@/components/shared/CountdownTimer'
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

function TeamBadge({ equipe, size = 48 }: { equipe: Team; size?: number }) {
  if (equipe.logo_url) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '2px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <Image
          src={equipe.logo_url}
          alt={equipe.nom}
          width={size}
          height={size}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 'var(--radius-md)',
            objectFit: 'cover',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 'var(--radius-md)',
      background: `linear-gradient(135deg, ${equipe.couleur_principale || '#006233'}, ${equipe.couleur_secondaire || '#FBBF00'})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      color: 'white',
      fontFamily: 'var(--font-outfit)',
      fontSize: size < 36 ? '0.65rem' : '0.8rem',
      flexShrink: 0,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: '2px solid var(--color-border)',
    }}>
      {equipe.sigle || equipe.nom.charAt(0)}
    </div>
  )
}

export default function MatchListClient({ initialMatchs }: Props) {
  const [selectedJournee, setSelectedJournee] = useState<number | 'all'>('all')
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
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 0 0 0' }} className="matchs-wrapper">
      {/* Hero Section */}
      <div className="matchs-hero" style={{
        background: 'linear-gradient(135deg, #004d27 0%, #006233 50%, #00A651 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(14px, 4vw, 22px)',
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-green)',
      }}>
        <div style={{
          position: 'absolute',
          top: -50,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -30,
          left: -15,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,215,0,0.06)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            color: 'white',
            fontFamily: 'var(--font-outfit)',
            fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
            fontWeight: 900,
            marginBottom: 6,
            letterSpacing: '-0.02em',
            textAlign: 'center',
          }}>
            ⚽ Calendrier des Matchs
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 'clamp(0.78rem, 2vw, 0.88rem)',
            marginBottom: 14,
            maxWidth: 500,
          }}>
            Calendrier officiel des phases de poules - Navétanes Zone 6 de Khombole
          </p>

          <div style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'white', lineHeight: 1 }}>
                {initialMatchs.length}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 2 }}>
                Matchs
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'white', lineHeight: 1 }}>
                {new Set(initialMatchs.map(m => m.equipe_a_id).concat(initialMatchs.map(m => m.equipe_b_id))).size}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 2 }}>
                Équipes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="matchs-filter-panel" style={{
        background: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 12,
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 16,
      }}>
        {/* Search */}
        <div style={{ marginBottom: 10 }}>
          <input
            className="input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Rechercher une équipe ou un stade..."
            aria-label="Rechercher un match"
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              borderRadius: 10,
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-outfit)',
            }}
          />
        </div>

        {/* Status Filters */}
        <div className="matchs-filter-row" style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto', padding: '2px 2px' }}>
          {statusFilters.map(filter => {
            const active = selectedStatus === filter.value
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedStatus(filter.value)}
                style={{
                  flex: '1 0 auto',
                  padding: '7px 12px',
                  borderRadius: 12,
                  border: '1px solid ' + (active ? 'var(--color-primary)' : 'var(--color-border)'),
                  background: active ? 'rgba(0,98,51,0.08)' : 'var(--color-surface)',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-outfit)',
                }}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        {/* Poule Filters */}
        <div className="matchs-filter-row" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '2px 2px' }}>
          {pouleFilters.map(filter => {
            const active = selectedPoule === filter.value
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedPoule(filter.value)}
                style={{
                  flex: '1 0 auto',
                  padding: '7px 12px',
                  borderRadius: 12,
                  border: '1px solid ' + (active ? 'var(--color-primary)' : 'var(--color-border)'),
                  background: active ? 'rgba(0,98,51,0.08)' : 'var(--color-surface)',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-outfit)',
                }}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        {/* Refresh Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 600,
              fontFamily: 'var(--font-outfit)',
            }}
            aria-label="Actualiser la liste des matchs"
          >
            <RefreshCw size={12} /> Actualiser
          </button>
        </div>
      </div>

      {/* Journée Tabs */}
      <div className="journee-tabs" style={{
        display: 'flex',
        gap: 6,
        marginBottom: 14,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        padding: '2px 2px',
      }}>
        <button
          onClick={() => setSelectedJournee('all')}
          style={{
            flex: '1 0 auto',
            padding: '8px 14px',
            border: 'none',
            background: selectedJournee === 'all' ? 'var(--gradient-green)' : 'var(--color-surface-card)',
            color: selectedJournee === 'all' ? 'white' : 'var(--color-text-secondary)',
            borderRadius: 12,
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: selectedJournee === 'all' ? 'var(--shadow-green)' : 'var(--shadow-sm)',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap',
            minWidth: 72,
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
              flex: '1 0 auto',
              padding: '8px 14px',
              border: 'none',
              background: selectedJournee === j ? 'var(--gradient-green)' : 'var(--color-surface-card)',
              color: selectedJournee === j ? 'white' : 'var(--color-text-secondary)',
              borderRadius: 12,
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: selectedJournee === j ? 'var(--shadow-green)' : 'var(--shadow-sm)',
              transition: 'all 0.25s ease',
              whiteSpace: 'nowrap',
              minWidth: 72,
              fontFamily: 'var(--font-outfit)',
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
          gap: 8,
          padding: '10px 12px',
          background: 'rgba(251,191,0,0.06)',
          border: '1px dashed rgba(251,191,0,0.4)',
          borderRadius: 10,
          marginBottom: 14,
          fontSize: '0.76rem',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
        }}>
          <span style={{ fontSize: '1rem' }}>📢</span>
          <span>
            Exempté ce tour : <strong style={{ color: '#D97706', fontWeight: 700 }}>ASC {EXEMPTE_MAP[selectedJournee].nom}</strong>
          </span>
        </div>
      )}

      {/* Magal Pause */}
      {selectedJournee === 4 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '14px',
          background: 'rgba(0,98,51,0.04)',
          border: '1px solid rgba(0,98,51,0.1)',
          borderRadius: 12,
          marginBottom: 14,
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}>
            🕌 Pause Magal de Touba
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', maxWidth: 320, lineHeight: 1.4 }}>
            Le calendrier observe une pause officielle. Les matchs reprennent le <strong style={{ color: 'var(--color-primary)' }}>03/08/2026</strong>.
          </span>
        </div>
      )}

      {/* Match Cards */}
      {sortedDates.length === 0 ? (
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: '32px 16px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>⚽</div>
          <h3 style={{ fontFamily: 'var(--font-outfit)', marginBottom: 4, fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Aucun match programmé
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Revenez bientôt pour le calendrier officiel.</p>
          {(selectedStatus !== 'all' || selectedPoule !== 'all' || selectedJournee !== 'all' || search) && (
            <button
              type="button"
              style={{
                marginTop: 12,
                padding: '8px 16px',
                background: 'var(--gradient-green)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-green)',
                fontFamily: 'var(--font-outfit)',
              }}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sortedDates.map(date => {
            const matches = matchesByDate[date]
            const d = new Date(date)
            const day = d.toLocaleDateString('fr-FR', { weekday: 'long' })
            const dayNum = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

            return (
              <div key={date}>
                {/* Date Header */}
                <div className="date-header" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    flexShrink: 0,
                    background: 'var(--gradient-green)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-green)',
                  }}>
                    <span style={{ fontSize: '0.48rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
                      {day.slice(0, 3)}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>{d.getDate()}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-outfit)',
                      textTransform: 'capitalize',
                      lineHeight: 1.25,
                    }}>
                      {day} {dayNum}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 1 }}>
                      {matches.length} rencontre{matches.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Match Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                      <Link key={m.id} href={`/matchs/${m.id}`} style={{ textDecoration: 'none', display: 'block' }} className="match-card-link">
                        <div className="match-card" style={{
                          position: 'relative',
                          background: 'linear-gradient(135deg, var(--color-surface-card) 0%, var(--color-surface-elevated) 100%)',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid var(--color-border)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)'
                          }}
                        >
                          {/* Top: Poule + Status */}
                          <div className="match-card-top" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                          }}>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: pouleColor,
                              background: `${pouleColor}15`,
                              padding: '3px 10px',
                              borderRadius: 'var(--radius-full)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}>
                              Poule {poule}
                            </span>

                            {isLive ? (
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                color: '#EF4444',
                                background: 'rgba(239,68,68,0.1)',
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                              }}>
                                <span style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: '#EF4444',
                                  display: 'inline-block',
                                  animation: 'pulse 1.5s infinite',
                                }} />
                                EN DIRECT
                              </span>
                            ) : isDone ? (
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: 'var(--color-text-muted)',
                                background: 'var(--color-surface-elevated)',
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-full)',
                              }}>
                                ✓ Terminé
                              </span>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CountdownTimer
                                  targetDate={m.date_match}
                                  targetTime={m.heure_match || '00:00'}
                                />
                                <span style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  color: 'var(--color-primary)',
                                  background: 'rgba(0,98,51,0.06)',
                                  padding: '3px 10px',
                                  borderRadius: 'var(--radius-full)',
                                }}>
                                  ⏰ {m.heure_match?.slice(0, 5)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Match Body */}
                          <div className="match-card-body" style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            gap: 6,
                            alignItems: 'center',
                            padding: '8px 10px',
                          }}>
                            {/* Équipe A */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div className="team-badge" style={{
                                width: 30,
                                height: 30,
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                                border: '1.5px solid var(--color-border)',
                              }}>
                                <TeamBadge equipe={m.equipe_a} size={30} />
                              </div>
                              <span className="team-name" style={{
                                fontSize: '0.68rem',
                                fontWeight: isWinA ? 800 : 600,
                                color: isWinA ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                textAlign: 'center',
                                lineHeight: 1.25,
                                minHeight: 32,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                {m.equipe_a.nom}
                              </span>
                            </div>

                            {/* Score / VS */}
                            <div className="score-badge" style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: isLive
                                ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))'
                                : 'linear-gradient(135deg, rgba(0,98,51,0.1), rgba(0,166,81,0.06))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '0.68rem',
                              color: isLive ? '#EF4444' : 'var(--color-primary)',
                              border: `1.5px solid ${isLive ? 'rgba(239,68,68,0.25)' : 'rgba(0,98,51,0.18)'}`,
                              fontFamily: 'var(--font-outfit)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            }}>
                              {isDone || isLive ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.68rem' }}>
                                  <span style={{ fontWeight: 900 }}>{m.score_a ?? 0}</span>
                                  <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>–</span>
                                  <span style={{ fontWeight: 900 }}>{m.score_b ?? 0}</span>
                                </div>
                              ) : (
                                <span style={{ fontWeight: 900, fontSize: '0.68rem' }}>VS</span>
                              )}
                            </div>

                            {/* Équipe B */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div className="team-badge" style={{
                                width: 30,
                                height: 30,
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                                border: '1.5px solid var(--color-border)',
                              }}>
                                <TeamBadge equipe={m.equipe_b} size={30} />
                              </div>
                              <span className="team-name" style={{
                                fontSize: '0.68rem',
                                fontWeight: isWinB ? 800 : 600,
                                color: isWinB ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                textAlign: 'center',
                                lineHeight: 1.25,
                                minHeight: 32,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                {m.equipe_b.nom}
                              </span>
                            </div>
                          </div>

                          {/* Share Button */}
                          <button className="share-btn" type="button"
                            onClick={event => {
                              event.preventDefault()
                              event.stopPropagation()
                              window.open(shareUrl, '_blank', 'noopener,noreferrer')
                            }}
                            aria-label="Partager ce match sur WhatsApp"
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: 'var(--color-surface)',
                              color: 'var(--color-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid var(--color-border)',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            <Share2 size={12} />
                          </button>

                          {/* Bottom CTA */}
                          {m.statut === 'a_venir' && (
                            <div className="match-card-footer" style={{
                              borderTop: '1px solid var(--color-border)',
                              padding: '6px 10px',
                              display: 'flex',
                              justifyContent: 'center',
                              background: 'linear-gradient(135deg, rgba(0,98,51,0.02), rgba(0,166,81,0.02))',
                            }}>
                              <span style={{
                                padding: '6px 14px',
                                background: 'var(--gradient-green)',
                                color: 'white',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                boxShadow: '0 3px 10px rgba(0,98,51,0.2)',
                                fontFamily: 'var(--font-outfit)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                letterSpacing: '0.01em',
                              }}>
                                🎯 Pronostiquer →
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
        @media (max-width: 640px) {
          .matchs-wrapper {
            padding-bottom: 96px !important;
          }
          .matchs-hero {
            border-radius: 0 0 16px 16px !important;
            margin-left: -12px !important;
            margin-right: -12px !important;
            margin-bottom: 10px !important;
            padding: 14px 12px !important;
          }
          .matchs-hero h1 {
            font-size: 1.05rem !important;
            text-align: left !important;
            letter-spacing: 0 !important;
          }
          .matchs-hero p {
            text-align: left !important;
            margin-bottom: 10px !important;
          }
          .matchs-filter-panel {
            position: sticky;
            top: 0;
            z-index: 30;
            margin-left: -8px;
            margin-right: -8px;
            padding: 10px !important;
            border-radius: 12px !important;
            backdrop-filter: blur(14px);
          }
          .matchs-filter-row {
            scrollbar-width: none;
          }
          .matchs-filter-row::-webkit-scrollbar,
          .journee-tabs::-webkit-scrollbar {
            display: none;
          }
          .journee-tabs {
            position: sticky;
            top: 108px;
            z-index: 25;
            background: var(--color-bg-primary);
            padding: 6px 0 8px !important;
            margin-bottom: 10px !important;
          }
          .match-card {
            padding: 0 !important;
            border-radius: var(--radius-md) !important;
          }
          .match-card-top {
            padding: 7px 8px !important;
          }
          .match-card-body {
            padding: 8px !important;
            gap: 4px !important;
          }
          .team-badge {
            width: 26px !important;
            height: 26px !important;
          }
          .team-badge img {
            width: 26px !important;
            height: 26px !important;
          }
          .score-badge {
            width: 28px !important;
            height: 28px !important;
            font-size: 0.65rem !important;
          }
          .team-name {
            font-size: 0.65rem !important;
            min-height: 34px !important;
          }
          .match-card-footer {
            padding: 6px 8px !important;
          }
          .share-btn {
            width: 24px !important;
            height: 24px !important;
            top: 4px !important;
            right: 4px !important;
          }
          .share-btn svg {
            width: 10px !important;
            height: 10px !important;
          }
        }
      `}</style>
    </div>
  )
}
