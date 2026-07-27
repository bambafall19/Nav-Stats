'use client'

import { useState } from 'react'

interface FilterProps {
  quartiers: string[]
  ascs: string[]
  onFilterChange: (filters: { quartier?: string; asc?: string; period?: string }) => void
}

export default function ClassementFilters({ quartiers, ascs, onFilterChange }: FilterProps) {
  const [activeFilter, setActiveFilter] = useState<'quartier' | 'asc' | 'period' | null>(null)
  const [selectedQuartier, setSelectedQuartier] = useState<string | null>(null)
  const [selectedAsc, setSelectedAsc] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')

  const handleQuartierChange = (q: string | null) => {
    setSelectedQuartier(q)
    onFilterChange({ quartier: q || undefined, asc: selectedAsc || undefined, period: selectedPeriod })
  }

  const handleAscChange = (a: string | null) => {
    setSelectedAsc(a)
    onFilterChange({ quartier: selectedQuartier || undefined, asc: a || undefined, period: selectedPeriod })
  }

  const handlePeriodChange = (p: string) => {
    setSelectedPeriod(p)
    onFilterChange({ quartier: selectedQuartier || undefined, asc: selectedAsc || undefined, period: p })
  }

  return (
    <div style={{ marginBottom: 'clamp(16px, 3vw, 20px)' }}>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
        {/* Quartier Filter */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setActiveFilter(activeFilter === 'quartier' ? null : 'quartier')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: selectedQuartier ? 'var(--color-primary)' : 'var(--color-surface-card)',
              color: selectedQuartier ? 'white' : 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            🏘️ Quartier {selectedQuartier && '✓'}
          </button>
          {activeFilter === 'quartier' && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 8,
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              zIndex: 100,
              minWidth: 200,
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideUp 0.2s ease',
            }}>
              <button
                onClick={() => handleQuartierChange(null)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: !selectedQuartier ? 'rgba(0,98,51,0.1)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                Tous
              </button>
              {quartiers.map(q => (
                <button
                  key={q}
                  onClick={() => handleQuartierChange(q)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: selectedQuartier === q ? 'rgba(0,98,51,0.1)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ASC Filter */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setActiveFilter(activeFilter === 'asc' ? null : 'asc')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: selectedAsc ? 'var(--color-primary)' : 'var(--color-surface-card)',
              color: selectedAsc ? 'white' : 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            🛡️ ASC {selectedAsc && '✓'}
          </button>
          {activeFilter === 'asc' && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 8,
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              zIndex: 100,
              minWidth: 200,
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideUp 0.2s ease',
              maxHeight: 300,
              overflowY: 'auto',
            }}>
              <button
                onClick={() => handleAscChange(null)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: !selectedAsc ? 'rgba(0,98,51,0.1)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                Tous
              </button>
              {ascs.map(a => (
                <button
                  key={a}
                  onClick={() => handleAscChange(a)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: selectedAsc === a ? 'rgba(0,98,51,0.1)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  ASC {a}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Period Filter */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setActiveFilter(activeFilter === 'period' ? null : 'period')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: selectedPeriod !== 'all' ? 'var(--color-primary)' : 'var(--color-surface-card)',
              color: selectedPeriod !== 'all' ? 'white' : 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            📅 Période {selectedPeriod !== 'all' && '✓'}
          </button>
          {activeFilter === 'period' && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 8,
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              zIndex: 100,
              minWidth: 180,
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideUp 0.2s ease',
            }}>
              {[
                { value: 'all', label: 'Tous les temps' },
                { value: 'month', label: 'Ce mois' },
                { value: 'week', label: 'Cette semaine' },
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => {
                    handlePeriodChange(p.value)
                    setActiveFilter(null)
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: selectedPeriod === p.value ? 'rgba(0,98,51,0.1)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    borderBottom: p.value !== 'week' ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
