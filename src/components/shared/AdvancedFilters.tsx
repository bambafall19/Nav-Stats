'use client'

import { useState } from 'react'

export interface FilterOptions {
  quartier?: string
  asc?: string
  periode?: 'semaine' | 'mois' | 'saison'
  minPoints?: number
  maxPoints?: number
}

interface AdvancedFiltersProps {
  quartiers: string[]
  ascs: string[]
  onFilterChange: (filters: FilterOptions) => void
}

export function AdvancedFilters({ quartiers, ascs, onFilterChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface-card)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
        }}
      >
        <span>🔍 Filtres avancés</span>
        <span style={{ marginLeft: 'auto' }}>{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div style={{
          marginTop: 12,
          padding: 16,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          display: 'grid',
          gap: 12,
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Quartier
            </label>
            <select
              value={filters.quartier || ''}
              onChange={(e) => handleFilterChange({ ...filters, quartier: e.target.value || undefined })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-card)',
                fontSize: '0.85rem',
              }}
            >
              <option value="">Tous les quartiers</option>
              {quartiers.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              ASC
            </label>
            <select
              value={filters.asc || ''}
              onChange={(e) => handleFilterChange({ ...filters, asc: e.target.value || undefined })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-card)',
                fontSize: '0.85rem',
              }}
            >
              <option value="">Tous les ASC</option>
              {ascs.map(a => (
                <option key={a} value={a}>ASC {a}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Période
            </label>
            <select
              value={filters.periode || 'saison'}
              onChange={(e) => handleFilterChange({ ...filters, periode: e.target.value as any })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-card)',
                fontSize: '0.85rem',
              }}
            >
              <option value="semaine">Cette semaine</option>
              <option value="mois">Ce mois</option>
              <option value="saison">Saison complète</option>
            </select>
          </div>

          <button
            onClick={() => {
              setFilters({})
              onFilterChange({})
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  )
}
