'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Pagination } from '@/components/shared/Pagination'
import { AdvancedFilters, FilterOptions } from '@/components/shared/AdvancedFilters'
import { ClassementTabs } from '@/components/shared/ClassementTabs'
import { QuickSearch } from '@/components/shared/QuickSearch'
import type { SearchResult } from '@/components/shared/QuickSearch'
import { TrendingList } from '@/components/shared/TrendingList'
import { SkeletonList } from '@/components/shared/Skeleton'

interface ClassementsClientProps {
  classementGeneral: any[]
  classementQuartier: any[]
  classementASC: any[]
  equipesRanked: any[]
  isLoading?: boolean
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

  // Trending (top 10 qui montent)
  const trending = useMemo(() => {
    return classementGeneral.slice(0, 20).map((u, idx) => ({
      id: u?.id,
      name: u?.username,
      avatar: u?.avatar_url,
      currentRank: idx + 1,
      previousRank: idx + 2,
      points: u?.points || 0,
      change: 0, // À calculer depuis les données réelles
      type: 'pronostiqueur' as const,
    }))
  }, [classementGeneral])

  const handleSearch = async (query: string): Promise<SearchResult[]> => {
    const results: SearchResult[] = []

    classementGeneral.forEach(u => {
      if (u?.username?.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: u.id,
          name: u.username,
          type: 'pronostiqueur',
          avatar: u.avatar_url,
          points: u.points,
        })
      }
    })

    equipesRanked.forEach(eq => {
      if (eq?.nom?.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: eq.id,
          name: eq.nom,
          type: 'equipe',
          avatar: eq.logo_url,
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

  const renderClassementList = (data: any[], isEquipes = false) => {
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
            fontFamily: 'var(--font-outfit)',
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

    return (
      <>
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          {data.map((item, idx) => {
            const i = idx + (currentPage - 1) * itemsPerPage
            const pct = !isEquipes && item?.total_pronostics > 0
              ? Math.round((item.pronostics_corrects / item.total_pronostics) * 100)
              : 0

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
                  padding: '12px 16px',
                  borderBottom: idx < data.length - 1 ? '1px solid var(--color-border)' : 'none',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>

                  {isEquipes && item?.logo_url ? (
                    <img src={item.logo_url} alt="" className="mobile-team-logo" />
                  ) : !isEquipes && item?.avatar_url ? (
                    <img src={item.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div className="mobile-team-logo-fallback" style={{
                      background: 'var(--gradient-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0a0f0d',
                    }}>
                      {isEquipes ? '⚽' : '👤'}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isEquipes ? item?.nom : item?.username}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {isEquipes ? item?.quartier || item?.asc_nom : item?.quartier}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}>
                      {isEquipes ? item?.points_classement : item?.points}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: pct >= 60 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                      {isEquipes ? `${item?.matchs_joues || 0}MJ` : `${pct}%`}
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

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #004d27 0%, #006233 50%, #00A651 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(24px, 4vw, 32px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-green)',
      }}>
        <div style={{
          position: 'absolute',
          top: -40,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -30,
          left: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,215,0,0.08)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            color: 'white',
            fontFamily: 'var(--font-outfit)',
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 900,
            marginBottom: 8,
            letterSpacing: '-0.02em',
            textAlign: 'center',
          }}>
            🏆 Classements
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
            textAlign: 'center',
            maxWidth: 500,
            margin: '0 auto',
          }}>
            Classement des pronostiqueurs, équipes et ASC
          </p>
        </div>
      </div>

      {/* Recherche rapide */}
      <QuickSearch onSearch={handleSearch} onSelect={handleSelectSearch} />

      {/* Trending */}
      <TrendingList items={trending} period="semaine" />

      {/* Tabs pour mobile */}
      <ClassementTabs children={{
        pronostiqueurs: (
          <div style={{ display: 'grid', gap: 16 }}>
            <AdvancedFilters
              quartiers={quartiers}
              ascs={ascs}
              onFilterChange={setFilters}
            />
            {renderClassementList(paginatedClassement)}
          </div>
        ),
        equipes: (
          <div>
            {renderClassementList(equipesRanked, true)}
          </div>
        ),
        quartiers: (
          <div style={{
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {classementQuartier.map((q, i) => (
              <div key={q?.quartier || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderBottom: i < classementQuartier.length - 1 ? '1px solid var(--color-border)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1.2rem', flexShrink: 0, width: 32, textAlign: 'center' }}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{i + 1}</span>}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{q?.quartier}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {q?.membres} membres
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,98,51,0.12), rgba(0,166,81,0.08))',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 12px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-outfit)',
                }}>
                  {q?.points}
                </div>
              </div>
            ))}
          </div>
        ),
        asc: (
          <div style={{
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {classementASC.map((a, i) => (
              <div key={a?.asc || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderBottom: i < classementASC.length - 1 ? '1px solid var(--color-border)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1.2rem', flexShrink: 0, width: 32, textAlign: 'center' }}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{i + 1}</span>}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>ASC {a?.asc}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {a?.membres} membres
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,98,51,0.12), rgba(0,166,81,0.08))',
                  borderRadius: 'var(--radius-md)',
                  padding: '6px 12px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-outfit)',
                }}>
                  {a?.points}
                </div>
              </div>
            ))}
          </div>
        ),
      }} />
    </div>
  )
}
