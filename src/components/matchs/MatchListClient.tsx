'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Share2, Search, Clock, Zap, CalendarDays, Info, Moon, Filter } from 'lucide-react'
import { MATCH_STATUS_LABELS } from '@/lib/constants/matchStatus'
import { useT } from '@/lib/i18n/LanguageProvider'
import MatchReminderBell from '@/components/matchs/MatchReminderBell'

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
  A: '#0dca6b',
  B: '#1E40AF',
  C: '#B91C1C',
}

const STATUS_DOTS: Record<string, string> = {
  a_venir: 'var(--color-border)',
  en_cours: '#EF4444',
  termine: 'var(--color-primary)',
}

function MiniLogo({ equipe, size = 40 }: { equipe: Team; size?: number }) {
  const radius = Math.round(size * 0.28)
  if (equipe.logo_url) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius, overflow: 'hidden',
        flexShrink: 0, border: '1px solid var(--color-border-subtle)',
        background: 'white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
      }}>
        <Image
          src={equipe.logo_url}
          alt={equipe.nom}
          width={size}
          height={size}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: `linear-gradient(135deg, ${equipe.couleur_principale || '#0dca6b'}, ${equipe.couleur_secondaire || '#ffc94d'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, color: 'white', fontSize: size * 0.34,
      fontFamily: 'var(--font-plus-jakarta)', flexShrink: 0,
      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
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
  const [showFilters, setShowFilters] = useState(false)
  const t = useT()

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
  const totalTeams = new Set(initialMatchs.map(m => m.equipe_a_id).concat(initialMatchs.map(m => m.equipe_b_id))).size

  const resetFilters = () => {
    setSelectedJournee('all')
    setSelectedStatus('all')
    setSelectedPoule('all')
    setSearch('')
  }

  const scrollToDate = (date: string) => {
    document.getElementById(`date-${date}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const hasActiveFilters = selectedStatus !== 'all' || selectedPoule !== 'all' || selectedJournee !== 'all' || !!search
  const isActiveJournee = typeof selectedJournee === 'number'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }} className="matchs-wrapper">
      {/* ====== HEADER ====== */}
      <div style={{
        background: 'var(--gradient-hero)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 24px 20px',
        marginBottom: 12,
        boxShadow: 'var(--shadow-green)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -50, right: -40, width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -70, left: -30, width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <CalendarDays size={18} color="white" />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-plus-jakarta)',
              fontSize: '1.5rem', fontWeight: 900,
              color: 'white',
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>
              {t('matchs.title')}
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', marginTop: 2, fontWeight: 600 }}>
              {t('matchs.subtitle')}
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 8, marginTop: 14 }}>
          {[
            { icon: CalendarDays, value: initialMatchs.length, label: t('matchs.statMatchs') },
            { icon: Zap, value: totalTeams, label: t('matchs.statEquipes') },
            { icon: Clock, value: journees.length, label: t('matchs.statJournees') },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1,
              padding: '8px 10px',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.16)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem',
                color: 'white', lineHeight: 1,
              }}>{stat.value}</span>
              <span style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ====== CONTROL BAR ====== */}
      <div className="matchs-control" style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 14,
        padding: 10,
        marginBottom: 10,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('matchs.search')}
              aria-label={t('matchs.search')}
              style={{
                width: '100%',
                background: 'var(--color-bg-primary)',
                borderRadius: 9,
                padding: '8px 12px 8px 32px',
                border: '1px solid var(--color-border-subtle)',
                fontSize: '0.76rem',
                fontFamily: 'var(--font-plus-jakarta)',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Filtres"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 12px', borderRadius: 9,
              background: hasActiveFilters ? 'rgba(42,255,160,0.08)' : 'var(--color-bg-primary)',
              border: '1px solid ' + (hasActiveFilters ? 'rgba(42,255,160,0.3)' : 'var(--color-border-subtle)'),
              color: hasActiveFilters ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontSize: '0.72rem', fontWeight: 700,
              fontFamily: 'var(--font-plus-jakarta)', cursor: 'pointer',
            }}
          >
            <Filter size={13} /> {t('matchs.filters')}
            {hasActiveFilters && (
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--color-primary)', color: 'white',
                fontSize: '0.55rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{1 + (selectedJournee !== 'all' ? 1 : 0) + (selectedPoule !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)}</span>
            )}
          </button>
        </div>

        {/* Journée selector */}
        <div style={{
          display: 'flex', gap: 6, marginTop: 10,
          overflowX: 'auto', padding: '2px 2px', scrollbarWidth: 'none',
        }}>
          <button
            type="button"
            onClick={() => setSelectedJournee('all')}
            style={{
              flex: '1 0 auto', padding: '6px 12px', borderRadius: 9,
              border: 'none',
              background: selectedJournee === 'all' ? 'var(--gradient-green)' : 'var(--color-bg-primary)',
              color: selectedJournee === 'all' ? 'white' : 'var(--color-text-secondary)',
              fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-plus-jakarta)',
            }}
          >
            {t('matchs.allJournees')}
          </button>
          {journees.map(j => (
            <button
              key={j}
              type="button"
              onClick={() => setSelectedJournee(j)}
              style={{
                flex: '1 0 auto', padding: '6px 12px', borderRadius: 9,
                border: 'none',
                background: selectedJournee === j ? 'var(--gradient-green)' : 'var(--color-bg-primary)',
                color: selectedJournee === j ? 'white' : 'var(--color-text-secondary)',
                fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              J{j}
            </button>
          ))}
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Statut
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {(['all', 'a_venir', 'en_cours', 'termine'] as const).map(s => {
                const active = selectedStatus === s
                const label = s === 'all' ? t('matchs.tous') : MATCH_STATUS_LABELS[s]
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStatus(s)}
                    style={{
                      flex: 1, padding: '6px 8px', borderRadius: 8,
                      border: '1px solid ' + (active ? 'rgba(42,255,160,0.4)' : 'var(--color-border-subtle)'),
                      background: active ? 'rgba(42,255,160,0.07)' : 'transparent',
                      color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'var(--font-plus-jakarta)', whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Poule
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'A', 'B', 'C'] as const).map(p => {
                const active = selectedPoule === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPoule(p)}
                    style={{
                      flex: 1, padding: '6px 8px', borderRadius: 8,
                      border: '1px solid ' + (active ? 'rgba(42,255,160,0.4)' : 'var(--color-border-subtle)'),
                      background: active ? 'rgba(42,255,160,0.07)' : 'transparent',
                      color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                    }}
                  >
                    {p === 'all' ? t('matchs.toutes') : `Poule ${p}`}
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 8,
                  background: 'transparent', border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-secondary)', fontSize: '0.66rem', fontWeight: 600,
                  fontFamily: 'var(--font-plus-jakarta)', cursor: 'pointer',
                }}
              >
                <Share2 size={11} className="refresh-icon" /> {t('matchs.actualiser')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ====== DAY STRIP ====== */}
      {sortedDates.length > 0 && (
        <div style={{
          display: 'flex', gap: 6, marginBottom: 12,
          overflowX: 'auto', padding: '2px 2px 6px', scrollbarWidth: 'none',
        }} className="day-strip">
          {sortedDates.map(date => {
            const d = new Date(date)
            const isToday = date === new Date().toISOString().split('T')[0]
            const active = matchesByDate[date].length > 0
            return (
              <button
                key={date}
                type="button"
                onClick={() => scrollToDate(date)}
                style={{
                  flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '7px 12px', borderRadius: 10,
                  background: isToday ? 'rgba(42,255,160,0.08)' : 'var(--color-surface-card)',
                  border: '1px solid ' + (isToday ? 'rgba(42,255,160,0.35)' : 'var(--color-border-subtle)'),
                  cursor: 'pointer',
                  opacity: active ? 1 : 0.5,
                  boxShadow: isToday ? 'none' : 'var(--shadow-card)',
                }}
              >
                <span style={{
                  fontSize: '0.5rem', fontWeight: 700, color: isToday ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2,
                }}>
                  {d.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </span>
                <span style={{
                  fontSize: '0.78rem', fontWeight: 900, lineHeight: 1.3,
                  color: isToday ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {d.getDate()}
                </span>
                <span style={{
                  fontSize: '0.5rem', fontWeight: 600, color: 'var(--color-text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.03em',
                }}>
                  {d.toLocaleDateString('fr-FR', { month: 'short' })}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ====== NOTICES ====== */}
      {isActiveJournee && EXEMPTE_MAP[selectedJournee] && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px',
          background: 'rgba(255,201,77,0.07)',
          border: '1px solid rgba(255,201,77,0.3)',
          borderRadius: 10, marginBottom: 10,
          fontSize: '0.7rem', color: 'var(--color-text-secondary)',
        }}>
          <Info size={13} color="var(--color-accent)" style={{ flexShrink: 0 }} />
          <span>
            {t('matchs.exempte')} <strong style={{ color: 'var(--color-accent)', fontWeight: 700 }}>ASC {EXEMPTE_MAP[selectedJournee].nom}</strong>
          </span>
        </div>
      )}
      {selectedJournee === 4 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px',
          background: 'rgba(42,255,160,0.05)',
          border: '1px solid rgba(42,255,160,0.15)',
          borderRadius: 10, marginBottom: 10,
          fontSize: '0.7rem',
        }}>
          <Moon size={13} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{t('matchs.pauseMagal')}</strong>
          </span>
        </div>
      )}

      {/* ====== FIXTURE LIST ====== */}
      {sortedDates.length === 0 ? (
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 16, padding: '32px 16px', textAlign: 'center',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--color-bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px',
          }}>
            <CalendarDays size={22} color="var(--color-text-muted)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-plus-jakarta)', fontSize: '0.9rem', fontWeight: 800, marginBottom: 3 }}>
            {t('matchs.aucunMatch')}
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem', marginBottom: 12 }}>
            {t('matchs.aucunMatchDesc')}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                padding: '8px 16px', background: 'var(--gradient-green)', color: 'white',
                border: 'none', borderRadius: 9, fontSize: '0.7rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-plus-jakarta)',
              }}
            >
              {t('matchs.resetFilters')}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sortedDates.map(date => {
            const matches = matchesByDate[date]
            const d = new Date(date)
            const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

            return (
              <div key={date} id={`date-${date}`} className="fixture-day">
                {/* Day header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '0 2px' }}>
                  <div style={{
                    width: 30, height: 32, borderRadius: 9, flexShrink: 0,
                    background: 'var(--gradient-green)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(42,255,160,0.25)',
                  }}>
                    <span style={{ fontSize: '0.4rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', lineHeight: 1 }}>
                      {dayLabel.slice(0, 3)}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'white', lineHeight: 1.1, fontFamily: 'var(--font-mono)' }}>
                      {d.getDate()}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 800, fontSize: '0.76rem', textTransform: 'capitalize',
                      color: 'var(--color-text-primary)', fontFamily: 'var(--font-plus-jakarta)', lineHeight: 1.2,
                    }}>
                      {dayLabel}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {matches.length} {t('matchs.rencontres')}{matches.length > 1 ? 's' : ''} · {t('matchs.journee')} {matches[0].journee || '?'}
                    </div>
                  </div>
                </div>

                {/* Fixture container */}
                <div style={{
                  background: 'var(--color-surface-card)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-card)',
                }}>
                  {matches.map((m, idx) => {
                    const isDone = m.statut === 'termine'
                    const isLive = m.statut === 'en_cours'
                    const isWinA = isDone && (m.score_a ?? 0) > (m.score_b ?? 0)
                    const isWinB = isDone && (m.score_b ?? 0) > (m.score_a ?? 0)
                    const poule = m.equipe_a.poule || 'A'
                    const pouleColor = POULE_COLORS[poule] || '#0dca6b'
                    const shareText = `${m.equipe_a.nom} vs ${m.equipe_b.nom} sur NavéStats\n${new Date(m.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${m.heure_match?.slice(0, 5)}\nhttps://navestats.site/matchs/${m.id}`
                    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

                    return (
                      <Link
                        key={m.id}
                        href={`/matchs/${m.id}`}
                        style={{
                          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '14px 14px',
                          borderBottom: idx < matches.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                          transition: 'background 0.12s',
                        }}
                        className="fixture-row"
                      >
                        {/* Time */}
                        <div style={{
                          width: 52, flexShrink: 0,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem',
                            color: isLive ? 'var(--color-red)' : 'var(--color-text-primary)',
                            lineHeight: 1,
                          }}>
                            {m.heure_match?.slice(0, 5)}
                          </span>
                          <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: STATUS_DOTS[m.statut] || 'var(--color-border)',
                            animation: isLive ? 'matchPulse 1.4s infinite' : 'none',
                          }} />
                        </div>

                        {/* Teams + score */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
                            <span style={{
                              fontSize: '0.8rem', fontWeight: isWinA ? 700 : 500,
                              color: isWinA ? 'var(--color-primary)' : 'var(--color-text-primary)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {m.equipe_a.nom}
                            </span>
                            <MiniLogo equipe={m.equipe_a} />
                          </div>

                          <div style={{
                            minWidth: 62, textAlign: 'center', flexShrink: 0,
                          }}>
                            {isDone || isLive ? (
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1rem',
                                padding: '5px 10px', borderRadius: 10,
                                background: isLive ? 'rgba(239,68,68,0.08)' : 'rgba(42,255,160,0.06)',
                              }}>
                                <span style={{ color: isWinA ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{m.score_a ?? 0}</span>
                                <span style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)' }}>–</span>
                                <span style={{ color: isWinB ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{m.score_b ?? 0}</span>
                              </div>
                            ) : (
                              <span style={{
                                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem',
                                color: 'var(--color-text-muted)', letterSpacing: '0.1em',
                              }}>
                                VS
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
                            <MiniLogo equipe={m.equipe_b} />
                            <span style={{
                              fontSize: '0.8rem', fontWeight: isWinB ? 700 : 500,
                              color: isWinB ? 'var(--color-primary)' : 'var(--color-text-primary)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {m.equipe_b.nom}
                            </span>
                          </div>
                        </div>

                        {/* Right side */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 800,
                            color: pouleColor, background: `${pouleColor}10`,
                            padding: '4px 9px', borderRadius: 7,
                            letterSpacing: '0.04em', display: 'none',
                          }} className="poule-chip">
                            Poule {poule}
                          </span>
                          {isLive && (
                            <span style={{
                              fontSize: '0.62rem', fontWeight: 800, color: '#EF4444',
                              display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                              <Zap size={12} /> {t('matchs.direct')}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={event => { event.preventDefault(); event.stopPropagation(); window.open(shareUrl, '_blank', 'noopener,noreferrer') }}
                            aria-label={t('matchs.partager')}
                            style={{
                              width: 32, height: 32, borderRadius: 9,
                              background: 'var(--color-bg-primary)', color: 'var(--color-text-muted)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '1px solid var(--color-border-subtle)', cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <Share2 size={13} />
                          </button>
                          {m.statut === 'a_venir' && (
                            <MatchReminderBell
                              matchId={m.id}
                              dateMatch={m.date_match}
                              heureMatch={m.heure_match}
                            />
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
        @keyframes matchPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .refresh-icon { transform: rotate(90deg); }
        .fixture-row:hover { background: var(--color-bg-primary); }
        .day-strip::-webkit-scrollbar { display: none; }
        .journee-selector::-webkit-scrollbar { display: none; }
        @media (min-width: 641px) {
          .poule-chip { display: inline-block !important; }
        }
        @media (max-width: 640px) {
          .matchs-wrapper { padding-bottom: 96px !important; }
          .matchs-control { position: sticky; top: 0; z-index: 30; margin-left: -8px; margin-right: -8px; backdrop-filter: blur(14px); background: rgba(14,23,19,0.92); }
          .fixture-day { scroll-margin-top: 180px; }
        }
        @media (min-width: 641px) {
          .fixture-day { scroll-margin-top: 16px; }
        }
      `}</style>
    </div>
  )
}
