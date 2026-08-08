'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Trophy, Users, Home } from 'lucide-react'
import { Pagination } from '@/components/shared/Pagination'
import { AdvancedFilters, FilterOptions } from '@/components/shared/AdvancedFilters'
import { ClassementTabs } from '@/components/shared/ClassementTabs'
import { QuickSearch } from '@/components/shared/QuickSearch'
import type { SearchResult } from '@/components/shared/QuickSearch'
import { SkeletonList } from '@/components/shared/Skeleton'
import { useT } from '@/lib/i18n/LanguageProvider'
import { ClassementPdfExport } from '@/components/shared/ClassementPdfExport'

export interface RankedRow {
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

export interface AggregatedRow {
  quartier?: string
  asc?: string
  points: number
  membres: number
}

export interface ClassementsClientProps {
  classementGeneral: RankedRow[]
  classementQuartier: AggregatedRow[]
  classementASC: AggregatedRow[]
  isLoading?: boolean
}

const MEDALS = ['🥇', '🥈', '🥉']

function TabSubtitle({ text }: { text: string }) {
  return (
    <p style={{
      margin: 0,
      marginBottom: 14,
      fontSize: '0.74rem',
      color: 'var(--color-text-secondary)',
      fontWeight: 500,
      textAlign: 'center',
      lineHeight: 1.5,
    }}>
      {text}
    </p>
  )
}

const PODIUM_STYLES: Record<number, { glow: string; text: string; bg: string; border: string; cardBg: string }> = {
  1: {
    glow: '0 0 0 1px rgba(255,201,77,0.35), 0 4px 18px rgba(255,201,77,0.35)',
    text: '#ffd97d',
    bg: 'linear-gradient(135deg, #ffd97d, #f0a800)',
    border: '1px solid rgba(255,201,77,0.4)',
    cardBg: 'linear-gradient(135deg, rgba(255,201,77,0.09), rgba(255,201,77,0.02))',
  },
  2: {
    glow: '0 0 0 1px rgba(201,212,208,0.3), 0 4px 18px rgba(201,212,208,0.25)',
    text: '#c8d2d0',
    bg: 'linear-gradient(135deg, #e4ece9, #9aa8a3)',
    border: '1px solid rgba(201,212,208,0.35)',
    cardBg: 'linear-gradient(135deg, rgba(201,212,208,0.09), rgba(201,212,208,0.02))',
  },
  3: {
    glow: '0 0 0 1px rgba(217,119,6,0.35), 0 4px 18px rgba(217,119,6,0.3)',
    text: '#eab37a',
    bg: 'linear-gradient(135deg, #e8a15c, #8a4a0e)',
    border: '1px solid rgba(217,119,6,0.4)',
    cardBg: 'linear-gradient(135deg, rgba(217,119,6,0.09), rgba(217,119,6,0.02))',
  },
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const s = PODIUM_STYLES[rank]
    return (
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.05rem',
        background: s.bg,
        boxShadow: s.glow,
        position: 'relative',
      }}>
        {MEDALS[rank - 1]}
        <span style={{
          position: 'absolute', top: -5, right: -5,
          width: 14, height: 14, borderRadius: '50%',
          background: 'var(--color-bg-primary)',
          border: `1.5px solid ${s.text}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: 900, color: s.text,
          fontFamily: 'var(--font-plus-jakarta)',
        }}>{rank}</span>
      </div>
    )
  }
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)',
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
  isLoading = false,
}: ClassementsClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [activeTab, setActiveTab] = useState<'pronostiqueurs' | 'quartiers' | 'asc'>('pronostiqueurs')
  const itemsPerPage = 12
  const t = useT()

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

  // Données pour l'export PDF selon l'onglet actif
  const exportData = useMemo(() => {
    switch (activeTab) {
      case 'quartiers':
        return {
          title: `${t('classements.title')} – ${t('classements.quartiers')}`,
          columns: ['#', t('classements.quartiers'), t('classements.membres'), t('classements.pts')],
          rows: classementQuartier.map((q, i) => [i + 1, q?.quartier || '—', q?.membres || 0, q?.points || 0]),
        }
      case 'asc':
        return {
          title: `${t('classements.title')} – ASC`,
          columns: ['#', 'ASC', t('classements.membres'), t('classements.pts')],
          rows: classementASC.map((a, i) => [i + 1, a?.asc || '—', a?.membres || 0, a?.points || 0]),
        }
      default:
        return {
          title: `${t('classements.title')} – ${t('classements.pronostiqueurs')}`,
          columns: ['#', t('classements.pronostiqueurs'), t('classements.quartiers'), t('classements.pts')],
          rows: classementGeneral.map((u, i) => [i + 1, u?.username || '—', u?.quartier || '—', u?.points || 0]),
        }
    }
  }, [activeTab, classementGeneral, classementQuartier, classementASC, t])

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

    return results.slice(0, 10)
  }

  const handleSelectSearch = (result: SearchResult) => {
    window.location.href = `/profil/${result.id}`
  }

  const renderClassementList = (data: RankedRow[]) => {
    if (isLoading) {
      return <SkeletonList count={5} />
    }

    if (data.length === 0) {
      return (
        <div style={{
          padding: 'clamp(28px, 5vw, 40px) 20px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.035)',
          backdropFilter: 'blur(12px) saturate(140%)',
          WebkitBackdropFilter: 'blur(12px) saturate(140%)',
          borderRadius: 18,
          border: '1px solid rgba(255, 255, 255, 0.07)',
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.22)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
          <h3 style={{
            fontFamily: 'var(--font-plus-jakarta)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 6,
          }}>
            {t('classements.aucunResultat')}
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', maxWidth: 320, margin: '0 auto' }}>
            {t('classements.aucunResultatDesc')}
          </p>
        </div>
      )
    }

    const maxPoints = Math.max(...data.map(item => (item?.points || 0)), 1)

    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', minWidth: 0 }}>
          {data.map((item, idx) => {
            const i = idx + (currentPage - 1) * itemsPerPage
            const rank = i + 1
            const podium = rank <= 3 ? PODIUM_STYLES[rank] : null
            const points = item?.points || 0
            const totalPronos = item?.total_pronostics || 0
            const pct = totalPronos > 0 && (item?.pronostics_corrects ?? 0) >= 0
              ? Math.round(((item?.pronostics_corrects || 0) / totalPronos) * 100)
              : null
            const barWidth = Math.round((points / maxPoints) * 100)

            return (
              <Link
                key={item?.id || idx}
                href={`/profil/${item?.id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%', maxWidth: '100%' }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  minWidth: 0,
                  padding: '17px 18px',
                  borderRadius: 18,
                  background: podium ? podium.cardBg : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(140%)',
                  border: podium ? podium.border : '1px solid rgba(255, 255, 255, 0.09)',
                  boxShadow: podium ? podium.glow : '0 8px 22px rgba(0, 0, 0, 0.26)',
                  transition: 'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = podium ? podium.glow.replace('1px', '2px') : '0 12px 30px rgba(0,0,0,0.32), 0 0 0 1px rgba(42,255,160,0.12)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = podium ? podium.glow : '0 8px 22px rgba(0, 0, 0, 0.26)' }}
                >
                  {podium && (
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                      background: podium.bg,
                    }} />
                  )}
                  <RankBadge rank={rank} />

                  {item?.avatar_url ? (
                    <img src={item.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255, 255, 255, 0.1)' }} />
                  ) : (
                    <div className="mobile-team-logo-fallback" style={{
                      background: 'var(--gradient-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0a0f0d',
                      fontSize: '0.9rem',
                    }}>
                      👤
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: '0.97rem',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: podium ? podium.text : 'var(--color-text-primary)',
                      fontFamily: 'var(--font-plus-jakarta)',
                    }}>
                      {item?.username}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: 3 }}>
                      {item?.quartier || '—'}
                    </div>
                    <div className="progress-bar" style={{ height: 4, marginTop: 8, maxWidth: 220 }}>
                      <div className="progress-fill" style={{ width: `${barWidth}%`, background: podium ? podium.bg : undefined }} />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.08rem', color: 'var(--color-primary)', fontFamily: 'var(--font-plus-jakarta)' }}>
                      {points}
                      <span style={{ fontSize: '0.64rem', color: 'var(--color-text-muted)', fontWeight: 600, marginLeft: 3 }}>
                        {t('classements.pts')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 2 }}>
                      {pct !== null
                        ? <span style={{ color: pct >= 60 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 700 }}>{pct}% {t('classements.reussite')}</span>
                        : `${totalPronos} ${t('classements.prono')}`}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div style={{
            position: 'sticky',
            bottom: 92,
            zIndex: 5,
            marginTop: 8,
            width: '100%',
            maxWidth: '100%',
          }}>
            <div style={{
              background: 'rgba(5, 10, 8, 0.88)',
              backdropFilter: 'blur(14px) saturate(150%)',
              WebkitBackdropFilter: 'blur(14px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 18,
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.42)',
              padding: '8px 12px',
              maxWidth: '100%',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </>
    )
  }

  const renderAggregated = (rows: AggregatedRow[], label: string, subLabel: (r: AggregatedRow) => string) => {
    const maxPoints = Math.max(...rows.map(r => r?.points || 0), 1)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', minWidth: 0 }}>
        {rows.map((r, i) => {
          const rank = i + 1
          const podium = rank <= 3 ? PODIUM_STYLES[rank] : null
          const barWidth = Math.round(((r?.points || 0) / maxPoints) * 100)
          return (
            <div key={r?.quartier || r?.asc || i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
              minWidth: 0,
              padding: '16px 18px',
              borderRadius: 18,
              background: podium ? podium.cardBg : 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px) saturate(140%)',
              WebkitBackdropFilter: 'blur(12px) saturate(140%)',
              border: podium ? podium.border : '1px solid rgba(255, 255, 255, 0.09)',
              boxShadow: podium ? podium.glow : '0 8px 22px rgba(0, 0, 0, 0.26)',
              transition: 'transform 0.16s ease, boxShadow 0.16s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = podium ? podium.glow : '0 12px 30px rgba(0,0,0,0.32)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = podium ? podium.glow : '0 8px 22px rgba(0, 0, 0, 0.26)' }}
            >
              {podium && (
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                  background: podium.bg,
                }} />
              )}
              <RankBadge rank={rank} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700, fontSize: '1rem',
                  color: podium ? podium.text : 'var(--color-text-primary)',
                  fontFamily: 'var(--font-plus-jakarta)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {label === 'ASC' ? `ASC ${r?.asc}` : r?.quartier}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: 3 }}>
                  {subLabel(r)}
                </div>
                <div className="progress-bar" style={{ height: 4, marginTop: 8, maxWidth: 220 }}>
                  <div className="progress-fill" style={{ width: `${barWidth}%`, background: podium ? podium.bg : undefined }} />
                </div>
              </div>
              <div style={{
                background: podium ? podium.bg : 'linear-gradient(135deg, rgba(42,255,160,0.12), rgba(16,185,129,0.08))',
                borderRadius: 12,
                padding: '7px 13px',
                fontWeight: 900,
                fontSize: '0.95rem',
                color: podium ? 'var(--color-bg-primary)' : 'var(--color-primary)',
                fontFamily: 'var(--font-plus-jakarta)',
                flexShrink: 0,
                boxShadow: podium ? podium.glow : 'none',
              }}>
                {r?.points}
                <span style={{ fontSize: '0.6rem', color: podium ? 'rgba(0,0,0,0.6)' : 'var(--color-text-muted)', fontWeight: 600, marginLeft: 3 }}>{t('classements.pts')}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 24, width: '100%', minWidth: 0, maxWidth: '100%' }}>
      {/* Hero Section */}
      <div className="hero-gradient" style={{
        borderRadius: 24,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        padding: 'clamp(14px, 3vw, 22px)',
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
            fontSize: '0.6rem', fontWeight: 800,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '4px 13px', borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font-plus-jakarta)',
            marginBottom: 8,
          }}>
            <Trophy size={11} />
            {t('classements.general')}
          </span>
          <h1 style={{
            color: 'white',
            fontFamily: 'var(--font-plus-jakarta)',
            fontSize: 'clamp(1.15rem, 3.4vw, 1.6rem)',
            fontWeight: 900,
            marginBottom: 2,
            letterSpacing: '-0.02em',
          }}>
            {t('classements.title')}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 'clamp(0.7rem, 2vw, 0.82rem)',
            marginBottom: 10,
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {t('classements.heroSub')}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 8,
            maxWidth: 520,
            width: '100%',
            minWidth: 0,
            margin: '0 auto',
          }}>
            {[
              { icon: Users, value: classementGeneral.length, label: t('classements.pronostiqueurs') },
              { icon: Trophy, value: classementASC.length, label: t('classements.asc') },
              { icon: Home, value: classementQuartier.length, label: t('classements.quartiers') },
            ].map(({ icon: Icon, value, label }, i) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '8px 5px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                minWidth: 0,
                width: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}>
                <Icon size={14} color={i === 0 ? 'var(--color-primary)' : 'var(--color-accent)'} />
                <div style={{ fontSize: 'clamp(0.9rem, 2.6vw, 1.1rem)', fontWeight: 900, fontFamily: 'var(--font-plus-jakarta)', color: 'white', lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {value}
                </div>
                <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.75)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
            <ClassementPdfExport
              title={exportData.title}
              columns={exportData.columns}
              rows={exportData.rows}
            />
          </div>
        </div>
      </div>

      {/* Recherche rapide */}
      <QuickSearch onSearch={handleSearch} onSelect={handleSelectSearch} />

      {/* Tabs */}
      <ClassementTabs
        onTabChange={setActiveTab}
        pronostiqueurs={(
          <div style={{ display: 'grid', gap: 16 }}>
            <AdvancedFilters
              quartiers={quartiers}
              ascs={ascs}
              onFilterChange={setFilters}
            />
            <TabSubtitle text={t('classements.tabsPronos')} />
            {renderClassementList(paginatedClassement)}
          </div>
        )}
        quartiers={(
          <div>
            <TabSubtitle text={t('classements.tabsQuartiers')} />
            {renderAggregated(classementQuartier, 'Quartier', r => `${r?.membres || 0} ${t('classements.membres')}`)}
          </div>
        )}
        asc={(
          <div>
            <TabSubtitle text={t('classements.tabsAsc')} />
            {renderAggregated(classementASC, 'ASC', r => `${r?.membres || 0} ${t('classements.membres')}`)}
          </div>
        )}
      />
    </div>
  )
}
