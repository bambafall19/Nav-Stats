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
          padding: 24,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.9rem',
        }}>
          Aucun résultat
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
    <div style={{ display: 'grid', gap: 24 }}>
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
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            {classementQuartier.map((q, i) => (
              <div key={q?.quartier || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderBottom: i < classementQuartier.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0, width: 24, textAlign: 'center' }}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{q?.quartier}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {q?.membres} membres
                  </div>
                </div>
                <div style={{
                  background: 'rgba(0,98,51,0.08)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  color: 'var(--color-primary)',
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
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            {classementASC.map((a, i) => (
              <div key={a?.asc || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderBottom: i < classementASC.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0, width: 24, textAlign: 'center' }}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>ASC {a?.asc}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {a?.membres} membres
                  </div>
                </div>
                <div style={{
                  background: 'rgba(0,98,51,0.08)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  color: 'var(--color-primary)',
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
