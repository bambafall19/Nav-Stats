'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Trophy, Users, Shield, Home } from 'lucide-react'
import { Pagination } from '@/components/shared/Pagination'
import { AdvancedFilters, FilterOptions } from '@/components/shared/AdvancedFilters'
import { ClassementTabs } from '@/components/shared/ClassementTabs'
import { QuickSearch } from '@/components/shared/QuickSearch'
import type { SearchResult } from '@/components/shared/QuickSearch'
import { SkeletonList } from '@/components/shared/Skeleton'

interface RankedRow {
  id?: string
  username?: string
  nom?: string
  avatar_url?: string | null
  logo_url?: string | null
  quartier?: string | null
  asc_nom?: string | null
  points?: number
  points_classement?: number
  matchs_joues?: number
  total_pronostics?: number | null
  pronostics_corrects?: number | null
}

interface AggregatedRow {
  quartier?: string
  asc?: string
  points: number
  membres: number
}

interface ClassementsClientProps {
  classementGeneral: RankedRow[]
  classementQuartier: AggregatedRow[]
  classementASC: AggregatedRow[]
  equipesRanked: RankedRow[]
  isLoading?: boolean
}

const MEDALS = ['🥇', '🥈', '🥉']

function TabSubtitle({ text }: { text: string }) {
  return (
    <p style={{
      margin: 0,
      marginBottom: 12,
      fontSize: '0.72rem',
      color: 'var(--color-text-secondary)',
      fontWeight: 500,
    }}>
      {text}
    </p>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.95rem',
        background: rank === 1
          ? 'linear-gradient(135deg, #ffd97d, #f0a800)'
          : rank === 2
            ? 'linear-gradient(135deg, #c8d2d0, #8f9d99)'
            : 'linear-gradient(135deg, #d97706, #92400e)',
        boxShadow: rank === 1
          ? '0 2px 14px rgba(255,201,77,0.45)'
          : rank === 2
            ? '0 2px 14px rgba(143,157,153,0.35)'
            : '0 2px 14px rgba(217,119,6,0.35)',
      }}>
        {MEDALS[rank - 1]}
      </div>
    )
  }
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-secondary)',
      fontFamily: 'var(--font-plus-jakarta)',
    }}>
      {rank}
    </div>
  )
}

export function ClassementsClient({
  classementGeneral,
  classementQuartier,
  classementASC,
  equipesRanked,
  isLoading = false,
}: ClassementsClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterOptions>({})
  const itemsPerPage = 12

  // Extraire quartiers et ASC uniques
  const quartiers = useMemo(() => {
    return [...new Set(classementGeneral.map(u => u?.quartier).filter(Boolean))] as string[]
  }, [classementGeneral])

  const ascs = useMemo(() => {
    return [...new Set(classementGeneral.map(u => u?.asc_nom).filter(Boolean))] as string[]
  }, [classementGeneral])

  // Appliquer les filtres
  const filteredClassement = useMemo(() => {
    return classementGeneral.filter(u => {
      if (filters.quartier && u?.quartier !== filters.quartier) return false
      if (filters.asc && u?.asc_nom !== filters.asc) return false
      return true
    })
  }, [classementGeneral, filters])

  // Pagination
  const totalPages = Math.ceil(filteredClassement.length / itemsPerPage)
  const paginatedClassement = filteredClassement.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSearch = async (query: string): Promise<SearchResult[]> => {
    const results: SearchResult[] = []

    classementGeneral.forEach(u => {
      if (u?.username?.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: u.id ?? '',
          name: u.username,
          type: 'pronostiqueur',
          avatar: u.avatar_url ?? undefined,
          points: u.points,
        })
      }
    })

    equipesRanked.forEach(eq => {
      if (eq?.nom?.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: eq.id ?? '',
          name: eq.nom,
          type: 'equipe',
          avatar: eq.logo_url ?? undefined,
          points: eq.points_classement,
        })
      }
    })

    return results.slice(0, 10)
  }

  const handleSelectSearch = (result: SearchResult) => {
    if (result.type === 'pronostiqueur') {
      window.location.href = `/profil/${result.id}`
    } else {
      window.location.href = `/equipes/${result.id}`
    }
  }

  const renderClassementList = (data: RankedRow[], isEquipes = false) => {
    if (isLoading) {
      return <SkeletonList count={5} />
    }

    if (data.length === 0) {
      return (
        <div style={{
          padding: 'clamp(32px, 5vw, 48px) 20px',
          textAlign: 'center',
          background: 'var(--color-surface-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
          <h3 style={{
            fontFamily: 'var(--font-plus-jakarta)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 6,
          }}>
            Aucun résultat
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', maxWidth: 320, margin: '0 auto' }}>
            Aucune donnée disponible pour le moment. Revenez plus tard !
          </p>
        </div>
      )
    }

    const maxPoints = Math.max(...data.map(item => isEquipes ? (item?.points_classement || 0) : (item?.points || 0)), 1)

    return (
      <>
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}>
          {data.map((item, idx) => {
            const i = idx + (currentPage - 1) * itemsPerPage
            const points = isEquipes ? (item?.points_classement || 0) : (item?.points || 0)
            const totalPronos = item?.total_pronostics || 0
            const pct = !isEquipes && totalPronos > 0 && (item?.pronostics_corrects ?? 0) >= 0
              ? Math.round(((item?.pronostics_corrects || 0) / totalPronos) * 100)
              : null
            const barWidth = Math.round((points / maxPoints) * 100)

            return (
              <Link
                key={item?.id || idx}
                href={isEquipes ? `/equipes/${item?.id}` : `/profil/${item?.id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '13px 16px',
                  borderBottom: idx < data.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <RankBadge rank={i + 1} />

                  {isEquipes && item?.logo_url ? (
                    <img src={item.logo_url} alt="" className="mobile-team-logo" />
                  ) : !isEquipes && item?.avatar_url ? (
                    <img src={item.avatar_url} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--color-border-subtle)' }} />
                  ) : (
                    <div className="mobile-team-logo-fallback" style={{
                      background: isEquipes ? 'var(--gradient-gold)' : 'var(--gradient-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isEquipes ? '#2b1b00' : '#0a0f0d',
                      fontSize: '0.8rem',
                    }}>
                      {isEquipes ? '⚽' : '👤'}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isEquipes ? item?.nom : item?.username}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
                      {isEquipes
                        ? (item?.quartier || item?.asc_nom || '—')
                        : (item?.quartier || '—')}
                    </div>
                    <div className="progress-bar" style={{ height: 4, marginTop: 7, maxWidth: 200 }}>
                      <div className="progress-fill" style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)', fontFamily: 'var(--font-plus-jakarta)' }}>
                      {points}
                      <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: 600, marginLeft: 3 }}>
                        {isEquipes ? 'pts' : 'pts'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {isEquipes
                        ? `${item?.matchs_joues || 0} MJ`
                        : (pct !== null
                            ? <span style={{ color: pct >= 60 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 700 }}>{pct}% réussite</span>
                            : `${totalPronos} prono`)}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {!isEquipes && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    )
  }

  const renderAggregated = (rows: AggregatedRow[], label: string, subLabel: (r: AggregatedRow) => string) => {
    const maxPoints = Math.max(...rows.map(r => r?.points || 0), 1)
    return (
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}>
        {rows.map((r, i) => {
          const barWidth = Math.round(((r?.points || 0) / maxPoints) * 100)
          return (
            <div key={r?.quartier || r?.asc || i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderBottom: i < rows.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <RankBadge rank={i + 1} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {label === 'ASC' ? `ASC ${r?.asc}` : r?.quartier}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
                  {subLabel(r)}
                </div>
                <div className="progress-bar" style={{ height: 4, marginTop: 7, maxWidth: 200 }}>
                  <div className="progress-fill" style={{ width: `${barWidth}%` }} />
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(42,255,160,0.12), rgba(16,185,129,0.08))',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                fontWeight: 900,
                fontSize: '0.9rem',
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-plus-jakarta)',
                flexShrink: 0,
              }}>
                {r?.points}
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 600, marginLeft: 3 }}>pts</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Hero Section */}
      <div className="hero-gradient" style={{
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(18px, 4vw, 28px)',
        boxShadow: 'var(--shadow-green)',
        border: '1px solid rgba(42,255,160,0.14)',
      }}>
        <div style={{
          position: 'absolute',
          top: -40,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'rgba(42,255,160,0.08)',
          filter: 'blur(20px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -30,
          left: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,201,77,0.12)',
          filter: 'blur(24px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,201,77,0.12)',
            border: '1px solid rgba(255,201,77,0.3)',
            color: 'var(--color-accent)',
            fontSize: '0.62rem', fontWeight: 800,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '5px 14px', borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-plus-jakarta)',
            marginBottom: 10,
          }}>
            <Trophy size={12} />
            Classement général
          </span>
          <h1 style={{
            color: 'white',
            fontFamily: 'var(--font-plus-jakarta)',
            fontSize: 'clamp(1.3rem, 4vw, 1.9rem)',
            fontWeight: 900,
            marginBottom: 4,
            letterSpacing: '-0.02em',
          }}>
            Classements
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 'clamp(0.72rem, 2vw, 0.85rem)',
            marginBottom: 14,
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Pronostiqueurs, équipes, quartiers et ASC — tout le palmarès du NavéStats
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            maxWidth: 520,
            margin: '0 auto',
          }}>
            {[
              { icon: Users, value: classementGeneral.length, label: 'Pronostiqueurs' },
              { icon: Shield, value: equipesRanked.length, label: 'Équipes' },
              { icon: Home, value: classementQuartier.length, label: 'Quartiers' },
            ].map(({ icon: Icon, value, label }, i) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '10px 6px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <Icon size={15} color={i === 0 ? 'var(--color-primary)' : 'var(--color-accent)'} />
                <div style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 900, fontFamily: 'var(--font-plus-jakarta)', color: 'white', lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recherche rapide */}
      <QuickSearch onSearch={handleSearch} onSelect={handleSelectSearch} />

      {/* Tabs */}
      <ClassementTabs
        pronostiqueurs={(
          <div style={{ display: 'grid', gap: 16 }}>
            <AdvancedFilters
              quartiers={quartiers}
              ascs={ascs}
              onFilterChange={setFilters}
            />
            <TabSubtitle text="Classé par points de pronostics gagnés. Cliquez sur un joueur pour voir son profil." />
            {renderClassementList(paginatedClassement)}
          </div>
        )}
        equipes={(
          <div>
            <TabSubtitle text="Classement des équipes par points de compétition, avec leur nombre de matchs joués." />
            {renderClassementList(equipesRanked, true)}
          </div>
        )}
        quartiers={(
          <div>
            <TabSubtitle text="Somme des points de tous les pronostiqueurs du quartier, et nombre de membres." />
            {renderAggregated(classementQuartier, 'Quartier', r => `${r?.membres || 0} membres`)}
          </div>
        )}
        asc={(
          <div>
            <TabSubtitle text="Somme des points de tous les membres de l'ASC, et nombre de membres." />
            {renderAggregated(classementASC, 'ASC', r => `${r?.membres || 0} membres`)}
          </div>
        )}
      />
    </div>
  )
}
